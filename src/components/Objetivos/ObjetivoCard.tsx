/**
 * @component ObjetivoCard
 * Tarjeta compacta de objetivo con semáforo de progreso - Material Design 3
 */

'use client'

import { cn } from '@/lib/utils'
import { COLORES_SEMAFORO } from '@/types/domain'
import type { ColorSemaforo } from '@/types/database'
import { ProgressBar } from '@/components/Common/ProgressBar'
import { StatusBadge } from '@/components/Common/StatusBadge'
import { Layers, AlertCircle, Pencil, Trash2 } from 'lucide-react'

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

  const statusColorMap: Record<string, 'gray' | 'green' | 'blue'> = {
    draft: 'gray',
    active: 'green',
    completed: 'blue',
    archived: 'gray',
  }

  const progressColor: 'blue' | 'green' | 'red' =
    colorSemaforo === 'VERDE' ? 'green' : colorSemaforo === 'ROJO' ? 'red' : 'blue'

  return (
    <div className={cn('rounded-2xl border border-gray-100 shadow-sm p-4 transition-all duration-200 hover:shadow-md', colores.bg)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={cn('w-3 h-3 rounded-full flex-shrink-0', colores.dot)} />
            <h3 className="text-sm font-semibold text-gray-900 truncate">{titulo}</h3>
          </div>
          <p className="text-xs text-gray-600">
            {areaNombre} · {anio}
          </p>
        </div>
        <StatusBadge
          label={STATUS_LABELS[status]}
          color={statusColorMap[status] || 'gray'}
        />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-700 mb-2">
          <span className="font-medium">Avance promedio</span>
          <span className="font-semibold text-gray-900">{avancePromedio}%</span>
        </div>
        <ProgressBar value={avancePromedio} color={progressColor} />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-700 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <span><span className="font-semibold text-gray-900">{totalProyectos}</span> proyecto{totalProyectos !== 1 ? 's' : ''}</span>
        </div>
        {proyectosBloqueados > 0 && (
          <div className="flex items-center gap-1.5 text-red-600">
            <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
            <span><span className="font-semibold">{proyectosBloqueados}</span> bloqueado{proyectosBloqueados !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onAddProject && (
          <button
            onClick={onAddProject}
            className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-150"
          >
            + Agregar
          </button>
        )}
        <button
          onClick={onViewProjects}
          className="flex-1 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-full transition-colors duration-150"
        >
          Ver proyectos
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors duration-150 flex items-center justify-center flex-shrink-0"
            title="Editar objetivo"
            aria-label="Editar"
          >
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 hover:text-red-900 rounded-xl transition-colors duration-150 flex items-center justify-center flex-shrink-0"
            title="Eliminar objetivo"
            aria-label="Eliminar"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}
