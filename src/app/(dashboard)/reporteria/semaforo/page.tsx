'use client'

import { useState } from 'react'
import { SemaforoCompleto } from '@/components/Reporteria/SemaforoCompleto'
import { useSemaforos, useGenerarSemaforo, usePublicarSemaforo } from '@/hooks/useSemaforo'
import { useUIStore } from '@/stores/uiStore'
import { nombreMes } from '@/lib/utils'

export default function SemaforoPage() {
  const now = new Date()
  const [anio, setAnio] = useState(now.getFullYear())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: semaforos = [], isLoading } = useSemaforos(anio)
  const generarMutation = useGenerarSemaforo()
  const publicarMutation = usePublicarSemaforo()
  const addToast = useUIStore((s) => s.addToast)

  const selected = semaforos.find((s) => s.id === selectedId) ?? semaforos[0] ?? null

  const handleGenerar = async () => {
    try {
      await generarMutation.mutateAsync({ mes: now.getMonth() + 1, anio: now.getFullYear() })
      addToast({ type: 'success', title: 'Semáforo generado correctamente' })
    } catch (e: unknown) {
      addToast({ type: 'error', title: e instanceof Error ? e.message : 'Error al generar' })
    }
  }

  const handlePublicar = async () => {
    if (!selected) return
    try {
      await publicarMutation.mutateAsync(selected.id)
      addToast({ type: 'success', title: 'Semáforo publicado' })
    } catch (e: unknown) {
      addToast({ type: 'error', title: e instanceof Error ? e.message : 'Error al publicar' })
    }
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Semáforo Mensual</h1>
          <p className="text-sm text-gray-500 mt-0.5">Reporte completo auto-generado de proyectos</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={handleGenerar}
            disabled={generarMutation.isPending}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {generarMutation.isPending ? 'Generando...' : '+ Generar ahora'}
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Sidebar: listado de semáforos */}
        <div className="w-52 flex-shrink-0 space-y-1">
          {isLoading ? (
            <p className="text-xs text-gray-400 px-2 py-4">Cargando...</p>
          ) : semaforos.length === 0 ? (
            <p className="text-xs text-gray-400 px-2 py-4">Sin reportes. Genera el primero.</p>
          ) : (
            semaforos.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  (selected?.id === s.id)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="block font-medium">{nombreMes(s.mes)} {s.anio}</span>
                <span className={`text-xs ${s.estado === 'Publicado' ? 'text-green-600' : 'text-gray-400'}`}>
                  {s.estado}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <SemaforoCompleto
              semaforo={selected}
              onGenerarAbreviado={() => window.location.href = `/reporteria/semaforo-abreviado?id=${selected.id}`}
              onExport={selected.estado === 'Borrador' ? handlePublicar : undefined}
            />
          ) : !isLoading ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-sm">No hay semáforos para este año.</p>
              <p className="text-xs mt-1">Haz clic en "Generar ahora" para crear el primero.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
