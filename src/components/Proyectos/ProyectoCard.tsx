/**
 * @component ProyectoCard
 * Tarjeta compacta de proyecto para vistas de grid - Material Design 3
 *
 * @example
 * <ProyectoCard proyecto={proyecto} />
 */

'use client'

import Link from 'next/link'
import { cn, calcularDiasRestantes } from '@/lib/utils'
import type { VistaSemaforoProyecto } from '@/types/database'
import { UserAvatar } from '@/components/Common/UserAvatar'
import { ProgressBar } from '@/components/Common/ProgressBar'
import { StatusBadge } from '@/components/Common/StatusBadge'
import { AlertCircle } from 'lucide-react'

interface ProyectoCardProps {
  proyecto: VistaSemaforoProyecto
}

const COLOR_BORDER: Record<string, string> = {
  VERDE: 'border-l-green-400',
  AMARILLO: 'border-l-yellow-400',
  ROJO: 'border-l-red-400',
}

const COLOR_DOT: Record<string, string> = {
  VERDE: 'bg-green-500',
  AMARILLO: 'bg-yellow-400',
  ROJO: 'bg-red-500',
}

const COLOR_PROGRESS: Record<string, 'green' | 'yellow' | 'red' | 'blue'> = {
  VERDE: 'green',
  AMARILLO: 'yellow',
  ROJO: 'red',
}

export function ProyectoCard({ proyecto }: ProyectoCardProps) {
  const diasRestantes = calcularDiasRestantes(proyecto.fecha_fin_planificada)
  const color = proyecto.color_semaforo ?? 'VERDE'

  return (
    <Link
      href={`/proyectos/${proyecto.id}`}
      className={cn(
        'block bg-white rounded-2xl border border-l-4 border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200',
        COLOR_BORDER[color]
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <StatusBadge label={(proyecto as any).area_responsable} color="gray" />
          <h3 className="text-sm font-semibold text-gray-900 truncate mt-2">{proyecto.nombre}</h3>
        </div>
        <span className={cn('w-3 h-3 rounded-full flex-shrink-0 mt-1', COLOR_DOT[color])} />
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">Avance</span>
          <span className="font-semibold text-gray-900">{proyecto.porcentaje_avance}%</span>
        </div>
        <ProgressBar value={proyecto.porcentaje_avance} color={COLOR_PROGRESS[color]} />
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
          <UserAvatar nombre={proyecto.responsable_nombre} size="sm" />
        )}
      </div>

      {/* Bloqueo badge */}
      {(proyecto.bloqueos_activos ?? 0) > 0 && (
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
          <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{proyecto.bloqueos_activos} bloqueo{(proyecto.bloqueos_activos ?? 0) > 1 ? 's' : ''}</span>
        </div>
      )}
    </Link>
  )
}
