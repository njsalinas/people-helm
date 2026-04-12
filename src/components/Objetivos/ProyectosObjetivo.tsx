/**
 * @component ProyectosObjetivo
 * Sección para gestionar proyectos vinculados a un objetivo
 */

'use client'

import { useEffect, useState } from 'react'
import { useProyectos } from '@/hooks/useProjects'
import { useVincularProyecto, useDesvincularProyecto, useObjetivo } from '@/hooks/useObjetivos'
import type { Proyecto } from '@/types/domain'

interface ProyectosObjetivoProps {
  objetivoId: string
  proyectosVinculados: Proyecto[]
  onRefresh?: () => void
  autoOpenModalKey?: number
}

export function ProyectosObjetivo({
  objetivoId,
  proyectosVinculados,
  onRefresh,
  autoOpenModalKey,
}: ProyectosObjetivoProps) {
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { data: todosProyectos = [] } = useProyectos()
  const { data: objetivoDetalle } = useObjetivo(objetivoId)
  const vincularMutation = useVincularProyecto(objetivoId)
  const desvinculaMutation = useDesvincularProyecto(objetivoId)

  // Si no viene la lista por props, reconstruirla desde el detalle del objetivo
  const proyectosVinculadosResueltos = proyectosVinculados.length > 0
    ? proyectosVinculados
    : todosProyectos.filter(p =>
        (objetivoDetalle as any)?.objetivo_proyecto?.some((op: any) => op.proyecto_id === p.id)
      )

  // Proyectos disponibles (no vinculados)
  const vinculadosIds = new Set(proyectosVinculadosResueltos.map(p => p.id))
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

  useEffect(() => {
    if (autoOpenModalKey !== undefined) {
      setShowModal(true)
    }
  }, [autoOpenModalKey])

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Proyectos Vinculados
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
              {proyectosVinculadosResueltos.length} proyecto{proyectosVinculadosResueltos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg border border-blue-600 transition-colors flex items-center gap-1.5 shadow-md"
            title="Agregar nuevos proyectos"
          >
            <span className="text-lg">+</span>
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* Lista de proyectos */}
      {proyectosVinculadosResueltos.length > 0 ? (
        <div className="space-y-2">
          {proyectosVinculadosResueltos.map(proyecto => (
            <div
              key={proyecto.id}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{proyecto.nombre}</p>
                <p className="text-xs text-gray-500">
                  {(proyecto as any).area_responsable} · {proyecto.estado} · {proyecto.porcentaje_avance}%
                </p>
              </div>
              <div className="ml-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={`/dashboard/proyectos/${proyecto.id}`}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Ver proyecto"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </a>
                <button
                  onClick={() => handleDesvincular(proyecto.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Quitar proyecto"
                  disabled={desvinculaMutation.isPending}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-sm text-gray-500 mb-3">Sin proyectos vinculados</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Agregar el primer proyecto
          </button>
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
