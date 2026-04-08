/**
 * @component KanbanColumnGlobal
 * Columna de un Kanban global mostrando proyectos
 */

'use client'

import Link from 'next/link'
import type { ProyectoGerencial, Usuario } from '@/types'
import { COLORES_ESTADO, COLORES_SEMAFORO } from '@/types/domain'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface KanbanColumnGlobalProps {
  estado: string
  proyectos: ProyectoGerencial[]
  user: Usuario | null
}

const ICON_BY_ESTADO: Record<string, string> = {
  Pendiente: '⏳',
  'En Curso': '🔄',
  'En Riesgo': '⚠️',
  Bloqueado: '🔴',
  Finalizado: '✅',
}

export function KanbanColumnGlobal({
  estado,
  proyectos,
  user,
}: KanbanColumnGlobalProps) {
  const colors = COLORES_ESTADO[estado] || COLORES_ESTADO.Pendiente
  const icon = ICON_BY_ESTADO[estado] || '📋'

  return (
    <div
      className={`w-80 flex-shrink-0 rounded-xl border-2 p-4 ${colors.bg}`}
      style={{
        borderColor: colors.border.replace('border-', 'rgb(var(--color-')
          .replace(')', ')'),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className={`font-semibold ${colors.text}`}>{estado}</h3>
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {proyectos.length}
        </span>
      </div>

      {/* Proyectos */}
      <div className="space-y-3">
        {proyectos.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Sin proyectos</p>
        ) : (
          proyectos.map((proyecto) => (
            <Link
              key={proyecto.id}
              href={`/proyectos/${proyecto.id}`}
              className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
            >
              {/* Nombre */}
              <p className="font-medium text-gray-900 text-sm line-clamp-2">
                {proyecto.nombre}
              </p>

              {/* Información compacta */}
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                {/* Área y Foco */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📍 {proyecto.area_responsable}</span>
                </div>

                {/* Semáforo */}
                {proyecto.color_semaforo && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        COLORES_SEMAFORO[proyecto.color_semaforo]?.dot || 'bg-gray-400'
                      }`}
                    />
                    <span className="text-gray-500">
                      {proyecto.color_semaforo === 'VERDE'
                        ? 'Verde'
                        : proyecto.color_semaforo === 'AMARILLO'
                          ? 'Amarillo'
                          : 'Rojo'}
                    </span>
                  </div>
                )}

                {/* Plazo */}
                {proyecto.fecha_fin_planificada && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      📅{' '}
                      {formatDistanceToNow(new Date(proyecto.fecha_fin_planificada), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                )}

                {/* Responsable */}
                {proyecto.responsable && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">👤 {proyecto.responsable.nombre_completo}</span>
                  </div>
                )}
              </div>

              {/* Progreso */}
              {proyecto.porcentaje_avance !== undefined && (
                <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${proyecto.porcentaje_avance}%` }}
                  />
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
