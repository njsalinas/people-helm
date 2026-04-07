/**
 * @component TablaEditable
 * Tabla editable para el semáforo abreviado (campo Detalle editable inline)
 *
 * @example
 * <TablaEditable items={items} color="verde" onChange={handleChange} />
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DETALLE_SEMAFORO_MAX } from '@/lib/constants'

export interface TablaEditableItem {
  proyecto_id: string
  area: string
  categoria: string
  proyecto: string
  detalle: string
}

interface TablaEditableProps {
  items: TablaEditableItem[]
  color: 'verde' | 'amarillo' | 'rojo'
  onChange: (items: TablaEditableItem[]) => void
  onAddItem?: () => void
  onRemoveItem?: (index: number) => void
}

const COLORES = {
  verde: { header: 'bg-green-50 border-green-200', titulo: 'text-green-800', icono: '🟢' },
  amarillo: { header: 'bg-yellow-50 border-yellow-200', titulo: 'text-yellow-800', icono: '🟡' },
  rojo: { header: 'bg-red-50 border-red-200', titulo: 'text-red-800', icono: '🔴' },
}

export function TablaEditable({ items, color, onChange, onAddItem, onRemoveItem }: TablaEditableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const estilos = COLORES[color]

  const updateDetalle = (index: number, detalle: string) => {
    const updated = items.map((item, i) => (i === index ? { ...item, detalle } : item))
    onChange(updated)
  }

  return (
    <div className={cn('border rounded-xl overflow-hidden', estilos.header.split(' ')[1])}>
      {/* Header */}
      <div className={cn('px-4 py-3 border-b', estilos.header)}>
        <h4 className={cn('font-semibold flex items-center gap-2', estilos.titulo)}>
          <span>{estilos.icono}</span>
          {color.charAt(0).toUpperCase() + color.slice(1)} — {items.length} items
        </h4>
      </div>

      {/* Tabla */}
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Área</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Proyecto</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
              Detalle ✏️
            </th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr key={item.proyecto_id} className="hover:bg-gray-50">
              <td className="px-4 py-2.5 text-gray-700 text-xs">{item.area}</td>
              <td className="px-4 py-2.5 text-gray-700 text-xs">{item.categoria}</td>
              <td className="px-4 py-2.5 font-medium text-gray-900 text-xs">{item.proyecto}</td>
              <td className="px-4 py-2.5">
                {editingIndex === i ? (
                  <div>
                    <input
                      type="text"
                      value={item.detalle}
                      maxLength={DETALLE_SEMAFORO_MAX}
                      onChange={(e) => updateDetalle(i, e.target.value)}
                      onBlur={() => setEditingIndex(null)}
                      autoFocus
                      className="w-full border border-blue-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className="text-xs text-gray-400 mt-0.5 text-right">
                      {item.detalle.length}/{DETALLE_SEMAFORO_MAX}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingIndex(i)}
                    className={cn(
                      'text-left w-full text-xs rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors',
                      item.detalle ? 'text-gray-700' : 'text-gray-400 italic'
                    )}
                  >
                    {item.detalle || 'Click para editar...'}
                  </button>
                )}
              </td>
              <td className="px-2 py-2.5">
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(i)}
                    className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
                    title="Eliminar fila"
                  >
                    ×
                  </button>
                )}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-400">
                Sin items. Agrega proyectos para este color.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {onAddItem && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button
            onClick={onAddItem}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            + Agregar fila
          </button>
        </div>
      )}
    </div>
  )
}
