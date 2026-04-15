/**
 * @component ObjetivosMainView
 * Vista principal de objetivos agrupada por área
 * Muestra resumen de cada objetivo con acceso a detalle
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useObjetivos, useCrearObjetivo, useActualizarObjetivo } from '@/hooks/useObjetivos'
import { useAreas } from '@/hooks/useAreas'
import { useAuth } from '@/hooks/useAuth'
import { ObjetivoForm } from './ObjetivoForm'
import { ProyectosObjetivo } from './ProyectosObjetivo'
import { COLORES_SEMAFORO } from '@/types/domain'


interface ObjetivosMainViewProps {
  anio?: number
}

export function ObjetivosMainView({ anio = new Date().getFullYear() }: ObjetivosMainViewProps) {
  const [selectedAnio, setSelectedAnio] = useState(anio)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingObjetivo, setEditingObjetivo] = useState<any | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [expandedObjetivo, setExpandedObjetivo] = useState<string | null>(null)

  const { isGerente } = useAuth()
  const { data: areas = [] } = useAreas()
  const { data: objetivosData = [], isLoading, refetch } = useObjetivos({
    anio: selectedAnio,
    area_id: selectedAreaId || undefined,
  })
  const crearObjetivo = useCrearObjetivo()
  const actualizarObjetivo = useActualizarObjetivo(editingObjetivo?.id || '')

  // Agrupar objetivos por área
  const areaNamesMap = new Map(areas.map(a => [a.id, a.nombre]))
  const objetivosPorArea = new Map<string, any[]>()

  objetivosData.forEach(obj => {
    const areaNombre = areaNamesMap.get(obj.area_responsable_id) || 'Desconocida'
    if (!objetivosPorArea.has(areaNombre)) {
      objetivosPorArea.set(areaNombre, [])
    }
    objetivosPorArea.get(areaNombre)!.push(obj)
  })

  const areasSorted = Array.from(areas).sort((a, b) => a.nombre.localeCompare(b.nombre))

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Año
            </label>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Área
            </label>
            <select
              value={selectedAreaId || ''}
              onChange={(e) => setSelectedAreaId(e.target.value || null)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las áreas</option>
              {areasSorted.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        {isGerente && (
          <button
            onClick={() => {
              setEditingObjetivo(null)
              setShowForm(true)
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            + Nuevo Objetivo
          </button>
        )}
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando objetivos...</p>
        </div>
      ) : objetivosData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay objetivos para los filtros seleccionados</p>
        </div>
      ) : (
        <div className="space-y-8">
          {areasSorted.map(area => {
            const objetivos = objetivosPorArea.get(area.nombre) || []
            if (objetivos.length === 0) return null

            return (
              <div key={area.id}>
                {/* Encabezado de área */}
                <div className="mb-6 pb-3 border-b-2 border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">{area.nombre}</h2>
                  <p className="text-sm text-gray-500">{objetivos.length} objetivo{objetivos.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Grid de objetivos con resumen */}
                <div className="space-y-4">
                  {objetivos.map(obj => {
                    const colores = COLORES_SEMAFORO[(obj.color_semaforo || 'VERDE') as keyof typeof COLORES_SEMAFORO] ?? COLORES_SEMAFORO.VERDE
                    const proyectosBloqueados = obj.proyectos_bloqueados || 0

                    return (
                      <div
                        key={obj.id}
                        className={`rounded-lg border-2 p-5 transition-all hover:shadow-md border-gray-200 ${colores.bg}`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-4 h-4 rounded-full ${colores.dot}`} />
                              <h3 className="text-lg font-semibold text-gray-900">{obj.titulo}</h3>
                              <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-gray-200">
                                {obj.status === 'draft' ? 'Borrador' : obj.status === 'active' ? 'Activo' : obj.status === 'completed' ? 'Completado' : 'Archivado'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{obj.anio}</p>
                          </div>
                          <Link
                            href={`/dashboard/objetivos/${obj.id}`}
                            className="text-2xl text-gray-700 hover:text-blue-600 transition-colors"
                            title="Ver detalle del objetivo"
                          >
                            →
                          </Link>
                        </div>

                        {/* Descripción */}
                        {obj.descripcion && (
                          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{obj.descripcion}</p>
                        )}

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-700 mb-1">
                            <span>Avance promedio</span>
                            <span className="font-semibold">{obj.avance_promedio || 0}%</span>
                          </div>
                          <div className="h-2.5 bg-white rounded-full overflow-hidden border border-gray-300">
                            <div
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${obj.avance_promedio || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-3">
                          {/* Proyectos */}
                          <div className="bg-white/60 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-gray-900">{obj.total_proyectos || 0}</div>
                            <div className="text-xs text-gray-600">Proyecto{(obj.total_proyectos || 0) !== 1 ? 's' : ''}</div>
                          </div>

                          {/* Bloqueados */}
                          <div className="bg-white/60 rounded-lg p-2 text-center">
                            <div className={`text-xl font-bold ${proyectosBloqueados > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              {proyectosBloqueados}
                            </div>
                            <div className="text-xs text-gray-600">Bloqueado{proyectosBloqueados !== 1 ? 's' : ''}</div>
                          </div>

                          {/* Completados */}
                          <div className="bg-white/60 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-gray-900">{obj.proyectos_completados || 0}</div>
                            <div className="text-xs text-gray-600">Completado{(obj.proyectos_completados || 0) !== 1 ? 's' : ''}</div>
                          </div>

                          {/* En riesgo */}
                          <div className="bg-white/60 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-yellow-600">{obj.proyectos_en_riesgo || 0}</div>
                            <div className="text-xs text-gray-600">En riesgo</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setExpandedObjetivo(expandedObjetivo === obj.id ? null : obj.id)}
                            className="w-full px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-md border border-blue-300 transition-colors duration-150"
                          >
                            Ver proyectos
                          </button>
                          {isGerente && (
                            <button
                              onClick={() => {
                                setEditingObjetivo(obj)
                                setShowForm(true)
                              }}
                              className="px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 bg-white rounded-md border border-gray-300 transition-colors duration-150"
                            >
                              Editar objetivo
                            </button>
                          )}
                        </div>

                        {expandedObjetivo === obj.id && (
                          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <ProyectosObjetivo
                              objetivoId={obj.id}
                              proyectosVinculados={[]}
                              onRefresh={handleRefresh}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <ObjetivoForm
          objetivo={editingObjetivo}
          onSubmit={async (data) => {
            try {
              setFormError(null)
              if (editingObjetivo?.id) {
                await actualizarObjetivo.mutateAsync(data as any)
              } else {
                await crearObjetivo.mutateAsync(data as any)
              }
              setShowForm(false)
              setEditingObjetivo(null)
              await refetch()
            } catch (error) {
              setFormError(
                error instanceof Error ? error.message : 'Error al guardar el objetivo'
              )
            }
          }}
          onClose={() => {
            setShowForm(false)
            setEditingObjetivo(null)
            setFormError(null)
            refetch()
          }}
          isLoading={crearObjetivo.isPending || actualizarObjetivo.isPending}
        />
      )}

      {/* Toast de error */}
      {formError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          {formError}
        </div>
      )}
    </div>
  )
}
