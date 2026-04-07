/**
 * Supabase Function: crear-tarea
 * POST - Crea una nueva tarea y notifica al responsable
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const userId = req.headers.get('x-user-id')
    if (!userId) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: corsHeaders })

    const {
      proyecto_id, nombre, descripcion, responsable_id,
      fecha_inicio, fecha_fin_planificada, prioridad = 3, tarea_padre,
    } = await req.json()

    if (!nombre || nombre.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Nombre mínimo 3 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar proyecto existe
    const { error: projError } = await supabase
      .from('proyectos')
      .select('id')
      .eq('id', proyecto_id)
      .single()

    if (projError) {
      return new Response(JSON.stringify({ error: 'Proyecto no encontrado' }), { status: 404, headers: corsHeaders })
    }

    const { data, error } = await supabase
      .from('tareas')
      .insert([{
        proyecto_id, nombre, descripcion, responsable_id,
        fecha_inicio, fecha_fin_planificada, prioridad, tarea_padre,
        created_by: userId, updated_by: userId,
      }])
      .select()
      .single()

    if (error) throw error

    // Notificar responsable
    if (responsable_id !== userId) {
      supabase.functions.invoke('enviar-notificacion', {
        body: { tipo: 'tarea_asignada', usuario_id: responsable_id, tarea_id: data.id, proyecto_id },
      }).catch(console.error)
    }

    return new Response(
      JSON.stringify({ id: data.id, mensaje: 'Tarea creada' }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error en crear-tarea:', error)
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers: corsHeaders })
  }
})
