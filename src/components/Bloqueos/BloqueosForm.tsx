/**
 * @component BloqueosForm
 * Modal formulario para registrar un nuevo bloqueo
 *
 * @example
 * <BloqueosForm proyectoId={id} onClose={() => setOpen(false)} />
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateBloqueoSchema, type CreateBloqueoInput } from '@/lib/validations'
import { useRegistrarBloqueo } from '@/hooks/useBloqueos'
import { TIPOS_BLOQUEO, ACCIONES_BLOQUEO } from '@/types/domain'

interface BloqueosFormProps {
  proyectoId: string
  onClose: () => void
}

export function BloqueosForm({ proyectoId, onClose }: BloqueosFormProps) {
  const registrar = useRegistrarBloqueo()

  const form = useForm<CreateBloqueoInput>({
    resolver: zodResolver(CreateBloqueoSchema),
    defaultValues: {
      proyecto_id: proyectoId,
      descripcion: '',
      tipo: 'Espera decisión',
      accion_requerida: 'Seguimiento',
      requiere_escalamiento: false,
    },
  })

  const onSubmit = async (data: CreateBloqueoInput) => {
    await registrar.mutateAsync(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Registrar Bloqueo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(mínimo 20 caracteres)</span>
            </label>
            <textarea
              {...form.register('descripcion')}
              rows={3}
              placeholder="Describe el bloqueo con suficiente detalle..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
            {form.formState.errors.descripcion && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.descripcion.message}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                {...form.register('tipo')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {TIPOS_BLOQUEO.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Acción requerida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Acción Requerida <span className="text-red-500">*</span>
              </label>
              <select
                {...form.register('accion_requerida')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {ACCIONES_BLOQUEO.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Requiere escalamiento */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...form.register('requiere_escalamiento')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Requiere escalamiento</p>
              <p className="text-xs text-gray-400">Marcará este bloqueo como crítico para la gerente</p>
            </div>
          </label>

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={registrar.isPending}
              className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
            >
              {registrar.isPending ? 'Registrando...' : 'Registrar Bloqueo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
