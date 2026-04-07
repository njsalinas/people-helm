/**
 * @component TaskTable
 * Vista de lista con todas las tareas de un proyecto en tabla
 *
 * @example
 * <TaskTable tareas={tareas} onTaskClick={(id) => openDetail(id)} />
 */

'use client'

import { useState } from 'react'
import type { Tarea, TareaEstado } from '@/types'
import { cn, formatDate, calcularDiasRestantes, formatPorcentaje, obtenerIniciales } from '@/lib/utils'
import { COLORES_ESTADO } from '@/types/domain'

interface TaskTableProps {
  tareas: Tarea[]
  onTaskClick: (tareaId: string) => void
  canEdit?: boolean
}

type SortKey = 'nombre' | 'estado' | 'porcentaje_avance' | 'fecha_fin_planificada'

export function TaskTable({ tareas, onTaskClick, canEdit = true }: TaskTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('fecha_fin_planificada')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...tareas].sort((a, b) => {
    const aVal = a[sortKey] as string | number
    const bVal = b[sortKey] as string | number
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {[
              { key: 'nombre', label: 'Tarea' },
              { key: 'estado', label: 'Estado' },
              { key: 'porcentaje_avance', label: '%' },
              { key: null, label: 'Responsable' },
              { key: 'fecha_fin_planificada', label: 'Plazo' },
              { key: null, label: 'Bloqueos' },
              { key: null, label: 'Últ. 24h' },
            ].map((col) => (
              <th
                key={col.label}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap',
                  col.key && 'cursor-pointer hover:text-gray-700 select-none'
                )}
                onClick={() => col.key && handleSort(col.key as SortKey)}
              >
                {col.key === sortKey
                  ? `${col.label} ${sortDir === 'asc' ? '↑' : '↓'}`
                  : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                Sin tareas
              </td>
            </tr>
          ) : (
            sorted.map((tarea) => <TaskRow key={tarea.id} tarea={tarea} onClick={() => onTaskClick(tarea.id)} />)
          )}
        </tbody>
      </table>
    </div>
  )
}

function TaskRow({ tarea, onClick }: { tarea: Tarea; onClick: () => void }) {
  const diasRestantes = calcularDiasRestantes(tarea.fecha_fin_planificada)
  const estaVencida = diasRestantes < 0
  const bloqueos = tarea.bloqueos?.filter((b) => b.estado === 'Activo') ?? []
  const colores = COLORES_ESTADO[tarea.estado] ?? COLORES_ESTADO['Pendiente']

  // Detectar si cambió en las últimas 24h
  const fue24h = tarea.updated_at
    ? new Date(tarea.updated_at).getTime() > Date.now() - 86400000
    : false

  return (
    <tr
      className={cn(
        'hover:bg-gray-50 cursor-pointer transition-colors',
        tarea.estado === 'Bloqueado' && 'bg-red-50',
      )}
      onClick={onClick}
    >
      {/* Nombre */}
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900 hover:text-blue-600 truncate max-w-[200px]">
          {tarea.nombre}
        </p>
        {tarea.descripcion && (
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{tarea.descripcion}</p>
        )}
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colores.bg, colores.text)}>
          {tarea.estado}
        </span>
      </td>

      {/* % Avance */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${tarea.porcentaje_avance}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">{formatPorcentaje(tarea.porcentaje_avance)}</span>
        </div>
      </td>

      {/* Responsable */}
      <td className="px-4 py-3">
        {tarea.responsable && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
              {obtenerIniciales(tarea.responsable.nombre_completo)}
            </div>
            <span className="text-xs text-gray-600 truncate max-w-[90px]">
              {tarea.responsable.nombre_completo.split(' ')[0]}
            </span>
          </div>
        )}
      </td>

      {/* Plazo */}
      <td className="px-4 py-3">
        <span className={cn('text-xs font-medium', estaVencida ? 'text-red-600' : 'text-gray-600')}>
          {formatDate(tarea.fecha_fin_planificada)}
        </span>
      </td>

      {/* Bloqueos */}
      <td className="px-4 py-3 text-center">
        {bloqueos.length > 0 ? (
          <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            {bloqueos.length}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>

      {/* Últ 24h */}
      <td className="px-4 py-3">
        {fue24h ? (
          <span className="text-xs text-blue-600 font-medium">Actualizado</span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>
    </tr>
  )
}
