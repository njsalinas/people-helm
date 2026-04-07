/**
 * Supabase Function: generar-semaforo
 * POST - Genera el semáforo mensual automático
 * Ejecutada vía cron el 1º de cada mes a las 22:00 UTC, o on-demand
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
}

interface ProyectoSemaforo {
  id: string
  nombre: string
  area_responsable: string
  estado: string
  porcentaje_avance: number
  fecha_inicio: string
  fecha_fin_planificada: string
  bloqueos_activos: number
  color_semaforo: string
}

function generarComentarioAuto(color: string, proyectos: ProyectoSemaforo[]): string {
  if (color === 'VERDE') {
    const finalizados = proyectos.filter((p) => p.estado === 'Finalizado').length
    const enCurso = proyectos.filter((p) => p.estado === 'En Curso').length
    return `Proyectos cerrados: ${finalizados}, en tiempo: ${enCurso}`
  }
  if (color === 'AMARILLO') {
    const enRiesgo = proyectos.filter((p) => p.estado === 'En Riesgo').length
    return `Proyectos en riesgo: ${enRiesgo}, requieren seguimiento`
  }
  const bloqueados = proyectos.filter((p) => p.estado === 'Bloqueado').length
  return `Bloqueados: ${bloqueados}, requieren intervención inmediata`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const userId = req.headers.get('x-user-id')
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}

    const now = new Date()
    const mes = body.mes ?? (now.getMonth() + 1)
    const anio = body.anio ?? now.getFullYear()

    // Obtener todos los proyectos activos
    const { data: proyectos, error: projError } = await supabase
      .from('vista_semaforo_proyectos')
      .select('*')

    if (projError) throw projError

    // Clasificar por color
    const verde: ProyectoSemaforo[] = []
    const amarillo: ProyectoSemaforo[] = []
    const rojo: ProyectoSemaforo[] = []

    for (const p of (proyectos ?? [])) {
      const color = p.color_semaforo
      const item = {
        id: p.id,
        nombre: p.nombre,
        area: p.area_responsable,
        categoria: p.categoria,
        comentario: '',
      }

      if (color === 'VERDE') verde.push({ ...p, ...item })
      else if (color === 'AMARILLO') amarillo.push({ ...p, ...item })
      else rojo.push({ ...p, ...item })
    }

    const contenido_automatico = {
      verde: verde.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        area: p.area_responsable,
        categoria: (p as unknown as Record<string, string>).categoria,
        comentario: `Estado: ${p.estado} | Avance: ${p.porcentaje_avance}%`,
      })),
      amarillo: amarillo.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        area: p.area_responsable,
        categoria: (p as unknown as Record<string, string>).categoria,
        comentario: `Estado: ${p.estado} | Avance: ${p.porcentaje_avance}% | Bloqueos: ${p.bloqueos_activos}`,
      })),
      rojo: rojo.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        area: p.area_responsable,
        categoria: (p as unknown as Record<string, string>).categoria,
        comentario: `Estado: ${p.estado} | Bloqueos activos: ${p.bloqueos_activos}`,
      })),
    }

    // Upsert semáforo del mes
    const { data, error } = await supabase
      .from('semaforos')
      .upsert([{
        mes,
        anio,
        contenido_automatico,
        comentario_ejecutivo_verde: generarComentarioAuto('VERDE', verde),
        comentario_ejecutivo_amarillo: generarComentarioAuto('AMARILLO', amarillo),
        comentario_ejecutivo_rojo: generarComentarioAuto('ROJO', rojo),
        estado: 'Borrador',
        created_by: userId ?? '00000000-0000-0000-0000-000000000001',
      }], { onConflict: 'mes,anio' })
      .select()
      .single()

    if (error) throw error

    // Notificar al gerente
    const { data: gerente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('rol', 'Gerente')
      .single()

    if (gerente) {
      supabase.functions.invoke('enviar-notificacion', {
        body: { tipo: 'semaforo_generado', usuario_id: gerente.id, semaforo_id: data.id },
      }).catch(console.error)
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        mes,
        anio,
        resumen: {
          verde: verde.length,
          amarillo: amarillo.length,
          rojo: rojo.length,
        },
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error en generar-semaforo:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
