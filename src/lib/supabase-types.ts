/**
 * @file Tipos de Database para Supabase Client (generics)
 * Mapea las tablas para TypeScript autocomplete
 */

import type {
  DbUsuario, DbProyecto, DbTarea, DbBloqueo, DbRiesgo,
  DbComentario, DbHistorialCambio, DbSemaforo, DbNotificacionConfig,
  VistaSemaforoProyecto, VistaBloqueoActivo,
} from '@/types/database'

type Row<T> = T
type Insert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>
type Update<T> = Partial<Omit<T, 'id' | 'created_at'>>

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: Row<DbUsuario>
        Insert: Insert<DbUsuario>
        Update: Update<DbUsuario>
      }
      proyectos: {
        Row: Row<DbProyecto>
        Insert: Insert<DbProyecto>
        Update: Update<DbProyecto>
      }
      tareas: {
        Row: Row<DbTarea>
        Insert: Insert<DbTarea>
        Update: Update<DbTarea>
      }
      bloqueos: {
        Row: Row<DbBloqueo>
        Insert: Insert<DbBloqueo>
        Update: Update<DbBloqueo>
      }
      riesgos: {
        Row: Row<DbRiesgo>
        Insert: Insert<DbRiesgo>
        Update: Update<DbRiesgo>
      }
      comentarios: {
        Row: Row<DbComentario>
        Insert: Insert<DbComentario>
        Update: Update<DbComentario>
      }
      historial_cambios: {
        Row: Row<DbHistorialCambio>
        Insert: Insert<DbHistorialCambio>
        Update: never
      }
      semaforos: {
        Row: Row<DbSemaforo>
        Insert: Insert<DbSemaforo>
        Update: Update<DbSemaforo>
      }
      notificaciones_config: {
        Row: Row<DbNotificacionConfig>
        Insert: Insert<DbNotificacionConfig>
        Update: Update<DbNotificacionConfig>
      }
    }
    Views: {
      vista_semaforo_proyectos: {
        Row: VistaSemaforoProyecto
      }
      vista_bloqueos_activos: {
        Row: VistaBloqueoActivo
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
