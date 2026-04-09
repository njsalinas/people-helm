/**
 * @file API Route: /api/proyectos/[id]/subproyectos
 * POST - Crear subproyecto
 * GET - Listar subproyectos (opcional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateProjectSchema } from '@/lib/validations'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()

  // Obtener proyecto padre para validaciones
  const supabase = createServerSupabaseClient()
  const { data: proyectoPadre, error: errorPadre } = await supabase
    .from('proyectos')
    .select('id, area_responsable, foco_estrategico')
    .eq('id', params.id)
    .single()

  if (errorPadre || !proyectoPadre) {
    return NextResponse.json(
      { error: 'Proyecto padre no encontrado' },
      { status: 404 }
    )
  }

  // Validar datos con schema
  const result = CreateProjectSchema.safeParse({
    ...body,
    proyecto_padre: params.id, // Forzar proyecto padre
  })

  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  // Validar que hereda area_responsable del padre
  if (result.data.area_responsable !== proyectoPadre.area_responsable) {
    return NextResponse.json(
      {
        error: `El subproyecto debe estar en el área "${proyectoPadre.area_responsable}" (igual al padre)`,
      },
      { status: 400 }
    )
  }

  // Crear subproyecto
  const { data, error } = await supabase
    .from('proyectos')
    .insert([
      {
        ...result.data,
        proyecto_padre: params.id,
        created_by: user.id,
        updated_by: user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { data, mensaje: 'Subproyecto creado exitosamente' },
    { status: 201 }
  )
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('proyectos')
    .select(
      `
      id,
      nombre,
      tipo,
      subtipo,
      foco_estrategico,
      area_responsable,
      estado,
      porcentaje_avance,
      prioridad,
      fecha_inicio,
      fecha_fin_planificada,
      responsable:usuarios!responsable_primario(id, nombre_completo, email)
    `
    )
    .eq('proyecto_padre', params.id)
    .order('prioridad', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count: data?.length || 0 })
}
