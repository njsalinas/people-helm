/**
 * @file Utilidades compartidas del sistema
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ColorSemaforo, ProyectoGerencial, VistaSemaforoProyecto } from '@/types'
import type { UserRole } from '@/types/database'
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
export function formatDate(dateStr: string | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (dateStr === null || dateStr === undefined) return '—'
  try {
    return format(parseISO(dateStr), pattern, { locale: es })
  } catch {
    return '—'
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
    'estado' | 'porcentaje_avance' | 'bloqueos_activos' | 'dias_bloqueo_max' | 'fecha_inicio' | 'fecha_fin_planificada'
  >
): ColorSemaforo {
  const { estado, porcentaje_avance, bloqueos_activos, dias_bloqueo_max } = proyecto

  if (estado === 'Finalizado') return 'VERDE'
  if (estado === 'Bloqueado') return 'ROJO'
  if (estado === 'En Riesgo') return 'ROJO'

  if (dias_bloqueo_max > DIAS_BLOQUEO_ROJO) return 'ROJO'
  if (dias_bloqueo_max > DIAS_BLOQUEO_AMARILLO) return 'AMARILLO'

  const porcentajeTiempo = calcularPorcentajeTiempo(
    proyecto.fecha_inicio,
    proyecto.fecha_fin_planificada
  )

  if (porcentaje_avance >= porcentajeTiempo && bloqueos_activos === 0) {
    return 'VERDE'
  }

  return 'AMARILLO'
}

/**
 * Calcula la prioridad de un riesgo basado en probabilidad e impacto
 */
export function calcularPrioridadRiesgo(
  probabilidad: 'Alta' | 'Media' | 'Baja',
  impacto: 'Alto' | 'Medio' | 'Bajo'
): 'Crítico' | 'Alta' | 'Media' | 'Baja' {
  const matriz: Record<string, Record<string, 'Crítico' | 'Alta' | 'Media' | 'Baja'>> = {
    Alta:  { Alto: 'Crítico', Medio: 'Alta',  Bajo: 'Media' },
    Media: { Alto: 'Alta',    Medio: 'Media', Bajo: 'Baja'  },
    Baja:  { Alto: 'Baja',    Medio: 'Baja',  Bajo: 'Baja'  },
  }
  return matriz[probabilidad]?.[impacto] ?? 'Baja'
}

/**
 * Genera un color de badge para la prioridad de riesgo
 */
export function colorPrioridadRiesgo(prioridad: 'Crítico' | 'Alta' | 'Media' | 'Baja'): string {
  if (prioridad === 'Crítico') return 'bg-red-100 text-red-800'
  if (prioridad === 'Alta') return 'bg-orange-100 text-orange-800'
  if (prioridad === 'Media') return 'bg-yellow-100 text-yellow-800'
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
export function obtenerIniciales(nombreCompleto: string | null | undefined): string {
  if (!nombreCompleto) return '??'
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
  const bloqueosActivos = proyectos.reduce((sum, p) => sum + p.bloqueos_activos, 0)
  const acciones_pendientes = proyectos.filter(
    (p) =>
      p.bloqueos_activos > 0 &&
      // tiene bloqueos con acción Decisión o Intervención (simplificado)
      p.estado === 'Bloqueado'
  ).length

  return { total, verde, amarillo, rojo, bloqueosActivos, acciones_pendientes }
}

/**
 * Verifica si un usuario tiene acceso a un recurso según su rol
 */
export function canAccess(
  userRol: UserRole,
  accion: 'crear' | 'leer' | 'actualizar' | 'eliminar',
  recurso: 'proyectos' | 'bloqueos' | 'riesgos' | 'semaforos' | 'usuarios'
): boolean {
  if (userRol === 'Gerente') return true
  if (userRol === 'Espectador') return accion === 'leer'
  const permisos: Record<string, ('crear' | 'leer' | 'actualizar' | 'eliminar')[]> = {
    proyectos: ['crear', 'leer', 'actualizar'],
    bloqueos: ['crear', 'leer', 'actualizar'],
    riesgos: ['crear', 'leer', 'actualizar'],
    semaforos: ['leer'],
    usuarios: ['leer'],
  }
  return permisos[recurso]?.includes(accion) ?? false
}

/**
 * Verifica si el usuario puede editar un proyecto específico
 */
export function canEditProject(
  userId: string,
  userRol: UserRole,
  responsablePrimario: string
): boolean {
  if (userRol === 'Gerente') return true
  if (userRol === 'Líder Area') return responsablePrimario === userId
  return false
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
