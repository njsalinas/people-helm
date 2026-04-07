/**
 * @file Lógica de autenticación y sesiones
 */

import { createServerSupabaseClient } from './supabase-server'
import type { DbUsuario, UserRole } from '@/types/database'

export interface SessionUser {
  id: string
  email: string
  nombre_completo: string
  rol: UserRole
  area_responsable: string | null
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
    .select('id, email, nombre_completo, rol, area_responsable')
    .eq('id', user.id)
    .single()

  if (!perfil) return null

  return {
    id: perfil.id,
    email: perfil.email,
    nombre_completo: perfil.nombre_completo,
    rol: perfil.rol as UserRole,
    area_responsable: perfil.area_responsable,
  }
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

  // Líder Area
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
 * (Gerente puede todo, Líder solo los suyos)
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
