/**
 * Supabase Function: crear-proyecto
 * POST - Crea un nuevo proyecto con validaciones y notificaciones
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const {
      nombre, tipo, subtipo, foco_estrategico, area_responsable, categoria,
      responsable_primario, descripcion_ejecutiva, objetivo, resultado_esperado,
      fecha_inicio, fecha_fin_planificada, prioridad = 3, proyecto_padre,
    } = body

    // Validaciones básicas
    if (!nombre || nombre.length < 5) {
      return new Response(
        JSON.stringify({ error: 'Nombre debe tener al menos 5 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new Date(fecha_fin_planificada) <= new Date(fecha_inicio)) {
      return new Response(
        JSON.stringify({ error: 'Fecha fin debe ser mayor a fecha inicio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que responsable existe
    const { data: responsable } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', responsable_primario)
      .single()

    if (!responsable) {
      return new Response(
        JSON.stringify({ error: 'Responsable no encontrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insertar proyecto
    const { data, error } = await supabase
      .from('proyectos')
      .insert([{
        nombre, tipo, subtipo, foco_estrategico, area_responsable, categoria,
        responsable_primario, descripcion_ejecutiva, objetivo, resultado_esperado,
        fecha_inicio, fecha_fin_planificada, prioridad, proyecto_padre,
        created_by: userId,
        updated_by: userId,
      }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Ya existe un proyecto con ese nombre en el área' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw error
    }

    // Registrar en historial
    await supabase.from('historial_cambios').insert([{
      proyecto_id: data.id,
      entidad_tipo: 'Proyecto',
      campo_afectado: 'creación',
      valor_nuevo: nombre,
      created_by: userId,
    }])

    // Notificar al responsable (async, sin await para no bloquear)
    supabase.functions.invoke('enviar-notificacion', {
      body: {
        tipo: 'proyecto_creado',
        usuario_id: responsable_primario,
        proyecto_id: data.id,
      },
    }).catch(console.error)

    return new Response(
      JSON.stringify({ id: data.id, mensaje: 'Proyecto creado exitosamente' }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error en crear-proyecto:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
