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

// ─── CreateProjectSchema ──────────────────────────────────────────────────────

describe('CreateProjectSchema', () => {
  const valid = {
    nombre: 'ATS Q2',
    tipo: 'Proyecto',
    foco_estrategico: 'Eficiencia',
    area_responsable: 'Reclutamiento',
    categoria: 'Atracción',
    fecha_inicio: '2025-01-01',
    fecha_fin: '2025-06-30',
  }

  it('acepta datos válidos', () => {
    expect(CreateProjectSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza cuando fecha_fin < fecha_inicio', () => {
    const r = CreateProjectSchema.safeParse({ ...valid, fecha_fin: '2024-12-31' })
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
    proyecto_id: 'abc-123',
    nombre: 'Revisar candidatos',
    estado: 'Pendiente',
    prioridad: 'Media',
  }

  it('acepta tarea mínima válida', () => {
    expect(CreateTaskSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza nombre vacío', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, nombre: '' })
    expect(r.success).toBe(false)
  })

  it('rechaza estado inválido', () => {
    const r = CreateTaskSchema.safeParse({ ...valid, estado: 'Inventado' })
    expect(r.success).toBe(false)
  })
})

// ─── CreateBloqueoSchema ──────────────────────────────────────────────────────

describe('CreateBloqueoSchema', () => {
  const valid = {
    proyecto_id: 'p1',
    tipo: 'Técnico',
    descripcion: 'El sistema de ATS no responde',
    accion_requerida: 'Escalar a TI',
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
    proyecto_id: 'p1',
    descripcion: 'Posible rotación del responsable',
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
