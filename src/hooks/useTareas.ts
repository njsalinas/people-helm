/**
 * @file React Query hooks para gestión de tareas
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
/* import { getSupabaseBrowserClient } from '@/lib/supabase' */
import { useUIStore } from '@/stores/uiStore'
import type { Tarea } from '@/types'
import type { CreateTaskInput, UpdateTaskStatusInput, UpdateTaskInput } from '@/types/api'

const QUERY_KEYS = {
  tareas: ['tareas'] as const,
  tareasByProject: (proyectoId: string) => ['tareas', 'project', proyectoId] as const,
  tareaDetail: (id: string) => ['tareas', 'detail', id] as const,
}

/**
 * Hook para obtener tareas de un proyecto
 */
export function useTareas(proyectoId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tareasByProject(proyectoId),
    queryFn: async (): Promise<Tarea[]> => {
      const response = await fetch(`/api/tareas/proyecto?id=${proyectoId}`)

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error fetching tareas')
      }

      const { data } = await response.json()
      return (data ?? []) as unknown as Tarea[]
    },
    enabled: !!proyectoId,
  })
}

/**
 * Hook para obtener todas las tareas de todos los proyectos (Kanban Global)
 */
interface TareaGlobal extends Omit<Tarea, 'bloqueos'> {
  proyecto?: {
    id: string
    nombre: string
    area_responsable: string
  }
}

export function useTareasGlobal() {
  return useQuery({
    queryKey: ['tareas', 'global'] as const,
    queryFn: async (): Promise<TareaGlobal[]> => {
      const response = await fetch('/api/tareas')

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error fetching tareas')
      }

      const { data } = await response.json()
      return (data ?? []) as unknown as TareaGlobal[]
    },
  })
}

/**
 * Hook para crear una tarea
 */
export function useCrearTarea() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const response = await fetch(`/api/proyectos/${input.proyecto_id}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al crear tarea')
      }

      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tareasByProject(variables.proyecto_id) })
      addToast({ type: 'success', title: 'Tarea creada' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error al crear tarea', description: error.message })
    },
  })
}

/**
 * Hook para actualizar estado/avance de una tarea
 */
export function useActualizarTarea(proyectoId: string) {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (input: UpdateTaskStatusInput) => {
      const response = await fetch(`/api/tareas/${input.tarea_id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al actualizar tarea')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tareasByProject(proyectoId) })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', description: error.message })
    },
  })
}

/**
 * Hook para editar campos de una tarea (nombre, descripción, responsable, fechas, prioridad)
 */
export function useEditarTarea(proyectoId: string) {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async ({ tareaId, data }: { tareaId: string; data: UpdateTaskInput }) => {
      const response = await fetch(`/api/tareas/${tareaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al editar tarea')
      }

      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tareasByProject(proyectoId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tareaDetail(variables.tareaId) })
      addToast({ type: 'success', title: 'Tarea actualizada' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar tarea', description: error.message })
    },
  })
}

/**
 * Hook para eliminar una tarea
 */
export function useEliminarTarea(proyectoId: string) {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (tareaId: string) => {
      const response = await fetch(`/api/tareas/${tareaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar tarea')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tareasByProject(proyectoId) })
      queryClient.invalidateQueries({ queryKey: ['tareas', 'global'] })
      addToast({ type: 'success', title: 'Tarea eliminada exitosamente' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error al eliminar tarea', description: error.message })
    },
  })
}
