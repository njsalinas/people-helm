/**
 * @component VistaGerencial
 * Tabla dinámica principal con todos los proyectos y su estado
 *
 * @example
 * <VistaGerencial proyectos={proyectos} onSelectProject={(id) => router.push(`/proyectos/${id}`)} />
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProyectoGerencial, ProyectoEstado, ColorSemaforo } from '@/types'
import { cn, formatDate, calcularDiasRestantes, formatPorcentaje, obtenerIniciales } from '@/lib/utils'
import { COLORES_ESTADO, COLORES_SEMAFORO } from '@/types/domain'

interface VistaGerencialProps {
  proyectos: ProyectoGerencial[]
  isLoading?: boolean
  onSelectProject?: (id: string) => void
}

type SortKey = 'nombre' | 'estado' | 'porcentaje_avance' | 'bloqueos_activos' | 'prioridad' | 'dias_restantes' | 'area_responsable'

export function VistaGerencial({ proyectos, isLoading, onSelectProject }: VistaGerencialProps) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('prioridad')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...proyectos].sort((a, b) => {
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <Th label="Proyecto / Línea" sortKey="nombre" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Foco" sortKey="area_responsable" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Área" sortKey="area_responsable" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Estado" sortKey="estado" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="% Avance" sortKey="porcentaje_avance" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Bloqueos" sortKey="bloqueos_activos" current={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Plazo" sortKey="dias_restantes" current={sortKey} dir={sortDir} onSort={handleSort} />
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Responsable
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                No hay proyectos que coincidan con los filtros
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
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: 'asc' | 'desc'
  onSort: (k: SortKey) => void
}) {
  const active = current === key
  return (
    <th
      onClick={() => onSort(key)}
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 whitespace-nowrap select-none"
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={cn('text-gray-300', active && 'text-gray-600')}>
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
    proyecto.estado === 'Bloqueado' && 'bg-red-50',
    proyecto.estado === 'En Riesgo' && 'bg-yellow-50',
    isHovered && 'bg-blue-50'
  )

  return (
    <tr
      className={rowBg}
      onMouseEnter={() => onHover(proyecto.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      {/* Proyecto */}
      <td className="px-4 py-3">
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
        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
          {proyecto.area_responsable}
        </span>
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
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {obtenerIniciales(proyecto.responsable_nombre)}
          </div>
          <span className="text-xs text-gray-600 max-w-[100px] truncate">
            {proyecto.responsable_nombre}
          </span>
        </div>
      </td>

      {/* Acción requerida */}
      <td className="px-4 py-3">
        {proyecto.requiere_escalamiento && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
            <span>⚠</span> Escalamiento
          </span>
        )}
        {proyecto.bloqueos_activos > 0 && !proyecto.requiere_escalamiento && (
          <span className="text-xs text-red-600">Bloqueo</span>
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
  return <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', colors[color])} />
}

function EstadoBadge({ estado }: { estado: ProyectoEstado }) {
  const colores = COLORES_ESTADO[estado] ?? COLORES_ESTADO['Pendiente']
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        colores.bg,
        colores.text
      )}
    >
      {estado}
    </span>
  )
}
