/**
 * @file API: Detalle y edición de Objetivos
 * GET    - Obtener objetivo por ID con proyectos asociados
 * PATCH  - Actualizar objetivo (solo Gerentes)
 * DELETE - Soft-delete de objetivo (solo Gerentes)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { UpdateObjetivoSchema } from '@/lib/validations'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  // Obtener objetivo con proyectos asociados
  const { data: objetivo, error: objetivoError } = await supabase
    .from('vista_objetivo_proyectos')
    .select('*')
    .eq('objetivo_id', params.id)
    .not('proyecto_id', 'is', null)

  if (objetivoError) {
    return NextResponse.json({ error: objetivoError.message }, { status: 500 })
  }

  if (!objetivo || objetivo.length === 0) {
    return NextResponse.json({ error: 'Objetivo no encontrado' }, { status: 404 })
  }

  // Agrupar por objetivo (todos los rows tienen el mismo objetivo)
  const primera = objetivo[0]
  const objetivoDetalles = {
    id: primera.objetivo_id,
    titulo: primera.objetivo_titulo,
    // ... otros campos (obtener del join)
  }

  // Para simplificar, retornar todo
  return NextResponse.json({ data: objetivo })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Solo Gerentes pueden editar
  if (user.rol !== 'Gerente') {
    return NextResponse.json({ error: 'Solo Gerentes pueden editar objetivos' }, { status: 403 })
  }

  const body = await request.json()
  const result = UpdateObjetivoSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('objetivos')
    .update({ ...result.data, updated_by: user.id })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating objetivo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Solo Gerentes pueden eliminar (soft-delete)
  if (user.rol !== 'Gerente') {
    return NextResponse.json({ error: 'Solo Gerentes pueden eliminar objetivos' }, { status: 403 })
  }

  const supabase = createServerSupabaseClient()

  // Soft-delete: marcar como archived
  const { error } = await supabase
    .from('objetivos')
    .update({ archived_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', params.id)

  if (error) {
    console.error('Error deleting objetivo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
