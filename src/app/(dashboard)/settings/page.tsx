'use client'

import { useNotificacionesConfig, useUpdateNotificacionConfig } from '@/hooks/useNotificaciones'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const EVENTO_LABELS: Record<string, { label: string; descripcion: string }> = {
  bloqueo_creado: { label: 'Bloqueo creado', descripcion: 'Cuando se registra un nuevo bloqueo en un proyecto' },
  estado_cambiado: { label: 'Cambio de estado', descripcion: 'Cuando el estado de un proyecto cambia' },
  semaforo_rojo: { label: 'Semáforo rojo', descripcion: 'Cuando un proyecto entra en estado ROJO' },
  tarea_vencida: { label: 'Tarea vencida', descripcion: 'Cuando una tarea supera su fecha de fin' },
  riesgo_alto: { label: 'Riesgo alto', descripcion: 'Cuando se registra un riesgo de prioridad Alta o Crítica' },
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { data: configs = [], isLoading } = useNotificacionesConfig()
  const updateMutation = useUpdateNotificacionConfig()
  const addToast = useUIStore((s) => s.addToast)

  const handleToggle = async (id: string, activo: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, activo })
    } catch {
      addToast({ type: 'error', message: 'Error al actualizar preferencia' })
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-0.5">Preferencias de cuenta y notificaciones</p>
      </div>

      {/* Perfil */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Perfil</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
            {user?.nombre?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{user?.nombre ?? '—'}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
              {user?.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-800 mb-1">Notificaciones</h2>
        <p className="text-xs text-gray-500 mb-4">
          Elige qué eventos quieres recibir por email y en la app.
        </p>

        {isLoading ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : configs.length === 0 ? (
          <p className="text-sm text-gray-400">Sin configuraciones disponibles.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {configs.map((config) => {
              const meta = EVENTO_LABELS[config.evento_tipo] ?? {
                label: config.evento_tipo,
                descripcion: '',
              }
              return (
                <div key={config.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{meta.descripcion}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(config.id, !config.activo)}
                    disabled={updateMutation.isPending}
                    className={cn(
                      'relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                      config.activo ? 'bg-blue-600' : 'bg-gray-200'
                    )}
                    role="switch"
                    aria-checked={config.activo}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200',
                        config.activo ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
