/**
 * @file API Route: /api/notificaciones/config/[id]
 * PATCH - Activar / desactivar una configuración de notificación
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { z } from 'zod'

const Schema = z.object({
  activo: z.boolean(), // mapea a canal_alerta_visual en DB
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const result = Schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Solo puede editar sus propias configs
  const { data, error } = await supabase
    .from('notificaciones_config')
    .update({ canal_alerta_visual: result.data.activo })
    .eq('id', params.id)
    .eq('usuario_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
