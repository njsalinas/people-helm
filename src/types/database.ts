/**
 * @file Tipos generados del schema de base de datos Supabase
 * Refleja exactamente las tablas SQL de las migraciones
 */

export type UserRole = 'Gerente' | 'Líder Area' | 'Espectador'

export type ProyectoTipo = 'Proyecto' | 'Línea'
export type ProyectoSubtipo = 'Operativo' | 'Campaña' | 'Estratégico'
export type ProyectoEstado = 'Pendiente' | 'En Curso' | 'En Riesgo' | 'Bloqueado' | 'Finalizado'
export type FocoEstrategico =
  | 'Alta prioridad (estratégico)'
  | 'Prioridad media (habilitadores)'
  | 'Prioridad operacional'
export type AreaResponsable = 'DO' | 'Gestión de Personas' | 'SSO' | 'Comunicaciones'

export type TareaEstado = 'Pendiente' | 'En Curso' | 'Finalizado' | 'Bloqueado'

export type BloqueoTipo =
  | 'Pendiente definición'
  | 'Espera recursos'
  | 'Espera decisión'
  | 'Capacity'
export type BloqueoAccion = 'Informar' | 'Seguimiento' | 'Decisión' | 'Intervención'
export type BloqueoEstado = 'Activo' | 'Resuelto' | 'Escalado'

export type RiesgoProbabilidad = 'Alta' | 'Media' | 'Baja'
export type RiesgoImpacto = 'Alto' | 'Medio' | 'Bajo'
export type RiesgoEstado = 'Identificado' | 'Monitoreado' | 'Mitigado' | 'Cerrado'

export type ComentarioTipo = 'Comentario' | 'Decisión' | 'Bloqueo' | 'Avance' | 'Riesgo'

export type SemaforoEstado = 'Borrador' | 'Publicado' | 'Archivado'
export type ColorSemaforo = 'VERDE' | 'AMARILLO' | 'ROJO'

export type NotificacionEvento =
  | 'bloqueo_registrado'
  | 'estado_cambio'
  | 'accion_asignada'
  | 'bloqueo_3_dias'
  | 'bloqueo_5_dias'
  | 'plazo_vencido'
  | 'comentario_nuevo'
  | 'semaforo_generado'
  | 'tarea_asignada'
  | 'tarea_finalizada'
  | 'proyecto_creado'

// ============================================================
// TABLAS
// ============================================================

export interface DbUsuario {
  id: string
  email: string
  nombre_completo: string
  rol: UserRole
  area_responsable: AreaResponsable | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface DbProyecto {
  id: string
  nombre: string
  tipo: ProyectoTipo
  subtipo: ProyectoSubtipo | null
  foco_estrategico: FocoEstrategico
  area_responsable: AreaResponsable
  categoria: string
  responsable_primario: string
  descripcion_ejecutiva: string | null
  objetivo: string | null
  resultado_esperado: string | null
  fecha_inicio: string
  fecha_fin_planificada: string
  fecha_fin_real: string | null
  estado: ProyectoEstado
  porcentaje_avance: number
  prioridad: number
  requiere_escalamiento: boolean
  proyecto_padre: string | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

export interface DbTarea {
  id: string
  proyecto_id: string
  nombre: string
  descripcion: string | null
  estado: TareaEstado
  porcentaje_avance: number
  responsable_id: string | null
  fecha_inicio: string
  fecha_fin_planificada: string
  fecha_fin_real: string | null
  prioridad: number
  tarea_padre: string | null
  bloqueado_razon: string | null
  desbloqueado_razon: string | null
  desbloqueado_por: string | null
  fecha_desbloqueado: string | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

export interface DbBloqueo {
  id: string
  proyecto_id: string
  descripcion: string
  tipo: BloqueoTipo
  accion_requerida: BloqueoAccion
  requiere_escalamiento: boolean
  estado: BloqueoEstado
  fecha_registro: string
  fecha_resolucion: string | null
  comentario_resolucion: string | null
  created_by: string
  resolved_by: string | null
  created_at: string
  updated_at: string
}

export interface DbRiesgo {
  id: string
  proyecto_id: string
  descripcion: string
  probabilidad: RiesgoProbabilidad
  impacto: RiesgoImpacto
  prioridad: number
  plan_mitigacion: string | null
  estado: RiesgoEstado
  fecha_identificacion: string
  fecha_cierre: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface DbComentario {
  id: string
  proyecto_id: string
  contenido: string
  tipo: ComentarioTipo
  created_by: string
  created_at: string
  updated_at: string
  comentario_padre: string | null
  deleted_at: string | null
}

export interface DbHistorialCambio {
  id: string
  proyecto_id: string
  entidad_tipo: 'Proyecto' | 'Tarea' | 'Bloqueo' | 'Riesgo' | 'Estado' | 'Avance' | 'Comentario'
  campo_afectado: string | null
  valor_anterior: string | null
  valor_nuevo: string | null
  comentario: string | null
  created_by: string
  created_at: string
}

export interface SemaforoItemManual {
  area: string
  categoria: string
  proyecto: string
  detalle: string
  indicadores?: {
    porcentaje_avance?: boolean
    status?: boolean
    bloqueos?: boolean
    responsable?: boolean
    proximo_hito?: boolean
  }
}

export interface SemaforoContenidoManual {
  verde: SemaforoItemManual[]
  amarillo: SemaforoItemManual[]
  rojo: SemaforoItemManual[]
}

export interface SemaforoItemAuto {
  id: string
  nombre: string
  area: string
  comentario: string
}

export interface SemaforoContenidoAuto {
  verde: SemaforoItemAuto[]
  amarillo: SemaforoItemAuto[]
  rojo: SemaforoItemAuto[]
}

export interface DbSemaforo {
  id: string
  mes: number
  anio: number
  contenido_automatico: SemaforoContenidoAuto | null
  contenido_manual: SemaforoContenidoManual | null
  comentario_ejecutivo_verde: string | null
  comentario_ejecutivo_amarillo: string | null
  comentario_ejecutivo_rojo: string | null
  estado: SemaforoEstado
  created_by: string
  publicado_by: string | null
  created_at: string
  publicado_at: string | null
  updated_at: string
}

export interface DbNotificacionConfig {
  id: string
  usuario_id: string
  evento: NotificacionEvento
  canal_alerta_visual: boolean
  canal_email: boolean
  canal_popup: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// VISTAS
// ============================================================

export interface VistaSemaforoProyecto extends DbProyecto {
  responsable_nombre: string
  responsable_email: string | null
  color_semaforo: ColorSemaforo | null
  bloqueos_activos: number
  dias_bloqueo_max: number
  riesgos_activos: number
  dias_vencido: number | null
  dias_restantes: number
}

export interface VistaBloqueoActivo {
  id: string
  proyecto_id: string
  proyecto_nombre: string
  area_responsable: AreaResponsable
  descripcion: string
  tipo: BloqueoTipo
  accion_requerida: BloqueoAccion
  requiere_escalamiento: boolean
  estado: BloqueoEstado
  fecha_registro: string
  dias_bloqueado: number
  creado_por_nombre: string
  created_by: string
  responsable_primario: string
}
