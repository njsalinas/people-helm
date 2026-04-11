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
        'block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-200 ring-2',
        COLOR_RING[color]
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{(proyecto as any).area_responsable}</p>
          <h3 className="text-sm font-semibold text-gray-900 truncate mt-1">{proyecto.nombre}</h3>
        </div>
        <span className={cn('w-3 h-3 rounded-full flex-shrink-0 mt-0.5', COLOR_DOT[color])} />
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">Avance</span>
          <span className="font-semibold">{proyecto.porcentaje_avance}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${proyecto.porcentaje_avance}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={cn(
            'text-xs font-semibold',
            diasRestantes < 0 ? 'text-red-600' : diasRestantes < 7 ? 'text-amber-600' : 'text-gray-600'
          )}
        >
          {diasRestantes < 0
            ? `${Math.abs(diasRestantes)}d vencido`
            : `${diasRestantes}d restantes`}
        </span>
        {proyecto.responsable_nombre && (
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-blue-700">
              {obtenerIniciales(proyecto.responsable_nombre)}
            </span>
          </div>
        )}
      </div>

      {/* Bloqueo badge */}
      {(proyecto.bloqueos_activos ?? 0) > 0 && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{proyecto.bloqueos_activos} bloqueo{(proyecto.bloqueos_activos ?? 0) > 1 ? 's' : ''}</span>
        </div>
      )}
    </Link>
  )
}
