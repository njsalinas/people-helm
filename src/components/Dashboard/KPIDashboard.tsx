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
  activeSemaforo?: 'VERDE' | 'AMARILLO' | 'ROJO' | null
  onSemaforoClick?: (color: 'VERDE' | 'AMARILLO' | 'ROJO') => void
}

export function KPIDashboard({ proyectos = [], isLoading, activeSemaforo, onSemaforoClick }: KPIDashboardProps) {
  const kpis = calcularKPIs(proyectos || [])
  const total = kpis.total || 0

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
      subtitle: `${total > 0 ? Math.round((kpis.verde / total) * 100) : 0}% del total`,
      color: 'text-green-700',
      bg: 'bg-green-50',
      dot: 'bg-green-500',
    },
    {
      label: 'Amarillo',
      value: kpis.amarillo,
      subtitle: `${total > 0 ? Math.round((kpis.amarillo / total) * 100) : 0}% del total`,
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      dot: 'bg-yellow-500',
    },
    {
      label: 'Rojo',
      value: kpis.rojo,
      subtitle: `${total > 0 ? Math.round((kpis.rojo / total) * 100) : 0}% del total`,
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
      subtitle: kpis.bloqueosActivos > 0 ? 'Requieren atención' : 'Sin bloqueos activos',
    },
    {
      label: 'Acciones Pendientes',
      value: kpis.acciones_pendientes,
      color: kpis.acciones_pendientes > 0 ? 'text-orange-700' : 'text-gray-700',
      bg: kpis.acciones_pendientes > 0 ? 'bg-orange-50' : 'bg-white',
      icon: '🔔',
      subtitle: kpis.acciones_pendientes > 0 ? 'Por gestionar' : 'Todo al día',
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
      {items.map((item) => {
        const isClickable = onSemaforoClick && ['Verde', 'Amarillo', 'Rojo'].includes(item.label)
        const isActive = isClickable && item.label.toLowerCase() === activeSemaforo?.toLowerCase()

        return (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            if (isClickable && item.label === 'Verde') onSemaforoClick('VERDE')
            else if (isClickable && item.label === 'Amarillo') onSemaforoClick('AMARILLO')
            else if (isClickable && item.label === 'Rojo') onSemaforoClick('ROJO')
          }}
          disabled={!isClickable}
          className={cn(
            'rounded-xl p-4 border shadow-sm transition-all text-left',
            item.bg,
            item.value > 0 ? 'border-gray-200' : 'border-gray-100',
            isClickable && 'cursor-pointer hover:shadow-md',
            isActive && 'ring-2 ring-offset-1 ring-blue-500'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            {item.dot && (
              <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', item.dot)} />
            )}
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span className="text-xs text-gray-500 truncate">{item.label}</span>
          </div>
          <div className={cn('text-2xl font-bold', item.color)}>{Number.isNaN(item.value) ? 0 : item.value}</div>
          {item.subtitle && <div className="text-xs text-gray-500 mt-0.5">{item.subtitle}</div>}
        </button>
        )
      })}
    </div>
  )
}
