/**
 * @file API Route: /api/proyectos
 * GET  - Listar proyectos
 * POST - Crear proyecto (invoca Supabase Function)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateProjectSchema } from '@/lib/validations'

export async function GET(_request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('vista_semaforo_proyectos')
    .select('*')
    .order('prioridad', { ascending: true })

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
