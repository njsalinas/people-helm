/**
 * @file API: Listado de áreas responsables
 * GET /api/areas - Retorna todas las áreas activas
 */

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    // Verificar autenticación
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener áreas activas desde BD
    const supabase = createServerSupabaseClient()
    const { data: areas, error } = await supabase
      .from('areas_responsables')
      .select('id, nombre, es_gerencia, activo')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      console.error('Error fetching areas:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(areas)
  } catch (error) {
    console.error('GET /api/areas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
