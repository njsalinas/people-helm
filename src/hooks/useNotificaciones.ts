/**
 * @file useNotificaciones
 * Hooks para configuración y recepción de notificaciones en tiempo real
 */

'use client'

import { useQuery, useMutation, useQueryClient, useEffect } from '@tanstack/react-query'
import { useEffect as useReactEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import type { DbNotificacionConfig } from '@/types/database'

async function fetchConfig(): Promise<DbNotificacionConfig[]> {
  const res = await fetch('/api/notificaciones/config')
  if (!res.ok) throw new Error('Error al cargar configuración')
  return (await res.json()).data
}

export function useNotificacionesConfig() {
  return useQuery({
    queryKey: ['notificaciones-config'],
    queryFn: fetchConfig,
  })
}

export function useUpdateNotificacionConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const res = await fetch(`/api/notificaciones/config/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones-config'] })
    },
  })
}

/** Suscribe al canal Realtime de alertas y muestra toasts */
export function useRealtimeAlertas(usuarioId: string | undefined) {
  const addToast = useUIStore((s) => s.addToast)

  useReactEffect(() => {
    if (!usuarioId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`alertas:${usuarioId}`)
      .on('broadcast', { event: 'alerta' }, ({ payload }) => {
        addToast({
          type: payload.tipo === 'error' ? 'error' : 'info',
          message: payload.mensaje ?? 'Nueva notificación',
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [usuarioId, addToast])
}
