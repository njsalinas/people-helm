/**
 * @file Tipos de dominio de negocio (enriquecidos con relaciones)
 * Usados en los componentes React y hooks
 */

import type {
  DbUsuario,
  DbProyecto,
  DbTarea,
  DbBloqueo,
  DbRiesgo,
  DbComentario,
  DbHistorialCambio,
  VistaSemaforoProyecto,
  VistaBloqueoActivo,
  ColorSemaforo,
} from './database'

// Re-exports de tipos base
export type { ColorSemaforo }

// ============================================================
// Tipos de dominio (con joins resueltos)
// ============================================================

export interface Usuario extends DbUsuario {}

export interface Proyecto extends DbProyecto {
  responsable?: Usuario
  subproyectos?: Proyecto[]
}

/** Proyecto enriquecido para Vista Gerencial */
export interface ProyectoGerencial extends VistaSemaforoProyecto {
  responsable?: Usuario
  tareas_total?: number
  tareas_completadas?: number
}

export interface Tarea extends DbTarea {
  responsable?: Usuario
  bloqueos?: Bloqueo[]
}

export interface Bloqueo extends DbBloqueo {
  creado_por?: Usuario
  resuelto_por?: Usuario
  proyecto?: Pick<DbProyecto, 'id' | 'nombre' | 'area_responsable'>
}

export interface BloqueoActivo extends VistaBloqueoActivo {}

export interface Riesgo extends DbRiesgo {
  creado_por?: Usuario
}

export interface Comentario extends DbComentario {
  autor?: Usuario
  respuestas?: Comentario[]
}

export interface HistorialCambio extends DbHistorialCambio {
  autor?: Usuario
}

// ============================================================
// Tipos para UI y estado
// ============================================================

export interface KPIData {
  total: number
  verde: number
  amarillo: number
  rojo: number
  bloqueos_activos: number
  acciones_pendientes: number
}

export interface KanbanColumn {
  id: 'Pendiente' | 'En Curso' | 'Bloqueado' | 'Finalizado'
  label: string
  tareas: Tarea[]
}

export interface TimelineTask {
  tarea: Tarea
  porcentaje_tiempo_transcurrido: number
  dias_totales: number
  dias_transcurridos: number
  esta_vencida: boolean
}

/** Categorías por área para dropdowns */
export const CATEGORIAS_POR_AREA: Record<string, string[]> = {
  DO: ['Desempeño', 'Clima Laboral', 'Capacitación', 'Empleabilidad Local', 'Liderazgo'],
  'Gestión de Personas': [
    'Temas Legales/Normativos',
    'Reportería',
    'Remuneraciones',
    'Beneficios',
    'Administración',
  ],
  SSO: [
    'Sistemas de Gestión',
    'Programas de Prevención',
    'Investigación de Incidentes',
    'Cumplimiento Normativo',
    'Cultura de Seguridad',
  ],
  Comunicaciones: [
    'Comunicación Interna',
    'Comunicación Externa',
    'Marca Empleadora',
    'Reputación',
    'Relaciones Comunitarias',
  ],
}

export const FOCOS_ESTRATEGICOS = [
  'Alta prioridad (estratégico)',
  'Prioridad media (habilitadores)',
  'Prioridad operacional',
] as const

export const AREAS_RESPONSABLES = [
  'DO',
  'Gestión de Personas',
  'SSO',
  'Comunicaciones',
] as const

export const ESTADOS_PROYECTO = [
  'Pendiente',
  'En Curso',
  'En Riesgo',
  'Bloqueado',
  'Finalizado',
] as const

export const ESTADOS_TAREA = ['Pendiente', 'En Curso', 'Finalizado', 'Bloqueado'] as const

export const TIPOS_BLOQUEO = [
  'Pendiente definición',
  'Espera recursos',
  'Espera decisión',
  'Capacity',
] as const

export const ACCIONES_BLOQUEO = ['Informar', 'Seguimiento', 'Decisión', 'Intervención'] as const

export const PROBABILIDADES_RIESGO = ['Alta', 'Media', 'Baja'] as const
export const IMPACTOS_RIESGO = ['Alto', 'Medio', 'Bajo'] as const

/** Colores Tailwind para cada estado de proyecto */
export const COLORES_ESTADO: Record<string, { bg: string; text: string; border: string }> = {
  Pendiente: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'En Curso': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'En Riesgo': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  Bloqueado: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  Finalizado: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
}

/** Colores Tailwind para semáforo */
export const COLORES_SEMAFORO: Record<ColorSemaforo, { bg: string; text: string; dot: string }> = {
  VERDE: { bg: 'bg-green-50', text: 'text-green-800', dot: 'bg-green-500' },
  AMARILLO: { bg: 'bg-yellow-50', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  ROJO: { bg: 'bg-red-50', text: 'text-red-800', dot: 'bg-red-500' },
}
