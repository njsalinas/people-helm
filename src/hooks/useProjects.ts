/**
 * @file React Query hooks para gestión de proyectos
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import type { ProyectoGerencial, Proyecto } from '@/types'
import type { ProyectosFilter, CreateProjectInput, UpdateProjectStatusInput } from '@/types/api'

const QUERY_KEYS = {
  proyectos: ['proyectos'] as const,
  proyectosList: (filtros: ProyectosFilter) => ['proyectos', 'list', filtros] as const,
  proyectoDetail: (id: string) => ['proyectos', 'detail', id] as const,
}

/**
 * Hook principal para la Vista Gerencial
 * Carga proyectos con datos calculados (color semáforo, bloqueos, etc.)
 *
 * NOTA: Usa API route /api/proyectos en lugar de consultar Supabase directamente
 * Esto asegura que se aplique correctamente el filtrado por rol/área en el servidor
 */
export function useProyectos(filtros: ProyectosFilter = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.proyectosList(filtros),
    queryFn: async (): Promise<ProyectoGerencial[]> => {
      // Construir query string con filtros
      const params = new URLSearchParams()

      if (filtros.areas?.length) {
        params.append('areas', filtros.areas.join(','))
      }
      if (filtros.focos?.length) {
        params.append('focos', filtros.focos.join(','))
      }
      if (filtros.estados?.length) {
        params.append('estados', filtros.estados.join(','))
      }
      if (filtros.solo_con_bloqueos) {
        params.append('solo_con_bloqueos', 'true')
      }
      if (filtros.solo_vencidos) {
        params.append('solo_vencidos', 'true')
      }
      if (filtros.solo_criticos) {
        params.append('solo_criticos', 'true')
      }
      if (filtros.responsable_id) {
        params.append('responsable_id', filtros.responsable_id)
      }
      if (filtros.fecha_inicio) {
        params.append('fecha_inicio', filtros.fecha_inicio)
      }
      if (filtros.fecha_fin) {
        params.append('fecha_fin', filtros.fecha_fin)
      }

      const url = `/api/proyectos${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error fetching proyectos')
      }

      const json = await response.json()
      return (json.data ?? []) as ProyectoGerencial[]
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Hook para obtener detalle de un proyecto específico (con subproyectos)
 */
export function useProyecto(id: string) {
  const supabase = getSupabaseBrowserClient()

  return useQuery({
    queryKey: QUERY_KEYS.proyectoDetail(id),
    queryFn: async (): Promise<Proyecto | null> => {
      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          responsable:usuarios!responsable_primario(id, nombre_completo, email, rol, area_responsable, activo, created_at, updated_at),
          subproyectos:proyectos!proyecto_padre(
            id,
            nombre,
            descripcion_ejecutiva,
            tipo,
            subtipo,
            categoria,
            foco_estrategico,
            area_responsable,
            estado,
            porcentaje_avance,
            prioridad,
            fecha_inicio,
            fecha_fin_planificada,
            responsable:usuarios!responsable_primario(id, nombre_completo, email)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as unknown as Proyecto
    },
    enabled: !!id,
  })
}

/**
 * Hook para crear un proyecto
 */
export function useCrearProyecto() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const response = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear proyecto')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proyectos })
      addToast({ type: 'success', title: 'Proyecto creado exitosamente' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error al crear proyecto', description: error.message })
    },
  })
}

/**
 * Hook para actualizar estado de un proyecto
 */
export function useActualizarEstadoProyecto() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (input: UpdateProjectStatusInput) => {
      const response = await fetch(`/api/proyectos/${input.proyecto_id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar estado')
      }

      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proyectos })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proyectoDetail(variables.proyecto_id) })
      addToast({ type: 'success', title: 'Estado actualizado' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', description: error.message })
    },
  })
}

/**
 * Hook para crear un subproyecto
 */
export function useCrearSubproyecto(proyectoPadreId: string) {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const response = await fetch(`/api/proyectos/${proyectoPadreId}/subproyectos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear subproyecto')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proyectoDetail(proyectoPadreId) })
      addToast({ type: 'success', title: 'Subproyecto creado exitosamente' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error al crear subproyecto', description: error.message })
    },
  })
}

/**
 * Hook para eliminar un subproyecto
 */
export function useEliminarSubproyecto(proyectoPadreId: string) {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (subproyectoId: string) => {
      const response = await fetch(`/api/proyectos/${subproyectoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar subproyecto')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proyectoDetail(proyectoPadreId) })
      addToast({ type: 'success', title: 'Subproyecto eliminado exitosamente' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error al eliminar subproyecto', description: error.message })
    },
  })
}
