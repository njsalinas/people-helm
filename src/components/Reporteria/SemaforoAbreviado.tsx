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
    area: p.area_responsable || '',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Semáforo Abreviado</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {nombreMes(semaforo.mes)} {semaforo.anio}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Selecciona y edita los 3 items más relevantes por color para el informe ejecutivo
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {onSave && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-sm font-semibold bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-all duration-150 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="text-sm font-semibold border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-all duration-150 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1m3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Exportar PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verde */}
      <div className="space-y-4 border-l-4 border-green-500 pl-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <h3 className="font-semibold text-gray-900 text-lg">En Línea</h3>
        </div>
        <TablaEditable
          items={verde}
          color="verde"
          onChange={setVerde}
          onRemoveItem={(i) => setVerde((prev) => prev.filter((_, idx) => idx !== i))}
        />
        <ComentarioEjecutivo
          label="Comentario ejecutivo"
          value={comentarioVerde}
          onChange={setComentarioVerde}
        />
      </div>

      {/* Amarillo */}
      {amarillo.length > 0 && (
        <div className="space-y-4 border-l-4 border-yellow-500 pl-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <h3 className="font-semibold text-gray-900 text-lg">Requiere Atención</h3>
          </div>
          <TablaEditable
            items={amarillo}
            color="amarillo"
            onChange={setAmarillo}
            onRemoveItem={(i) => setAmarillo((prev) => prev.filter((_, idx) => idx !== i))}
          />
          <ComentarioEjecutivo
            label="Comentario ejecutivo"
            value={comentarioAmarillo}
            onChange={setComentarioAmarillo}
          />
        </div>
      )}

      {/* Rojo */}
      {rojo.length > 0 && (
        <div className="space-y-4 border-l-4 border-red-500 pl-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <h3 className="font-semibold text-gray-900 text-lg">En Riesgo</h3>
          </div>
          <TablaEditable
            items={rojo}
            color="rojo"
            onChange={setRojo}
            onRemoveItem={(i) => setRojo((prev) => prev.filter((_, idx) => idx !== i))}
          />
          <ComentarioEjecutivo
            label="Comentario ejecutivo"
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
