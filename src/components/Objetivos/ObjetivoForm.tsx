/**
 * @component ObjetivoForm
 * Formulario para crear/editar objetivos (solo Gerentes)
 */

'use client'


import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateObjetivoSchema, UpdateObjetivoSchema } from '@/lib/validations'
import type { CreateObjetivoInput, UpdateObjetivoInput } from '@/lib/validations'
import { useAreas } from '@/hooks/useAreas'
import { OBJETIVOS_STATUS } from '@/types/domain'
import type { DbObjetivo } from '@/types/database'

interface ObjetivoFormProps {
  objetivo?: DbObjetivo | null
  onSubmit: (data: CreateObjetivoInput | UpdateObjetivoInput) => Promise<void>
  onClose: () => void
  isLoading?: boolean
}

export function ObjetivoForm({ objetivo, onSubmit, onClose, isLoading = false }: ObjetivoFormProps) {
  const { data: areas = [], isLoading: areasLoading } = useAreas()
  const isEditing = !!objetivo

  const schema = isEditing ? UpdateObjetivoSchema : CreateObjetivoSchema
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateObjetivoInput | UpdateObjetivoInput>({
    resolver: zodResolver(schema),
    defaultValues: objetivo ? {
      titulo: objetivo.titulo,
      descripcion: objetivo.descripcion || '',
      anio: objetivo.anio,
      area_responsable_id: objetivo.area_responsable_id,
      status: objetivo.status,
      orden: objetivo.orden,
    } : {
      anio: new Date().getFullYear(),
      status: 'draft',
      orden: 0,
    },
  })

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Error submitting objetivo:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Editar Objetivo' : 'Nuevo Objetivo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Título *
            </label>
            <input
              {...register('titulo')}
              type="text"
              placeholder="Ej: Reducir rotación en 15%"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(errors as any).titulo && (
              <p className="text-xs text-red-500 mt-1">{(errors as any).titulo.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Descripción
            </label>
            <textarea
              {...register('descripcion')}
              placeholder="Detalles del objetivo..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {(errors as any).descripcion && (
              <p className="text-xs text-red-500 mt-1">{(errors as any).descripcion.message}</p>
            )}
          </div>

          {/* Año + Área */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Año *
              </label>
              <input
                {...register('anio', { valueAsNumber: true })}
                type="number"
                min="2020"
                max="2100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {(errors as any).anio && (
                <p className="text-xs text-red-500 mt-1">{(errors as any).anio.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Área *
              </label>
              <select
                {...register('area_responsable_id')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={areasLoading}
              >
                <option value="">Seleccionar área...</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
              {(errors as any).area_responsable_id && (
                <p className="text-xs text-red-500 mt-1">{(errors as any).area_responsable_id.message}</p>
              )}
            </div>
          </div>

          {/* Status + Orden */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Estado
              </label>
              <select
                {...register('status')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {OBJETIVOS_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Orden
              </label>
              <input
                {...register('orden', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSubmitting || isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(handleFormSubmit)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            disabled={isSubmitting || isLoading || areasLoading}
          >
            {isSubmitting || isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}
