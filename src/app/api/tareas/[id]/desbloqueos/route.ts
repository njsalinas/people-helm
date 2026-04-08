/**
 * @file API Route: /api/tareas/[id]/desbloqueos
 * GET - Obtener historial de desbloqueos de una tarea
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  // Obtener historial de desbloqueos (registros donde campo_afectado='estado' y valor_anterior='Bloqueado')
  const { data, error } = await supabase
    .from('historial_cambios')
    .select(
      `
      id,
      campo_afectado,
      valor_anterior,
      valor_nuevo,
      comentario,
      created_at,
      created_by,
      usuario:usuarios!created_by(id, nombre_completo, email)
    `
    )
    .eq('entidad_id', params.id)
    .eq('entidad_tipo', 'Tarea')
    .eq('campo_afectado', 'estado')
    .eq('valor_anterior', 'Bloqueado')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data || [] })
}
