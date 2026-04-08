/**
 * @file API Route: /api/tareas/[id]/desbloquear
 * PATCH - Desbloquear tarea registrando razón y metadata
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { DesbloquearTareaSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  // Validar schema
  const result = DesbloquearTareaSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createServerSupabaseClient()

  // Obtener tarea actual
  const { data: tarea, error: tareaError } = await supabase
    .from('tareas')
    .select('id, estado, proyecto_id, responsable_id')
    .eq('id', params.id)
    .single()

  if (tareaError || !tarea) {
    return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
  }

  // Validar que está en estado 'Bloqueado'
  if (tarea.estado !== 'Bloqueado') {
    return NextResponse.json(
      { error: 'La tarea no está bloqueada' },
      { status: 400 }
    )
  }

  // TODO: Validar permisos (Gerente, responsable de tarea, o responsable del proyecto)
  // Por ahora, permitir a cualquier usuario autenticado

  const { nuevo_estado, desbloqueado_razon } = result.data

  // Actualizar tarea
  const { data: updated, error: updateError } = await supabase
    .from('tareas')
    .update({
      estado: nuevo_estado,
      desbloqueado_por: user.id,
      desbloqueado_razon: desbloqueado_razon,
      fecha_desbloqueado: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Registrar en historial_cambios
  const { error: historialError } = await supabase
    .from('historial_cambios')
    .insert({
      proyecto_id: tarea.proyecto_id,
      entidad_tipo: 'Tarea',
      entidad_id: params.id,
      campo_afectado: 'estado',
      valor_anterior: 'Bloqueado',
      valor_nuevo: nuevo_estado,
      comentario: `Desbloqueado: ${desbloqueado_razon}`,
      created_by: user.id,
    })

  if (historialError) {
    console.error('Error registrando en historial:', historialError)
    // No fallar la operación si no se registra en historial
  }

  return NextResponse.json({ data: updated, mensaje: 'Tarea desbloqueada' })
}
