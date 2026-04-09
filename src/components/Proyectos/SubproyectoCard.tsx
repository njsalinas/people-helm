/**
 * @component SubproyectoCard
 * Card component para mostrar un subproyecto en la lista
 */

'use client'

import type { Proyecto } from '@/types'
import { cn, formatDate, calcularDiasRestantes, formatPorcentaje, obtenerIniciales } from '@/lib/utils'
import { COLORES_ESTADO } from '@/types/domain'

interface SubproyectoCardProps {
  subproyecto: Proyecto
  onEdit?: () => void
  onView?: () => void
  onDelete?: () => void
}

export function SubproyectoCard({
  subproyecto,
  onEdit,
  onView,
  onDelete,
}: SubproyectoCardProps) {
  const diasRestantes = calcularDiasRestantes(subproyecto.fecha_fin_planificada)
  const estaVencido = diasRestantes < 0
  const colorEstado = COLORES_ESTADO[subproyecto.estado] ?? COLORES_ESTADO['Pendiente']

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{subproyecto.nombre}</h3>
          <p className="text-xs text-gray-500">{subproyecto.categoria}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
            colorEstado.bg,
            colorEstado.text,
            colorEstado.border
          )}
        >
          {subproyecto.estado}
        </span>
      </div>

      {subproyecto.descripcion_ejecutiva && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{subproyecto.descripcion_ejecutiva}</p>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Avance</span>
          <span className="text-xs font-semibold text-gray-700">{formatPorcentaje(subproyecto.porcentaje_avance)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all"
            style={{ width: `${subproyecto.porcentaje_avance}%` }}
          />
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📅</span>
          <span className={estaVencido ? 'text-red-600 font-medium' : ''}>
            {formatDate(subproyecto.fecha_fin_planificada)}
            {estaVencido ? ` (vencido)` : ` (${diasRestantes}d)`}
          </span>
        </div>

        {subproyecto.responsable && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
              {obtenerIniciales(subproyecto.responsable.nombre_completo)}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          <span className="text-gray-400">🎯</span>
          <span className="text-gray-700">P{subproyecto.prioridad}</span>
        </div>
      </div>

      {/* Actions */}
      {(onView || onEdit || onDelete) && (
        <div className="flex gap-2">
          {onView && (
            <button
              onClick={onView}
              className="flex-1 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium transition-colors"
            >
              Ver
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
