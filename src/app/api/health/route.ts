/**
 * @file API Route: /api/health
 * GET - Health check del servidor
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    // Ping simple a Supabase
    const { error } = await supabase.from('usuarios').select('id').limit(1)
    if (error) throw error

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch {
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString(), database: 'disconnected' },
      { status: 503 }
    )
  }
}
