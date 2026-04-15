/**
 * @component KanbanColumn
 * Columna del tablero Kanban (Pendiente | En Curso | Finalizado) - Material Design 3
 *
 * @example
 * <KanbanColumn column={column} onTaskClick={(id) => openDetail(id)} />
 */

'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { KanbanColumn as KanbanColumnType } from '@/types'
import { TaskCard } from './TaskCard'
import { StatusBadge } from '@/components/Common/StatusBadge'
import { cn } from '@/lib/utils'
import { Clock, RefreshCw, CheckCircle, Plus } from 'lucide-react'

interface KanbanColumnProps {
  column: KanbanColumnType
  onTaskClick: (tareaId: string) => void
  onAddTask?: () => void
}

const COLUMN_COLORS: Record<string, string> = {
  Pendiente: 'border-l-gray-400',
  'En Curso': 'border-l-blue-500',
  Finalizado: 'border-l-green-500',
}

const COLUMN_ICONS: Record<string, any> = {
  Pendiente: Clock,
  'En Curso': RefreshCw,
  Finalizado: CheckCircle,
}

export function KanbanColumn({ column, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const Icon = COLUMN_ICONS[column.id]

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <div
        className={cn(
          'bg-white rounded-2xl border border-l-4 border-gray-100 shadow-sm mb-4 px-4 py-3 flex items-center justify-between',
          COLUMN_COLORS[column.id] ?? 'border-l-gray-400'
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-600" strokeWidth={1.5} />}
          <span className="font-semibold text-gray-900 text-sm">{column.label}</span>
        </div>
        <StatusBadge label={column.tareas.length.toString()} color="gray" />
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-3 min-h-[150px] rounded-2xl p-3 transition-all duration-200 border-2 border-dashed',
          isOver
            ? 'bg-blue-50 border-blue-400 shadow-md'
            : 'bg-gray-50 border-gray-200'
        )}
      >
        <SortableContext
          items={column.tareas.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tareas.map((tarea) => (
            <TaskCard key={tarea.id} tarea={tarea} onClick={() => onTaskClick(tarea.id)} />
          ))}
        </SortableContext>

        {column.tareas.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-gray-400 text-sm">
            <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span>Sin tareas</span>
          </div>
        )}
      </div>

      {/* Add task button */}
      {column.id === 'Pendiente' && onAddTask && (
        <button
          onClick={onAddTask}
          className="mt-3 w-full py-2 px-3 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 transition-all duration-150 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Agregar tarea
        </button>
      )}
    </div>
  )
}
