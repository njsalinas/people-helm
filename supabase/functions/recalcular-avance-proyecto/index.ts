/**
 * Supabase Function: recalcular-avance-proyecto
 * POST - Recalcula el % avance del proyecto basado en promedio de tareas
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

    const { proyecto_id } = await req.json()

    // Obtener tareas del proyecto
    const { data: tareas, error: tareasError } = await supabase
      .from('tareas')
      .select('id, porcentaje_avance, estado')
      .eq('proyecto_id', proyecto_id)

    if (tareasError) throw tareasError

    if (!tareas || tareas.length === 0) {
      return new Response(
        JSON.stringify({ avanceProyecto: 0, mensaje: 'Sin tareas' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const promedioAvance = Math.round(
      tareas.reduce((sum, t) => sum + (t.porcentaje_avance ?? 0), 0) / tareas.length
    )

    const { error: updateError } = await supabase
      .from('proyectos')
      .update({ porcentaje_avance: promedioAvance })
      .eq('id', proyecto_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ avanceProyecto: promedioAvance }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error en recalcular-avance-proyecto:', error)
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers: corsHeaders })
  }
})
