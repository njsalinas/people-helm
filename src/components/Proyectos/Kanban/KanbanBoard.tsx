/**
 * @component KanbanBoard
 * Tablero Kanban principal con drag & drop entre columnas
 *
 * @example
 * <KanbanBoard proyectoId={id} tareas={tareas} />
 */

'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Tarea, TareaEstado, KanbanColumn as KanbanColumnType } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { TaskDetailModal } from './TaskDetailModal'
import { TareaForm } from '../TareaForm'
import { useActualizarTarea } from '@/hooks/useTareas'
import { useUIStore } from '@/stores/uiStore'

interface KanbanBoardProps {
  proyectoId: string
  tareas: Tarea[]
  usuarios: { id: string; nombre_completo: string }[]
  isLoading?: boolean
  canEdit?: boolean
}

const COLUMN_LABELS: Record<string, string> = {
  Pendiente: 'Pendiente',
  'En Curso': 'En Curso',
  Finalizado: 'Finalizado',
}

function buildColumns(tareas: Tarea[]): KanbanColumnType[] {
  return (['Pendiente', 'En Curso', 'Finalizado'] as const).map((estado) => ({
    id: estado,
    label: COLUMN_LABELS[estado],
    tareas: tareas.filter((t) => t.estado === estado),
  }))
}

export function KanbanBoard({ proyectoId, tareas, usuarios, isLoading, canEdit = true }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnType[]>(() => buildColumns(tareas))
  const [activeTask, setActiveTask] = useState<Tarea | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const actualizarTarea = useActualizarTarea(proyectoId)
  const { isTareaFormOpen, openTareaForm, closeTareaForm } = useUIStore((s) => ({
    isTareaFormOpen: s.isTareaFormOpen,
    openTareaForm: s.openTareaForm,
    closeTareaForm: s.closeTareaForm,
  }))

  // Rebuild columns when tareas change
  useState(() => {
    setColumns(buildColumns(tareas))
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const tarea = tareas.find((t) => t.id === event.active.id)
    setActiveTask(tarea ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over || active.id === over.id) return

    const sourceColId = columns.find((c) =>
      c.tareas.some((t) => t.id === active.id)
    )?.id

    const destColId = (
      columns.some((c) => c.id === over.id) ? over.id :
      columns.find((c) => c.tareas.some((t) => t.id === over.id))?.id
    ) as TareaEstado | undefined

    if (!sourceColId || !destColId) return

    if (sourceColId !== destColId) {
      // Mover entre columnas: actualizar estado
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === sourceColId) {
            return { ...col, tareas: col.tareas.filter((t) => t.id !== active.id) }
          }
          if (col.id === destColId) {
            const tarea = tareas.find((t) => t.id === active.id)!
            return { ...col, tareas: [...col.tareas, { ...tarea, estado: destColId as TareaEstado }] }
          }
          return col
        })
      )

      // Sincronizar con backend
      if (canEdit) {
        await actualizarTarea.mutateAsync({
          tarea_id: active.id as string,
          estado_nuevo: destColId as TareaEstado,
        })
      }
    } else {
      // Reordenar dentro de la misma columna
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== sourceColId) return col
          const oldIndex = col.tareas.findIndex((t) => t.id === active.id)
          const newIndex = col.tareas.findIndex((t) => t.id === over.id)
          return { ...col, tareas: arrayMove(col.tareas, oldIndex, newIndex) }
        })
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4">
            <div className="h-6 bg-gray-200 rounded mb-4" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-24 bg-gray-100 rounded-xl mb-2 animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onTaskClick={(id) => setSelectedTaskId(id)}
              onAddTask={canEdit ? () => openTareaForm(proyectoId) : undefined}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard tarea={activeTask} onClick={() => {}} />
          )}
        </DragOverlay>
      </DndContext>

      {selectedTaskId && (
        <TaskDetailModal
          tareaId={selectedTaskId}
          proyectoId={proyectoId}
          onClose={() => setSelectedTaskId(null)}
          canEdit={canEdit}
        />
      )}

      {isTareaFormOpen && (
        <TareaForm
          proyectoId={proyectoId}
          usuarios={usuarios}
          onClose={closeTareaForm}
        />
      )}
    </>
  )
}
