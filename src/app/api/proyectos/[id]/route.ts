/**
 * @file API Route: /api/proyectos/[id]
 * GET    - Obtener proyecto por ID con joins completos
 * PATCH  - Actualizar campos del proyecto
 * DELETE - Eliminar proyecto (solo Gerente)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('proyectos')
    .select(`
      *,
      responsable:usuarios!proyectos_responsable_id_fkey(id, nombre, email),
      tareas(id, nombre, estado, porcentaje_avance, responsable_id, fecha_inicio, fecha_fin, prioridad, orden),
      bloqueos(id, tipo, descripcion, accion_requerida, estado, created_at),
      riesgos(id, descripcion, probabilidad, impacto, prioridad, estado)
    `)
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol !== 'Gerente') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('proyectos').delete().eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ mensaje: 'Proyecto eliminado' })
}
