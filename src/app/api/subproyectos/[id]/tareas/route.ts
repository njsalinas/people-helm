/**
 * @file API Route: /api/subproyectos/[id]/tareas
 * GET - Listar tareas del subproyecto
 * POST - Crear tarea en el subproyecto
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateTaskSchema } from '@/lib/validations'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  // Obtener el subproyecto para validar que existe
  const { data: subproyecto, error: errorSub } = await supabase
    .from('subproyectos')
    .select('proyecto_id')
    .eq('id', params.id)
    .single()

  if (errorSub || !subproyecto) {
    return NextResponse.json(
      { error: 'Subproyecto no encontrado' },
      { status: 404 }
    )
  }

  // Obtener tareas del subproyecto
  const { data, error } = await supabase
    .from('tareas')
    .select('*, responsable:usuarios!responsable_id(id, nombre_completo, email)')
    .eq('subproyecto_id', params.id)
    .order('prioridad', { ascending: true })
    .order('fecha_fin_planificada', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()

  const supabase = createServerSupabaseClient()

  // Obtener el subproyecto para obtener su proyecto_id
  const { data: subproyecto, error: errorSub } = await supabase
    .from('subproyectos')
    .select('proyecto_id')
    .eq('id', params.id)
    .single()

  if (errorSub || !subproyecto) {
    return NextResponse.json(
      { error: 'Subproyecto no encontrado' },
      { status: 404 }
    )
  }

  // Validar datos de tarea
  const result = CreateTaskSchema.safeParse({
    ...body,
    proyecto_id: subproyecto.proyecto_id,
    subproyecto_id: params.id,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  // Crear tarea
  const { data, error } = await supabase
    .from('tareas')
    .insert([
      {
        ...result.data,
        created_by: user.id,
        updated_by: user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { data, mensaje: 'Tarea creada exitosamente' },
    { status: 201 }
  )
}
