/**
 * @component TaskProgressBar
 * Barra de progreso individual para la vista Timeline
 *
 * @example
 * <TaskProgressBar tarea={tarea} />
 */

'use client'

import type { Tarea } from '@/types'
import type { TimelineTask } from '@/types/domain'
import { cn, formatPorcentaje } from '@/lib/utils'

interface TaskProgressBarProps {
  timelineTask: TimelineTask
  onClick?: () => void
}

export function TaskProgressBar({ timelineTask, onClick }: TaskProgressBarProps) {
  const { tarea, porcentaje_tiempo_transcurrido, dias_totales, dias_transcurridos, esta_vencida } = timelineTask
  const bloqueoActivo = tarea.bloqueos?.find((b) => b.estado === 'Activo')

  const barColor = cn(
    'h-full rounded-full transition-all',
    tarea.estado === 'Finalizado' && 'bg-green-500',
    tarea.estado === 'En Curso' && !bloqueoActivo && !esta_vencida && 'bg-blue-500',
    tarea.estado === 'En Curso' && esta_vencida && !bloqueoActivo && 'bg-orange-500',
    bloqueoActivo && 'bg-red-500',
    tarea.estado === 'Pendiente' && 'bg-gray-400',
  )

  return (
    <div
      className={cn(
        'group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 cursor-default',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {/* Task name */}
      <div className="w-48 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          {bloqueoActivo && <span className="text-red-500 text-xs">🔴</span>}
          {tarea.estado === 'Finalizado' && <span className="text-green-500 text-xs">✓</span>}
          <p className="text-sm text-gray-700 truncate">{tarea.nombre}</p>
        </div>
        {tarea.responsable && (
          <p className="text-xs text-gray-400 mt-0.5">{tarea.responsable.nombre_completo.split(' ')[0]}</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 relative">
          {/* Background track */}
          <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
            {/* Progress fill */}
            <div
              className={barColor}
              style={{ width: `${tarea.porcentaje_avance}%` }}
            />
            {/* Time marker */}
            {tarea.estado !== 'Finalizado' && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-gray-500 opacity-50"
                style={{ left: `${porcentaje_tiempo_transcurrido}%` }}
                title={`Tiempo transcurrido: ${Math.round(porcentaje_tiempo_transcurrido)}%`}
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 w-40 flex-shrink-0">
          <span className="font-semibold text-gray-700">
            {formatPorcentaje(tarea.porcentaje_avance)}
          </span>
          <span>
            ({dias_transcurridos} de {dias_totales}d)
          </span>
          {bloqueoActivo && <span className="text-red-600 font-medium">BLOQ</span>}
          {tarea.estado === 'Finalizado' && <span className="text-green-600 font-medium">✓</span>}
        </div>
      </div>
    </div>
  )
}
