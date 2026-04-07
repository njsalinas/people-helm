/**
 * Supabase Function: actualizar-tarea-estado
 * PATCH - Actualiza estado y/o avance de una tarea
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

    const { tarea_id, estado_nuevo, porcentaje_avance, comentario } = await req.json()

    // Obtener tarea actual
    const { data: tarea, error: getError } = await supabase
      .from('tareas')
      .select('*, proyectos(id, estado)')
      .eq('id', tarea_id)
      .single()

    if (getError || !tarea) {
      return new Response(JSON.stringify({ error: 'Tarea no encontrada' }), { status: 404, headers: corsHeaders })
    }

    const updates: Record<string, unknown> = {
      estado: estado_nuevo,
      updated_by: userId,
    }

    if (porcentaje_avance !== undefined) {
      updates.porcentaje_avance = porcentaje_avance
    }

    if (estado_nuevo === 'Finalizado') {
      updates.porcentaje_avance = 100
      updates.fecha_fin_real = new Date().toISOString().split('T')[0]
    }

    const { error: updateError } = await supabase
      .from('tareas')
      .update(updates)
      .eq('id', tarea_id)

    if (updateError) throw updateError

    // Registrar en historial
    await supabase.from('historial_cambios').insert([{
      proyecto_id: tarea.proyecto_id,
      entidad_tipo: 'Tarea',
      campo_afectado: 'estado',
      valor_anterior: tarea.estado,
      valor_nuevo: estado_nuevo,
      comentario,
      created_by: userId,
    }])

    // El trigger SQL recalcular_avance_proyecto se dispara automáticamente

    // Notificar si finalizó
    if (estado_nuevo === 'Finalizado' && tarea.estado !== 'Finalizado') {
      supabase.functions.invoke('enviar-notificacion', {
        body: {
          tipo: 'tarea_finalizada',
          usuario_id: tarea.responsable_id,
          tarea_id,
          proyecto_id: tarea.proyecto_id,
        },
      }).catch(console.error)
    }

    return new Response(
      JSON.stringify({ mensaje: 'Tarea actualizada' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error en actualizar-tarea-estado:', error)
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers: corsHeaders })
  }
})
