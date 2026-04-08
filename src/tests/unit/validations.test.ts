/**
 * Unit tests: Zod schemas in lib/validations.ts
 */

import { describe, it, expect } from 'vitest'
import {
  CreateProjectSchema,
  CreateTaskSchema,
  CreateBloqueoSchema,
  CreateRiesgoSchema,
  LoginSchema,
} from '@/lib/validations'

const UUID = '00000000-0000-0000-0000-000000000001'

// ─── CreateProjectSchema ──────────────────────────────────────────────────────

describe('CreateProjectSchema', () => {
  const valid = {
    nombre: 'ATS Q2',
    tipo: 'Proyecto',
    foco_estrategico: 'Alta prioridad (estratégico)',
    area_responsable: 'DO',
    categoria: 'Desempeño',
    responsable_primario: UUID,
    fecha_inicio: '2026-01-01',
    fecha_fin_planificada: '2026-06-30',
  }

  it('acepta datos válidos', () => {
    expect(CreateProjectSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza cuando fecha_fin < fecha_inicio', () => {
    const r = CreateProjectSchema.safeParse({ ...valid, fecha_fin_planificada: '2025-12-31' })
    expect(r.success).toBe(false)
  })

  it('rechaza nombre vacío', () => {
    const r = CreateProjectSchema.safeParse({ ...valid, nombre: '' })
    expect(r.success).toBe(false)
  })

  it('rechaza tipo inválido', () => {
    const r = CreateProjectSchema.safeParse({ ...valid, tipo: 'Otro' })
    expect(r.success).toBe(false)
  })

  it('rechaza área inválida', () => {
    const r = CreateProjectSchema.safeParse({ ...valid, area_responsable: 'NoExiste' })
    expect(r.success).toBe(false)
  })
})

// ─── CreateTaskSchema ─────────────────────────────────────────────────────────

describe('CreateTaskSchema', () => {
  const valid = {
    proyecto_id: UUID,
    nombre: 'Revisar candidatos',
    responsable_id: UUID,
    fecha_inicio: '2026-01-01',
    fecha_fin_planificada: '2026-06-30',
    prioridad: 3,
  }

  it('acepta tarea mínima válida', () => {
    expect(CreateTaskSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza nombre vacío', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, nombre: '' })
    expect(r.success).toBe(false)
  })

  it('rechaza prioridad fuera de rango', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, prioridad: 6 })
    expect(r.success).toBe(false)
  })
})

// ─── CreateBloqueoSchema ──────────────────────────────────────────────────────

describe('CreateBloqueoSchema', () => {
  const valid = {
    proyecto_id: UUID,
    tipo: 'Espera decisión',
    descripcion: 'El sistema de ATS no responde desde ayer en producción',
    accion_requerida: 'Decisión',
  }

  it('acepta bloqueo válido', () => {
    expect(CreateBloqueoSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza descripción muy corta', () => {
    const r = CreateBloqueoSchema.safeParse({ ...valid, descripcion: 'X' })
    expect(r.success).toBe(false)
  })

  it('rechaza tipo inválido', () => {
    const r = CreateBloqueoSchema.safeParse({ ...valid, tipo: 'Mágico' })
    expect(r.success).toBe(false)
  })
})

// ─── CreateRiesgoSchema ───────────────────────────────────────────────────────

describe('CreateRiesgoSchema', () => {
  const valid = {
    proyecto_id: UUID,
    descripcion: 'Posible rotación del responsable del proyecto',
    probabilidad: 'Media',
    impacto: 'Alto',
  }

  it('acepta riesgo válido', () => {
    expect(CreateRiesgoSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza probabilidad inválida', () => {
    const r = CreateRiesgoSchema.safeParse({ ...valid, probabilidad: 'Extrema' })
    expect(r.success).toBe(false)
  })
})

// ─── LoginSchema ──────────────────────────────────────────────────────────────

describe('LoginSchema', () => {
  it('acepta credenciales válidas', () => {
    const r = LoginSchema.safeParse({ email: 'user@example.com', password: 'Secret123' })
    expect(r.success).toBe(true)
  })

  it('rechaza email inválido', () => {
    const r = LoginSchema.safeParse({ email: 'no-es-email', password: 'Secret123' })
    expect(r.success).toBe(false)
  })

  it('rechaza contraseña corta', () => {
    const r = LoginSchema.safeParse({ email: 'user@example.com', password: '123' })
    expect(r.success).toBe(false)
  })
})
