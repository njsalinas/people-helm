/**
 * @file API Route: /api/tareas/detalle?id=...
 * GET - Obtener tarea específica con responsable
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const tareaId = request.nextUrl.searchParams.get('id')
  if (!tareaId) return NextResponse.json({ error: 'ID de tarea requerido' }, { status: 400 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('tareas')
    .select(`
      *,
      responsable:usuarios!responsable_id(id, nombre_completo, email, rol, area_responsable_id, activo, created_at, updated_at)
    `)
    .eq('id', tareaId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json({ data })
}
