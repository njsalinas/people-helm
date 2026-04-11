/**
 * @file API: Gestión de Objetivos
 * GET  - Listar objetivos (con filtros)
 * POST - Crear objetivo (solo Gerentes)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateObjetivoSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const searchParams = request.nextUrl.searchParams

  // Preparar query base
  let query = supabase
    .from('vista_objetivos_con_metricas')
    .select('*')
    .is('archived_at', null)  // Excluir soft-deleted

  // Filtros opcionales
  const anio = searchParams.get('anio')
  const areaId = searchParams.get('area_id')
  const status = searchParams.get('status')

  if (anio) query = query.eq('anio', parseInt(anio))
  if (areaId) query = query.eq('area_responsable_id', areaId)
  if (status) query = query.eq('status', status)

  // Ordenar por área y luego por orden
  query = query.order('area_responsable_id', { ascending: true }).order('orden', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching objetivos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Solo Gerentes pueden crear objetivos
  if (user.rol !== 'Gerente') {
    return NextResponse.json(
      { error: 'Solo Gerentes pueden crear objetivos' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const result = CreateObjetivoSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('objetivos')
    .insert([{ ...result.data, created_by: user.id, updated_by: user.id }])
    .select()
    .single()

  if (error) {
    console.error('Error creating objetivo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
