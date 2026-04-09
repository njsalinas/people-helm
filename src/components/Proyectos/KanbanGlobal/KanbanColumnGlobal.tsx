/**
 * @component KanbanColumnGlobal
 * Columna de un Kanban global mostrando tareas por estado
 */

'use client'

import { useDroppable } from '@dnd-kit/core'
import type { Tarea, TareaEstado } from '@/types'
import { COLORES_ESTADO } from '@/types/domain'
import { TaskCardGlobal } from './TaskCardGlobal'

interface KanbanColumnGlobalProps {
  estado: TareaEstado
  tareas: Tarea[]
  getProyectoColor: (proyectoId: string) => string
  activeTaskId: string | null
}

const ICON_BY_ESTADO: Record<TareaEstado, string> = {
  Pendiente: '⏳',
  'En Curso': '🔄',
  Bloqueado: '🔴',
  Finalizado: '✅',
}

export function KanbanColumnGlobal({
  estado,
  tareas,
  getProyectoColor,
  activeTaskId,
}: KanbanColumnGlobalProps) {
  const { setNodeRef } = useDroppable({
    id: estado,
  })

  const colors = COLORES_ESTADO[estado]
  const icon = ICON_BY_ESTADO[estado]

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 rounded-xl border-2 p-4 ${colors.bg}`}
      style={{
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className={`font-semibold ${colors.text}`}>{estado}</h3>
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {tareas.length}
        </span>
      </div>

      {/* Tareas */}
      <div className="space-y-3 min-h-[200px]">
        {tareas.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Sin tareas</p>
        ) : (
          tareas.map((tarea) => (
            <TaskCardGlobal
              key={tarea.id}
              tarea={tarea}
              getProyectoColor={getProyectoColor}
              isDragging={activeTaskId === tarea.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
