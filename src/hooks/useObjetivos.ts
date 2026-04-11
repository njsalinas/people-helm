/**
 * @file Hook: useObjetivos - CRUD de Objetivos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DbObjetivo } from '@/types/database'
import type { CreateObjetivoInput, UpdateObjetivoInput } from '@/lib/validations'

interface ObjetivoFiltros {
  anio?: number
  area_id?: string
  status?: string
}

// Query: Lista de objetivos
export function useObjetivos(filtros?: ObjetivoFiltros) {
  const params = new URLSearchParams()
  if (filtros?.anio) params.append('anio', filtros.anio.toString())
  if (filtros?.area_id) params.append('area_id', filtros.area_id)
  if (filtros?.status) params.append('status', filtros.status)

  return useQuery<any[]>({
    queryKey: ['objetivos', filtros],
    queryFn: async () => {
      const response = await fetch(`/api/objetivos?${params}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error fetching objetivos')
      }
      return response.json().then((res) => res.data)
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

// Query: Detalle de un objetivo
export function useObjetivo(id: string | null) {
  return useQuery({
    queryKey: ['objetivos', id],
    queryFn: async () => {
      const response = await fetch(`/api/objetivos/${id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error fetching objetivo')
      }
      return response.json().then((res) => res.data)
    },
    enabled: !!id,
  })
}

// Mutation: Crear objetivo
export function useCrearObjetivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateObjetivoInput) => {
      const response = await fetch('/api/objetivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error creating objetivo')
      }

      return response.json().then((res) => res.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objetivos'] })
    },
  })
}

// Mutation: Actualizar objetivo
export function useActualizarObjetivo(objetivoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateObjetivoInput) => {
      const response = await fetch(`/api/objetivos/${objetivoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error updating objetivo')
      }

      return response.json().then((res) => res.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objetivos'] })
      queryClient.invalidateQueries({ queryKey: ['objetivos', objetivoId] })
    },
  })
}

// Mutation: Eliminar objetivo (soft-delete)
export function useEliminarObjetivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (objetivoId: string) => {
      const response = await fetch(`/api/objetivos/${objetivoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error deleting objetivo')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objetivos'] })
    },
  })
}

// Mutation: Vincular proyecto a objetivo
export function useVincularProyecto(objetivoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proyectoId: string) => {
      const response = await fetch(`/api/objetivos/${objetivoId}/proyectos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyecto_id: proyectoId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error vinculando proyecto')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objetivos'] })
      queryClient.invalidateQueries({ queryKey: ['objetivos', objetivoId] })
    },
  })
}

// Mutation: Desvincular proyecto de objetivo
export function useDesvincularProyecto(objetivoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proyectoId: string) => {
      const response = await fetch(`/api/objetivos/${objetivoId}/proyectos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyecto_id: proyectoId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error desvinculando proyecto')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objetivos'] })
      queryClient.invalidateQueries({ queryKey: ['objetivos', objetivoId] })
    },
  })
}
