/**
 * @component TaskCardGlobal
 * Tarjeta de tarea para el Kanban Global con color del proyecto
 */

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Tarea } from '@/types'
import { cn, calcularDiasRestantes, formatPorcentaje } from '@/lib/utils'

interface TaskCardGlobalProps {
  tarea: Tarea & { proyecto?: { id: string; nombre: string; area_responsable: string } }
  getProyectoColor: (proyectoId: string) => string
  isDragging?: boolean
}

export function TaskCardGlobal({ tarea, getProyectoColor, isDragging = false }: TaskCardGlobalProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tarea.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const estaBloqueada = tarea.estado === 'Bloqueado'
  const diasParaInicio = calcularDiasRestantes(tarea.fecha_inicio)
  const diasRestantes = calcularDiasRestantes(tarea.fecha_fin_planificada)

  const proyectoColor = getProyectoColor(tarea.proyecto_id)

  const cardColor = cn(
    'p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all border border-l-4',
    isDragging && 'opacity-50 shadow-lg',
    proyectoColor,
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cardColor}
    >
      {/* Header: Nombre + Proyecto */}
      <div className="mb-2">
        <p className="text-sm font-medium text-gray-900 line-clamp-2">{tarea.nombre}</p>
        {tarea.proyecto && (
          <p className="text-xs text-gray-600 mt-1">📁 {tarea.proyecto.nombre}</p>
        )}
      </div>

      {/* Responsable */}
      {tarea.responsable && (
        <p className="text-xs text-gray-700 mb-2">👤 {tarea.responsable.nombre_completo}</p>
      )}

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Avance</span>
          <span className="text-xs font-medium text-gray-700">
            {formatPorcentaje(tarea.porcentaje_avance)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full"
            style={{ width: `${tarea.porcentaje_avance}%` }}
          />
        </div>
      </div>

      {/* Footer: Inicio + Vencimiento + Badges */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600">
            🚀 {diasParaInicio > 0
              ? `Inicia en ${diasParaInicio}d`
              : diasParaInicio === 0
                ? 'Inicia hoy'
                : `Inició hace ${Math.abs(diasParaInicio)}d`}
          </span>

          {diasRestantes >= 0 ? (
            <span className="text-xs text-gray-600">
              ⏰ {diasRestantes === 0 ? 'Vence hoy' : `${diasRestantes}d`}
            </span>
          ) : (
            <span className="text-xs text-red-600">⏰ Vencido {Math.abs(diasRestantes)}d</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          {tarea.prioridad <= 2 && (
            <span className="text-xs text-orange-600">⚡ P{tarea.prioridad}</span>
          )}

          {estaBloqueada && <span className="text-xs text-red-600">🔴 Bloqueado</span>}
        </div>
      </div>
    </div>
  )
}
