/**
 * @component TaskDetailModal
 * Modal con detalle completo de una tarea, bloqueos y comentarios
 *
 * @example
 * <TaskDetailModal tareaId={id} proyectoId={proyId} onClose={() => setOpen(false)} />
 */

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Tarea, Usuario } from '@/types'
import { cn, formatDate, calcularDiasRestantes, formatPorcentaje } from '@/lib/utils'
import { useActualizarTarea, useEditarTarea, useEliminarTarea } from '@/hooks/useTareas'
import { ESTADOS_TAREA } from '@/types/domain'

interface TaskDetailModalProps {
  tareaId: string
  proyectoId: string
  onClose: () => void
  canEdit?: boolean
  usuarios?: Usuario[]
}

export function TaskDetailModal({ tareaId, proyectoId, onClose, canEdit = true, usuarios = [] }: TaskDetailModalProps) {
  const [editandoAvance, setEditandoAvance] = useState(false)
  const [nuevoAvance, setNuevoAvance] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Modo edición de campos completos
  const [editMode, setEditMode] = useState(false)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editResponsableId, setEditResponsableId] = useState('')
  const [editFechaInicio, setEditFechaInicio] = useState('')
  const [editFechaFin, setEditFechaFin] = useState('')
  const [editPrioridad, setEditPrioridad] = useState(3)

  const actualizarTarea = useActualizarTarea(proyectoId)
  const editarTarea = useEditarTarea(proyectoId)
  const eliminarTarea = useEliminarTarea(proyectoId)

  const { data: tarea, isLoading } = useQuery({
    queryKey: ['tareas', 'detail', tareaId],
    queryFn: async (): Promise<Tarea | null> => {
      const response = await fetch(`/api/tareas/detalle?id=${tareaId}`)
      if (!response.ok) throw new Error('Error al obtener tarea')
      const json = await response.json()
      return json.data as Tarea
    },
  })

  const desbloqueos: any[] = []

  const handleEstadoChange = async (estado: string) => {
    if (!tarea) return
    await actualizarTarea.mutateAsync({
      tarea_id: tareaId,
      estado_nuevo: estado as 'Pendiente' | 'En Curso' | 'Finalizado' | 'Bloqueado',
    })
  }

  const handleAvanceSubmit = async () => {
    await actualizarTarea.mutateAsync({
      tarea_id: tareaId,
      estado_nuevo: tarea!.estado,
      porcentaje_avance: nuevoAvance,
    })
    setEditandoAvance(false)
  }

  const enterEditMode = () => {
    if (!tarea) return
    setEditNombre(tarea.nombre)
    setEditDescripcion(tarea.descripcion ?? '')
    setEditResponsableId(tarea.responsable_id ?? '')
    setEditFechaInicio(tarea.fecha_inicio)
    setEditFechaFin(tarea.fecha_fin_planificada)
    setEditPrioridad(tarea.prioridad ?? 3)
    setEditMode(true)
  }

  const handleGuardarEdicion = async () => {
    await editarTarea.mutateAsync({
      tareaId,
      data: {
        nombre: editNombre,
        descripcion: editDescripcion || null,
        responsable_id: editResponsableId || undefined,
        fecha_inicio: editFechaInicio,
        fecha_fin_planificada: editFechaFin,
        prioridad: editPrioridad,
      },
    })
    setEditMode(false)
  }

  const diasRestantes = tarea ? calcularDiasRestantes(tarea.fecha_fin_planificada) : 0

  const handleEliminarTarea = async () => {
    try {
      await eliminarTarea.mutateAsync(tareaId)
      setShowDeleteModal(false)
      onClose()
    } catch (error) {
      console.error('Error al eliminar tarea:', error)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[95vh]">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-xs text-gray-400 mb-1">DETALLE DE TAREA</p>
              {editMode ? (
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full text-lg font-bold text-gray-900 border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <h2 className="text-lg font-bold text-gray-900">
                  {isLoading ? '...' : tarea?.nombre}
                </h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 animate-pulse space-y-4 overflow-y-auto flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded" />
              ))}
            </div>
          ) : tarea ? (
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Estado + Avance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Estado</label>
                  {canEdit ? (
                    <select
                      value={tarea.estado}
                      onChange={(e) => handleEstadoChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ESTADOS_TAREA.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                      {tarea.estado}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">% Avance</label>
                  {editandoAvance && canEdit ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0} max={100}
                        value={nuevoAvance}
                        onChange={(e) => setNuevoAvance(Number(e.target.value))}
                        className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <button onClick={handleAvanceSubmit} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg">
                        Guardar
                      </button>
                      <button onClick={() => setEditandoAvance(false)} className="text-xs text-gray-500">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setNuevoAvance(tarea.porcentaje_avance); setEditandoAvance(true) }}
                      disabled={!canEdit}
                      className={cn(
                        'flex items-center gap-2 text-sm',
                        canEdit && 'hover:text-blue-600 cursor-pointer'
                      )}
                    >
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${tarea.porcentaje_avance}%` }}
                        />
                      </div>
                      <span className="font-medium">{formatPorcentaje(tarea.porcentaje_avance)}</span>
                      {canEdit && <span className="text-gray-400 text-xs">✎</span>}
                    </button>
                  )}
                </div>
              </div>

              {/* Responsable + Prioridad */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Responsable</p>
                  {editMode ? (
                    <select
                      value={editResponsableId}
                      onChange={(e) => setEditResponsableId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sin responsable</option>
                      {usuarios.map((u) => (
                        <option key={u.id} value={u.id}>{u.nombre_completo}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium text-gray-700">{tarea.responsable?.nombre_completo ?? '—'}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Prioridad</p>
                  {editMode ? (
                    <select
                      value={editPrioridad}
                      onChange={(e) => setEditPrioridad(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((p) => (
                        <option key={p} value={p}>{p} — {['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'][p - 1]}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium text-gray-700">{tarea.prioridad ?? 3} / 5</p>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Fecha inicio</p>
                  {editMode ? (
                    <input
                      type="date"
                      value={editFechaInicio}
                      onChange={(e) => setEditFechaInicio(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{formatDate(tarea.fecha_inicio)}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Fecha límite</p>
                  {editMode ? (
                    <input
                      type="date"
                      value={editFechaFin}
                      onChange={(e) => setEditFechaFin(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className={cn('font-medium', diasRestantes < 0 ? 'text-red-600' : 'text-gray-700')}>
                      {formatDate(tarea.fecha_fin_planificada)}
                      {diasRestantes < 0
                        ? ` (vencida hace ${Math.abs(diasRestantes)}d)`
                        : ` (${diasRestantes}d restantes)`}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Descripción</p>
                {editMode ? (
                  <textarea
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    rows={3}
                    placeholder="Descripción de la tarea..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                ) : tarea.descripcion ? (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{tarea.descripcion}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sin descripción</p>
                )}
              </div>

              {/* Bloqueos activos */}
              {tarea.bloqueos && tarea.bloqueos.filter((b) => b.estado === 'Activo').length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bloqueos Activos</p>
                  <div className="space-y-2">
                    {tarea.bloqueos
                      .filter((b) => b.estado === 'Activo')
                      .map((b) => (
                        <div key={b.id} className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                          <p className="font-medium text-red-800">{b.descripcion}</p>
                          <p className="text-xs text-red-600 mt-1">
                            {b.tipo} · Acción: {b.accion_requerida}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Historial de Desbloqueos */}
              {desbloqueos && desbloqueos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Historial de Desbloqueos</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {desbloqueos.map((d: any) => (
                      <div key={d.id} className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-green-800">
                              {d.valor_anterior} → {d.valor_nuevo}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              {d.usuario?.nombre_completo || 'Desconocido'} · {formatDate(d.created_at)}
                            </p>
                          </div>
                        </div>
                        {d.comentario && (
                          <p className="text-xs text-gray-700 mt-2 bg-white rounded px-2 py-1">
                            {d.comentario}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {canEdit && (
                  <>
                    {editMode ? (
                      <>
                        <button
                          onClick={handleGuardarEdicion}
                          disabled={editarTarea.isPending}
                          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium"
                        >
                          {editarTarea.isPending ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={enterEditMode}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Editar
                        </button>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          Agregar Bloqueo
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </>
                )}
                <button
                  onClick={onClose}
                  className="ml-auto text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Delete task modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowDeleteModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="font-bold text-gray-900 mb-2">Eliminar Tarea</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que deseas eliminar &quot;{tarea?.nombre}&quot;? Esta acción no se puede deshacer.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarTarea}
                  disabled={eliminarTarea.isPending}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                >
                  {eliminarTarea.isPending ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
