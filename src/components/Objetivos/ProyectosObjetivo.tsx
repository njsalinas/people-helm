/**
 * @component ProyectosObjetivo
 * Sección para gestionar proyectos vinculados a un objetivo
 */

'use client'

import { useState } from 'react'
import { useProyectos } from '@/hooks/useProjects'
import { useVincularProyecto, useDesvincularProyecto } from '@/hooks/useObjetivos'
import type { Proyecto } from '@/types/domain'

interface ProyectosObjetivoProps {
  objetivoId: string
  proyectosVinculados: Proyecto[]
  onRefresh?: () => void
}

export function ProyectosObjetivo({
  objetivoId,
  proyectosVinculados,
  onRefresh,
}: ProyectosObjetivoProps) {
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { data: todosProyectos = [] } = useProyectos()
  const vincularMutation = useVincularProyecto(objetivoId)
  const desvinculaMutation = useDesvincularProyecto(objetivoId)

  // Proyectos disponibles (no vinculados)
  const vinculadosIds = new Set(proyectosVinculados.map(p => p.id))
  const proyectosDisponibles = todosProyectos.filter(p => !vinculadosIds.has(p.id))

  const filtrados = proyectosDisponibles.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleVincular = async (proyectoId: string) => {
    try {
      await vincularMutation.mutateAsync(proyectoId)
      setSearchTerm('')
      setShowModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error vinculando proyecto:', error)
    }
  }

  const handleDesvincular = async (proyectoId: string) => {
    try {
      await desvinculaMutation.mutateAsync(proyectoId)
      onRefresh?.()
    } catch (error) {
      console.error('Error desvinculando proyecto:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Proyectos Vinculados ({proyectosVinculados.length})
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-300 transition-colors"
        >
          + Agregar
        </button>
      </div>

      {/* Lista de proyectos */}
      {proyectosVinculados.length > 0 ? (
        <div className="space-y-2">
          {proyectosVinculados.map(proyecto => (
            <div
              key={proyecto.id}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{proyecto.nombre}</p>
                <p className="text-xs text-gray-500">
                  {proyecto.area_responsable} · {proyecto.estado} · {proyecto.porcentaje_avance}%
                </p>
              </div>
              <button
                onClick={() => handleDesvincular(proyecto.id)}
                className="ml-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Desvincular"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-sm text-gray-500">Sin proyectos vinculados</p>
        </div>
      )}

      {/* Modal para vincular proyectos */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Vincular Proyectos</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSearchTerm('')
                }}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-100">
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Lista */}
            <div className="max-h-64 overflow-y-auto">
              {filtrados.length > 0 ? (
                filtrados.map(proyecto => (
                  <button
                    key={proyecto.id}
                    onClick={() => handleVincular(proyecto.id)}
                    disabled={vincularMutation.isPending}
                    className="w-full px-6 py-3 text-left border-b border-gray-100 hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{proyecto.nombre}</p>
                      <p className="text-xs text-gray-500">{proyecto.area_responsable}</p>
                    </div>
                    <span className="ml-2 text-xs text-blue-600 font-medium">+</span>
                  </button>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-500">
                    {searchTerm ? 'No hay proyectos que coincidan' : 'Todos los proyectos están vinculados'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
