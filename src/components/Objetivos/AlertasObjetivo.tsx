/**
 * @component AlertasObjetivo
 * Muestra alertas y riesgos de los proyectos vinculados a un objetivo
 */

'use client'

interface Alerta {
  id: string
  tipo: 'riesgo' | 'desviacion' | 'bloqueo' | 'proximidad'
  titulo: string
  descripcion: string
  severidad: 'baja' | 'media' | 'alta'
  proyectoNombre: string
}

interface AlertasObjetivoProps {
  alertas: Alerta[]
  isLoading?: boolean
}

export function AlertasObjetivo({ alertas, isLoading }: AlertasObjetivoProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Cargando alertas...</p>
      </div>
    )
  }

  if (alertas.length === 0) {
    return (
      <div className="bg-green-50 rounded-lg border border-green-200 p-6 text-center">
        <div className="text-2xl mb-2">👍</div>
        <p className="text-green-900 font-medium">Sin alertas activas</p>
        <p className="text-sm text-green-700 mt-1">Objetivo en buen estado</p>
      </div>
    )
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'riesgo':
        return '⚠️'
      case 'desviacion':
        return '📊'
      case 'bloqueo':
        return '🔴'
      case 'proximidad':
        return '⏰'
      default:
        return '📌'
    }
  }

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'alta':
        return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', icon: '🔴' }
      case 'media':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', icon: '🟡' }
      case 'baja':
        return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: '🔵' }
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800', icon: '⚪' }
    }
  }

  const alertasOrdenadas = [...alertas].sort((a, b) => {
    const severidades = { alta: 0, media: 1, baja: 2 }
    return severidades[a.severidad as keyof typeof severidades] - severidades[b.severidad as keyof typeof severidades]
  })

  const conAlertas = alertasOrdenadas.filter(a => a.severidad === 'alta').length
  const conAdvertencias = alertasOrdenadas.filter(a => a.severidad === 'media').length

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-amber-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-amber-900">⚠️ Alertas y Riesgos</h2>
            <p className="text-sm text-amber-700 mt-1">
              {conAlertas} crítica{conAlertas !== 1 ? 's' : ''} · {conAdvertencias} advertencia{conAdvertencias !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="divide-y divide-gray-200">
        {alertasOrdenadas.map(alerta => {
          const severidadColor = getSeveridadColor(alerta.severidad)

          return (
            <div
              key={alerta.id}
              className={`p-5 border-l-4 transition-colors ${severidadColor.border} ${
                alerta.severidad === 'alta' ? 'bg-red-50/50' : alerta.severidad === 'media' ? 'bg-yellow-50/50' : 'bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div className="text-2xl flex-shrink-0 mt-1">
                  {getTipoIcon(alerta.tipo)}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{alerta.titulo}</h3>
                    <div className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${severidadColor.badge}`}>
                      {severidadColor.icon} {alerta.severidad.toUpperCase()}
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-2">{alerta.descripcion}</p>

                  <div className="text-xs text-gray-500">
                    Proyecto: <span className="font-medium text-gray-900">{alerta.proyectoNombre}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen de impacto */}
      {alertas.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Impacto estimado:</strong> {conAlertas > 0 && `${conAlertas} problema${conAlertas !== 1 ? 's' : ''} crítico${conAlertas !== 1 ? 's' : ''} `}
            {conAdvertencias > 0 && `${conAdvertencias} riesgo${conAdvertencias !== 1 ? 's' : ''} potencial${conAdvertencias !== 1 ? 's' : ''}`}
            requieren atención inmediata
          </p>
        </div>
      )}
    </div>
  )
}
