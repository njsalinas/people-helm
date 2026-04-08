/**
 * @file API Route: /api/proyectos
 * GET  - Listar proyectos
 * POST - Crear proyecto (invoca Supabase Function)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateProjectSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const searchParams = request.nextUrl.searchParams

  let query = supabase.from('vista_semaforo_proyectos').select('*')

  // RBAC: Filtrar por rol del usuario
  if (user.rol === 'Líder Area') {
    // Líder Area ve:
    // 1. Proyectos donde es responsable primario
    // 2. Proyectos donde tiene tareas asignadas

    // Obtener IDs de proyectos donde el usuario tiene tareas
    const { data: proyectosConTareas } = await supabase
      .from('tareas')
      .select('proyecto_id')
      .eq('responsable_id', user.id)

    const proyectoIds = proyectosConTareas?.map((t) => t.proyecto_id) || []
    const projectIdsSet = new Set([...proyectoIds])

    // Filtrar proyectos
    query = query.or(`responsable_primario.eq.${user.id},id.in.(${Array.from(projectIdsSet).join(',')})`)
  }
  // Gerente ve todos (sin filtro)
  // Espectador ve todos (read-only, controlado por RLS en BD)

  // Aplicar filtros opcionales
  const foco = searchParams.get('foco')
  const estado = searchParams.get('estado')
  const area = searchParams.get('area')
  const prioridad = searchParams.get('prioridad')

  if (foco) query = query.eq('foco_estrategico', foco)
  if (estado) query = query.eq('estado', estado)
  if (area && user.rol === 'Gerente') query = query.eq('area_responsable', area)
  if (prioridad) query = query.eq('prioridad', parseInt(prioridad))

  query = query.order('prioridad', { ascending: true })

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol === 'Espectador') {
    return NextResponse.json({ error: 'Sin permisos para crear proyectos' }, { status: 403 })
  }

  const body = await request.json()
  const result = CreateProjectSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('proyectos')
    .insert([{ ...result.data, created_by: user.id, updated_by: user.id }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya existe un proyecto con ese nombre en el área' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, mensaje: 'Proyecto creado' }, { status: 201 })
}
