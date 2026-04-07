/**
 * @file API Route: /api/proyectos/[id]/estado
 * PATCH - Actualizar estado de un proyecto
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser, canEditProject } from '@/lib/auth'
import { UpdateProjectStatusSchema } from '@/lib/validations'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const result = UpdateProjectStatusSchema.safeParse({ ...body, proyecto_id: params.id })

  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: result.error.flatten() }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Obtener proyecto actual para validaciones
  const { data: proyecto, error: fetchError } = await supabase
    .from('proyectos')
    .select('id, estado, responsable_primario')
    .eq('id', params.id)
    .single()

  if (fetchError || !proyecto) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  }

  // Verificar permisos
  if (!canEditProject(user.id, user.rol, proyecto.responsable_primario)) {
    return NextResponse.json({ error: 'Sin permisos para editar este proyecto' }, { status: 403 })
  }

  // Validar: no Finalizar con bloqueos activos
  if (result.data.estado_nuevo === 'Finalizado') {
    const { count } = await supabase
      .from('bloqueos')
      .select('id', { count: 'exact', head: true })
      .eq('proyecto_id', params.id)
      .eq('estado', 'Activo')

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: 'No se puede finalizar un proyecto con bloqueos activos' },
        { status: 400 }
      )
    }
  }

  // Actualizar estado
  const { error: updateError } = await supabase
    .from('proyectos')
    .update({
      estado: result.data.estado_nuevo,
      updated_by: user.id,
    })
    .eq('id', params.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Registrar en historial (comentario explícito)
  await supabase.from('historial_cambios').insert([
    {
      proyecto_id: params.id,
      entidad_tipo: 'Estado',
      campo_afectado: 'estado',
      valor_anterior: proyecto.estado,
      valor_nuevo: result.data.estado_nuevo,
      comentario: result.data.comentario,
      created_by: user.id,
    },
  ])

  return NextResponse.json({ mensaje: 'Estado actualizado' })
}
