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
import type { KanbanColumn as KanbanColumnType, Tarea } from '@/types'
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
          'bg-white rounded-xl border-2 border-t-4 shadow-sm mb-3 px-4 py-3 flex items-center justify-between',
          COLUMN_COLORS[column.id] ?? 'border-t-gray-400'
        )}
      >
        <div className="flex items-center gap-2">
          <span>{COLUMN_ICONS[column.id]}</span>
          <span className="font-semibold text-gray-800 text-sm">{column.label}</span>
        </div>
        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
          {column.tareas.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 min-h-[120px] rounded-xl p-2 transition-colors',
          isOver && 'bg-blue-50 ring-2 ring-blue-300 ring-dashed'
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
          <div className="flex items-center justify-center h-20 text-gray-300 text-sm">
            Sin tareas
          </div>
        )}
      </div>

      {/* Add task button */}
      {column.id === 'Pendiente' && onAddTask && (
        <button
          onClick={onAddTask}
          className="mt-2 w-full py-2 px-3 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-gray-300 hover:border-blue-300 transition-colors flex items-center gap-1.5"
        >
          <span className="text-base leading-none">+</span>
          Agregar tarea
        </button>
      )}
    </div>
  )
}
