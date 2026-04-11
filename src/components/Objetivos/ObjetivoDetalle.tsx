/**
 * @component ObjetivoDetalle
 * Encabezado y resumen de un objetivo específico
 */

'use client'

import { COLORES_SEMAFORO } from '@/types/domain'
import type { ColorSemaforo } from '@/types/database'

interface ObjetivoDetalleProps {
  id: string
  titulo: string
  descripcion?: string
  anio: number
  areaNombre: string
  status: string
  avancePromedio: number
  totalProyectos: number
  proyectosBloqueados: number
  proyectosCompletados: number
  proyectosEnRiesgo: number
  colorSemaforo: ColorSemaforo
  onEdit?: () => void
  onDelete?: () => void
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  archived: 'Archivado',
}

export function ObjetivoDetalle({
  titulo,
  descripcion,
  anio,
  areaNombre,
  status,
  avancePromedio,
  totalProyectos,
  proyectosBloqueados,
  proyectosCompletados,
  proyectosEnRiesgo,
  colorSemaforo,
  onEdit,
  onDelete,
}: ObjetivoDetalleProps) {
  const colores = COLORES_SEMAFORO[colorSemaforo]

  return (
    <div className={`rounded-lg border-2 p-6 mb-6 ${colores.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-5 h-5 rounded-full ${colores.dot}`} />
            <h1 className="text-3xl font-bold text-gray-900">{titulo}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{areaNombre}</span>
            <span>•</span>
            <span>{anio}</span>
            <span>•</span>
            <span className="px-2 py-1 bg-white rounded border border-gray-300 font-medium">
              {STATUS_LABELS[status]}
            </span>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
                title="Editar"
              >
                ✎
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-300 transition-colors"
                title="Eliminar"
              >
                🗑
              </button>
            )}
          </div>
        )}
      </div>

      {/* Descripción */}
      {descripcion && (
        <p className="text-gray-700 mb-6 leading-relaxed">{descripcion}</p>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span className="font-semibold">Avance general</span>
          <span className="font-bold text-lg">{avancePromedio}%</span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-300">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${avancePromedio}%` }}
          />
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white/70 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalProyectos}</div>
          <div className="text-xs text-gray-600 mt-1">Proyecto{totalProyectos !== 1 ? 's' : ''}</div>
          <div className="text-xs text-gray-500 mt-2">Total</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{proyectosCompletados}</div>
          <div className="text-xs text-gray-600 mt-1">Completado{proyectosCompletados !== 1 ? 's' : ''}</div>
          <div className="text-xs text-gray-500 mt-2">Finalizados</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalProyectos - proyectosCompletados - proyectosBloqueados}</div>
          <div className="text-xs text-gray-600 mt-1">En progreso</div>
          <div className="text-xs text-gray-500 mt-2">Activos</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${proyectosBloqueados > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {proyectosBloqueados}
          </div>
          <div className="text-xs text-gray-600 mt-1">Bloqueado{proyectosBloqueados !== 1 ? 's' : ''}</div>
          <div className="text-xs text-gray-500 mt-2">Detenidos</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{proyectosEnRiesgo}</div>
          <div className="text-xs text-gray-600 mt-1">En riesgo</div>
          <div className="text-xs text-gray-500 mt-2">Atención</div>
        </div>
      </div>
    </div>
  )
}
