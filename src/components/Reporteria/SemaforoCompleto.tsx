/**
 * @component SemaforoCompleto
 * Vista del semáforo mensual completo auto-generado
 *
 * @example
 * <SemaforoCompleto semaforo={semaforo} onExport={handleExport} />
 */

'use client'

import type { DbSemaforo, SemaforoContenidoAuto, SemaforoItemAuto } from '@/types/database'
import { cn, nombreMes } from '@/lib/utils'

interface SemaforoCompletoProps {
  semaforo: DbSemaforo
  onExport?: () => void
  onGenerarAbreviado?: () => void
}

export function SemaforoCompleto({ semaforo, onExport, onGenerarAbreviado }: SemaforoCompletoProps) {
  const contenido = semaforo.contenido_automatico as SemaforoContenidoAuto | null
  if (!contenido) {
    return (
      <div className="text-center py-12 text-gray-400">
        Sin contenido generado
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Semáforo Mensual</p>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">
              {nombreMes(semaforo.mes)} {semaforo.anio}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <EstadoBadge estado={semaforo.estado} />
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-green-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                  {contenido.verde.length} Verde
                </span>
                <span className="flex items-center gap-1.5 text-yellow-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                  {contenido.amarillo.length} Amarillo
                </span>
                <span className="flex items-center gap-1.5 text-red-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  {contenido.rojo.length} Rojo
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onGenerarAbreviado && (
              <button
                onClick={onGenerarAbreviado}
                className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Generar Abreviado
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                📥 Exportar PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secciones de color */}
      <SemaforoSection
        color="VERDE"
        titulo="Logros Principales"
        items={contenido.verde}
        comentarioEjecutivo={semaforo.comentario_ejecutivo_verde}
        accion="Mantener ritmo de ejecución"
      />

      {contenido.amarillo.length > 0 && (
        <SemaforoSection
          color="AMARILLO"
          titulo="Temas en Seguimiento"
          items={contenido.amarillo}
          comentarioEjecutivo={semaforo.comentario_ejecutivo_amarillo}
          accion="Seguimiento activo requerido"
        />
      )}

      {contenido.rojo.length > 0 && (
        <SemaforoSection
          color="ROJO"
          titulo="Críticos / Bloqueados"
          items={contenido.rojo}
          comentarioEjecutivo={semaforo.comentario_ejecutivo_rojo}
          accion="Intervención inmediata requerida"
        />
      )}
    </div>
  )
}

function SemaforoSection({
  color,
  titulo,
  items,
  comentarioEjecutivo,
  accion,
}: {
  color: 'VERDE' | 'AMARILLO' | 'ROJO'
  titulo: string
  items: SemaforoItemAuto[]
  comentarioEjecutivo?: string | null
  accion: string
}) {
  const estilos = {
    VERDE: {
      border: 'border-green-200',
      header: 'bg-green-50 border-b border-green-200',
      titulo: 'text-green-800',
      dot: 'bg-green-500',
      icono: '🟢',
    },
    AMARILLO: {
      border: 'border-yellow-200',
      header: 'bg-yellow-50 border-b border-yellow-200',
      titulo: 'text-yellow-800',
      dot: 'bg-yellow-500',
      icono: '🟡',
    },
    ROJO: {
      border: 'border-red-200',
      header: 'bg-red-50 border-b border-red-200',
      titulo: 'text-red-800',
      dot: 'bg-red-500',
      icono: '🔴',
    },
  }[color]

  return (
    <div className={cn('bg-white rounded-xl border overflow-hidden', estilos.border)}>
      <div className={cn('px-5 py-3', estilos.header)}>
        <h3 className={cn('font-bold flex items-center gap-2', estilos.titulo)}>
          <span>{estilos.icono}</span>
          {color} — {items.length} {titulo}
        </h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Items */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', estilos.dot)} />
              <div>
                <span className="text-sm font-medium text-gray-900">{item.nombre}: </span>
                <span className="text-sm text-gray-600">{item.comentario}</span>
                <span className="text-xs text-gray-400 ml-2">({item.area})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Comentario ejecutivo */}
        {comentarioEjecutivo && (
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 italic border-l-4 border-gray-200">
            {comentarioEjecutivo}
          </div>
        )}

        {/* Acción */}
        <div className="text-sm text-gray-500">
          <span className="font-medium">Acción: </span>{accion}
        </div>
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const colores: Record<string, string> = {
    Borrador: 'bg-gray-100 text-gray-700',
    Publicado: 'bg-green-100 text-green-700',
    Archivado: 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', colores[estado] ?? 'bg-gray-100 text-gray-700')}>
      {estado}
    </span>
  )
}
