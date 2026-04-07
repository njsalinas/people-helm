/**
 * Supabase Function: registrar-bloqueo
 * POST - Registra un bloqueo en un proyecto y notifica al gerente
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

    const { proyecto_id, descripcion, tipo, accion_requerida, requiere_escalamiento = false } = await req.json()

    if (!descripcion || descripcion.length < 20) {
      return new Response(
        JSON.stringify({ error: 'Descripción mínimo 20 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insertar bloqueo
    const { data, error } = await supabase
      .from('bloqueos')
      .insert([{
        proyecto_id,
        descripcion,
        tipo,
        accion_requerida,
        requiere_escalamiento,
        created_by: userId,
        estado: 'Activo',
      }])
      .select()
      .single()

    if (error) throw error

    // El trigger SQL ya actualiza el estado del proyecto a 'Bloqueado'
    // Registrar en historial
    await supabase.from('historial_cambios').insert([{
      proyecto_id,
      entidad_tipo: 'Bloqueo',
      campo_afectado: 'registro',
      valor_nuevo: descripcion,
      created_by: userId,
    }])

    // Obtener gerente para notificación
    const { data: gerente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('rol', 'Gerente')
      .eq('activo', true)
      .single()

    if (gerente) {
      // Notificar al gerente (siempre)
      supabase.functions.invoke('enviar-notificacion', {
        body: {
          tipo: 'bloqueo_registrado',
          usuario_id: gerente.id,
          proyecto_id,
          bloqueo_id: data.id,
          accion_requerida,
        },
      }).catch(console.error)
    }

    return new Response(
      JSON.stringify({ id: data.id, mensaje: 'Bloqueo registrado' }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error en registrar-bloqueo:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
