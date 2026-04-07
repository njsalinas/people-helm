/**
 * @component KPIDashboard
 * Panel de KPIs resumidos en la parte superior del dashboard
 *
 * @example
 * <KPIDashboard proyectos={proyectos} />
 */

'use client'

import type { ProyectoGerencial } from '@/types'
import { calcularKPIs } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface KPIDashboardProps {
  proyectos: ProyectoGerencial[]
  isLoading?: boolean
}

export function KPIDashboard({ proyectos, isLoading }: KPIDashboardProps) {
  const kpis = calcularKPIs(proyectos)

  const items = [
    {
      label: 'Total Proyectos',
      value: kpis.total,
      color: 'text-gray-900',
      bg: 'bg-white',
      icon: '📋',
    },
    {
      label: 'Verde',
      value: kpis.verde,
      subtitle: `${kpis.total > 0 ? Math.round((kpis.verde / kpis.total) * 100) : 0}%`,
      color: 'text-green-700',
      bg: 'bg-green-50',
      dot: 'bg-green-500',
    },
    {
      label: 'Amarillo',
      value: kpis.amarillo,
      subtitle: `${kpis.total > 0 ? Math.round((kpis.amarillo / kpis.total) * 100) : 0}%`,
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      dot: 'bg-yellow-500',
    },
    {
      label: 'Rojo',
      value: kpis.rojo,
      subtitle: `${kpis.total > 0 ? Math.round((kpis.rojo / kpis.total) * 100) : 0}%`,
      color: 'text-red-700',
      bg: 'bg-red-50',
      dot: 'bg-red-500',
    },
    {
      label: 'Bloqueos Activos',
      value: kpis.bloqueosActivos,
      color: kpis.bloqueosActivos > 0 ? 'text-red-700' : 'text-gray-700',
      bg: kpis.bloqueosActivos > 0 ? 'bg-red-50' : 'bg-white',
      icon: '⚠️',
    },
    {
      label: 'Acciones Pendientes',
      value: kpis.acciones_pendientes,
      color: kpis.acciones_pendientes > 0 ? 'text-orange-700' : 'text-gray-700',
      bg: kpis.acciones_pendientes > 0 ? 'bg-orange-50' : 'bg-white',
      icon: '🔔',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn('rounded-xl p-4 border border-gray-100 shadow-sm', item.bg)}
        >
          <div className="flex items-center gap-2 mb-1">
            {item.dot && (
              <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', item.dot)} />
            )}
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span className="text-xs text-gray-500 truncate">{item.label}</span>
          </div>
          <div className={cn('text-2xl font-bold', item.color)}>{item.value}</div>
          {item.subtitle && <div className="text-xs text-gray-400 mt-0.5">{item.subtitle}</div>}
        </div>
      ))}
    </div>
  )
}
