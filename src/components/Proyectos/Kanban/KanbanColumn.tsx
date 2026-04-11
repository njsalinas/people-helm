/**
 * @component KanbanColumn
 * Columna del tablero Kanban (Pendiente | En Curso | Finalizado)
 *
 * @example
 * <KanbanColumn column={column} onTaskClick={(id) => openDetail(id)} />
 */

'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { KanbanColumn as KanbanColumnType } from '@/types'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  column: KanbanColumnType
  onTaskClick: (tareaId: string) => void
  onAddTask?: () => void
}

const COLUMN_COLORS: Record<string, string> = {
  Pendiente: 'border-t-gray-400',
  'En Curso': 'border-t-blue-500',
  Finalizado: 'border-t-green-500',
}

const COLUMN_ICONS: Record<string, string> = {
  Pendiente: '⏳',
  'En Curso': '🔄',
  Finalizado: '✅',
}

export function KanbanColumn({ column, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <div
        className={cn(
          'bg-white rounded-lg border border-gray-200 border-t-4 shadow-sm mb-4 px-4 py-3 flex items-center justify-between',
          COLUMN_COLORS[column.id] ?? 'border-t-gray-400'
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">{COLUMN_ICONS[column.id]}</span>
          <span className="font-semibold text-gray-800 text-sm">{column.label}</span>
        </div>
        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {column.tareas.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-3 min-h-[150px] rounded-lg p-3 transition-all duration-200 border-2 border-dashed',
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
            <svg className="w-8 h-8 mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>Sin tareas</span>
          </div>
        )}
      </div>

      {/* Add task button */}
      {column.id === 'Pendiente' && onAddTask && (
        <button
          onClick={onAddTask}
          className="mt-3 w-full py-2.5 px-3 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 transition-all duration-150 flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agregar tarea
        </button>
      )}
    </div>
  )
}
