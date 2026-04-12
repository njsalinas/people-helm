/**
 * @component SubproyectoList
 * Sección para mostrar subproyectos en el detalle del proyecto
 */

'use client'

import { useState } from 'react'
import type { Proyecto, Subproyecto } from '@/types'
import { SubproyectoCard } from './SubproyectoCard'
import { SubproyectoForm } from './SubproyectoForm'
import { useEliminarSubproyecto } from '@/hooks/useProjects'

interface SubproyectoListProps {
  proyecto: Proyecto
  subproyectos?: Subproyecto[]
  canEdit?: boolean
}

export function SubproyectoList({
  proyecto,
  subproyectos = [],
  canEdit = false,
}: SubproyectoListProps) {
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const eliminarSubproyecto = useEliminarSubproyecto(proyecto.id)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Subproyectos</h3>
          <p className="text-xs text-gray-500 mt-1">
            {subproyectos.length} subproyecto{subproyectos.length !== 1 ? 's' : ''} asociado{subproyectos.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            + Agregar
          </button>
        )}
      </div>

      {/* Subproyectos list */}
      {subproyectos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subproyectos.map((sub) => (
            <SubproyectoCard
              key={sub.id}
              subproyecto={sub}
              onView={() => {
                // Navegar al detalle del subproyecto
                window.location.href = `/subproyectos/${sub.id}`
              }}
              onEdit={canEdit ? () => {
                // Navegar al detalle del subproyecto para editar
                window.location.href = `/subproyectos/${sub.id}`
              } : undefined}
              onDelete={canEdit ? () => {
                setDeletingId(sub.id)
              } : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">No hay subproyectos creados</p>
          {canEdit && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear el primer subproyecto
            </button>
          )}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <SubproyectoForm
          proyectoPadre={proyecto}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Confirmación eliminar modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeletingId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm z-10 mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Eliminar Subproyecto</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Está seguro que desea eliminar este subproyecto? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  eliminarSubproyecto.mutate(deletingId, {
                    onSuccess: () => setDeletingId(null),
                  })
                }}
                disabled={eliminarSubproyecto.isPending}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {eliminarSubproyecto.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
