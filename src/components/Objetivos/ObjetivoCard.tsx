/**
 * @component ObjetivoCard
 * Tarjeta compacta de objetivo con semáforo de progreso
 */

'use client'

import { cn } from '@/lib/utils'
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
  onAddProject?: () => void
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
  onAddProject,
}: ObjetivoCardProps) {
  const colores = COLORES_SEMAFORO[colorSemaforo]

  return (
    <div className={`rounded-lg border border-gray-200 p-4 ${colores.bg} transition-all duration-200 hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colores.dot}`} />
            <h3 className="text-sm font-semibold text-gray-900 truncate">{titulo}</h3>
          </div>
          <p className="text-xs text-gray-600">
            {areaNombre} · {anio}
          </p>
        </div>
        <span className={cn(
          'text-xs font-medium px-2.5 py-1 rounded-md border flex-shrink-0',
          status === 'draft' && 'bg-gray-50 text-gray-600 border-gray-300',
          status === 'active' && 'bg-green-50 text-green-700 border-green-300',
          status === 'completed' && 'bg-blue-50 text-blue-700 border-blue-300',
          status === 'archived' && 'bg-gray-100 text-gray-600 border-gray-300'
        )}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-700 mb-2">
          <span className="font-medium">Avance promedio</span>
          <span className="font-semibold text-gray-900">{avancePromedio}%</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden border border-gray-300">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${avancePromedio}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-700 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm0 8a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
          </svg>
          <span><span className="font-semibold text-gray-900">{totalProyectos}</span> proyecto{totalProyectos !== 1 ? 's' : ''}</span>
        </div>
        {proyectosBloqueados > 0 && (
          <div className="flex items-center gap-1.5 text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span><span className="font-semibold">{proyectosBloqueados}</span> bloqueado{proyectosBloqueados !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onAddProject && (
          <button
            onClick={onAddProject}
            className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md border border-blue-600 transition-colors duration-150"
          >
            + Agregar
          </button>
        )}
        <button
          onClick={onViewProjects}
          className="flex-1 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-md border border-blue-300 transition-colors duration-150"
        >
          Ver proyectos
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-md border border-gray-300 transition-colors duration-150 flex items-center justify-center flex-shrink-0"
            title="Editar objetivo"
            aria-label="Editar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 hover:text-red-900 rounded-md border border-red-300 transition-colors duration-150 flex items-center justify-center flex-shrink-0"
            title="Eliminar objetivo"
            aria-label="Eliminar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
