/**
 * @component SubproyectoDetail
 * Página de detalle de un subproyecto con Kanban de tareas
 */

'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTareasSubproyecto } from '@/hooks/useSubproyecto'
import type { Subproyecto } from '@/types'
import { KanbanBoard } from '@/components/Proyectos/Kanban/KanbanBoard'
import { COLORES_ESTADO } from '@/types/domain'
import { cn, formatDate } from '@/lib/utils'

interface SubproyectoDetailProps {
  subproyecto: Subproyecto
}

export function SubproyectoDetail({ subproyecto }: SubproyectoDetailProps) {
  const router = useRouter()
  const { data: tareas = [] } = useTareasSubproyecto(subproyecto.id)

  const [usuarios, setUsuarios] = useState<{ id: string; nombre_completo: string }[]>([])
  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((json) => { if (json.data) setUsuarios(json.data) })
      .catch(() => {})
  }, [])

  const colorEstado = COLORES_ESTADO[subproyecto.estado] ?? COLORES_ESTADO['Pendiente']

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Volver
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{subproyecto.nombre}</h1>
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                  colorEstado.bg,
                  colorEstado.text,
                  colorEstado.border
                )}
              >
                {subproyecto.estado}
              </span>
            </div>
            {subproyecto.descripcion_ejecutiva && (
              <p className="text-gray-700 mt-2">{subproyecto.descripcion_ejecutiva}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Avance</p>
            <p className="text-3xl font-bold text-gray-900">{subproyecto.porcentaje_avance}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${subproyecto.porcentaje_avance}%` }}
            />
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Responsable</p>
            <p className="text-sm text-gray-900 font-medium">{subproyecto.responsable?.nombre_completo}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Área</p>
            <p className="text-sm text-gray-900 font-medium">{subproyecto.area?.nombre}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Inicio</p>
            <p className="text-sm text-gray-900 font-medium">{formatDate(subproyecto.fecha_inicio)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Fin Planificado</p>
            <p className="text-sm text-gray-900 font-medium">{formatDate(subproyecto.fecha_fin_planificada)}</p>
          </div>
        </div>

        {subproyecto.objetivo && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Objetivo</p>
            <p className="text-sm text-gray-700">{subproyecto.objetivo}</p>
          </div>
        )}

        {subproyecto.resultado_esperado && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Resultado Esperado</p>
            <p className="text-sm text-gray-700">{subproyecto.resultado_esperado}</p>
          </div>
        )}
      </div>

      {/* Kanban */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tareas</h2>
        <KanbanBoard
          proyectoId={subproyecto.proyecto_id}
          subproyectoId={subproyecto.id}
          tareas={tareas}
          usuarios={usuarios}
        />
      </div>
    </div>
  )
}
