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
 */
export function useProyectos(filtros: ProyectosFilter = {}) {
  const supabase = getSupabaseBrowserClient()

  return useQuery({
    queryKey: QUERY_KEYS.proyectosList(filtros),
    queryFn: async (): Promise<ProyectoGerencial[]> => {
      let query = supabase
        .from('vista_semaforo_proyectos')
        .select('*')

      // Aplicar filtros
      if (filtros.areas?.length) {
        query = query.in('area_responsable', filtros.areas)
      }
      if (filtros.focos?.length) {
        query = query.in('foco_estrategico', filtros.focos)
      }
      if (filtros.estados?.length) {
        query = query.in('estado', filtros.estados)
      }
      if (filtros.solo_con_bloqueos) {
        query = query.gt('bloqueos_activos', 0)
      }
      if (filtros.solo_vencidos) {
        query = query.not('dias_vencido', 'is', null)
      }
      if (filtros.solo_criticos) {
        query = query.in('prioridad', [1, 2])
      }
      if (filtros.responsable_id) {
        query = query.eq('responsable_primario', filtros.responsable_id)
      }
      if (filtros.fecha_inicio) {
        query = query.gte('fecha_inicio', filtros.fecha_inicio)
      }
      if (filtros.fecha_fin) {
        query = query.lte('fecha_fin_planificada', filtros.fecha_fin)
      }

      // Ordenamiento por defecto: prioridad desc, estado
      query = query.order('prioridad', { ascending: true }).order('estado')

      const { data, error } = await query

      if (error) throw error
      return (data ?? []) as ProyectoGerencial[]
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
