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
import { cn, calcularDiasRestantes, obtenerIniciales, formatPorcentaje } from '@/lib/utils'

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
  const diasParaInicio = calcularDiasRestantes(tarea.fecha_inicio)
  const diasRestantes = calcularDiasRestantes(tarea.fecha_fin_planificada)
  const estaVencida = diasRestantes < 0

  const cardColor = cn(
    'bg-white border rounded-lg p-3 cursor-pointer shadow-sm transition-all duration-200 hover:shadow-md',
    estaBloqueada && 'border-red-300 bg-red-50',
    !estaBloqueada && estaVencida && 'border-amber-300 bg-amber-50',
    !estaBloqueada && !estaVencida && 'border-gray-200 hover:border-blue-300',
    isDragging && 'opacity-70 shadow-lg scale-105 rotate-1'
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
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 flex-1">{tarea.nombre}</p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {estaBloqueada && (
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center" title="Tarea bloqueada">
              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {tarea.prioridad <= 2 && (
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center" title={`Prioridad ${tarea.prioridad}`}>
              <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-600 font-medium">Avance</span>
          <span className="text-xs font-semibold text-gray-700">
            {formatPorcentaje(tarea.porcentaje_avance)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              tarea.porcentaje_avance === 100 && 'bg-green-500',
              tarea.porcentaje_avance < 100 && !estaBloqueada && 'bg-blue-500',
              estaBloqueada && 'bg-red-400'
            )}
            style={{ width: `${tarea.porcentaje_avance}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-1.5">
        {/* Responsable */}
        {tarea.responsable && (
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
              {obtenerIniciales(tarea.responsable.nombre_completo)}
            </div>
            <span className="text-xs text-gray-600 truncate max-w-[100px]">
              {tarea.responsable.nombre_completo.split(' ')[0]}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600 whitespace-nowrap">
            🚀 {diasParaInicio > 0
              ? `Inicia en ${diasParaInicio}d`
              : diasParaInicio === 0
                ? 'Inicia hoy'
                : `Inició hace ${Math.abs(diasParaInicio)}d`}
          </span>

          {estaVencida ? (
            <span className="text-xs text-red-600 whitespace-nowrap">⏰ Vencido {Math.abs(diasRestantes)}d</span>
          ) : (
            <span className="text-xs text-gray-600 whitespace-nowrap">
              ⏰ {diasRestantes === 0 ? 'Vence hoy' : `${diasRestantes}d`}
            </span>
          )}
        </div>
      </div>

      {/* Bloqueo badge */}
      {estaBloqueada && (
        <div className="mt-3 px-2.5 py-1.5 bg-red-100 border border-red-200 text-red-700 text-xs rounded-md font-medium flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Bloqueado
        </div>
      )}
    </div>
  )
}
