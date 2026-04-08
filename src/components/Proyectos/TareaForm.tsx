'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateTaskSchema, type CreateTaskInput } from '@/lib/validations'
import { useCrearTarea } from '@/hooks/useTareas'
import { useAuth } from '@/hooks/useAuth'

interface TareaFormProps {
  proyectoId: string
  usuarios: { id: string; nombre_completo: string }[]
  onClose: () => void
}

export function TareaForm({ proyectoId, usuarios, onClose }: TareaFormProps) {
  const { user } = useAuth()
  const crearTarea = useCrearTarea()

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      proyecto_id: proyectoId,
      nombre: '',
      descripcion: '',
      responsable_id: undefined, // Será asignado automáticamente al creador
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin_planificada: '',
      prioridad: 3,
    },
  })

  const onSubmit = async (data: CreateTaskInput) => {
    try {
      await crearTarea.mutateAsync(data)
      // Agregar un pequeño delay para asegurar que la query se refetch
      await new Promise(resolve => setTimeout(resolve, 500))
      onClose()
    } catch (error) {
      // El error ya se muestra en el toast del hook
      console.error('Error creating task:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Nueva tarea</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              {...form.register('nombre')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la tarea"
            />
            {form.formState.errors.nombre && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              {...form.register('descripcion')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Descripción opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsable <span className="text-gray-400 font-normal">(Opcional - Se asigna al creador si está vacío)</span>
            </label>
            <select
              {...form.register('responsable_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No asignar (se asignará automáticamente)</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre_completo}</option>
              ))}
            </select>
            {form.formState.errors.responsable_id && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.responsable_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
              <input
                type="date"
                {...form.register('fecha_inicio')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.fecha_inicio && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.fecha_inicio.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
              <input
                type="date"
                {...form.register('fecha_fin_planificada')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.fecha_fin_planificada && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.fecha_fin_planificada.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad <span className="text-gray-400 font-normal">(1 = alta, 5 = baja)</span>
            </label>
            <select
              {...form.register('prioridad', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 — Crítica</option>
              <option value={2}>2 — Alta</option>
              <option value={3}>3 — Media</option>
              <option value={4}>4 — Baja</option>
              <option value={5}>5 — Mínima</option>
            </select>
          </div>

          {form.formState.errors.fecha_fin_planificada?.message?.includes('mayor') && (
            <p className="text-xs text-red-600">{form.formState.errors.fecha_fin_planificada.message}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={crearTarea.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {crearTarea.isPending ? 'Creando...' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
