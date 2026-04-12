/**
 * @file API Route: /api/proyectos
 * GET  - Listar proyectos
 * POST - Crear proyecto (invoca Supabase Function)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'
import { CreateProjectSchema } from '@/lib/validations'
import type { DbProyecto } from '@/types/database'

interface ProyectoWithRelations extends DbProyecto {
  area?: { nombre: string }
  responsable?: { nombre_completo: string }
}

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const supabase = createServerSupabaseClient()
  const searchParams = request.nextUrl.searchParams

  // NOTA: Usar tabla base con JOIN a areas y usuarios para obtener nombres
  // (RLS se aplica en la tabla proyectos, no en la vista)
  let query = supabase
    .from('proyectos')
    .select('*, area:areas_responsables(nombre), responsable:usuarios!responsable_primario(nombre_completo)')

  // RBAC: Filtrar por rol del usuario
  if (user.rol === 'Líder Area') {
    // Líder Area ve: todos los proyectos de su área responsable
    if (!user.area_responsable_id) {
      // Seguridad: si un Líder no tiene area_responsable_id asignada, no ve nada
      return NextResponse.json({ data: [] })
    }
    query = query.eq('area_responsable_id', user.area_responsable_id)
  }
  // Gerente ve todos (sin filtro)
  // Espectador ve todos (read-only, controlado por RLS en BD)

  // Aplicar filtros opcionales (soportar ambos formatos: singular y plural, coma-separados)
  const focos = searchParams.get('focos')
  const estados = searchParams.get('estados')
  const areas = searchParams.get('areas')
  const area = searchParams.get('area') // Legacy
  const prioridad = searchParams.get('prioridad')
  const soloConBloqueos = searchParams.get('solo_con_bloqueos')
  const soloVencidos = searchParams.get('solo_vencidos')
  const soloCriticos = searchParams.get('solo_criticos')
  const responsableId = searchParams.get('responsable_id')
  const fechaInicio = searchParams.get('fecha_inicio')
  const fechaFin = searchParams.get('fecha_fin')

  if (focos) query = query.in('foco_estrategico', focos.split(','))
  if (estados) query = query.in('estado', estados.split(','))
  if (areas) query = query.in('area_responsable_id', areas.split(','))
  if (area) query = query.eq('area_responsable_id', area) // Legacy: espera UUID
  if (prioridad) query = query.eq('prioridad', parseInt(prioridad))
  if (soloConBloqueos === 'true') query = query.gt('bloqueos_activos', 0)
  if (soloVencidos === 'true') query = query.not('dias_vencido', 'is', null)
  if (soloCriticos === 'true') query = query.in('prioridad', [1, 2])
  if (responsableId) query = query.eq('responsable_primario', responsableId)
  if (fechaInicio) query = query.gte('fecha_inicio', fechaInicio)
  if (fechaFin) query = query.lte('fecha_fin_planificada', fechaFin)

  query = query.order('prioridad', { ascending: true }).order('estado')

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Obtener información de subproyectos para todos los proyectos
  const { data: subproyectos } = await supabase
    .from('subproyectos')
    .select('proyecto_id, porcentaje_avance')

  const subproyectosByProject = new Map<string, { count: number; totalAvance: number }>()
  if (subproyectos) {
    subproyectos.forEach((sub: any) => {
      if (!subproyectosByProject.has(sub.proyecto_id)) {
        subproyectosByProject.set(sub.proyecto_id, { count: 0, totalAvance: 0 })
      }
      const current = subproyectosByProject.get(sub.proyecto_id)!
      current.count += 1
      current.totalAvance += sub.porcentaje_avance || 0
    })
  }

  // Transformar area join a area_responsable para retrocompatibilidad y agregar subproyectos
  const transformedData = (data ?? []).map((proyecto: ProyectoWithRelations) => {
    const subData = subproyectosByProject.get(proyecto.id)
    return {
      ...proyecto,
      area_responsable: proyecto.area?.nombre || 'Desconocida',
      area: undefined, // Eliminar el nested object
      subproyectos_count: subData?.count || 0,
      subproyectos_avance: subData ? Math.round(subData.totalAvance / subData.count) : 0,
    }
  })

  return NextResponse.json({ data: transformedData })
}

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.rol === 'Espectador') {
    return NextResponse.json({ error: 'Sin permisos para crear proyectos' }, { status: 403 })
  }

  const body = await request.json()
  const result = CreateProjectSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('proyectos')
    .insert([{ ...result.data, created_by: user.id, updated_by: user.id }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya existe un proyecto con ese nombre en el área' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, mensaje: 'Proyecto creado' }, { status: 201 })
}
