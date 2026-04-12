/**
 * @file React Query hooks para gestión de subproyectos
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUIStore } from '@/stores/uiStore'
import type { Subproyecto, Tarea } from '@/types'
import type { CreateTaskInput } from '@/types/api'

const QUERY_KEYS = {
  subproyecto: (id: string) => ['subproyecto', id] as const,
  tareasSubproyecto: (id: string) => ['tareas', 'subproyecto', id] as const,
}

/**
 * Hook para obtener detalle de un subproyecto específico
 */
export function useSubproyecto(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.subproyecto(id),
    queryFn: async (): Promise<Subproyecto | null> => {
      const response = await fetch(`/api/subproyectos/${id}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al obtener subproyecto')
      }

      const json = await response.json()
      return json.data as Subproyecto
    },
    enabled: !!id,
  })
}

/**
 * Hook para obtener tareas de un subproyecto
 */
export function useTareasSubproyecto(subproyectoId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tareasSubproyecto(subproyectoId),
    queryFn: async (): Promise<Tarea[]> => {
      const response = await fetch(`/api/subproyectos/${subproyectoId}/tareas`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al obtener tareas')
      }

      const json = await response.json()
      return json.data as Tarea[]
    },
    enabled: !!subproyectoId,
  })
}

/**
 * Hook para crear una tarea en un subproyecto
 */
export function useCrearTareaSubproyecto(subproyectoId: string) {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const response = await fetch(`/api/subproyectos/${subproyectoId}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear tarea')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tareasSubproyecto(subproyectoId) })
      addToast({ type: 'success', title: 'Tarea creada exitosamente' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error al crear tarea', description: error.message })
    },
  })
}
