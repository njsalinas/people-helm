/**
 * @file API Route: /api/reporteria/semaforo
 * GET  - Listar semáforos (con paginación)
 * POST - Generar semáforo del mes actual (invoca Supabase Function)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const anio = searchParams.get('anio')
  const limit = parseInt(searchParams.get('limit') ?? '12')

  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('semaforos')
    .select('*')
    .order('anio', { ascending: false })
    .order('mes', { ascending: false })
    .limit(limit)

  if (anio) {
    query = query.eq('anio', parseInt(anio))
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol !== 'Gerente') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const now = new Date()
  const mes = body.mes ?? now.getMonth() + 1
  const anio = body.anio ?? now.getFullYear()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const response = await fetch(`${supabaseUrl}/functions/v1/generar-semaforo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ mes, anio }),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: err }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json({ data, mensaje: 'Semáforo generado' }, { status: 201 })
}
