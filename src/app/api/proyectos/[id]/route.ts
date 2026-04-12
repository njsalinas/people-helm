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

  // RBAC: Verificar acceso al proyecto antes de obtener los datos completos
  if (user.rol === 'Líder Area') {
    const { data: proyecto, error: proyectoError } = await supabase
      .from('proyectos')
      .select('area_responsable_id')
      .eq('id', params.id)
      .single()

    if (proyectoError || !proyecto) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    if (proyecto.area_responsable_id !== user.area_responsable_id) {
      return NextResponse.json({ error: 'Sin acceso a este proyecto' }, { status: 403 })
    }
  }

  const { data, error } = await supabase
    .from('proyectos')
    .select(`
      *,
      responsable:usuarios!responsable_primario(id, nombre_completo, email),
      tareas(id, nombre, estado, porcentaje_avance, responsable_id, fecha_inicio, fecha_fin_planificada, prioridad),
      bloqueos(id, tipo, descripcion, accion_requerida, estado, created_at),
      riesgos(id, descripcion, probabilidad, impacto, prioridad, estado)
    `)
    .eq('id', params.id)
    .single()

  if (error) {
    console.error('[GET /api/proyectos/[id]] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  }

  // Obtener subproyectos por separado para evitar problemas de alias en PostgREST
  const { data: subproyectos } = await supabase
    .from('subproyectos')
    .select('id, nombre, descripcion_ejecutiva, subtipo, categoria, foco_estrategico, area_responsable_id, estado, porcentaje_avance, prioridad, fecha_inicio, fecha_fin_planificada')
    .eq('proyecto_id', params.id)

  const projectWithSubproyectos = {
    ...data,
    subproyectos: subproyectos || [],
  }

  return NextResponse.json({ data: projectWithSubproyectos })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  // Obtener proyecto actual para validar permisos
  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('id, responsable_primario, area_responsable_id')
    .eq('id', params.id)
    .single()

  if (proyectoError || !proyecto) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
  }

  // RBAC: Verificar acceso por área (Líderes solo pueden editar su área)
  if (user.rol === 'Líder Area' && proyecto.area_responsable_id !== user.area_responsable_id) {
    return NextResponse.json(
      { error: 'Sin acceso a este proyecto' },
      { status: 403 }
    )
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

  const { data, error } = await supabase
    .from('proyectos')
    .update({
      ...result.data,
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
