/**
 * @component KanbanGlobal
 * Kanban global con proyectos organizados por estado
 */

'use client'

import { useMemo } from 'react'
import { useProyectos } from '@/hooks/useProjects'
import { useAuthStore } from '@/stores/authStore'
import type { ProyectoGerencial } from '@/types'
import { KanbanColumnGlobal } from './KanbanColumnGlobal'
import { COLORES_ESTADO } from '@/types/domain'

export function KanbanGlobal() {
  const { data: proyectos, isLoading } = useProyectos()
  const user = useAuthStore((s) => s.user)

  const ESTADOS = ['Pendiente', 'En Curso', 'En Riesgo', 'Bloqueado', 'Finalizado'] as const

  const proyectosPorEstado = useMemo(() => {
    const grouped: Record<string, ProyectoGerencial[]> = {}

    ESTADOS.forEach((estado) => {
      grouped[estado] = proyectos?.filter((p) => p.estado === estado) || []
    })

    return grouped
  }, [proyectos])

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ESTADOS.map((estado) => (
          <div
            key={estado}
            className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="h-6 bg-gray-200 rounded mb-4 w-24" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg mb-3 animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {ESTADOS.map((estado) => (
        <KanbanColumnGlobal
          key={estado}
          estado={estado}
          proyectos={proyectosPorEstado[estado] || []}
          user={user}
        />
      ))}
    </div>
  )
}
