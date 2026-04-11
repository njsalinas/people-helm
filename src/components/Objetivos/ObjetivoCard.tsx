/**
 * @component ObjetivoCard
 * Tarjeta compacta de objetivo con semáforo de progreso
 */

'use client'

import { COLORES_SEMAFORO } from '@/types/domain'
import type { ColorSemaforo } from '@/types/database'

interface ObjetivoCardProps {
  id: string
  titulo: string
  anio: number
  areaNombre: string
  status: string
  totalProyectos: number
  avancePromedio: number
  proyectosBloqueados: number
  colorSemaforo: ColorSemaforo
  onEdit?: () => void
  onDelete?: () => void
  onViewProjects?: () => void
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  archived: 'Archivado',
}

export function ObjetivoCard({
  id: _id,
  titulo,
  anio,
  areaNombre,
  status,
  totalProyectos,
  avancePromedio,
  proyectosBloqueados,
  colorSemaforo,
  onEdit,
  onDelete,
  onViewProjects,
}: ObjetivoCardProps) {
  const colores = COLORES_SEMAFORO[colorSemaforo]

  return (
    <div className={`rounded-lg border border-gray-200 p-4 ${colores.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${colores.dot}`} />
            <h3 className="text-sm font-semibold text-gray-900 truncate">{titulo}</h3>
          </div>
          <p className="text-xs text-gray-500">
            {areaNombre} · {anio}
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-gray-200">
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-700 mb-1">
          <span>Avance promedio</span>
          <span className="font-semibold">{avancePromedio}%</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden border border-gray-300">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${avancePromedio}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs text-gray-600 mb-4">
        <span>📋 {totalProyectos} proyecto{totalProyectos !== 1 ? 's' : ''}</span>
        {proyectosBloqueados > 0 && (
          <span className="text-red-600">🔴 {proyectosBloqueados} bloqueado{proyectosBloqueados !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewProjects}
          className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
        >
          Ver proyectos
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
            title="Editar"
          >
            ✎
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded border border-red-300 transition-colors"
            title="Eliminar"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  )
}
