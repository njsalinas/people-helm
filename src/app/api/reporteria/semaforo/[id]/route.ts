/**
 * @file API Route: /api/reporteria/semaforo/[id]
 * GET   - Obtener semáforo por ID
 * PATCH - Actualizar comentarios / publicar semáforo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { z } from 'zod'

const UpdateSemaforoSchema = z.object({
  comentario_ejecutivo_verde: z.string().max(500).optional(),
  comentario_ejecutivo_amarillo: z.string().max(500).optional(),
  comentario_ejecutivo_rojo: z.string().max(500).optional(),
  contenido_manual: z.record(z.unknown()).optional(),
  estado: z.enum(['Borrador', 'Publicado', 'Archivado']).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('semaforos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol === 'Espectador') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const result = UpdateSemaforoSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: result.error.flatten() }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('semaforos')
    .update({ ...result.data, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, mensaje: 'Semáforo actualizado' })
}
