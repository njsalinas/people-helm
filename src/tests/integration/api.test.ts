/**
 * Integration tests: API routes
 *
 * Uses msw (mock service worker) to intercept fetch calls, allowing us to
 * test the hooks and API-layer logic without a live Supabase instance.
 */

import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// ─── MSW server ───────────────────────────────────────────────────────────────

const handlers = [
  http.get('/api/proyectos', () =>
    HttpResponse.json({
      data: [
        {
          id: 'p1',
          nombre: 'ATS Q2',
          estado: 'En Progreso',
          color_semaforo: 'VERDE',
          porcentaje_avance: 40,
          bloqueos_activos: 0,
          area_responsable: 'Reclutamiento',
          categoria: 'Atracción',
          foco_estrategico: 'Eficiencia',
          tipo: 'Proyecto',
          fecha_inicio: '2025-01-01',
          fecha_fin: '2025-12-31',
          responsable_nombre: null,
          responsable_email: null,
          dias_bloqueo_max: 0,
        },
      ],
    })
  ),

  http.post('/api/proyectos', () =>
    HttpResponse.json({ data: { id: 'p-new' }, mensaje: 'Proyecto creado' }, { status: 201 })
  ),

  http.get('/api/proyectos/:id/tareas', () =>
    HttpResponse.json({ data: [] })
  ),

  http.get('/api/reporteria/semaforo', () =>
    HttpResponse.json({ data: [] })
  ),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useProyectos', () => {
  it('fetches and returns project list', async () => {
    const { useProyectos } = await import('@/hooks/useProjects')
    const { result } = renderHook(() => useProyectos({}), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].nombre).toBe('ATS Q2')
  })

  it('handles API error gracefully', async () => {
    server.use(
      http.get('/api/proyectos', () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    )

    const { useProyectos } = await import('@/hooks/useProjects')
    const { result } = renderHook(() => useProyectos({}), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useSemaforos', () => {
  it('returns empty list when no semaforos exist', async () => {
    const { useSemaforos } = await import('@/hooks/useSemaforo')
    const { result } = renderHook(() => useSemaforos(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(0)
  })
})
