/**
 * @component SubproyectoList
 * Sección para mostrar subproyectos en el detalle del proyecto
 */

'use client'

import { useState } from 'react'
import type { Proyecto } from '@/types'
import { SubproyectoCard } from './SubproyectoCard'
import { SubproyectoForm } from './SubproyectoForm'

interface SubproyectoListProps {
  proyecto: Proyecto
  subproyectos?: Proyecto[]
  canEdit?: boolean
}

export function SubproyectoList({
  proyecto,
  subproyectos = [],
  canEdit = false,
}: SubproyectoListProps) {
  const [showForm, setShowForm] = useState(false)

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
                window.location.href = `/proyectos/${sub.id}`
              }}
              onEdit={canEdit ? () => {
                // Aquí se puede agregar funcionalidad de edición
                window.location.href = `/proyectos/${sub.id}`
              } : undefined}
              onDelete={canEdit ? () => {
                // Aquí se puede agregar funcionalidad de eliminación
                console.log('Delete subproyecto:', sub.id)
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
    </div>
  )
}
