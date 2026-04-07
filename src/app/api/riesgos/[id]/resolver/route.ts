/**
 * @file API Route: /api/riesgos/[id]/resolver
 * PATCH - Cambiar estado del riesgo a Mitigado o Cerrado
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { z } from 'zod'

const Schema = z.object({
  estado: z.enum(['Monitoreado', 'Mitigado', 'Cerrado']),
  plan_mitigacion: z.string().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol === 'Espectador') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const result = Schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const updateData: Record<string, unknown> = {
    estado: result.data.estado,
    updated_at: new Date().toISOString(),
  }
  if (result.data.plan_mitigacion) updateData.plan_mitigacion = result.data.plan_mitigacion
  if (result.data.estado === 'Cerrado') updateData.fecha_cierre = new Date().toISOString()

  const { data, error } = await supabase
    .from('riesgos')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, mensaje: 'Riesgo actualizado' })
}
