/**
 * @component ProyectoDetail
 * Vista de detalle de un proyecto con 3 pestañas: Kanban, Timeline, Lista
 *
 * @example
 * <ProyectoDetail proyectoId={id} />
 */

'use client'

import { useState, useEffect } from 'react'
import type { Proyecto, ProyectoEstado } from '@/types'
import { KanbanBoard } from './Kanban/KanbanBoard'
import { TimelineChart } from './Timeline/TimelineChart'
import { TaskTable } from './Lista/TaskTable'
import { useTareas } from '@/hooks/useTareas'
import { useActualizarEstadoProyecto } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { cn, formatDate, calcularDiasRestantes, formatPorcentaje, obtenerIniciales, canEditProject } from '@/lib/utils'
import { COLORES_ESTADO, ESTADOS_PROYECTO } from '@/types/domain'
import { TaskDetailModal } from './Kanban/TaskDetailModal'
import { ProyectoEditForm } from './ProyectoEditForm'
import { SubproyectoList } from './SubproyectoList'

interface ProyectoDetailProps {
  proyecto: Proyecto
}

type Tab = 'kanban' | 'timeline' | 'lista'

export function ProyectoDetail({ proyecto }: ProyectoDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('kanban')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showEstadoModal, setShowEstadoModal] = useState(false)
  const [comentarioEstado, setComentarioEstado] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState<ProyectoEstado>(proyecto.estado as ProyectoEstado)
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState(proyecto.nombre)
  const [showEditModal, setShowEditModal] = useState(false)

  const { user } = useAuth()
  const { data: tareas = [], isLoading: tareasLoading } = useTareas(proyecto.id)
  const actualizarEstado = useActualizarEstadoProyecto()

  const [usuarios, setUsuarios] = useState<{ id: string; nombre_completo: string }[]>([])
  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((json) => { if (json.data) setUsuarios(json.data) })
      .catch(() => {})
  }, [])

  const canEdit = user
    ? canEditProject(user.id, user.rol, proyecto.responsable_primario)
    : false

  const diasRestantes = calcularDiasRestantes(proyecto.fecha_fin_planificada)
  const estaVencido = diasRestantes < 0
  const colorEstado = COLORES_ESTADO[proyecto.estado] ?? COLORES_ESTADO['Pendiente']

  const handleCambiarEstado = async () => {
    if (comentarioEstado.length < 10) return
    await actualizarEstado.mutateAsync({
      proyecto_id: proyecto.id,
      estado_nuevo: nuevoEstado,
      comentario: comentarioEstado,
    })
    setShowEstadoModal(false)
    setComentarioEstado('')
  }

  const handleActualizarNombre = async () => {
    if (!nuevoNombre.trim() || nuevoNombre === proyecto.nombre) {
      setEditandoNombre(false)
      setNuevoNombre(proyecto.nombre)
      return
    }
    try {
      const response = await fetch(`/api/proyectos/${proyecto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre }),
      })
      if (response.ok) {
        setEditandoNombre(false)
        // Refresh page or update state
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating nombre:', error)
      setNuevoNombre(proyecto.nombre)
    }
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'kanban', label: 'Kanban', icon: '📌' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'lista', label: 'Lista', icon: '📋' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-400 uppercase">
                {proyecto.area_responsable} · {proyecto.categoria}
              </span>
            </div>
            {editandoNombre && canEdit ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleActualizarNombre}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setEditandoNombre(false)
                    setNuevoNombre(proyecto.nombre)
                  }}
                  className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <h1
                onClick={() => canEdit && setEditandoNombre(true)}
                className={cn(
                  'text-xl font-bold text-gray-900',
                  canEdit && 'cursor-pointer hover:text-blue-600'
                )}
              >
                {proyecto.nombre}
                {canEdit && <span className="text-gray-400 text-lg ml-2">✎</span>}
              </h1>
            )}
            {proyecto.descripcion_ejecutiva && (
              <p className="text-sm text-gray-500 mt-1">{proyecto.descripcion_ejecutiva}</p>
            )}
          </div>

          {/* Estado + Editar */}
          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ✎ Editar
              </button>
            )}
            <button
              onClick={() => canEdit && setShowEstadoModal(true)}
              className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors',
                colorEstado.bg,
                colorEstado.text,
                colorEstado.border,
                canEdit && 'hover:opacity-80 cursor-pointer'
              )}
            >
              {proyecto.estado}
              {canEdit && <span className="ml-1.5 text-xs">▼</span>}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          {/* % Avance */}
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${proyecto.porcentaje_avance}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {formatPorcentaje(proyecto.porcentaje_avance)}
            </span>
          </div>

          {/* Plazo */}
          <div className="text-sm">
            <span className="text-gray-400">Plazo: </span>
            <span className={cn('font-medium', estaVencido ? 'text-red-600' : 'text-gray-700')}>
              {formatDate(proyecto.fecha_fin_planificada)}
              {estaVencido
                ? ` (vencido hace ${Math.abs(diasRestantes)}d)`
                : ` (${diasRestantes}d restantes)`}
            </span>
          </div>

          {/* Responsable */}
          {proyecto.responsable && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                {obtenerIniciales(proyecto.responsable.nombre_completo)}
              </div>
              <span className="text-sm text-gray-600">{proyecto.responsable.nombre_completo}</span>
            </div>
          )}

          {/* Foco */}
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {proyecto.foco_estrategico}
          </span>

          {/* Tareas stats */}
          <div className="text-sm text-gray-500">
            {tareas.filter((t) => t.estado === 'Finalizado').length}/{tareas.length} tareas
          </div>
        </div>
      </div>

      {/* Subproyectos section */}
      {(proyecto.subproyectos && proyecto.subproyectos.length > 0) || canEdit ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SubproyectoList
            proyecto={proyecto}
            subproyectos={proyecto.subproyectos || []}
            canEdit={canEdit}
          />
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'kanban' && (
          <KanbanBoard
            proyectoId={proyecto.id}
            tareas={tareas}
            usuarios={usuarios}
            isLoading={tareasLoading}
            canEdit={canEdit}
          />
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <TimelineChart
              tareas={tareas}
              onTaskClick={(id) => setSelectedTaskId(id)}
            />
          </div>
        )}

        {activeTab === 'lista' && (
          <TaskTable
            tareas={tareas}
            onTaskClick={(id) => setSelectedTaskId(id)}
            canEdit={canEdit}
          />
        )}
      </div>

      {/* Modal cambio estado */}
      {showEstadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowEstadoModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-10">
            <h3 className="font-bold text-gray-900 mb-4">Cambiar Estado del Proyecto</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo Estado</label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value as ProyectoEstado)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ESTADOS_PROYECTO.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">(mínimo 10 caracteres)</span>
              </label>
              <textarea
                value={comentarioEstado}
                onChange={(e) => setComentarioEstado(e.target.value)}
                rows={3}
                placeholder="Describe el motivo del cambio de estado..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{comentarioEstado.length}/1000</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEstadoModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarEstado}
                disabled={comentarioEstado.length < 10 || actualizarEstado.isPending}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {actualizarEstado.isPending ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit project modal */}
      {showEditModal && canEdit && (
        <ProyectoEditForm proyecto={proyecto} onClose={() => setShowEditModal(false)} />
      )}

      {/* Task detail modal */}
      {selectedTaskId && (
        <TaskDetailModal
          tareaId={selectedTaskId}
          proyectoId={proyecto.id}
          onClose={() => setSelectedTaskId(null)}
          canEdit={canEdit}
        />
      )}
    </div>
  )
}
