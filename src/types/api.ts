/**
 * @file Tipos para requests y responses de API
 */

import type {
  ProyectoTipo,
  ProyectoSubtipo,
  FocoEstrategico,
  AreaResponsable,
  ProyectoEstado,
  TareaEstado,
  BloqueoTipo,
  BloqueoAccion,
  RiesgoProbabilidad,
  RiesgoImpacto,
} from './database'

// ============================================================
// Respuestas genéricas
// ============================================================

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  mensaje?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ============================================================
// Proyectos
// ============================================================

export interface CreateProjectInput {
  nombre: string
  tipo: ProyectoTipo
  subtipo?: ProyectoSubtipo
  foco_estrategico: FocoEstrategico
  area_responsable: AreaResponsable
  categoria: string
  responsable_primario: string
  descripcion_ejecutiva?: string
  objetivo?: string
  resultado_esperado?: string
  fecha_inicio: string
  fecha_fin_planificada: string
  prioridad?: number
  proyecto_padre?: string
}

export interface UpdateProjectInput {
  nombre?: string
  descripcion_ejecutiva?: string
  objetivo?: string
  resultado_esperado?: string
  fecha_fin_planificada?: string
  prioridad?: number
  responsable_primario?: string
}

export interface UpdateProjectStatusInput {
  proyecto_id: string
  estado_nuevo: ProyectoEstado
  comentario: string
}

export interface UpdateProjectProgressInput {
  proyecto_id: string
  porcentaje_avance: number
}

// ============================================================
// Tareas
// ============================================================

export interface CreateTaskInput {
  proyecto_id: string
  nombre: string
  descripcion?: string
  responsable_id: string
  fecha_inicio: string
  fecha_fin_planificada: string
  prioridad?: number
  tarea_padre?: string
}

export interface UpdateTaskStatusInput {
  tarea_id: string
  estado_nuevo: TareaEstado
  porcentaje_avance?: number
  comentario?: string
}

// ============================================================
// Bloqueos
// ============================================================

export interface CreateBloqueoInput {
  proyecto_id: string
  descripcion: string
  tipo: BloqueoTipo
  accion_requerida: BloqueoAccion
  requiere_escalamiento: boolean
}

export interface ResolveBloqueoInput {
  bloqueo_id: string
  comentario_resolucion: string
}

// ============================================================
// Riesgos
// ============================================================

export interface CreateRiesgoInput {
  proyecto_id: string
  descripcion: string
  probabilidad: RiesgoProbabilidad
  impacto: RiesgoImpacto
  plan_mitigacion?: string
}

// ============================================================
// Comentarios
// ============================================================

export interface CreateComentarioInput {
  proyecto_id: string
  contenido: string
  tipo?: 'Comentario' | 'Decisión' | 'Bloqueo' | 'Avance' | 'Riesgo'
  comentario_padre?: string
}

// ============================================================
// Semáforo
// ============================================================

export interface GenerateSemaforoInput {
  mes: number
  anio: number
}

export interface SemaforoAbreviadoInput {
  semaforo_id: string
  contenido_manual: {
    verde: Array<{
      proyecto_id: string
      detalle: string
    }>
    amarillo: Array<{
      proyecto_id: string
      detalle: string
    }>
    rojo: Array<{
      proyecto_id: string
      detalle: string
    }>
  }
  comentario_ejecutivo_verde?: string
  comentario_ejecutivo_amarillo?: string
  comentario_ejecutivo_rojo?: string
}

// ============================================================
// Filtros para Vista Gerencial
// ============================================================

export interface ProyectosFilter {
  areas?: AreaResponsable[]
  focos?: FocoEstrategico[]
  estados?: ProyectoEstado[]
  solo_con_bloqueos?: boolean
  solo_con_acciones_pendientes?: boolean
  solo_criticos?: boolean
  solo_vencidos?: boolean
  fecha_inicio?: string
  fecha_fin?: string
  responsable_id?: string
  page?: number
  pageSize?: number
  sortBy?: keyof import('./database').DbProyecto
  sortDir?: 'asc' | 'desc'
}
