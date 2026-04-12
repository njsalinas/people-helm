/**
 * @component ProyectoForm
 * Modal de creación de proyecto
 *
 * @example
 * <ProyectoForm onClose={() => setOpen(false)} />
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateProjectSchema } from '@/lib/validations'
import type { CreateProjectInput } from '@/types/api'
import { FOCOS_ESTRATEGICOS, CATEGORIAS_POR_AREA } from '@/types/domain'
import { useCrearProyecto } from '@/hooks/useProjects'
import { useAreas } from '@/hooks/useAreas'
import { useUIStore } from '@/stores/uiStore'
import type { DbUsuario } from '@/types/database'

interface ProyectoFormProps {
  onClose: () => void
}

export function ProyectoForm({ onClose }: ProyectoFormProps) {
  const crearMutation = useCrearProyecto()
  const addToast = useUIStore((s) => s.addToast)
  const [usuarios, setUsuarios] = useState<DbUsuario[]>([])
  const { data: areas = [], isLoading: areasLoading } = useAreas()

  // Mapa de ID -> nombre para hacer lookups
  const areaNamesMap = new Map(areas.map(a => [a.id, a.nombre]))

  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((json) => setUsuarios(json.data ?? []))
      .catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      tipo: 'Proyecto',
      foco_estrategico: 'Alta prioridad (estratégico)',
      area_responsable_id: areas[0]?.id || '',
      responsable_primario: usuarios[0]?.id || '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      prioridad: 3,
    } as any,
  })

  const areaId = watch('area_responsable_id')
  const areaNombre = areaNamesMap.get(areaId) || ''
  const categorias = areaNombre ? (CATEGORIAS_POR_AREA[areaNombre] ?? []) : []

  const onSubmit = async (data: CreateProjectInput) => {
    try {
      await crearMutation.mutateAsync(data)
      addToast({ type: 'success', title: `Proyecto "${data.nombre}" creado` })
      onClose()
    } catch (e: unknown) {
      addToast({ type: 'error', title: 'Error al crear proyecto', description: e instanceof Error ? e.message : 'Error desconocido' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Nuevo Proyecto</h2>
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
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Nombre del proyecto *
            </label>
            <input
              {...register('nombre')}
              type="text"
              placeholder="Ej: Implementación ATS Q2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.nombre && (
              <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>
            )}
          </div>

          {/* Área + Categoría */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Área *
              </label>
              <select
                {...register('area_responsable_id')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={areasLoading}
              >
                <option value="">Cargando áreas...</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
              {errors.area_responsable_id && (
                <p className="text-xs text-red-500 mt-1">{errors.area_responsable_id?.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Categoría *
              </label>
              <select
                {...register('categoria')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-xs text-red-500 mt-1">{errors.categoria.message}</p>
              )}
            </div>
          </div>

          {/* Foco + Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Foco Estratégico *
              </label>
              <select
                {...register('foco_estrategico')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FOCOS_ESTRATEGICOS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Tipo *
              </label>
              <select
                {...register('tipo')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Proyecto">Proyecto</option>
                <option value="Línea">Línea</option>
              </select>
            </div>
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Responsable *
            </label>
            <select
              {...register('responsable_primario')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona responsable...</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre_completo}</option>
              ))}
            </select>
            {errors.responsable_primario && (
              <p className="text-xs text-red-500 mt-1">{errors.responsable_primario.message}</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Fecha inicio *
              </label>
              <input
                {...register('fecha_inicio')}
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fecha_inicio && (
                <p className="text-xs text-red-500 mt-1">{errors.fecha_inicio.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Fecha fin *
              </label>
              <input
                {...register('fecha_fin_planificada')}
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fecha_fin_planificada && (
                <p className="text-xs text-red-500 mt-1">{errors.fecha_fin_planificada.message}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Descripción ejecutiva
            </label>
            <textarea
              {...register('descripcion_ejecutiva')}
              rows={3}
              placeholder="Describe el objetivo del proyecto..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
