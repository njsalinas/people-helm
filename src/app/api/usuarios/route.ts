import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre_completo, rol, area_responsable_id, area:areas_responsables(nombre)')
    .eq('activo', true)
    .order('nombre_completo')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Transformar para exponer area.nombre como area_responsable para retrocompatibilidad
  const transformedData = (data ?? []).map((user: any) => ({
    ...user,
    area_responsable: user.area?.nombre || null,
    area: undefined,
  }))

  return NextResponse.json({ data: transformedData })
}
