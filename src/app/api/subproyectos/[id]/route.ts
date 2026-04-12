/**
 * @file API Route: /api/subproyectos/[id]
 * GET - Obtener un subproyecto por ID
 * PATCH - Actualizar un subproyecto
 * DELETE - Eliminar un subproyecto (solo Gerente)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { UpdateSubprojectSchema } from '@/lib/validations'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('subproyectos')
    .select(
      `
      *,
      responsable:usuarios!responsable_primario(id, nombre_completo, email),
      area:areas_responsables(id, nombre)
    `
    )
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Subproyecto no encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json({ data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Obtener el subproyecto actual
  const supabase = createServerSupabaseClient()
  const { data: subproyecto, error: errorGet } = await supabase
    .from('subproyectos')
    .select('id, responsable_primario')
    .eq('id', params.id)
    .single()

  if (errorGet || !subproyecto) {
    return NextResponse.json(
      { error: 'Subproyecto no encontrado' },
      { status: 404 }
    )
  }

  // Verificar permisos: responsable primario o Gerente
  if (user.rol !== 'Gerente' && subproyecto.responsable_primario !== user.id) {
    return NextResponse.json(
      { error: 'No tienes permisos para actualizar este subproyecto' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const result = UpdateSubprojectSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  // Actualizar
  const { data, error } = await supabase
    .from('subproyectos')
    .update({
      ...result.data,
      updated_by: user.id,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    mensaje: 'Subproyecto actualizado exitosamente',
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Solo Gerente puede eliminar
  if (user.rol !== 'Gerente') {
    return NextResponse.json(
      { error: 'Solo Gerentes pueden eliminar subproyectos' },
      { status: 403 }
    )
  }

  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('subproyectos')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    mensaje: 'Subproyecto eliminado exitosamente',
  })
}
