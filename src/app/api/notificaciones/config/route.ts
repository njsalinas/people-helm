/**
 * @file API Route: /api/notificaciones/config
 * GET - Obtener configuración de notificaciones del usuario autenticado
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('notificaciones_config')
    .select('*')
    .eq('usuario_id', user.id)
    .order('evento_tipo')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
