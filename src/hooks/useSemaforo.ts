/**
 * @file useSemaforo
 * Hooks para semáforos (reportería)
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DbSemaforo } from '@/types/database'
import type { SemaforoAbreviadoData } from '@/components/Reporteria/SemaforoAbreviado'

async function fetchSemaforos(anio?: number): Promise<DbSemaforo[]> {
  const params = new URLSearchParams()
  if (anio) params.set('anio', String(anio))
  const res = await fetch(`/api/reporteria/semaforo?${params}`)
  if (!res.ok) throw new Error('Error al cargar semáforos')
  const json = await res.json()
  return json.data
}

async function fetchSemaforo(id: string): Promise<DbSemaforo> {
  const res = await fetch(`/api/reporteria/semaforo/${id}`)
  if (!res.ok) throw new Error('Error al cargar semáforo')
  const json = await res.json()
  return json.data
}

export function useSemaforos(anio?: number) {
  return useQuery({
    queryKey: ['semaforos', anio],
    queryFn: () => fetchSemaforos(anio),
  })
}

export function useSemaforo(id: string) {
  return useQuery({
    queryKey: ['semaforo', id],
    queryFn: () => fetchSemaforo(id),
    enabled: Boolean(id),
  })
}

export function useGenerarSemaforo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ mes, anio }: { mes: number; anio: number }) => {
      const res = await fetch('/api/reporteria/semaforo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes, anio }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al generar')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semaforos'] })
    },
  })
}

export function useGuardarAbreviado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: SemaforoAbreviadoData) => {
      const payload = {
        comentario_ejecutivo_verde: data.comentario_verde,
        comentario_ejecutivo_amarillo: data.comentario_amarillo,
        comentario_ejecutivo_rojo: data.comentario_rojo,
        contenido_manual: {
          verde: data.verde,
          amarillo: data.amarillo,
          rojo: data.rojo,
        },
      }
      const res = await fetch(`/api/reporteria/semaforo/${data.semaforo_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al guardar')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['semaforo', variables.semaforo_id] })
      queryClient.invalidateQueries({ queryKey: ['semaforos'] })
    },
  })
}

export function usePublicarSemaforo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reporteria/semaforo/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Publicado' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al publicar')
      }
      return res.json()
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['semaforo', id] })
      queryClient.invalidateQueries({ queryKey: ['semaforos'] })
    },
  })
}
