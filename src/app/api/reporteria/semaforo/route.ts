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

  const supabase = createServerSupabaseClient()

  // Obtener proyectos desde la vista
  const { data: proyectos, error: projError } = await supabase
    .from('vista_semaforo_proyectos')
    .select('*')

  if (projError) return NextResponse.json({ error: projError.message }, { status: 500 })

  const verde: typeof proyectos = []
  const amarillo: typeof proyectos = []
  const rojo: typeof proyectos = []

  for (const p of proyectos ?? []) {
    if (p.color_semaforo === 'VERDE') verde.push(p)
    else if (p.color_semaforo === 'AMARILLO') amarillo.push(p)
    else rojo.push(p)
  }

  const toItem = (p: (typeof proyectos)[number], extra = '') => ({
    id: p.id,
    nombre: p.nombre,
    area: p.area_responsable,
    comentario: extra,
  })

  const contenido_automatico = {
    verde: verde.map((p) => toItem(p, `Estado: ${p.estado} | Avance: ${p.porcentaje_avance}%`)),
    amarillo: amarillo.map((p) => toItem(p, `Estado: ${p.estado} | Avance: ${p.porcentaje_avance}% | Bloqueos: ${p.bloqueos_activos}`)),
    rojo: rojo.map((p) => toItem(p, `Estado: ${p.estado} | Bloqueos activos: ${p.bloqueos_activos}`)),
  }

  const { data, error } = await supabase
    .from('semaforos')
    .upsert([{
      mes,
      anio,
      contenido_automatico,
      comentario_ejecutivo_verde: `Proyectos en tiempo: ${verde.length}`,
      comentario_ejecutivo_amarillo: `Proyectos en riesgo: ${amarillo.length}`,
      comentario_ejecutivo_rojo: `Proyectos bloqueados: ${rojo.length}`,
      estado: 'Borrador',
      created_by: user.id,
    }], { onConflict: 'mes,anio' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    resumen: { verde: verde.length, amarillo: amarillo.length, rojo: rojo.length },
    mensaje: 'Semáforo generado',
  }, { status: 201 })
}
