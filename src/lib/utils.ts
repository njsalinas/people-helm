/**
 * @file Utilidades compartidas del sistema
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ColorSemaforo, ProyectoGerencial, VistaSemaforoProyecto } from '@/types'
import { DIAS_BLOQUEO_ROJO, DIAS_BLOQUEO_AMARILLO } from './constants'

/**
 * Combina clases Tailwind de forma segura
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha ISO a formato legible en español
 */
export function formatDate(dateStr: string, pattern = 'dd/MM/yyyy'): string {
  try {
    return format(parseISO(dateStr), pattern, { locale: es })
  } catch {
    return dateStr
  }
}

/**
 * Calcula días restantes hasta una fecha
 * @returns número positivo = días restantes, negativo = días vencido
 */
export function calcularDiasRestantes(fechaFin: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fin = parseISO(fechaFin)
  return differenceInDays(fin, hoy)
}

/**
 * Calcula el porcentaje de tiempo transcurrido de un proyecto
 */
export function calcularPorcentajeTiempo(fechaInicio: string, fechaFin: string): number {
  const inicio = parseISO(fechaInicio)
  const fin = parseISO(fechaFin)
  const hoy = new Date()

  if (isAfter(hoy, fin)) return 100
  if (isBefore(hoy, inicio)) return 0

  const totalDias = differenceInDays(fin, inicio)
  if (totalDias <= 0) return 100

  const diasTranscurridos = differenceInDays(hoy, inicio)
  return Math.round((diasTranscurridos / totalDias) * 100)
}

/**
 * Calcula el color del semáforo para un proyecto en el frontend
 * Usa los mismos criterios que la función SQL calcular_color_semaforo
 */
export function calcularColorSemaforo(
  proyecto: Pick<
    VistaSemaforoProyecto,
    'estado' | 'porcentaje_avance' | 'bloqueos_activos' | 'fecha_inicio' | 'fecha_fin_planificada'
  >
): ColorSemaforo {
  const { estado, porcentaje_avance, bloqueos_activos } = proyecto

  if (estado === 'Finalizado') return 'VERDE'

  // Calcular máximo días bloqueado (simplificado en frontend, server calcula el real)
  if (estado === 'Bloqueado' && bloqueos_activos > 0) return 'ROJO'
  if (bloqueos_activos >= DIAS_BLOQUEO_ROJO) return 'ROJO'
  if (estado === 'En Riesgo') return 'AMARILLO'

  const porcentajeTiempo = calcularPorcentajeTiempo(
    proyecto.fecha_inicio,
    proyecto.fecha_fin_planificada
  )

  if (
    estado === 'En Curso' &&
    porcentaje_avance >= porcentajeTiempo &&
    bloqueos_activos === 0
  ) {
    return 'VERDE'
  }

  if (
    estado === 'En Curso' &&
    (porcentaje_avance < porcentajeTiempo || bloqueos_activos > 0)
  ) {
    return 'AMARILLO'
  }

  return 'AMARILLO'
}

/**
 * Calcula la prioridad de un riesgo basado en probabilidad e impacto
 */
export function calcularPrioridadRiesgo(
  probabilidad: 'Alta' | 'Media' | 'Baja',
  impacto: 'Alto' | 'Medio' | 'Bajo'
): number {
  const matriz: Record<string, Record<string, number>> = {
    Alta: { Alto: 1, Medio: 2, Bajo: 3 },
    Media: { Alto: 2, Medio: 3, Bajo: 4 },
    Baja: { Alto: 3, Medio: 4, Bajo: 5 },
  }
  return matriz[probabilidad]?.[impacto] ?? 5
}

/**
 * Genera un color de badge para la prioridad de riesgo
 */
export function colorPrioridadRiesgo(prioridad: number): string {
  if (prioridad === 1) return 'bg-red-100 text-red-800'
  if (prioridad === 2) return 'bg-orange-100 text-orange-800'
  if (prioridad === 3) return 'bg-yellow-100 text-yellow-800'
  if (prioridad === 4) return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-800'
}

/**
 * Determina el color de fila para un bloqueo según días transcurridos
 */
export function colorFilaBloqueo(diasBloqueado: number): string {
  if (diasBloqueado > DIAS_BLOQUEO_ROJO) return 'bg-red-50 border-l-4 border-red-500'
  if (diasBloqueado > DIAS_BLOQUEO_AMARILLO) return 'bg-orange-50 border-l-4 border-orange-500'
  return 'bg-yellow-50 border-l-4 border-yellow-400'
}

/**
 * Formatea el porcentaje con símbolo
 */
export function formatPorcentaje(valor: number): string {
  return `${valor}%`
}

/**
 * Trunca un texto a un máximo de caracteres
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Genera las iniciales de un nombre completo
 */
export function obtenerIniciales(nombreCompleto: string): string {
  return nombreCompleto
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Calcula KPIs para el dashboard dado un listado de proyectos
 */
export function calcularKPIs(proyectos: ProyectoGerencial[]) {
  const total = proyectos.length
  const verde = proyectos.filter((p) => p.color_semaforo === 'VERDE').length
  const amarillo = proyectos.filter((p) => p.color_semaforo === 'AMARILLO').length
  const rojo = proyectos.filter((p) => p.color_semaforo === 'ROJO').length
  const bloqueos_activos = proyectos.reduce((sum, p) => sum + p.bloqueos_activos, 0)
  const acciones_pendientes = proyectos.filter(
    (p) =>
      p.bloqueos_activos > 0 &&
      // tiene bloqueos con acción Decisión o Intervención (simplificado)
      p.estado === 'Bloqueado'
  ).length

  return { total, verde, amarillo, rojo, bloqueos_activos, acciones_pendientes }
}

/**
 * Nombre del mes en español
 */
export function nombreMes(mes: number): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return meses[mes - 1] ?? String(mes)
}
