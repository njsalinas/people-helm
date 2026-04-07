/**
 * @file Clientes Supabase para browser y server
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './supabase-types'

// Re-export para uso en componentes cliente
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton para uso en hooks/stores del cliente
let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}

export type { Database }
