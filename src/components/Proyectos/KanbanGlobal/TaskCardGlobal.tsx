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
  const diasRestantes = calcularDiasRestantes(tarea.fecha_fin_planificada)
  const estaVencida = diasRestantes < 0

  const bgColor = getProyectoColor(tarea.proyecto_id)

  const cardColor = cn(
    'p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all border-l-4',
    isDragging && 'opacity-50 shadow-lg',
    estaBloqueada ? 'border-red-500 bg-red-50 border-l-red-500' : 'border-l-blue-500',
    !estaBloqueada && estaVencida && 'bg-orange-50',
    !estaBloqueada && !estaVencida && bgColor,
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

      {/* Footer: Plazo + Prioridad + Estado */}
      <div className="flex items-center justify-between gap-2">
        {diasRestantes >= 0 ? (
          <span className="text-xs text-gray-600">
            ⏰ {diasRestantes === 0 ? 'Hoy' : `${diasRestantes}d`}
          </span>
        ) : (
          <span className="text-xs text-red-600">⏰ Vencido {Math.abs(diasRestantes)}d</span>
        )}

        {tarea.prioridad <= 2 && (
          <span className="text-xs text-orange-600">⚡ P{tarea.prioridad}</span>
        )}

        {estaBloqueada && <span className="text-xs text-red-600">🔴 Bloqueado</span>}
      </div>
    </div>
  )
}
