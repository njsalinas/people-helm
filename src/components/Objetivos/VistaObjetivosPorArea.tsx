/**
 * @component VistaObjetivosPorArea
 * Vista de seguimiento de objetivos agrupada por área
 * Muestra semáforos, progreso y métricas por objetivo
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useObjetivos } from '@/hooks/useObjetivos'
import { useAreas } from '@/hooks/useAreas'
import { ObjetivoCard } from './ObjetivoCard'
import { ProyectosObjetivo } from './ProyectosObjetivo'
import { ObjetivoForm } from './ObjetivoForm'


interface VistaObjetivosPorAreaProps {
  anio?: number
  onRefresh?: () => void
}

export function VistaObjetivosPorArea({ anio = new Date().getFullYear(), onRefresh }: VistaObjetivosPorAreaProps) {
  const [selectedAnio, setSelectedAnio] = useState(anio)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [editingObjetivo, setEditingObjetivo] = useState<any | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [expandedObjetivo, setExpandedObjetivo] = useState<string | null>(null)
  const [autoOpenModalForObjetivo, setAutoOpenModalForObjetivo] = useState<string | null>(null)
  const [autoOpenModalKey, setAutoOpenModalKey] = useState(0)

  const { isGerente } = useAuth()
  const { data: areas = [] } = useAreas()
  const { data: objetivosData = [], isLoading, refetch } = useObjetivos({
    anio: selectedAnio,
    area_id: selectedAreaId || undefined,
  })

  const areaNamesMap = new Map(areas.map(a => [a.id, a.nombre]))

  // Agrupar objetivos por área
  const objetivosPorArea = new Map<string, any[]>()
  objetivosData.forEach(obj => {
    const areaNombre = areaNamesMap.get(obj.area_responsable_id) || 'Desconocida'
    if (!objetivosPorArea.has(areaNombre)) {
      objetivosPorArea.set(areaNombre, [])
    }
    objetivosPorArea.get(areaNombre)!.push(obj)
  })

  const handleRefresh = () => {
    refetch()
    onRefresh?.()
  }

  const areasSorted = Array.from(areas).sort((a, b) => a.nombre.localeCompare(b.nombre))

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
        <button
          onClick={() => {
            setEditingObjetivo(null)
            setShowForm(true)
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          + Nuevo Objetivo
        </button>
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando objetivos...</p>
        </div>
      ) : objetivosData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay objetivos para los filtros seleccionados</p>
          <button
            onClick={() => {
              setEditingObjetivo(null)
              setShowForm(true)
            }}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-300"
          >
            Crear el primer objetivo
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {areasSorted.map(area => {
            const objetivos = objetivosPorArea.get(area.nombre) || []
            if (objetivos.length === 0) return null

            return (
              <div key={area.id}>
                {/* Encabezado de área */}
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">{area.nombre}</h2>
                  <p className="text-xs text-gray-500">{objetivos.length} objetivo{objetivos.length !== 1 ? 's' : ''} activo{objetivos.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Grid de objetivos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {objetivos.map(obj => (
                    <div key={obj.id}>
                      <ObjetivoCard
                        id={obj.id}
                        titulo={obj.titulo}
                        anio={obj.anio}
                        areaNombre={area.nombre}
                        status={obj.status}
                        totalProyectos={obj.total_proyectos || 0}
                        avancePromedio={obj.avance_promedio || 0}
                        proyectosBloqueados={obj.proyectos_bloqueados || 0}
                        colorSemaforo={obj.color_semaforo || 'VERDE'}
                        onEdit={isGerente
                          ? () => {
                              setEditingObjetivo(obj)
                              setShowForm(true)
                            }
                          : undefined}
                        onViewProjects={() => setExpandedObjetivo(
                          expandedObjetivo === obj.id ? null : obj.id
                        )}
                        onAddProject={() => {
                          setExpandedObjetivo(obj.id)
                          setAutoOpenModalForObjetivo(obj.id)
                          setAutoOpenModalKey(prev => prev + 1)
                        }}
                      />
                      {expandedObjetivo === obj.id && (
                        <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <ProyectosObjetivo
                            objetivoId={obj.id}
                            proyectosVinculados={[]}
                            onRefresh={handleRefresh}
                            autoOpenModalKey={autoOpenModalForObjetivo === obj.id ? autoOpenModalKey : undefined}
                          />
                        </div>
                      )}
                    </div>
                  ))}
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
          onSubmit={async (_data) => {
            handleRefresh()
          }}
          onClose={() => {
            setShowForm(false)
            setEditingObjetivo(null)
            handleRefresh()
          }}
        />
      )}
    </div>
  )
}
