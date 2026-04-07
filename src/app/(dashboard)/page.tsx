'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KPIDashboard } from '@/components/Dashboard/KPIDashboard'
import { VistaGerencial } from '@/components/Dashboard/VistaGerencial'
import { Filtros } from '@/components/Dashboard/Filtros'
import { useProyectos } from '@/hooks/useProjects'
import { useUIStore } from '@/stores/uiStore'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { filtros, setFiltros, clearFiltros, openProyectoForm } = useUIStore((s) => ({
    filtros: s.filtros,
    setFiltros: s.setFiltros,
    clearFiltros: s.clearFiltros,
    openProyectoForm: s.openProyectoForm,
  }))

  const { data: proyectos = [], isLoading, error } = useProyectos(filtros)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vista Gerencial</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Estado general de todos los proyectos y líneas del área
          </p>
        </div>
        {(user?.rol === 'Gerente' || user?.rol === 'Líder Area') && (
          <button
            onClick={() => openProyectoForm()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Nuevo Proyecto
          </button>
        )}
      </div>

      {/* KPIs */}
      <KPIDashboard proyectos={proyectos} isLoading={isLoading} />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          Error al cargar proyectos: {error.message}
        </div>
      )}

      {/* Main content */}
      <div className="flex gap-5 items-start">
        {/* Filtros */}
        <Filtros filtros={filtros} onChange={setFiltros} onClear={clearFiltros} />

        {/* Tabla */}
        <div className="flex-1 min-w-0">
          <VistaGerencial
            proyectos={proyectos}
            isLoading={isLoading}
            onSelectProject={(id) => router.push(`/proyectos/${id}`)}
          />
          {!isLoading && (
            <p className="text-xs text-gray-400 mt-2 text-right">
              {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
