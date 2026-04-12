/**
 * @component KanbanGlobal
 * Kanban global con tareas organizadas por estado
 */

'use client'

import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useTareasGlobal } from '@/hooks/useTareas'
import { useProyectos } from '@/hooks/useProjects'
import { useUIStore } from '@/stores/uiStore'
import type { Tarea, TareaEstado } from '@/types'
import { KanbanColumnGlobal } from './KanbanColumnGlobal'
import { TaskCardGlobal } from './TaskCardGlobal'

const ESTADOS_TAREA: TareaEstado[] = ['Pendiente', 'En Curso', 'Bloqueado', 'Finalizado']

// Colores predefinidos para proyectos
const COLORES_PROYECTOS = [
  'bg-blue-50 border-blue-200',
  'bg-purple-50 border-purple-200',
  'bg-green-50 border-green-200',
  'bg-amber-50 border-amber-200',
  'bg-pink-50 border-pink-200',
  'bg-indigo-50 border-indigo-200',
  'bg-cyan-50 border-cyan-200',
  'bg-red-50 border-red-200',
]

export function KanbanGlobal() {
  const { data: tareas, isLoading: isTareasLoading } = useTareasGlobal()
  const { data: proyectos } = useProyectos()
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  // Filtros
  const [filtroProyecto, setFiltroProyecto] = useState<string | null>(null)
  const [filtroResponsable, setFiltroResponsable] = useState<string | null>(null)

  // Estado de drag & drop
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // Obtener IDs de responsables únicos (de TODAS las tareas, no solo filtradas)
  const responsables = useMemo(() => {
    const unique = new Map<string, { id: string; nombre_completo: string }>()
    tareas?.forEach((t) => {
      if (t.responsable?.id) {
        unique.set(t.responsable.id, {
          id: t.responsable.id,
          nombre_completo: t.responsable.nombre_completo,
        })
      }
    })
    return Array.from(unique.values())
  }, [tareas])

  // Aplicar filtros
  const tareasFiltradas = useMemo(() => {
    return tareas?.filter((t) => {
      if (filtroProyecto && t.proyecto_id !== filtroProyecto) return false
      if (filtroResponsable && t.responsable_id !== filtroResponsable) return false
      return true
    }) ?? []
  }, [tareas, filtroProyecto, filtroResponsable])

  // Agrupar por estado
  const tareasPorEstado = useMemo(() => {
    const grouped: Record<TareaEstado, Tarea[]> = {
      Pendiente: [],
      'En Curso': [],
      Bloqueado: [],
      Finalizado: [],
    }

    tareasFiltradas.forEach((tarea) => {
      grouped[tarea.estado as TareaEstado].push(tarea)
    })

    return grouped
  }, [tareasFiltradas])

  // Obtener color para un proyecto
  const getProyectoColor = (proyectoId: string): string => {
    const proyectosOrdenados = proyectos?.sort((a, b) => a.id.localeCompare(b.id)) ?? []
    const index = proyectosOrdenados.findIndex((p) => p.id === proyectoId)
    return COLORES_PROYECTOS[index % COLORES_PROYECTOS.length]
  }

  // Setup drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)

    if (!over) return

    const taskId = active.id as string
    const nuevoEstado = over.id as TareaEstado

    // Si el nuevo estado es el mismo, no hacer nada
    const tarea = tareasFiltradas.find((t) => t.id === taskId)
    if (!tarea || tarea.estado === nuevoEstado) return

    // Llamar a la API para actualizar el estado
    try {
      const response = await fetch(`/api/tareas/${taskId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarea_id: taskId,
          estado_nuevo: nuevoEstado,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al actualizar estado')
      }

      // Invalidar el cache de tareas globales
      await queryClient.invalidateQueries({ queryKey: ['tareas', 'global'] as const })
      addToast({ type: 'success', title: 'Estado actualizado' })
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar estado',
      })
    }
  }

  if (isTareasLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ESTADOS_TAREA.map((estado) => (
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
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filtroProyecto ?? ''}
          onChange={(e) => setFiltroProyecto(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Todos los proyectos</option>
          {proyectos?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtroResponsable ?? ''}
          onChange={(e) => setFiltroResponsable(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Todos los responsables</option>
          {responsables.map((resp) => (
            <option key={resp.id} value={resp.id}>
              {resp.nombre_completo}
            </option>
          ))}
        </select>
      </div>

      {/* Kanban */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ESTADOS_TAREA.map((estado) => (
            <KanbanColumnGlobal
              key={estado}
              estado={estado}
              tareas={tareasPorEstado[estado]}
              getProyectoColor={getProyectoColor}
              activeTaskId={activeTaskId}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTaskId ? (
            <TaskCardGlobal
              tarea={tareasFiltradas.find((t) => t.id === activeTaskId)!}
              getProyectoColor={getProyectoColor}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
