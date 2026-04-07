/**
 * @file API Route: /api/proyectos/[id]/bloqueos
 * POST - Registrar bloqueo en un proyecto
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateBloqueoSchema } from '@/lib/validations'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol === 'Espectador') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const result = CreateBloqueoSchema.safeParse({ ...body, proyecto_id: params.id })

  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: result.error.flatten() }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('bloqueos')
    .insert([{ ...result.data, created_by: user.id, estado: 'Activo' }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Registrar en historial
  await supabase.from('historial_cambios').insert([{
    proyecto_id: params.id,
    entidad_tipo: 'Bloqueo',
    campo_afectado: 'registro',
    valor_nuevo: result.data.descripcion,
    created_by: user.id,
  }])

  return NextResponse.json({ data, mensaje: 'Bloqueo registrado' }, { status: 201 })
}
