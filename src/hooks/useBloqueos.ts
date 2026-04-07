/**
 * @file React Query hooks para gestión de bloqueos
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import type { BloqueoActivo } from '@/types'
import type { CreateBloqueoInput, ResolveBloqueoInput } from '@/types/api'

const QUERY_KEYS = {
  bloqueos: ['bloqueos'] as const,
  bloqueosActivos: ['bloqueos', 'activos'] as const,
  bloqueosByProject: (id: string) => ['bloqueos', 'project', id] as const,
}

/**
 * Hook para vista transversal de bloqueos activos
 */
export function useBloqueoActivos() {
  const supabase = getSupabaseBrowserClient()

  return useQuery({
    queryKey: QUERY_KEYS.bloqueosActivos,
    queryFn: async (): Promise<BloqueoActivo[]> => {
      const { data, error } = await supabase
        .from('vista_bloqueos_activos')
        .select('*')
        .order('dias_bloqueado', { ascending: false })

      if (error) throw error
      return (data ?? []) as BloqueoActivo[]
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Hook para registrar un bloqueo
 */
export function useRegistrarBloqueo() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (input: CreateBloqueoInput) => {
      const response = await fetch(`/api/proyectos/${input.proyecto_id}/bloqueos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al registrar bloqueo')
      }

      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloqueosActivos })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloqueosByProject(variables.proyecto_id) })
      addToast({ type: 'success', title: 'Bloqueo registrado', description: 'Se notificó al gerente' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error al registrar bloqueo', description: error.message })
    },
  })
}

/**
 * Hook para resolver un bloqueo
 */
export function useResolverBloqueo(proyectoId: string) {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)
  const supabase = getSupabaseBrowserClient()

  return useMutation({
    mutationFn: async (input: ResolveBloqueoInput) => {
      const { error } = await supabase
        .from('bloqueos')
        .update({
          estado: 'Resuelto',
          fecha_resolucion: new Date().toISOString(),
          comentario_resolucion: input.comentario_resolucion,
        })
        .eq('id', input.bloqueo_id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloqueosActivos })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloqueosByProject(proyectoId) })
      addToast({ type: 'success', title: 'Bloqueo resuelto' })
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', description: error.message })
    },
  })
}
