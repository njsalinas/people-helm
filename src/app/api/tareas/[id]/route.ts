/**
 * @file API Route: /api/tareas/[id]
 * PATCH - Actualizar campos de una tarea (nombre, descripción, responsable, fechas, prioridad)
 * DELETE - Eliminar una tarea
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { UpdateTaskSchema } from '@/lib/validations'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const result = UpdateTaskSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const updates: Record<string, unknown> = {
    ...result.data,
    updated_by: user.id,
  }

  const { error } = await supabase
    .from('tareas')
    .update(updates)
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ mensaje: 'Tarea actualizada' })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from('tareas')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ mensaje: 'Tarea eliminada exitosamente' })
}
