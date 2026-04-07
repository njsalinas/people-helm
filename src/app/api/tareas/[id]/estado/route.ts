/**
 * @file API Route: /api/tareas/[id]/estado
 * PATCH - Actualizar estado/avance de una tarea
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { UpdateTaskStatusSchema } from '@/lib/validations'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const result = UpdateTaskStatusSchema.safeParse({ ...body, tarea_id: params.id })

  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const updates: Record<string, unknown> = {
    estado: result.data.estado_nuevo,
    updated_by: user.id,
  }

  if (result.data.porcentaje_avance !== undefined) {
    updates.porcentaje_avance = result.data.porcentaje_avance
  }

  if (result.data.estado_nuevo === 'Finalizado') {
    updates.porcentaje_avance = 100
    updates.fecha_fin_real = new Date().toISOString().split('T')[0]
  }

  const { error } = await supabase
    .from('tareas')
    .update(updates)
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ mensaje: 'Tarea actualizada' })
}
