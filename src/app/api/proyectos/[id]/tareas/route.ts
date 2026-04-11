/**
 * @file API Route: /api/proyectos/[id]/tareas
 * GET  - Listar tareas del proyecto
 * POST - Crear tarea
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateTaskSchema } from '@/lib/validations'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('tareas')
    .select('*, responsable:usuarios!responsable_id(*)')
    .eq('proyecto_id', params.id)
    .order('prioridad')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol === 'Espectador') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const body = await request.json()
  const result = CreateTaskSchema.safeParse({ ...body, proyecto_id: params.id })

  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: result.error.flatten() }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Si no se asigna responsable, asignar al creador de la tarea
  const taskData = {
    ...result.data,
    responsable_id: result.data.responsable_id || user.id,
    created_by: user.id,
    updated_by: user.id,
  }

  const { data, error } = await supabase
    .from('tareas')
    .insert([taskData])
    .select('*, responsable:usuarios!responsable_id(id, nombre_completo, email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, mensaje: 'Tarea creada' }, { status: 201 })
}
