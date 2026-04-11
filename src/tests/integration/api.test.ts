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

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockProyecto = {
  id: 'p1',
  nombre: 'ATS Q2',
  estado: 'En Curso',
  color_semaforo: 'VERDE',
  porcentaje_avance: 40,
  bloqueos_activos: 0,
  area_responsable: 'DO',
  categoria: 'Desempeño',
  foco_estrategico: 'Desarrollo Organizacional',
  tipo: 'Proyecto',
  fecha_inicio: '2026-01-01',
  fecha_fin_planificada: '2026-12-31',
  responsable_nombre: 'Test User',
  responsable_email: null,
  dias_bloqueo_max: 0,
}

// ─── MSW server (for HTTP calls) ───────────────────────────────────────────

const handlers = [
  http.get('/api/proyectos', () =>
    HttpResponse.json({ data: [mockProyecto] })
  ),
  http.get('/api/reporteria/semaforo', () =>
    HttpResponse.json({ data: [] })
  ),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
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
    // Mock error response for this test
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
