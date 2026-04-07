/**
 * @file React Query hooks para gestión de tareas
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import type { Tarea } from '@/types'
import type { CreateTaskInput, UpdateTaskStatusInput } from '@/types/api'

const QUERY_KEYS = {
  tareas: ['tareas'] as const,
  tareasByProject: (proyectoId: string) => ['tareas', 'project', proyectoId] as const,
  tareaDetail: (id: string) => ['tareas', 'detail', id] as const,
}

/**
 * Hook para obtener tareas de un proyecto
 */
export function useTareas(proyectoId: string) {
  const supabase = getSupabaseBrowserClient()

  return useQuery({
    queryKey: QUERY_KEYS.tareasByProject(proyectoId),
    queryFn: async (): Promise<Tarea[]> => {
      const { data, error } = await supabase
        .from('tareas')
        .select(`
          *,
          responsable:usuarios!responsable_id(id, nombre_completo, email, rol, area_responsable, activo, created_at, updated_at),
          bloqueos(id, descripcion, tipo, accion_requerida, estado, fecha_registro, created_by, created_at, updated_at, resolved_by, fecha_resolucion, comentario_resolucion, requiere_escalamiento)
        `)
        .eq('proyecto_id', proyectoId)
        .is('tarea_padre', null)
        .order('prioridad', { ascending: true })
        .order('fecha_fin_planificada', { ascending: true })

      if (error) throw error
      return (data ?? []) as unknown as Tarea[]
    },
    enabled: !!proyectoId,
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
