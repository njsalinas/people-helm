/**
 * @component SemaforoAbreviado
 * Editor interactivo del semáforo abreviado (top 3 por color, editable)
 *
 * @example
 * <SemaforoAbreviado semaforo={semaforo} proyectos={proyectos} onSave={handleSave} />
 */

'use client'

import { useState } from 'react'
import type { DbSemaforo } from '@/types/database'
import type { ProyectoGerencial } from '@/types'
import { TablaEditable, type TablaEditableItem } from './TablaEditable'
import { nombreMes } from '@/lib/utils'
import { COMENTARIO_EJECUTIVO_MAX } from '@/lib/constants'

interface SemaforoAbreviadoProps {
  semaforo: DbSemaforo
  proyectos: ProyectoGerencial[]
  onSave?: (data: SemaforoAbreviadoData) => Promise<void>
  onExport?: () => void
}

export interface SemaforoAbreviadoData {
  semaforo_id: string
  verde: TablaEditableItem[]
  amarillo: TablaEditableItem[]
  rojo: TablaEditableItem[]
  comentario_verde: string
  comentario_amarillo: string
  comentario_rojo: string
}

function proyectoToTablaItem(p: ProyectoGerencial): TablaEditableItem {
  return {
    proyecto_id: p.id,
    area: p.area_responsable,
    categoria: p.categoria,
    proyecto: p.nombre,
    detalle: '',
  }
}

export function SemaforoAbreviado({ semaforo, proyectos, onSave, onExport }: SemaforoAbreviadoProps) {
  const [isSaving, setIsSaving] = useState(false)

  // Pre-rellenar con top 3 por color (sugerencia del sistema)
  const sugerenciasVerde = proyectos
    .filter((p) => p.color_semaforo === 'VERDE')
    .slice(0, 3)
    .map(proyectoToTablaItem)

  const sugerenciasAmarillo = proyectos
    .filter((p) => p.color_semaforo === 'AMARILLO')
    .slice(0, 3)
    .map(proyectoToTablaItem)

  const sugerenciasRojo = proyectos
    .filter((p) => p.color_semaforo === 'ROJO')
    .slice(0, 3)
    .map(proyectoToTablaItem)

  const [verde, setVerde] = useState<TablaEditableItem[]>(sugerenciasVerde)
  const [amarillo, setAmarillo] = useState<TablaEditableItem[]>(sugerenciasAmarillo)
  const [rojo, setRojo] = useState<TablaEditableItem[]>(sugerenciasRojo)
  const [comentarioVerde, setComentarioVerde] = useState(semaforo.comentario_ejecutivo_verde ?? '')
  const [comentarioAmarillo, setComentarioAmarillo] = useState(semaforo.comentario_ejecutivo_amarillo ?? '')
  const [comentarioRojo, setComentarioRojo] = useState(semaforo.comentario_ejecutivo_rojo ?? '')

  const handleSave = async () => {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave({
        semaforo_id: semaforo.id,
        verde,
        amarillo,
        rojo,
        comentario_verde: comentarioVerde,
        comentario_amarillo: comentarioAmarillo,
        comentario_rojo: comentarioRojo,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase">Semáforo Abreviado</p>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">
              {nombreMes(semaforo.mes)} {semaforo.anio}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona y edita los 3 items más relevantes por color para el informe ejecutivo
            </p>
          </div>
          <div className="flex gap-2">
            {onSave && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                📥 Exportar PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verde */}
      <div className="space-y-3">
        <TablaEditable
          items={verde}
          color="verde"
          onChange={setVerde}
          onRemoveItem={(i) => setVerde((prev) => prev.filter((_, idx) => idx !== i))}
        />
        <ComentarioEjecutivo
          label="🟢 Comentario ejecutivo verde"
          value={comentarioVerde}
          onChange={setComentarioVerde}
        />
      </div>

      {/* Amarillo */}
      {amarillo.length > 0 && (
        <div className="space-y-3">
          <TablaEditable
            items={amarillo}
            color="amarillo"
            onChange={setAmarillo}
            onRemoveItem={(i) => setAmarillo((prev) => prev.filter((_, idx) => idx !== i))}
          />
          <ComentarioEjecutivo
            label="🟡 Comentario ejecutivo amarillo"
            value={comentarioAmarillo}
            onChange={setComentarioAmarillo}
          />
        </div>
      )}

      {/* Rojo */}
      {rojo.length > 0 && (
        <div className="space-y-3">
          <TablaEditable
            items={rojo}
            color="rojo"
            onChange={setRojo}
            onRemoveItem={(i) => setRojo((prev) => prev.filter((_, idx) => idx !== i))}
          />
          <ComentarioEjecutivo
            label="🔴 Comentario ejecutivo rojo"
            value={comentarioRojo}
            onChange={setComentarioRojo}
          />
        </div>
      )}
    </div>
  )
}

function ComentarioEjecutivo({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={COMENTARIO_EJECUTIVO_MAX}
        rows={3}
        placeholder="Redacta el comentario ejecutivo para este bloque..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <p className="text-xs text-gray-400 text-right mt-0.5">
        {value.length}/{COMENTARIO_EJECUTIVO_MAX}
      </p>
    </div>
  )
}
