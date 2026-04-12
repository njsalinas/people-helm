/**
 * Unit tests: calcularColorSemaforo, calcularPrioridadRiesgo, calcularKPIs
 */

import { describe, it, expect } from 'vitest'
import { calcularColorSemaforo, calcularPrioridadRiesgo, calcularKPIs } from '@/lib/utils'
import type { VistaSemaforoProyecto } from '@/types/database'

// ─── calcularColorSemaforo ────────────────────────────────────────────────────

function makeProyecto(overrides: Partial<VistaSemaforoProyecto>): VistaSemaforoProyecto {
  return {
    id: 'p1',
    nombre: 'Test',
    estado: 'En Curso',
    porcentaje_avance: 50,
    fecha_inicio: '2026-01-01',
    fecha_fin_planificada: '2026-12-31',
    area_responsable_id: '00000000-0000-0000-0000-000000000002',
    categoria: 'Atracción',
    foco_estrategico: 'Alta prioridad (estratégico)',
    tipo: 'Proyecto',
    subtipo: null,
    responsable_nombre: 'Test User',
    responsable_email: null,
    bloqueos_activos: 0,
    dias_bloqueo_max: 0,
    riesgos_activos: 0,
    dias_vencido: null,
    dias_restantes: 270,
    responsable_primario: '00000000-0000-0000-0000-000000000001',
    descripcion_ejecutiva: null,
    objetivo: null,
    resultado_esperado: null,
    fecha_fin_real: null,
    prioridad: 3,
    requiere_escalamiento: false,
    proyecto_padre: null,
    color_semaforo: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    created_by: '00000000-0000-0000-0000-000000000001',
    updated_by: '00000000-0000-0000-0000-000000000001',
    ...overrides,
  }
}

describe('calcularColorSemaforo', () => {
  it('devuelve VERDE para proyecto sin bloqueos y avance normal', () => {
    const p = makeProyecto({
      estado: 'En Curso',
      bloqueos_activos: 0,
      dias_bloqueo_max: 0,
      porcentaje_avance: 60,
      fecha_inicio: '2026-01-01',
      fecha_fin_planificada: '2026-12-31',
    })
    expect(calcularColorSemaforo(p)).toBe('VERDE')
  })

  it('devuelve ROJO cuando el estado es Bloqueado', () => {
    const p = makeProyecto({ estado: 'Bloqueado' })
    expect(calcularColorSemaforo(p)).toBe('ROJO')
  })

  it('devuelve ROJO cuando hay bloqueos activos > 5 días', () => {
    const p = makeProyecto({
      bloqueos_activos: 1,
      dias_bloqueo_max: 6,
    })
    expect(calcularColorSemaforo(p)).toBe('ROJO')
  })

  it('devuelve AMARILLO cuando hay bloqueos activos entre 3 y 5 días', () => {
    const p = makeProyecto({
      bloqueos_activos: 1,
      dias_bloqueo_max: 4,
    })
    expect(calcularColorSemaforo(p)).toBe('AMARILLO')
  })

  it('devuelve VERDE para proyecto Finalizado', () => {
    const p = makeProyecto({ estado: 'Finalizado', bloqueos_activos: 0, dias_bloqueo_max: 0 })
    expect(calcularColorSemaforo(p)).toBe('VERDE')
  })

  it('devuelve ROJO cuando está En Riesgo', () => {
    const p = makeProyecto({ estado: 'En Riesgo', bloqueos_activos: 0, dias_bloqueo_max: 0 })
    expect(calcularColorSemaforo(p)).toBe('ROJO')
  })
})

// ─── calcularPrioridadRiesgo ──────────────────────────────────────────────────

describe('calcularPrioridadRiesgo', () => {
  it('Crítico cuando prob=Alta e impacto=Alto', () => {
    expect(calcularPrioridadRiesgo('Alta', 'Alto')).toBe('Crítico')
  })

  it('Alta cuando prob=Media e impacto=Alto', () => {
    expect(calcularPrioridadRiesgo('Media', 'Alto')).toBe('Alta')
  })

  it('Alta cuando prob=Alta e impacto=Medio', () => {
    expect(calcularPrioridadRiesgo('Alta', 'Medio')).toBe('Alta')
  })

  it('Media cuando prob=Media e impacto=Medio', () => {
    expect(calcularPrioridadRiesgo('Media', 'Medio')).toBe('Media')
  })

  it('Baja cuando prob=Baja e impacto=Bajo', () => {
    expect(calcularPrioridadRiesgo('Baja', 'Bajo')).toBe('Baja')
  })

  it('Baja cuando prob=Baja e impacto=Alto', () => {
    expect(calcularPrioridadRiesgo('Baja', 'Alto')).toBe('Baja')
  })
})

// ─── calcularKPIs ─────────────────────────────────────────────────────────────

describe('calcularKPIs', () => {
  const proyectos = [
    makeProyecto({ estado: 'En Curso', color_semaforo: 'VERDE', bloqueos_activos: 0 }),
    makeProyecto({ id: 'p2', estado: 'En Curso', color_semaforo: 'AMARILLO', bloqueos_activos: 0 }),
    makeProyecto({ id: 'p3', estado: 'Bloqueado', color_semaforo: 'ROJO', bloqueos_activos: 2 }),
    makeProyecto({ id: 'p4', estado: 'Finalizado', color_semaforo: 'VERDE', bloqueos_activos: 0 }),
  ]

  it('cuenta el total de proyectos', () => {
    const kpis = calcularKPIs(proyectos)
    expect(kpis.total).toBe(4)
  })

  it('cuenta proyectos por color', () => {
    const kpis = calcularKPIs(proyectos)
    expect(kpis.verde).toBe(2)
    expect(kpis.amarillo).toBe(1)
    expect(kpis.rojo).toBe(1)
  })

  it('cuenta bloqueos activos totales', () => {
    const kpis = calcularKPIs(proyectos)
    expect(kpis.bloqueosActivos).toBe(2)
  })

  it('devuelve 0s para array vacío', () => {
    const kpis = calcularKPIs([])
    expect(kpis.total).toBe(0)
    expect(kpis.verde).toBe(0)
    expect(kpis.bloqueosActivos).toBe(0)
  })
})
