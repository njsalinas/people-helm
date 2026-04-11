/**
 * @component ProyectoEditForm
 * Formulario para editar un proyecto existente
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Proyecto } from '@/types'
// import { AREAS_RESPONSABLES, FOCOS_ESTRATEGICOS, CATEGORIAS_POR_AREA } from '@/types/domain'
import {  FOCOS_ESTRATEGICOS, CATEGORIAS_POR_AREA } from '@/types/domain'
import { useUIStore } from '@/stores/uiStore'
import type { DbUsuario } from '@/types/database'

// Schema para edición (algunos campos opcionales)
const UpdateProjectSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  descripcion_ejecutiva: z.string().max(1000).optional(),
  objetivo: z.string().max(2000).optional(),
  resultado_esperado: z.string().max(2000).optional(),
  categoria: z.string().min(1, 'Selecciona una categoría'),
  foco_estrategico: z.enum(['Alta prioridad (estratégico)', 'Prioridad media (habilitadores)', 'Prioridad operacional']),
  responsable_primario: z.string().uuid('Selecciona un responsable'),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fecha_fin_planificada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  prioridad: z.number().int().min(1).max(5),
})

type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>

interface ProyectoEditFormProps {
  proyecto: Proyecto
  onClose: () => void
}

export function ProyectoEditForm({ proyecto, onClose }: ProyectoEditFormProps) {
  const addToast = useUIStore((s) => s.addToast)
  const [usuarios, setUsuarios] = useState<DbUsuario[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((json) => setUsuarios(json.data ?? []))
      .catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    /* watch, */
    formState: { errors },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(UpdateProjectSchema),
    defaultValues: {
      nombre: proyecto.nombre,
      descripcion_ejecutiva: proyecto.descripcion_ejecutiva || '',
      objetivo: proyecto.objetivo || '',
      resultado_esperado: proyecto.resultado_esperado || '',
      categoria: proyecto.categoria,
      foco_estrategico: proyecto.foco_estrategico,
      responsable_primario: proyecto.responsable_primario,
      fecha_inicio: proyecto.fecha_inicio,
      fecha_fin_planificada: proyecto.fecha_fin_planificada,
      prioridad: proyecto.prioridad,
    },
  })

  const area_responsable = (proyecto as any).area_responsable
  const categorias = area_responsable ? (CATEGORIAS_POR_AREA[area_responsable] ?? []) : []

  const onSubmit = async (data: UpdateProjectInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/proyectos/${proyecto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al actualizar proyecto')
      }

      addToast({ type: 'success', title: 'Proyecto actualizado correctamente' })
      onClose()
      // Reload para actualizar los datos
      window.location.reload()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error al actualizar',
        description: error instanceof Error ? error.message : 'Error desconocido',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Editar Proyecto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 overflow-y-auto">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              {...register('nombre')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          {/* Descripción Ejecutiva */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Ejecutiva</label>
            <textarea
              {...register('descripcion_ejecutiva')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.descripcion_ejecutiva && (
              <p className="text-red-500 text-xs mt-1">{errors.descripcion_ejecutiva.message}</p>
            )}
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
            <textarea
              {...register('objetivo')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.objetivo && <p className="text-red-500 text-xs mt-1">{errors.objetivo.message}</p>}
          </div>

          {/* Resultado Esperado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resultado Esperado</label>
            <textarea
              {...register('resultado_esperado')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.resultado_esperado && (
              <p className="text-red-500 text-xs mt-1">{errors.resultado_esperado.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              {...register('categoria')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>}
          </div>

          {/* Foco Estratégico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foco Estratégico *</label>
            <select
              {...register('foco_estrategico')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FOCOS_ESTRATEGICOS.map((foco) => (
                <option key={foco} value={foco}>
                  {foco}
                </option>
              ))}
            </select>
            {errors.foco_estrategico && (
              <p className="text-red-500 text-xs mt-1">{errors.foco_estrategico.message}</p>
            )}
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable Principal *</label>
            <select
              {...register('responsable_primario')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un responsable</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo}
                </option>
              ))}
            </select>
            {errors.responsable_primario && (
              <p className="text-red-500 text-xs mt-1">{errors.responsable_primario.message}</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
              <input
                type="date"
                {...register('fecha_inicio')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fecha_inicio && (
                <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
              <input
                type="date"
                {...register('fecha_fin_planificada')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fecha_fin_planificada && (
                <p className="text-red-500 text-xs mt-1">{errors.fecha_fin_planificada.message}</p>
              )}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad (1-5) *</label>
            <input
              type="number"
              min={1}
              max={5}
              {...register('prioridad', { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.prioridad && <p className="text-red-500 text-xs mt-1">{errors.prioridad.message}</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
