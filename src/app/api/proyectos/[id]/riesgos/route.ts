/**
 * @file API Route: /api/proyectos/[id]/riesgos
 * GET  - Listar riesgos del proyecto
 * POST - Registrar nuevo riesgo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateRiesgoSchema } from '@/lib/validations'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('riesgos')
    .select('*')
    .eq('proyecto_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol === 'Espectador') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const result = CreateRiesgoSchema.safeParse({ ...body, proyecto_id: params.id })

  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: result.error.flatten() }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('riesgos')
    .insert([{ ...result.data, created_by: user.id, estado: 'Identificado' }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, mensaje: 'Riesgo registrado' }, { status: 201 })
}
