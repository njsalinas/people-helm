/**
 * @component ProyectosEnObjetivo
 * Tabla detallada de proyectos vinculados a un objetivo
 */

'use client'

import Link from 'next/link'
import type { Proyecto } from '@/types/domain'

interface ProyectosEnObjetivoProps {
  proyectos: Proyecto[]
  isLoading?: boolean
}

export function ProyectosEnObjetivo({ proyectos, isLoading }: ProyectosEnObjetivoProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Cargando proyectos...</p>
      </div>
    )
  }

  if (proyectos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">Sin proyectos vinculados a este objetivo</p>
      </div>
    )
  }

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
        return 'bg-green-50 border-green-200'
      case 'en progreso':
      case 'en_progreso':
        return 'bg-blue-50 border-blue-200'
      case 'en riesgo':
      case 'en_riesgo':
        return 'bg-yellow-50 border-yellow-200'
      case 'bloqueado':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
        return { text: '✓ Completado', color: 'text-green-700 bg-green-100' }
      case 'en progreso':
      case 'en_progreso':
        return { text: '→ En progreso', color: 'text-blue-700 bg-blue-100' }
      case 'en riesgo':
      case 'en_riesgo':
        return { text: '⚠️ En riesgo', color: 'text-yellow-700 bg-yellow-100' }
      case 'bloqueado':
        return { text: '⛔ Bloqueado', color: 'text-red-700 bg-red-100' }
      default:
        return { text: estado, color: 'text-gray-700 bg-gray-100' }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Proyectos Vinculados</h2>
        <p className="text-sm text-gray-600 mt-1">{proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Lista de proyectos */}
      <div className="divide-y divide-gray-200">
        {proyectos.map(proyecto => {
          const estadoBadge = getEstadoBadge(proyecto.estado)

          return (
            <Link
              key={proyecto.id}
              href={`/dashboard/proyectos/${proyecto.id}`}
              className={`block p-4 transition-colors hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-400 ${getEstadoColor(proyecto.estado)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Nombre y estado */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{proyecto.nombre}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${estadoBadge.color}`}>
                      {estadoBadge.text}
                    </span>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Responsable:</span>
                      <p className="text-gray-900 font-medium">
                        {(proyecto.responsable as any)?.nombre_completo || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Área:</span>
                      <p className="text-gray-900 font-medium">{proyecto.area_responsable || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Período:</span>
                      <p className="text-gray-900 font-medium">
                        {proyecto.fecha_inicio && proyecto.fecha_fin_planificada
                          ? `${new Date(proyecto.fecha_inicio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${new Date(proyecto.fecha_fin_planificada).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Prioridad:</span>
                      <p className="text-gray-900 font-medium">{proyecto.foco_estrategico || '-'}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Avance</span>
                      <span className="text-sm font-semibold text-gray-900">{proyecto.porcentaje_avance}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${proyecto.porcentaje_avance}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Indicador de avance grande */}
                <div className="ml-4 text-right">
                  <div className="text-3xl font-bold text-blue-600">{proyecto.porcentaje_avance}%</div>
                  <div className="text-xs text-gray-500 mt-1">completado</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
