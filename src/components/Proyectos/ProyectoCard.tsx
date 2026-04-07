/**
 * @component ProyectoCard
 * Tarjeta compacta de proyecto para vistas de grid.
 *
 * @example
 * <ProyectoCard proyecto={proyecto} />
 */

'use client'

import Link from 'next/link'
import { cn, calcularDiasRestantes, obtenerIniciales } from '@/lib/utils'
import type { VistaSemaforoProyecto } from '@/types/database'

interface ProyectoCardProps {
  proyecto: VistaSemaforoProyecto
}

const COLOR_RING: Record<string, string> = {
  VERDE: 'ring-green-400',
  AMARILLO: 'ring-yellow-400',
  ROJO: 'ring-red-400',
}

const COLOR_DOT: Record<string, string> = {
  VERDE: 'bg-green-500',
  AMARILLO: 'bg-yellow-400',
  ROJO: 'bg-red-500',
}

export function ProyectoCard({ proyecto }: ProyectoCardProps) {
  const diasRestantes = calcularDiasRestantes(proyecto.fecha_fin_planificada)
  const color = proyecto.color_semaforo ?? 'VERDE'

  return (
    <Link
      href={`/proyectos/${proyecto.id}`}
      className={cn(
        'block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow ring-2',
        COLOR_RING[color]
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 uppercase">{proyecto.area_responsable}</p>
          <h3 className="text-sm font-semibold text-gray-900 truncate mt-0.5">{proyecto.nombre}</h3>
        </div>
        <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1', COLOR_DOT[color])} />
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Avance</span>
          <span>{proyecto.porcentaje_avance}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${proyecto.porcentaje_avance}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-medium',
            diasRestantes < 0 ? 'text-red-600' : diasRestantes < 7 ? 'text-yellow-600' : 'text-gray-500'
          )}
        >
          {diasRestantes < 0
            ? `${Math.abs(diasRestantes)}d vencido`
            : `${diasRestantes}d restantes`}
        </span>
        {proyecto.responsable_nombre && (
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-700">
              {obtenerIniciales(proyecto.responsable_nombre)}
            </span>
          </div>
        )}
      </div>

      {/* Bloqueo badge */}
      {(proyecto.bloqueos_activos ?? 0) > 0 && (
        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <span>⚠</span>
          <span>{proyecto.bloqueos_activos} bloqueo{(proyecto.bloqueos_activos ?? 0) > 1 ? 's' : ''}</span>
        </div>
      )}
    </Link>
  )
}
