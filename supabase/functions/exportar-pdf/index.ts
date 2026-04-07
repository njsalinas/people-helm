/**
 * Supabase Function: exportar-pdf
 * POST - Genera y exporta un PDF del semáforo o detalle de proyecto
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
}

function nombreMes(mes: number): string {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return meses[mes - 1] ?? String(mes)
}

function generarHTMLSemaforo(semaforo: Record<string, unknown>): string {
  const contenido = (semaforo.contenido_manual ?? semaforo.contenido_automatico) as Record<string, unknown[]>
  const verde = (contenido?.verde ?? []) as Array<Record<string, string>>
  const amarillo = (contenido?.amarillo ?? []) as Array<Record<string, string>>
  const rojo = (contenido?.rojo ?? []) as Array<Record<string, string>>

  const tablaColor = (items: Array<Record<string, string>>, color: string, titulo: string) => `
    <div style="margin-bottom: 24px;">
      <h2 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 8px;">${titulo}</h2>
      <table border="1" cellspacing="0" cellpadding="8" style="width:100%; border-collapse: collapse; font-size: 12px;">
        <thead style="background: #f3f4f6;">
          <tr>
            <th>Área</th>
            <th>Categoría</th>
            <th>Proyecto</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((i) => `
            <tr>
              <td>${i.area ?? ''}</td>
              <td>${i.categoria ?? ''}</td>
              <td>${i.nombre ?? i.proyecto ?? ''}</td>
              <td>${i.comentario ?? i.detalle ?? ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 24px; color: #111;">
  <h1 style="text-align: center; color: #1e40af;">
    SEMÁFORO MENSUAL — ${nombreMes(semaforo.mes as number)} ${semaforo.anio}
  </h1>
  ${tablaColor(verde, '#16a34a', '🟢 VERDE — Logros Principales')}
  ${amarillo.length ? tablaColor(amarillo, '#ca8a04', '🟡 AMARILLO — Temas en Seguimiento') : ''}
  ${rojo.length ? tablaColor(rojo, '#dc2626', '🔴 ROJO — Críticos / Bloqueados') : ''}
  <p style="text-align: right; font-size: 10px; color: #9ca3af; margin-top: 32px;">
    Generado por People Helm — ${new Date().toLocaleDateString('es-CL')}
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

    const { tipo, semaforo_id, proyecto_id } = await req.json()

    if (tipo === 'semaforo' && semaforo_id) {
      const { data: semaforo, error } = await supabase
        .from('semaforos')
        .select('*')
        .eq('id', semaforo_id)
        .single()

      if (error || !semaforo) {
        return new Response(JSON.stringify({ error: 'Semáforo no encontrado' }), { status: 404, headers: corsHeaders })
      }

      const html = generarHTMLSemaforo(semaforo as Record<string, unknown>)

      // En producción se usaría puppeteer/deno-pdf para convertir HTML→PDF
      // Por ahora retornamos el HTML para que el frontend lo procese con @react-pdf/renderer
      // o window.print()
      const filename = `semaforo-${semaforo.anio}-${semaforo.mes.toString().padStart(2,'0')}.html`

      const { error: storageError } = await supabase.storage
        .from('reportes')
        .upload(filename, new Blob([html], { type: 'text/html' }), { upsert: true })

      if (storageError) throw storageError

      const { data: { publicUrl } } = supabase.storage.from('reportes').getPublicUrl(filename)

      return new Response(
        JSON.stringify({ url: publicUrl, html }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Tipo de exportación no soportado' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error en exportar-pdf:', error)
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers: corsHeaders })
  }
})
