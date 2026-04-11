/**
 * @file Lógica de autenticación y sesiones
 */

import { createServerSupabaseClient } from './supabase-server'
import type { UserRole } from '@/types/database'

export interface SessionUser {
  id: string
  email: string
  nombre_completo: string
  rol: UserRole
  area_responsable_id: string | null  // UUID FK a areas_responsables
}

/**
 * Obtiene el usuario autenticado actual desde el servidor
 * @returns SessionUser o null si no está autenticado
 */
export async function getServerUser(): Promise<SessionUser | null> {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('id, email, nombre_completo, rol, area_responsable_id')
    .eq('id', user.id)
    .single()

  if (!perfil) return null

  return {
    id: perfil.id,
    email: perfil.email,
    nombre_completo: perfil.nombre_completo,
    rol: perfil.rol as UserRole,
    area_responsable_id: perfil.area_responsable_id,
  }
}

