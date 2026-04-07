/**
 * Unit tests: utility functions
 */

import { describe, it, expect } from 'vitest'
import {
  formatDate,
  calcularDiasRestantes,
  calcularPorcentajeTiempo,
  colorFilaBloqueo,
  obtenerIniciales,
  nombreMes,
} from '@/lib/utils'

describe('formatDate', () => {
  it('formatea fecha ISO como DD/MM/YYYY', () => {
    expect(formatDate('2025-06-15')).toBe('15/06/2025')
  })

  it('retorna — para null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('retorna — para undefined', () => {
    expect(formatDate(undefined)).toBe('—')
  })
})

describe('calcularDiasRestantes', () => {
  it('devuelve número positivo para fecha futura', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    const dias = calcularDiasRestantes(future.toISOString().split('T')[0])
    expect(dias).toBeGreaterThan(0)
  })

  it('devuelve número negativo para fecha pasada', () => {
    const past = new Date()
    past.setDate(past.getDate() - 5)
    const dias = calcularDiasRestantes(past.toISOString().split('T')[0])
    expect(dias).toBeLessThan(0)
  })
})

describe('calcularPorcentajeTiempo', () => {
  it('devuelve ~50 cuando estamos a la mitad del proyecto', () => {
    const start = new Date()
    start.setDate(start.getDate() - 30)
    const end = new Date()
    end.setDate(end.getDate() + 30)
    const pct = calcularPorcentajeTiempo(start.toISOString(), end.toISOString())
    expect(pct).toBeGreaterThan(40)
    expect(pct).toBeLessThan(60)
  })

  it('retorna 0 cuando aún no ha empezado', () => {
    const start = new Date()
    start.setDate(start.getDate() + 10)
    const end = new Date()
    end.setDate(end.getDate() + 40)
    const pct = calcularPorcentajeTiempo(start.toISOString(), end.toISOString())
    expect(pct).toBe(0)
  })

  it('retorna 100 cuando ya terminó', () => {
    const start = new Date()
    start.setDate(start.getDate() - 40)
    const end = new Date()
    end.setDate(end.getDate() - 10)
    const pct = calcularPorcentajeTiempo(start.toISOString(), end.toISOString())
    expect(pct).toBe(100)
  })
})

describe('colorFilaBloqueo', () => {
  it('devuelve rojo para bloqueos de más de 5 días', () => {
    expect(colorFilaBloqueo(6)).toContain('red')
  })

  it('devuelve naranja para bloqueos de 3-5 días', () => {
    expect(colorFilaBloqueo(4)).toContain('orange')
  })

  it('devuelve amarillo para bloqueos de menos de 3 días', () => {
    expect(colorFilaBloqueo(2)).toContain('yellow')
  })
})

describe('obtenerIniciales', () => {
  it('extrae iniciales de nombre y apellido', () => {
    expect(obtenerIniciales('María González')).toBe('MG')
  })

  it('maneja nombre simple', () => {
    expect(obtenerIniciales('Carlos')).toBe('C')
  })

  it('retorna ?? para null', () => {
    expect(obtenerIniciales(null)).toBe('??')
  })
})

describe('nombreMes', () => {
  it('retorna el nombre correcto en español', () => {
    expect(nombreMes(1)).toBe('Enero')
    expect(nombreMes(6)).toBe('Junio')
    expect(nombreMes(12)).toBe('Diciembre')
  })
})
