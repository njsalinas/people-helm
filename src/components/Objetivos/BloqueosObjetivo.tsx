/**
 * @component BloqueosObjetivo
 * Muestra bloqueos activos de los proyectos vinculados a un objetivo
 */

'use client'

import type { Bloqueo } from '@/types/domain'

interface BloqueosObjetivoProps {
  bloqueos: Bloqueo[]
  isLoading?: boolean
}

export function BloqueosObjetivo({ bloqueos, isLoading }: BloqueosObjetivoProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Cargando bloqueos...</p>
      </div>
    )
  }

  if (bloqueos.length === 0) {
    return (
      <div className="bg-green-50 rounded-lg border border-green-200 p-6 text-center">
        <div className="text-2xl mb-2">✓</div>
        <p className="text-green-900 font-medium">Sin bloqueos activos</p>
        <p className="text-sm text-green-700 mt-1">Todos los proyectos fluyen correctamente</p>
      </div>
    )
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'espera decisión':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' }
      case 'recurso':
        return { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' }
      case 'dependencia':
        return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' }
      case 'técnico':
        return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' }
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' }
    }
  }

  const getAccionColor = (accion: string) => {
    switch (accion?.toLowerCase()) {
      case 'decisión':
        return '🔴'
      case 'recurso':
        return '⚙️'
      case 'comunicación':
        return '💬'
      case 'escalación':
        return '📢'
      default:
        return '⏳'
    }
  }

  const diasDesde = (fecha: string) => {
    const ahora = new Date()
    const creacion = new Date(fecha)
    const dias = Math.floor((ahora.getTime() - creacion.getTime()) / (1000 * 60 * 60 * 24))
    return dias
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-red-900">🔴 Bloqueos Activos</h2>
            <p className="text-sm text-red-700 mt-1">{bloqueos.length} bloqueo{bloqueos.length !== 1 ? 's' : ''} impidiendo progreso</p>
          </div>
        </div>
      </div>

      {/* Lista de bloqueos */}
      <div className="divide-y divide-gray-200">
        {bloqueos.map(bloqueo => {
          const tipoColor = getTipoColor(bloqueo.tipo)
          const dias = diasDesde(bloqueo.created_at)
          const urgente = dias > 3

          return (
            <div key={bloqueo.id} className={`p-5 border-l-4 ${urgente ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Encabezado */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${tipoColor.badge}`}>
                      {bloqueo.tipo}
                    </div>
                    {urgente && (
                      <div className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                        ⚠️ URGENTE ({dias} días)
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-900 font-medium mb-2">{bloqueo.descripcion}</p>

                  {/* Detalles */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Acción requerida:</span>
                      <p className="text-gray-900 font-medium">
                        {getAccionColor(bloqueo.accion_requerida)} {bloqueo.accion_requerida}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Proyecto afectado:</span>
                      <p className="text-gray-900 font-medium">{bloqueo.proyecto_nombre || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duración:</span>
                      <p className="text-gray-900 font-medium">{dias} día{dias !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
