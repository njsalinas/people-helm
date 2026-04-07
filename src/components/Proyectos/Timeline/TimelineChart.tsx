/**
 * @component TimelineChart
 * Vista tipo Gantt simplificada con barras de progreso por tarea
 *
 * @example
 * <TimelineChart tareas={tareas} />
 */

'use client'

import { useMemo } from 'react'
import { differenceInDays, parseISO, isAfter, isBefore } from 'date-fns'
import type { Tarea } from '@/types'
import type { TimelineTask } from '@/types/domain'
import { TaskProgressBar } from './TaskProgressBar'

interface TimelineChartProps {
  tareas: Tarea[]
  onTaskClick?: (tareaId: string) => void
}

function buildTimelineTask(tarea: Tarea): TimelineTask {
  const inicio = parseISO(tarea.fecha_inicio)
  const fin = parseISO(tarea.fecha_fin_planificada)
  const hoy = new Date()

  const dias_totales = Math.max(differenceInDays(fin, inicio), 1)
  const dias_transcurridos = Math.max(
    Math.min(differenceInDays(hoy, inicio), dias_totales),
    0
  )
  const porcentaje_tiempo_transcurrido = Math.round((dias_transcurridos / dias_totales) * 100)
  const esta_vencida = isAfter(hoy, fin) && tarea.estado !== 'Finalizado'

  return { tarea, porcentaje_tiempo_transcurrido, dias_totales, dias_transcurridos, esta_vencida }
}

export function TimelineChart({ tareas, onTaskClick }: TimelineChartProps) {
  const timelineTasks = useMemo(() => tareas.map(buildTimelineTask), [tareas])

  if (tareas.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        No hay tareas para mostrar
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center gap-3 py-2 px-3 text-xs text-gray-400 font-medium uppercase tracking-wide border-b border-gray-100 mb-2">
        <div className="w-48 flex-shrink-0">Tarea</div>
        <div className="flex-1">Progreso</div>
      </div>

      {/* Tasks */}
      {timelineTasks.map((task) => (
        <TaskProgressBar
          key={task.tarea.id}
          timelineTask={task}
          onClick={onTaskClick ? () => onTaskClick(task.tarea.id) : undefined}
        />
      ))}

      {/* Leyenda */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 bg-blue-500 rounded-sm" />
          <span>Progreso real</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 bg-gray-200 rounded-sm" />
          <span>Pendiente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 bg-green-500 rounded-sm" />
          <span>Finalizado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 bg-red-500 rounded-sm" />
          <span>Bloqueado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-gray-500" />
          <span>Tiempo transcurrido</span>
        </div>
      </div>
    </div>
  )
}
