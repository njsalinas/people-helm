/**
 * Supabase Function: actualizar-estado
 * PATCH - Actualiza estado de un proyecto con validaciones y notificaciones
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
    if (!userId) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: corsHeaders })
    }

    const { proyecto_id, estado_nuevo, comentario } = await req.json()

    if (!comentario || comentario.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Comentario mínimo 10 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener proyecto actual
    const { data: proyecto, error: getError } = await supabase
      .from('proyectos')
      .select('id, estado, responsable_primario, nombre')
      .eq('id', proyecto_id)
      .single()

    if (getError || !proyecto) {
      return new Response(JSON.stringify({ error: 'Proyecto no encontrado' }), { status: 404, headers: corsHeaders })
    }

    // Validar: no Finalizar con bloqueos activos
    if (estado_nuevo === 'Finalizado') {
      const { count } = await supabase
        .from('bloqueos')
        .select('id', { count: 'exact', head: true })
        .eq('proyecto_id', proyecto_id)
        .eq('estado', 'Activo')

      if ((count ?? 0) > 0) {
        return new Response(
          JSON.stringify({ error: 'No se puede finalizar con bloqueos activos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Actualizar
    const updates: Record<string, unknown> = {
      estado: estado_nuevo,
      updated_by: userId,
    }
    if (estado_nuevo === 'Finalizado') {
      updates.fecha_fin_real = new Date().toISOString().split('T')[0]
      updates.porcentaje_avance = 100
    }

    const { error: updateError } = await supabase
      .from('proyectos')
      .update(updates)
      .eq('id', proyecto_id)

    if (updateError) throw updateError

    // Registrar historial con comentario
    await supabase.from('historial_cambios').insert([{
      proyecto_id,
      entidad_tipo: 'Estado',
      campo_afectado: 'estado',
      valor_anterior: proyecto.estado,
      valor_nuevo: estado_nuevo,
      comentario,
      created_by: userId,
    }])

    // Notificaciones async
    supabase.functions.invoke('enviar-notificacion', {
      body: {
        tipo: 'estado_cambio',
        proyecto_id,
        estado_nuevo,
        usuario_id: proyecto.responsable_primario,
      },
    }).catch(console.error)

    return new Response(
      JSON.stringify({ mensaje: 'Estado actualizado' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error en actualizar-estado:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
