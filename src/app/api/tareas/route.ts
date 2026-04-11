/**
 * @file API Route: /api/tareas
 * GET - Obtener todas las tareas (para Kanban Global)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  // Primero: tareas básicas sin JOINs
  let basicQuery = supabase
    .from('tareas')
    .select('*')

  // RBAC: Líderes de área ven solo sus tareas en Kanban Global
  if (user.rol === 'Líder Area') {
    basicQuery = basicQuery.eq('responsable_id', user.id)
  }

  const { data: basicTareas, error: basicError } = await basicQuery
    .order('prioridad', { ascending: true })
    .order('fecha_fin_planificada', { ascending: true })

  if (basicError) {
    return NextResponse.json({ error: basicError.message }, { status: 500 })
  }

  // Si hay tareas, obtener con JOINs (sin bloqueos, que están vinculados a proyectos)
  if ((basicTareas ?? []).length > 0) {
    let detailQuery = supabase
      .from('tareas')
      .select(`
        *,
        responsable:usuarios!responsable_id(id, nombre_completo, email, rol, area_responsable_id, activo, created_at, updated_at),
        proyecto:proyectos(id, nombre, area_responsable_id, area:areas_responsables(nombre))
      `)

    // RBAC: Líderes de área ven solo sus tareas en Kanban Global
    if (user.rol === 'Líder Area') {
      detailQuery = detailQuery.eq('responsable_id', user.id)
    }

    const { data, error } = await detailQuery
      .order('prioridad', { ascending: true })
      .order('fecha_fin_planificada', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, count: data?.length })
  }

  return NextResponse.json({ data: basicTareas, count: basicTareas?.length })
}
