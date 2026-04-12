/**
 * @file API Route: /api/proyectos/[id]/subproyectos
 * POST - Crear subproyecto (en tabla subproyectos)
 * GET - Listar subproyectos del proyecto
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateSubprojectSchema } from '@/lib/validations'

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
    .select('id, area_responsable_id, area:areas_responsables(nombre)')
    .eq('id', params.id)
    .single()

  if (errorPadre || !proyectoPadre) {
    return NextResponse.json(
      { error: 'Proyecto padre no encontrado' },
      { status: 404 }
    )
  }

  // Validar datos con schema de subproyectos
  const result = CreateSubprojectSchema.safeParse({
    ...body,
    proyecto_id: params.id, // Forzar FK al proyecto padre
  })

  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  // Validar que hereda area_responsable_id del padre
  if (result.data.area_responsable_id !== proyectoPadre.area_responsable_id) {
    return NextResponse.json(
      {
        error: `El subproyecto debe estar en el área "${(proyectoPadre as any).area?.nombre || 'desconocida'}" (igual al padre)`,
      },
      { status: 400 }
    )
  }

  // Crear subproyecto en tabla subproyectos
  const { data, error } = await supabase
    .from('subproyectos')
    .insert([
      {
        ...result.data,
        proyecto_id: params.id,
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
    .from('subproyectos')
    .select(
      `
      id,
      nombre,
      subtipo,
      foco_estrategico,
      area_responsable_id,
      estado,
      porcentaje_avance,
      prioridad,
      fecha_inicio,
      fecha_fin_planificada,
      responsable:usuarios!responsable_primario(id, nombre_completo, email)
    `
    )
    .eq('proyecto_id', params.id)
    .order('prioridad', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count: data?.length || 0 })
}
