/**
 * @component VistaGerencial
 * Tabla dinámica principal con todos los proyectos y su estado - Material Design 3
 *
 * @example
 * <VistaGerencial proyectos={proyectos} onSelectProject={(id) => router.push(`/proyectos/${id}`)} />
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProyectoGerencial, ProyectoEstado, ColorSemaforo } from '@/types'
import { cn, formatDate, calcularDiasRestantes, formatPorcentaje, obtenerIniciales, getAvatarColor } from '@/lib/utils'
import { COLORES_ESTADO } from '@/types/domain'
import { UserAvatar } from '@/components/Common/UserAvatar'
import { StatusBadge } from '@/components/Common/StatusBadge'
import { AlertCircle } from 'lucide-react'

interface VistaGerencialProps {
  proyectos: ProyectoGerencial[]
  isLoading?: boolean
  onSelectProject?: (id: string) => void
}

type SortKey =
  | 'nombre'
  | 'estado'
  | 'porcentaje_avance'
  | 'bloqueos_activos'
  | 'prioridad'
  | 'dias_restantes'
  | 'area_responsable'
  | 'subproyectos_count'
  | 'foco_estrategico'

export function VistaGerencial({ proyectos, isLoading, onSelectProject }: VistaGerencialProps) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('prioridad')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = proyectos.filter((p) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(query) ||
      p.foco_estrategico?.toLowerCase().includes(query)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    let aVal: string | number = a[sortKey] as string | number
    let bVal: string | number = b[sortKey] as string | number

    if (sortKey === 'dias_restantes') {
      aVal = a.dias_restantes ?? -999
      bVal = b.dias_restantes ?? -999
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  const handleRowClick = (id: string) => {
    if (onSelectProject) {
      onSelectProject(id)
    } else {
      router.push(`/proyectos/${id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="animate-pulse divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 px-4 flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-100 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Search toolbar */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <input
            type="search"
            placeholder="Buscar por nombre o foco..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
          {sorted.length} resultado{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <Th label="Proyecto / Línea" sortKey="nombre" current={sortKey} dir={sortDir} onSort={handleSort} sticky />
            <Th label="Foco" sortKey="foco_estrategico" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Área" sortKey="area_responsable" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Estado" sortKey="estado" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="% Avance" sortKey="porcentaje_avance" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Subproyectos" sortKey="subproyectos_count" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Bloqueos" sortKey="bloqueos_activos" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Plazo" sortKey="dias_restantes" current={sortKey} dir={sortDir} onSort={handleSort} />
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Responsable
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Atención
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-gray-600 font-medium">No hay proyectos que coincidan</p>
                  <p className="text-xs text-gray-400">Prueba ajustando los filtros activos o la búsqueda</p>
                </div>
              </td>
            </tr>
          ) : (
            sorted.map((p) => (
              <ProyectoRow
                key={p.id}
                proyecto={p}
                isHovered={hoveredRow === p.id}
                onHover={setHoveredRow}
                onClick={() => handleRowClick(p.id)}
              />
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}

// ============================================================
// Sub-componentes
// ============================================================

function Th({
  label,
  sortKey: key,
  current,
  dir,
  onSort,
  sticky,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: 'asc' | 'desc'
  onSort: (k: SortKey) => void
  sticky?: boolean
}) {
  const active = current === key
  return (
    <th
      onClick={() => onSort(key)}
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap select-none',
        sticky && 'sticky left-0 z-20 bg-gray-50 hover:bg-gray-100'
      )}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={cn('text-gray-300 text-xs', active && 'text-gray-500')}>
          {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  )
}

function ProyectoRow({
  proyecto,
  isHovered,
  onHover,
  onClick,
}: {
  proyecto: ProyectoGerencial
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick: () => void
}) {
  const diasRestantes = calcularDiasRestantes(proyecto.fecha_fin_planificada)
  const estaVencido = diasRestantes < 0
  const colorSemaforo = proyecto.color_semaforo as ColorSemaforo

  const rowBg = cn(
    'transition-colors cursor-pointer',
    proyecto.estado === 'Bloqueado'
      ? isHovered ? 'bg-red-100' : 'bg-red-50'
      : proyecto.estado === 'En Riesgo'
        ? isHovered ? 'bg-yellow-100' : 'bg-yellow-50'
        : isHovered ? 'bg-blue-50' : ''
  )

  return (
    <tr
      className={rowBg}
      onMouseEnter={() => onHover(proyecto.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      {/* Proyecto */}
      <td
        className={cn(
          'px-4 py-3 sticky left-0 z-10',
          proyecto.estado === 'Bloqueado'
            ? isHovered ? 'bg-red-100' : 'bg-red-50'
            : proyecto.estado === 'En Riesgo'
              ? isHovered ? 'bg-yellow-100' : 'bg-yellow-50'
              : isHovered ? 'bg-blue-50' : 'bg-white'
        )}
      >
        <div className="flex items-center gap-2">
          <SemaforoIndicator color={colorSemaforo} />
          <div>
            <p className="font-medium text-gray-900 hover:text-blue-600 transition-colors max-w-[200px] truncate">
              {proyecto.nombre}
            </p>
            <p className="text-xs text-gray-400">{proyecto.tipo}</p>
          </div>
        </div>
      </td>

      {/* Foco */}
      <td className="px-4 py-3">
        <span className="text-xs text-gray-500 truncate max-w-[120px] block">
          {proyecto.foco_estrategico}
        </span>
      </td>

      {/* Área */}
      <td className="px-4 py-3">
        {proyecto.area_responsable && (
          <StatusBadge label={proyecto.area_responsable} color="gray" />
        )}
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <EstadoBadge estado={proyecto.estado as ProyectoEstado} />
      </td>

      {/* % Avance */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 min-w-[80px]">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div
              className={cn(
                'h-1.5 rounded-full',
                colorSemaforo === 'VERDE' && 'bg-green-500',
                colorSemaforo === 'AMARILLO' && 'bg-yellow-500',
                colorSemaforo === 'ROJO' && 'bg-red-500'
              )}
              style={{ width: `${proyecto.porcentaje_avance}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-9 text-right">
            {formatPorcentaje(proyecto.porcentaje_avance)}
          </span>
        </div>
      </td>

      {/* Subproyectos */}
      <td className="px-4 py-3">
        {proyecto.subproyectos_count && proyecto.subproyectos_count > 0 ? (
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-gray-700">
              {proyecto.subproyectos_count} sub{proyecto.subproyectos_count !== 1 ? 's' : ''}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-[60px]">
              <div
                className="h-1.5 rounded-full bg-purple-500"
                style={{ width: `${proyecto.subproyectos_avance || 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 w-7 text-right">
              {proyecto.subproyectos_avance}%
            </span>
          </div>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>

      {/* Bloqueos */}
      <td className="px-4 py-3 text-center">
        {proyecto.bloqueos_activos > 0 ? (
          <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            {proyecto.bloqueos_activos}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>

      {/* Plazo */}
      <td className="px-4 py-3">
        <div className="text-xs">
          <p className={cn('font-medium', estaVencido ? 'text-red-600' : 'text-gray-700')}>
            {estaVencido
              ? `Vencido hace ${Math.abs(diasRestantes)}d`
              : `${diasRestantes}d restantes`}
          </p>
          <p className="text-gray-400">{formatDate(proyecto.fecha_fin_planificada)}</p>
        </div>
      </td>

      {/* Responsable */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <UserAvatar nombre={proyecto.responsable_nombre} size="sm" />
          <span className="text-xs text-gray-600 max-w-[100px] truncate">
            {proyecto.responsable_nombre}
          </span>
        </div>
      </td>

      {/* Atención */}
      <td className="px-4 py-3">
        {proyecto.requiere_escalamiento && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> Escalamiento
          </span>
        )}
        {proyecto.bloqueos_activos > 0 && !proyecto.requiere_escalamiento && (
          <span className="text-xs text-red-600 font-medium">Bloqueo</span>
        )}
        {!proyecto.requiere_escalamiento && proyecto.bloqueos_activos === 0 && (
          <span className="text-xs text-gray-400">Sin alerta</span>
        )}
      </td>
    </tr>
  )
}

function SemaforoIndicator({ color }: { color: ColorSemaforo }) {
  const colors = {
    VERDE: 'bg-green-500',
    AMARILLO: 'bg-yellow-500',
    ROJO: 'bg-red-500',
  }
  return <span className={cn('w-3 h-3 rounded-full flex-shrink-0', colors[color])} />
}

function EstadoBadge({ estado }: { estado: ProyectoEstado }) {
  const colores = COLORES_ESTADO[estado] ?? COLORES_ESTADO['Pendiente']
  const colorMap: Record<string, 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'orange'> = {
    'Pendiente': 'gray',
    'En Progreso': 'blue',
    'En Riesgo': 'yellow',
    'Bloqueado': 'red',
    'Completado': 'green',
  }
  return <StatusBadge label={estado} color={colorMap[estado] || 'gray'} />
}
