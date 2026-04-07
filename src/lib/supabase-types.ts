/**
 * @file Tipos de Database para Supabase Client (generics)
 * Mapea las tablas para TypeScript autocomplete.
 *
 * GenericTable exige { Row, Insert, Update, Relationships }.
 * Sin Relationships, Database['public'] no extiende GenericSchema
 * y Supabase cae a `any`, lo que hace que .insert()/.update() retornen `never`.
 */

import type {
  DbUsuario, DbProyecto, DbTarea, DbBloqueo, DbRiesgo,
  DbComentario, DbHistorialCambio, DbSemaforo, DbNotificacionConfig,
  VistaSemaforoProyecto, VistaBloqueoActivo,
} from '@/types/database'

/** Campos que nunca se envían desde el cliente */
type OmitAuto = 'id' | 'created_at' | 'updated_at'

/**
 * Hace opcionales los campos que admiten null (como en los tipos generados por Supabase CLI).
 * Los campos required siguen siendo obligatorios.
 */
type InsertRow<T> = Omit<
  {
    [K in keyof T as null extends T[K] ? K : never]?: T[K]
  } & {
    [K in keyof T as null extends T[K] ? never : K]: T[K]
  },
  OmitAuto
>

type UpdateRow<T> = Partial<Omit<T, 'id' | 'created_at'>>

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: DbUsuario
        Insert: InsertRow<DbUsuario>
        Update: UpdateRow<DbUsuario>
        Relationships: never[]
      }
      proyectos: {
        Row: DbProyecto
        Insert: InsertRow<DbProyecto>
        Update: UpdateRow<DbProyecto>
        Relationships: never[]
      }
      tareas: {
        Row: DbTarea
        Insert: InsertRow<DbTarea>
        Update: UpdateRow<DbTarea>
        Relationships: never[]
      }
      bloqueos: {
        Row: DbBloqueo
        Insert: InsertRow<DbBloqueo>
        Update: UpdateRow<DbBloqueo>
        Relationships: never[]
      }
      riesgos: {
        Row: DbRiesgo
        Insert: InsertRow<DbRiesgo>
        Update: UpdateRow<DbRiesgo>
        Relationships: never[]
      }
      comentarios: {
        Row: DbComentario
        Insert: InsertRow<DbComentario>
        Update: UpdateRow<DbComentario>
        Relationships: never[]
      }
      historial_cambios: {
        Row: DbHistorialCambio
        Insert: InsertRow<DbHistorialCambio>
        Update: never
        Relationships: never[]
      }
      semaforos: {
        Row: DbSemaforo
        Insert: InsertRow<DbSemaforo>
        Update: UpdateRow<DbSemaforo>
        Relationships: never[]
      }
      notificaciones_config: {
        Row: DbNotificacionConfig
        Insert: InsertRow<DbNotificacionConfig>
        Update: UpdateRow<DbNotificacionConfig>
        Relationships: never[]
      }
    }
    Views: {
      vista_semaforo_proyectos: {
        Row: VistaSemaforoProyecto
        Relationships: never[]
      }
      vista_bloqueos_activos: {
        Row: VistaBloqueoActivo
        Relationships: never[]
      }
    }
    Functions: {
      calcular_color_semaforo: {
        Args: { p_proyecto_id: string }
        Returns: string
      }
      recalcular_avance_proyecto: {
        Args: { p_proyecto_id: string }
        Returns: number
      }
    }
    Enums: Record<string, never>
  }
}
