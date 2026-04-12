/**
 * @component SubproyectoCard
 * Card component para mostrar un subproyecto en la lista
 */

'use client'

import type { Subproyecto } from '@/types'
import { cn, formatDate, calcularDiasRestantes, formatPorcentaje, obtenerIniciales } from '@/lib/utils'
import { COLORES_ESTADO } from '@/types/domain'

interface SubproyectoCardProps {
  subproyecto: Subproyecto
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{subproyecto.nombre}</h3>
          <p className="text-xs text-gray-500">{subproyecto.categoria}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0',
            colorEstado.bg,
            colorEstado.text,
            colorEstado.border
          )}
        >
          {subproyecto.estado}
        </span>
      </div>

      {subproyecto.descripcion_ejecutiva && (
        <p className="text-xs text-gray-600 mb-4 line-clamp-2">{subproyecto.descripcion_ejecutiva}</p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600 font-medium">Avance</span>
          <span className="text-xs font-semibold text-gray-700">{formatPorcentaje(subproyecto.porcentaje_avance)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${subproyecto.porcentaje_avance}%` }}
          />
        </div>
      </div>

      {/* Info row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-4">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 2a1 1 0 011-1h6a1 1 0 011 1v2h3a1 1 0 011 1v2a1 1 0 01-.293.707l-1.414 1.414a1 1 0 00-.293.707V17a2 2 0 01-2 2H5a2 2 0 01-2-2V9.414a1 1 0 00-.293-.707L1.293 7.293A1 1 0 011 6.586V4a1 1 0 011-1h3V2zm0 5.414L3.707 6h12.586L14 7.414V17H6V7.414z" />
          </svg>
          <span className={estaVencido ? 'text-red-600 font-semibold' : ''}>
            {formatDate(subproyecto.fecha_fin_planificada)}
            {estaVencido ? ` (vencido)` : ` (${diasRestantes}d)`}
          </span>
        </div>

        {subproyecto.responsable && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {obtenerIniciales(subproyecto.responsable.nombre_completo)}
            </div>
            <span className="hidden sm:inline">{subproyecto.responsable.nombre_completo.split(' ')[0]}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-semibold text-gray-700">P{subproyecto.prioridad}</span>
        </div>
      </div>

      {/* Actions */}
      {(onView || onEdit || onDelete) && (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          {onView && (
            <button
              onClick={onView}
              className="flex-1 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors duration-150"
            >
              Kanban
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors duration-150"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 py-2 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors duration-150"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
