/**
 * @file API Route: /api/tareas/proyecto?id=xyz
 * GET - Obtener tareas de un proyecto específico
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const proyectoId = searchParams.get('id')

  if (!proyectoId) {
    return NextResponse.json({ error: 'Missing proyecto id' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // RBAC: Verificar que el usuario tiene acceso al proyecto
  if (user.rol === 'Líder Area') {
    const { data: proyecto, error: proyectoError } = await supabase
      .from('proyectos')
      .select('area_responsable_id')
      .eq('id', proyectoId)
      .single()

    if (proyectoError || !proyecto) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    if (proyecto.area_responsable_id !== user.area_responsable_id) {
      return NextResponse.json({ error: 'Sin acceso a este proyecto' }, { status: 403 })
    }
  }

  // Primero: tareas básicas sin JOINs
  const { data: basicTareas, error: basicError } = await supabase
    .from('tareas')
    .select('*')
    .eq('proyecto_id', proyectoId)
    .order('prioridad', { ascending: true })
    .order('fecha_fin_planificada', { ascending: true })

  if (basicError) {
    return NextResponse.json({ error: basicError.message }, { status: 500 })
  }

  // Si hay tareas, obtener con JOINs (sin bloqueos, que están vinculados a proyectos)
  if ((basicTareas ?? []).length > 0) {
    const { data, error } = await supabase
      .from('tareas')
      .select(`
        *,
        responsable:usuarios!responsable_id(id, nombre_completo, email, rol, area_responsable_id, activo, created_at, updated_at)
      `)
      .eq('proyecto_id', proyectoId)
      .order('prioridad', { ascending: true })
      .order('fecha_fin_planificada', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, count: data?.length })
  }

  return NextResponse.json({ data: basicTareas, count: basicTareas?.length })
}
