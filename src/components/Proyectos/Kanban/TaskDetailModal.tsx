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
import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { Tarea, Usuario } from '@/types'
import { cn, formatDate, calcularDiasRestantes, formatPorcentaje } from '@/lib/utils'
import { useActualizarTarea } from '@/hooks/useTareas'
import { ESTADOS_TAREA } from '@/types/domain'

interface TaskDetailModalProps {
  tareaId: string
  proyectoId: string
  onClose: () => void
  canEdit?: boolean
  usuarios?: Usuario[]
}

export function TaskDetailModal({ tareaId, proyectoId, onClose, canEdit = true, usuarios = [] }: TaskDetailModalProps) {
  const supabase = getSupabaseBrowserClient()
  const [editandoAvance, setEditandoAvance] = useState(false)
  const [nuevoAvance, setNuevoAvance] = useState(0)
  const [editandoResponsable, setEditandoResponsable] = useState(false)
  const [nuevoResponsableId, setNuevoResponsableId] = useState<string | null>(null)
  const actualizarTarea = useActualizarTarea(proyectoId)

  const { data: tarea, isLoading } = useQuery({
    queryKey: ['tareas', 'detail', tareaId],
    queryFn: async (): Promise<Tarea | null> => {
      const { data, error } = await supabase
        .from('tareas')
        .select(`
          *,
          responsable:usuarios!responsable_id(id, nombre_completo, email, rol, area_responsable, activo, created_at, updated_at),
          bloqueos(*)
        `)
        .eq('id', tareaId)
        .single()

      if (error) throw error
      return data as unknown as Tarea
    },
  })

  // Fetch historial de desbloqueos
  const { data: desbloqueos = [] } = useQuery({
    queryKey: ['tareas', tareaId, 'desbloqueos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('historial_cambios')
        .select(
          `
          id,
          campo_afectado,
          valor_anterior,
          valor_nuevo,
          comentario,
          created_at,
          created_by,
          usuario:usuarios!created_by(id, nombre_completo, email)
        `
        )
        .eq('entidad_id', tareaId)
        .eq('entidad_tipo', 'Tarea')
        .eq('campo_afectado', 'estado')
        .eq('valor_anterior', 'Bloqueado')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching desbloqueos:', error)
        return []
      }
      return data || []
    },
    enabled: !!tareaId,
  })

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

  const diasRestantes = tarea ? calcularDiasRestantes(tarea.fecha_fin_planificada) : 0

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">DETALLE DE TAREA</p>
              <h2 className="text-lg font-bold text-gray-900">
                {isLoading ? '...' : tarea?.nombre}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 animate-pulse space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded" />
              ))}
            </div>
          ) : tarea ? (
            <div className="p-6 space-y-5">
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

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Responsable</p>
                  {editandoResponsable && canEdit ? (
                    <div className="flex gap-2">
                      <select
                        value={nuevoResponsableId || tarea.responsable_id || ''}
                        onChange={(e) => setNuevoResponsableId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona responsable</option>
                        {usuarios.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nombre_completo}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => setEditandoResponsable(false)} className="text-xs text-gray-500">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setNuevoResponsableId(tarea.responsable_id)
                        setEditandoResponsable(true)
                      }}
                      disabled={!canEdit}
                      className={cn(
                        'text-sm font-medium text-gray-700',
                        canEdit && 'hover:text-blue-600 cursor-pointer'
                      )}
                    >
                      {tarea.responsable?.nombre_completo ?? '—'}
                      {canEdit && <span className="text-gray-400 text-xs ml-2">✎</span>}
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Plazo</p>
                  <p className={cn('font-medium', diasRestantes < 0 ? 'text-red-600' : 'text-gray-700')}>
                    {formatDate(tarea.fecha_fin_planificada)}
                    {diasRestantes < 0
                      ? ` (vencida hace ${Math.abs(diasRestantes)}d)`
                      : ` (${diasRestantes}d restantes)`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Inicio</p>
                  <p className="text-gray-700">{formatDate(tarea.fecha_inicio)}</p>
                </div>
              </div>

              {/* Descripción */}
              {tarea.descripcion && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Descripción</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{tarea.descripcion}</p>
                </div>
              )}

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
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Agregar Bloqueo
                  </button>
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
    </div>
  )
}
