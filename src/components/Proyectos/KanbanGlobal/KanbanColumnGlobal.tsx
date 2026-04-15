/**
 * @component KanbanColumnGlobal
 * Columna de un Kanban global mostrando tareas por estado - Material Design 3
 */

'use client'

import { useDroppable } from '@dnd-kit/core'
import type { Tarea, TareaEstado } from '@/types'
import { COLORES_ESTADO } from '@/types/domain'
import { TaskCardGlobal } from './TaskCardGlobal'
import { StatusBadge } from '@/components/Common/StatusBadge'
import { Clock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface KanbanColumnGlobalProps {
  estado: TareaEstado
  tareas: Tarea[]
  getProyectoColor: (proyectoId: string) => string
  activeTaskId: string | null
}

const ICON_BY_ESTADO: Record<TareaEstado, any> = {
  Pendiente: Clock,
  'En Curso': RefreshCw,
  Bloqueado: AlertCircle,
  Finalizado: CheckCircle,
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
  const Icon = ICON_BY_ESTADO[estado]

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 rounded-2xl border-2 p-4 shadow-sm ${colors.bg}`}
      style={{
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-600" strokeWidth={1.5} />}
          <h3 className={`font-semibold ${colors.text}`}>{estado}</h3>
        </div>
        <StatusBadge label={tareas.length.toString()} color="gray" />
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
