/**
 * @component TaskCard
 * Tarjeta individual de tarea en el tablero Kanban - Material Design 3
 *
 * @example
 * <TaskCard tarea={tarea} onClick={() => openModal(tarea.id)} />
 */

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Tarea } from '@/types'
import { cn, calcularDiasRestantes, formatPorcentaje } from '@/lib/utils'
import { UserAvatar } from '@/components/Common/UserAvatar'
import { ProgressBar } from '@/components/Common/ProgressBar'
import { Zap, Clock, Lock, Star } from 'lucide-react'

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
    'bg-white border border-l-4 rounded-2xl p-3 cursor-pointer shadow-sm transition-all duration-200 hover:shadow-md',
    estaBloqueada && 'border-gray-100 border-l-red-400 bg-red-50',
    !estaBloqueada && estaVencida && 'border-gray-100 border-l-amber-400 bg-amber-50',
    !estaBloqueada && !estaVencida && 'border-gray-100 border-l-blue-400',
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
        <div className="flex items-center gap-1 flex-shrink-0">
          {estaBloqueada && (
            <div className="flex-shrink-0 rounded-full bg-red-100 p-1" title="Tarea bloqueada">
              <Lock className="w-3 h-3 text-red-600" strokeWidth={2} />
            </div>
          )}
          {tarea.prioridad <= 2 && (
            <div className="flex-shrink-0 rounded-full bg-amber-100 p-1" title={`Prioridad ${tarea.prioridad}`}>
              <Star className="w-3 h-3 text-amber-600" strokeWidth={2} fill="currentColor" />
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
        <ProgressBar
          value={tarea.porcentaje_avance}
          color={
            tarea.porcentaje_avance === 100
              ? 'green'
              : estaBloqueada
                ? 'red'
                : 'blue'
          }
        />
      </div>

      {/* Footer */}
      <div className="space-y-1.5">
        {/* Responsable */}
        {tarea.responsable && (
          <div className="flex items-center gap-1.5 min-w-0">
            <UserAvatar nombre={tarea.responsable.nombre_completo} size="xs" />
            <span className="text-xs text-gray-600 truncate max-w-[100px]">
              {tarea.responsable.nombre_completo.split(' ')[0]}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
            <Zap className="w-3 h-3" strokeWidth={1.5} />
            {diasParaInicio > 0
              ? `Inicia en ${diasParaInicio}d`
              : diasParaInicio === 0
                ? 'Inicia hoy'
                : `Inició hace ${Math.abs(diasParaInicio)}d`}
          </span>

          {estaVencida ? (
            <span className="flex items-center gap-1 text-red-600 whitespace-nowrap">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              Vencido {Math.abs(diasRestantes)}d
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              {diasRestantes === 0 ? 'Vence hoy' : `${diasRestantes}d`}
            </span>
          )}
        </div>
      </div>

      {/* Bloqueo badge */}
      {estaBloqueada && (
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
          <Lock className="w-3 h-3" strokeWidth={1.5} />
          Bloqueado
        </div>
      )}
    </div>
  )
}
