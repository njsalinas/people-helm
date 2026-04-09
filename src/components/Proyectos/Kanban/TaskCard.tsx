/**
 * @component TaskCard
 * Tarjeta individual de tarea en el tablero Kanban
 *
 * @example
 * <TaskCard tarea={tarea} onClick={() => openModal(tarea.id)} />
 */

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Tarea } from '@/types'
import { cn, formatDate, calcularDiasRestantes, obtenerIniciales, formatPorcentaje } from '@/lib/utils'

interface TaskCardProps {
  tarea: Tarea
  onClick: () => void
}

export function TaskCard({ tarea, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tarea.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const estaBloqueada = tarea.estado === 'Bloqueado'
  const diasRestantes = calcularDiasRestantes(tarea.fecha_fin_planificada)
  const estaVencida = diasRestantes < 0

  const cardColor = cn(
    'bg-white border rounded-xl p-3 cursor-pointer shadow-sm transition-all hover:shadow-md',
    estaBloqueada && 'border-red-300 bg-red-50',
    !estaBloqueada && estaVencida && 'border-orange-300 bg-orange-50',
    !estaBloqueada && !estaVencida && 'border-gray-200 hover:border-blue-300',
    isDragging && 'opacity-50 shadow-lg rotate-2'
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cardColor}
      onClick={onClick}
      data-testid={`task-card-${tarea.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">{tarea.nombre}</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          {estaBloqueada && (
            <span className="text-red-500 text-base" title="Tarea bloqueada">
              🔴
            </span>
          )}
          {tarea.prioridad <= 2 && (
            <span className="text-orange-500 text-xs" title={`Prioridad ${tarea.prioridad}`}>
              ⚡
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Avance</span>
          <span className="text-xs font-medium text-gray-700">
            {formatPorcentaje(tarea.porcentaje_avance)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={cn(
              'h-1.5 rounded-full transition-all',
              tarea.porcentaje_avance === 100 && 'bg-green-500',
              tarea.porcentaje_avance < 100 && !estaBloqueada && 'bg-blue-500',
              estaBloqueada && 'bg-red-400'
            )}
            style={{ width: `${tarea.porcentaje_avance}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between">
        {/* Responsable */}
        {tarea.responsable && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold flex items-center justify-center">
              {obtenerIniciales(tarea.responsable.nombre_completo)}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[80px]">
              {tarea.responsable.nombre_completo.split(' ')[0]}
            </span>
          </div>
        )}

        {/* Fecha */}
        <span
          className={cn(
            'text-xs',
            estaVencida ? 'text-red-600 font-medium' : 'text-gray-400'
          )}
        >
          {estaVencida
            ? `Venció ${formatDate(tarea.fecha_fin_planificada)}`
            : formatDate(tarea.fecha_fin_planificada)}
        </span>
      </div>

      {/* Bloqueo badge */}
      {estaBloqueada && (
        <div className="mt-2 bg-red-100 text-red-700 text-xs rounded-lg px-2 py-1">
          🔴 Tarea bloqueada
        </div>
      )}
    </div>
  )
}
