'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KPIDashboard } from '@/components/Dashboard/KPIDashboard'
import { VistaGerencial } from '@/components/Dashboard/VistaGerencial'
import { Filtros } from '@/components/Dashboard/Filtros'
import { useProyectos } from '@/hooks/useProjects'
import { useUIStore } from '@/stores/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { ProyectoForm } from '@/components/Proyectos/ProyectoForm'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [filtrosExpanded, setFiltrosExpanded] = useState(true)
  const [semaforoFilter, setSemaforoFilter] = useState<'VERDE' | 'AMARILLO' | 'ROJO' | null>(null)
  const { filtros, setFiltros, clearFiltros, openProyectoForm, isProyectoFormOpen, closeProyectoForm } = useUIStore((s) => ({
    filtros: s.filtros,
    setFiltros: s.setFiltros,
    clearFiltros: s.clearFiltros,
    openProyectoForm: s.openProyectoForm,
    isProyectoFormOpen: s.isProyectoFormOpen,
    closeProyectoForm: s.closeProyectoForm,
  }))

  const { data: proyectos = [], isLoading, error } = useProyectos(filtros)

  // Filtrar por semáforo seleccionado
  const proyectosFiltrados = semaforoFilter
    ? proyectos.filter((p) => p.color_semaforo === semaforoFilter)
    : proyectos

  // Debug: Verificar proyectos bloqueados con color incorrecto
  const proyectosBloqueadosNoRojo = proyectos.filter(
    (p) => p.estado === 'Bloqueado' && p.color_semaforo !== 'ROJO'
  )
  if (proyectosBloqueadosNoRojo.length > 0 && typeof window !== 'undefined') {
    console.warn(
      '⚠️ Proyectos Bloqueados con color_semaforo != ROJO:',
      proyectosBloqueadosNoRojo.map((p) => ({
        nombre: p.nombre,
        estado: p.estado,
        color_semaforo: p.color_semaforo,
        bloqueos_activos: p.bloqueos_activos,
      }))
    )
  }

  return (
    <div className="space-y-5">
      {isProyectoFormOpen && <ProyectoForm onClose={closeProyectoForm} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vista General</h1>
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

      {/* Leyenda de colores */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Verde - En tiempo</p>
              <p className="text-xs text-gray-600">Avance ≥ tiempo transcurrido y sin bloqueos activos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0 mt-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Amarillo - Alerta</p>
              <p className="text-xs text-gray-600">Bloqueado 3+ días o avance atrasado</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Rojo - Crítico</p>
              <p className="text-xs text-gray-600">Estado Bloqueado/En Riesgo o bloqueado 5+ días</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <KPIDashboard
        proyectos={proyectos}
        isLoading={isLoading}
        activeSemaforo={semaforoFilter}
        onSemaforoClick={(color) => setSemaforoFilter(color === semaforoFilter ? null : color)}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          Error al cargar proyectos: {error.message}
        </div>
      )}

      {/* Main content */}
      <div className="flex gap-5 items-start">
        {/* Filtros */}
        <Filtros
          filtros={filtros}
          onChange={setFiltros}
          onClear={clearFiltros}
          expanded={filtrosExpanded}
          onToggle={() => setFiltrosExpanded((e) => !e)}
        />

        {/* Tabla */}
        <div className="flex-1 min-w-0">
          <VistaGerencial
            proyectos={proyectosFiltrados}
            isLoading={isLoading}
            onSelectProject={(id) => router.push(`/proyectos/${id}`)}
          />
          {!isLoading && (
            <p className="text-xs text-gray-400 mt-2 text-right">
              {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? 's' : ''} {semaforoFilter && `(${semaforoFilter})`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
