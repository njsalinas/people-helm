/**
 * @file API: Gestión de relación Objetivos - Proyectos
 * POST   - Vincular proyecto a objetivo
 * DELETE - Desvincular proyecto de objetivo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { VincularProyectoSchema } from '@/lib/validations'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Solo Gerentes pueden vincular proyectos
  if (user.rol !== 'Gerente') {
    return NextResponse.json({ error: 'Solo Gerentes pueden vincular proyectos' }, { status: 403 })
  }

  const body = await request.json()
  const resultado = VincularProyectoSchema.safeParse({
    objetivo_id: params.id,
    ...body,
  })

  if (!resultado.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: resultado.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('objetivo_proyecto').insert([resultado.data])

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'El proyecto ya está vinculado a este objetivo' },
        { status: 409 }
      )
    }
    console.error('Error vinculando proyecto:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Solo Gerentes pueden desvincular
  if (user.rol !== 'Gerente') {
    return NextResponse.json(
      { error: 'Solo Gerentes pueden desvincular proyectos' },
      { status: 403 }
    )
  }

  const { proyecto_id } = await request.json()

  if (!proyecto_id) {
    return NextResponse.json({ error: 'proyecto_id requerido' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('objetivo_proyecto')
    .delete()
    .eq('objetivo_id', params.id)
    .eq('proyecto_id', proyecto_id)

  if (error) {
    console.error('Error desvinculando proyecto:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
