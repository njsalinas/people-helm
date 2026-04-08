/**
 * @file Schemas de validación Zod para inputs del sistema
 */

import { z } from 'zod'
import {
  NOMBRE_PROYECTO_MIN,
  NOMBRE_PROYECTO_MAX,
  DESCRIPCION_BLOQUEO_MIN,
  DESCRIPCION_BLOQUEO_MAX,
  COMENTARIO_ESTADO_MIN,
  COMENTARIO_ESTADO_MAX,
  DETALLE_SEMAFORO_MAX,
  COMENTARIO_EJECUTIVO_MAX,
} from './constants'
import {
  FOCOS_ESTRATEGICOS,
  AREAS_RESPONSABLES,
  ESTADOS_PROYECTO,
  ESTADOS_TAREA,
  TIPOS_BLOQUEO,
  ACCIONES_BLOQUEO,
  PROBABILIDADES_RIESGO,
  IMPACTOS_RIESGO,
  CATEGORIAS_POR_AREA,
} from '@/types/domain'

// ============================================================
// Proyectos
// ============================================================

export const CreateProjectSchema = z
  .object({
    nombre: z
      .string()
      .min(NOMBRE_PROYECTO_MIN, `Mínimo ${NOMBRE_PROYECTO_MIN} caracteres`)
      .max(NOMBRE_PROYECTO_MAX, `Máximo ${NOMBRE_PROYECTO_MAX} caracteres`),
    tipo: z.enum(['Proyecto', 'Línea']),
    subtipo: z.enum(['Operativo', 'Campaña', 'Estratégico']).optional(),
    foco_estrategico: z.enum(FOCOS_ESTRATEGICOS),
    area_responsable: z.enum(AREAS_RESPONSABLES),
    categoria: z.string().min(1, 'Categoría requerida'),
    responsable_primario: z.string().uuid('ID de responsable inválido'),
    descripcion_ejecutiva: z.string().max(2000).optional(),
    objetivo: z.string().max(1000).optional(),
    resultado_esperado: z.string().max(1000).optional(),
    fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
    fecha_fin_planificada: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
    prioridad: z.number().int().min(1).max(5).default(3),
    proyecto_padre: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      const inicio = new Date(data.fecha_inicio)
      const fin = new Date(data.fecha_fin_planificada)
      return fin > inicio
    },
    { message: 'Fecha fin debe ser mayor a fecha inicio', path: ['fecha_fin_planificada'] }
  )
  .refine(
    (data) => {
      const cats = CATEGORIAS_POR_AREA[data.area_responsable]
      return cats?.includes(data.categoria)
    },
    { message: 'Categoría no válida para el área seleccionada', path: ['categoria'] }
  )

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export const UpdateProjectStatusSchema = z.object({
  proyecto_id: z.string().uuid(),
  estado_nuevo: z.enum(ESTADOS_PROYECTO),
  comentario: z
    .string()
    .min(COMENTARIO_ESTADO_MIN, `Comentario mínimo ${COMENTARIO_ESTADO_MIN} caracteres`)
    .max(COMENTARIO_ESTADO_MAX),
})

export type UpdateProjectStatusInput = z.infer<typeof UpdateProjectStatusSchema>

export const UpdateProjectSchema = z.object({
  nombre: z
    .string()
    .min(NOMBRE_PROYECTO_MIN, `Mínimo ${NOMBRE_PROYECTO_MIN} caracteres`)
    .max(NOMBRE_PROYECTO_MAX, `Máximo ${NOMBRE_PROYECTO_MAX} caracteres`)
    .optional(),
  descripcion_ejecutiva: z.string().max(2000).optional(),
  objetivo: z.string().max(1000).optional(),
  resultado_esperado: z.string().max(1000).optional(),
  responsable_primario: z.string().uuid('ID de responsable inválido').optional(),
  prioridad: z.number().int().min(1).max(5).optional(),
  estado: z.enum(ESTADOS_PROYECTO).optional(),
})

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>

// ============================================================
// Tareas
// ============================================================

export const CreateTaskSchema = z
  .object({
    proyecto_id: z.string().uuid(),
    nombre: z.string().min(3, 'Mínimo 3 caracteres').max(200),
    descripcion: z.string().max(2000).optional(),
    responsable_id: z.string().uuid().optional(),
    fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    fecha_fin_planificada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    prioridad: z.number().int().min(1).max(5).default(3),
    tarea_padre: z.string().uuid().optional(),
  })
  .refine(
    (data) => new Date(data.fecha_fin_planificada) >= new Date(data.fecha_inicio),
    { message: 'Fecha fin debe ser mayor o igual a fecha inicio', path: ['fecha_fin_planificada'] }
  )

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>

export const UpdateTaskStatusSchema = z.object({
  tarea_id: z.string().uuid(),
  estado_nuevo: z.enum(ESTADOS_TAREA),
  porcentaje_avance: z.number().int().min(0).max(100).optional(),
  comentario: z.string().max(500).optional(),
})

export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>

export const DesbloquearTareaSchema = z.object({
  nuevo_estado: z.enum(['Pendiente', 'En Curso', 'Finalizado']),
  desbloqueado_razon: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
})

export type DesbloquearTareaInput = z.infer<typeof DesbloquearTareaSchema>

// ============================================================
// Bloqueos
// ============================================================

export const CreateBloqueoSchema = z.object({
  proyecto_id: z.string().uuid(),
  descripcion: z
    .string()
    .min(DESCRIPCION_BLOQUEO_MIN, `Mínimo ${DESCRIPCION_BLOQUEO_MIN} caracteres`)
    .max(DESCRIPCION_BLOQUEO_MAX, `Máximo ${DESCRIPCION_BLOQUEO_MAX} caracteres`),
  tipo: z.enum(TIPOS_BLOQUEO),
  accion_requerida: z.enum(ACCIONES_BLOQUEO),
  requiere_escalamiento: z.boolean().default(false),
})

export type CreateBloqueoInput = z.infer<typeof CreateBloqueoSchema>

export const ResolveBloqueoSchema = z.object({
  bloqueo_id: z.string().uuid(),
  comentario_resolucion: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
})

export type ResolveBloqueoInput = z.infer<typeof ResolveBloqueoSchema>

// ============================================================
// Riesgos
// ============================================================

export const CreateRiesgoSchema = z.object({
  proyecto_id: z.string().uuid(),
  descripcion: z.string().min(20, 'Mínimo 20 caracteres').max(500),
  probabilidad: z.enum(PROBABILIDADES_RIESGO),
  impacto: z.enum(IMPACTOS_RIESGO),
  plan_mitigacion: z.string().max(1000).optional(),
})

export type CreateRiesgoInput = z.infer<typeof CreateRiesgoSchema>

// ============================================================
// Comentarios
// ============================================================

export const CreateComentarioSchema = z.object({
  proyecto_id: z.string().uuid(),
  contenido: z.string().min(1, 'El comentario no puede estar vacío').max(2000),
  tipo: z.enum(['Comentario', 'Decisión', 'Bloqueo', 'Avance', 'Riesgo']).default('Comentario'),
  comentario_padre: z.string().uuid().optional(),
})

export type CreateComentarioInput = z.infer<typeof CreateComentarioSchema>

// ============================================================
// Auth
// ============================================================

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña mínima 6 caracteres'),
})

export type LoginInput = z.infer<typeof LoginSchema>

// ============================================================
// Semáforo abreviado
// ============================================================

export const SemaforoItemManualSchema = z.object({
  proyecto_id: z.string().uuid(),
  detalle: z.string().max(DETALLE_SEMAFORO_MAX, `Máximo ${DETALLE_SEMAFORO_MAX} caracteres`),
})

export const SemaforoAbreviadoSchema = z.object({
  semaforo_id: z.string().uuid(),
  contenido_manual: z.object({
    verde: z.array(SemaforoItemManualSchema).max(3),
    amarillo: z.array(SemaforoItemManualSchema).max(3),
    rojo: z.array(SemaforoItemManualSchema).max(3),
  }),
  comentario_ejecutivo_verde: z.string().max(COMENTARIO_EJECUTIVO_MAX).optional(),
  comentario_ejecutivo_amarillo: z.string().max(COMENTARIO_EJECUTIVO_MAX).optional(),
  comentario_ejecutivo_rojo: z.string().max(COMENTARIO_EJECUTIVO_MAX).optional(),
})

export type SemaforoAbreviadoInput = z.infer<typeof SemaforoAbreviadoSchema>
