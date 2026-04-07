/**
 * Supabase Function: enviar-notificacion
 * POST - Envía notificaciones (alerta visual via Realtime + email via Resend)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
}

type NotificationType =
  | 'bloqueo_registrado'
  | 'estado_cambio'
  | 'accion_asignada'
  | 'bloqueo_5_dias'
  | 'plazo_vencido'
  | 'semaforo_generado'
  | 'tarea_asignada'
  | 'tarea_finalizada'
  | 'proyecto_creado'

function generarMensaje(tipo: NotificationType, datos: Record<string, unknown>): string {
  const mensajes: Record<NotificationType, string> = {
    bloqueo_registrado: `Nuevo bloqueo registrado. Acción requerida: ${datos.accion_requerida}`,
    estado_cambio: `Estado del proyecto cambió a: ${datos.estado_nuevo}`,
    accion_asignada: `Se requiere tu acción en un proyecto`,
    bloqueo_5_dias: `Bloqueo sin resolver por más de 5 días. Requiere intervención`,
    plazo_vencido: `Proyecto ha vencido su plazo planificado`,
    semaforo_generado: `Semáforo mensual generado y listo para revisión`,
    tarea_asignada: `Se te asignó una nueva tarea`,
    tarea_finalizada: `Una tarea fue marcada como finalizada`,
    proyecto_creado: `Se te asignó un nuevo proyecto`,
  }
  return mensajes[tipo] ?? 'Nueva notificación'
}

function generarAsunto(tipo: NotificationType): string {
  const asuntos: Record<NotificationType, string> = {
    bloqueo_registrado: '🔴 Nuevo bloqueo registrado — People Helm',
    estado_cambio: '🔄 Estado de proyecto actualizado — People Helm',
    accion_asignada: '⚡ Acción requerida en proyecto — People Helm',
    bloqueo_5_dias: '🚨 Bloqueo crítico sin resolver — People Helm',
    plazo_vencido: '⚠️ Proyecto vencido — People Helm',
    semaforo_generado: '🚦 Semáforo mensual disponible — People Helm',
    tarea_asignada: '📋 Nueva tarea asignada — People Helm',
    tarea_finalizada: '✅ Tarea finalizada — People Helm',
    proyecto_creado: '🎯 Nuevo proyecto asignado — People Helm',
  }
  return asuntos[tipo] ?? 'Notificación — People Helm'
}

function generarHTMLEmail(tipo: NotificationType, mensaje: string, nombre: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1e40af; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 18px;">People Helm</h1>
    <p style="color: #93c5fd; margin: 4px 0 0; font-size: 13px;">Sistema de Dirección Operativa</p>
  </div>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="color: #374151; font-size: 16px;">Hola, <strong>${nombre}</strong></p>
    <p style="color: #6b7280;">${mensaje}</p>
    <a href="${Deno.env.get('APP_URL') ?? 'http://localhost:3000'}"
       style="display: inline-block; background: #1e40af; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 16px; font-size: 14px;">
      Ver en People Helm
    </a>
  </div>
  <p style="color: #9ca3af; font-size: 11px; margin-top: 16px; text-align: center;">
    Puedes gestionar tus preferencias de notificación en Configuración → Notificaciones
  </p>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { tipo, usuario_id, ...datos } = await req.json()

    if (!usuario_id || !tipo) {
      return new Response(
        JSON.stringify({ error: 'usuario_id y tipo son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Leer preferencias del usuario
    const { data: prefs } = await supabase
      .from('notificaciones_config')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('evento', tipo)
      .single()

    const mensaje = generarMensaje(tipo as NotificationType, datos)

    // Alerta visual via Realtime
    if (!prefs || prefs.canal_alerta_visual) {
      try {
        await supabase.channel(`notificaciones:${usuario_id}`).send({
          type: 'broadcast',
          event: 'nueva_alerta',
          payload: { tipo, mensaje, timestamp: new Date().toISOString(), datos },
        })
      } catch (e) {
        // Realtime puede fallar sin bloquear
        console.warn('Realtime error:', e)
      }
    }

    // Email via Resend
    if (prefs?.canal_email) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('email, nombre_completo')
        .eq('id', usuario_id)
        .single()

      if (usuario) {
        const resendApiKey = Deno.env.get('RESEND_API_KEY')
        const emailFrom = Deno.env.get('EMAIL_FROM') ?? 'noreply@people-helm.com'

        if (resendApiKey) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: emailFrom,
              to: usuario.email,
              subject: generarAsunto(tipo as NotificationType),
              html: generarHTMLEmail(tipo as NotificationType, mensaje, usuario.nombre_completo),
            }),
          })
        }
      }
    }

    return new Response(
      JSON.stringify({ enviado: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error en enviar-notificacion:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
