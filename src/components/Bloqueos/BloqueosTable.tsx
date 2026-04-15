/**
 * @component BloqueosTable
 * Tabla transversal de todos los bloqueos activos del sistema - Material Design 3
 *
 * @example
 * <BloqueosTable bloqueos={bloqueos} />
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BloqueoActivo } from '@/types'
import { cn, colorFilaBloqueo } from '@/lib/utils'
import { TIPOS_BLOQUEO, ACCIONES_BLOQUEO } from '@/types/domain'
import { StatusBadge } from '@/components/Common/StatusBadge'
import { AlertCircle } from 'lucide-react'

interface BloqueosTableProps {
  bloqueos: BloqueoActivo[]
  isLoading?: boolean
}

export function BloqueosTable({ bloqueos, isLoading }: BloqueosTableProps) {
  const router = useRouter()
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [filtroAccion, setFiltroAccion] = useState<string>('')
  const [filtroArea, setFiltroArea] = useState<string>('')

  const filtrados = bloqueos.filter((b) => {
    if (filtroTipo && b.tipo !== filtroTipo) return false
    if (filtroAccion && b.accion_requerida !== filtroAccion) return false
    if (filtroArea && b.area_responsable !== filtroArea) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="animate-pulse divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 px-4 flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-4 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          {TIPOS_BLOQUEO.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={filtroAccion}
          onChange={(e) => setFiltroAccion(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todas las acciones</option>
          {ACCIONES_BLOQUEO.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        <select
          value={filtroArea}
          onChange={(e) => setFiltroArea(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todas las áreas</option>
          {Array.from(new Set(bloqueos.map((b) => b.area_responsable))).map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <span className="text-sm text-gray-500 ml-auto">
          {filtrados.length} bloqueo{filtrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Proyecto', 'Bloqueo', 'Tipo', 'Días', 'Acción Req.', 'Responsable', 'Estado'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  {bloqueos.length === 0 ? '✅ Sin bloqueos activos' : 'Sin resultados para los filtros'}
                </td>
              </tr>
            ) : (
              filtrados.map((b) => (
                <tr
                  key={b.id}
                  className={cn(
                    'cursor-pointer hover:opacity-90 transition-opacity',
                    colorFilaBloqueo(b.dias_bloqueado)
                  )}
                  onClick={() => router.push(`/proyectos/${b.proyecto_id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 hover:text-blue-600">{b.proyecto_nombre}</p>
                    <p className="text-xs text-gray-400">{b.area_responsable}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 max-w-[200px] truncate" title={b.descripcion}>
                      {b.descripcion}
                    </p>
                    {b.requiere_escalamiento && (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                        <AlertCircle className="w-3 h-3" strokeWidth={1.5} /> Escalar
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={b.tipo} color="gray" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-sm font-bold',
                      b.dias_bloqueado > 5 ? 'text-red-700' :
                      b.dias_bloqueado > 3 ? 'text-orange-700' : 'text-yellow-700'
                    )}>
                      {b.dias_bloqueado}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AccionBadge accion={b.accion_requerida} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">{b.creado_por_nombre}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={b.estado} color="red" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AccionBadge({ accion }: { accion: string }) {
  const colorMap: Record<string, 'gray' | 'blue' | 'yellow' | 'orange' | 'red'> = {
    Informar: 'blue',
    Seguimiento: 'yellow',
    Decisión: 'orange',
    Intervención: 'red',
  }
  return <StatusBadge label={accion} color={colorMap[accion] || 'gray'} />
}
