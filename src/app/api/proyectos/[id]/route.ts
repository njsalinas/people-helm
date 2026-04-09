/**
 * @file API Route: /api/proyectos/[id]
 * GET    - Obtener proyecto por ID con joins completos
 * PATCH  - Actualizar campos del proyecto (edición inline)
 * DELETE - Eliminar proyecto (solo Gerente)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { UpdateProjectSchema } from '@/lib/validations'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('proyectos')
    .select(`
      *,
      responsable:usuarios!proyectos_responsable_id_fkey(id, nombre, email),
      tareas(id, nombre, estado, porcentaje_avance, responsable_id, fecha_inicio, fecha_fin, prioridad, orden),
      bloqueos(id, tipo, descripcion, accion_requerida, estado, created_at),
      riesgos(id, descripcion, probabilidad, impacto, prioridad, estado)
    `)
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  // Obtener proyecto actual para validar permisos
  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('id, responsable_primario')
    .eq('id', params.id)
    .single()

  if (proyectoError || !proyecto) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  }

  // RBAC: Solo Gerente o responsable primario pueden editar
  if (user.rol !== 'Gerente' && proyecto.responsable_primario !== user.id) {
    return NextResponse.json(
      { error: 'No tienes permisos para editar este proyecto' },
      { status: 403 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  // Validar schema
  const result = UpdateProjectSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  // Forzamos el tipo a 'any' temporalmente para que TS no se queje de proyecto_padre
  const updateData = result.data as any;

  // Si intenta cambiar proyecto_padre, validar que no sea circular
  if (updateData.proyecto_padre !== undefined && updateData.proyecto_padre !== null) {
    // Validar: el nuevo padre no puede ser el proyecto actual
    if (updateData.proyecto_padre === params.id) {
      return NextResponse.json(
        { error: 'Un proyecto no puede ser subproyecto de sí mismo' },
        { status: 400 }
      )
    }

    // Validar: el nuevo padre no puede ser un subproyecto del actual
    const { data: chain } = await supabase.rpc('validar_proyecto_circular', {
      p_proyecto_id: params.id,
      p_nuevo_padre_id: updateData.proyecto_padre,
    })

    if (chain && chain.es_circular) {
      return NextResponse.json(
        { error: 'Esta relación crearía una referencia circular entre proyectos' },
        { status: 400 }
      )
    }
  }

  const { data, error } = await supabase
    .from('proyectos')
    .update({
      ...updateData, // Usamos la variable con el cast
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol !== 'Gerente') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('proyectos').delete().eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ mensaje: 'Proyecto eliminado' })
}
