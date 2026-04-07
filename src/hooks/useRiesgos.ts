/**
 * @file useRiesgos
 * Hooks para riesgos de proyectos
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DbRiesgo } from '@/types/database'
import type { CreateRiesgoInput } from '@/types/api'

async function fetchRiesgos(proyectoId: string): Promise<DbRiesgo[]> {
  const res = await fetch(`/api/proyectos/${proyectoId}/riesgos`)
  if (!res.ok) throw new Error('Error al cargar riesgos')
  return (await res.json()).data
}

export function useRiesgos(proyectoId: string) {
  return useQuery({
    queryKey: ['riesgos', proyectoId],
    queryFn: () => fetchRiesgos(proyectoId),
    enabled: Boolean(proyectoId),
  })
}

export function useRegistrarRiesgo(proyectoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<CreateRiesgoInput, 'proyecto_id'>) => {
      const res = await fetch(`/api/proyectos/${proyectoId}/riesgos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al registrar')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riesgos', proyectoId] })
    },
  })
}

export function useResolverRiesgo(proyectoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, plan_mitigacion }: { id: string; plan_mitigacion?: string }) => {
      const res = await fetch(`/api/riesgos/${id}/resolver`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Mitigado', plan_mitigacion }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al resolver')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riesgos', proyectoId] })
    },
  })
}
