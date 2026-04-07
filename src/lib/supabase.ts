/**
 * @file Clientes Supabase para browser y server
 */

import { createBrowserClient } from '@supabase/ssr'

// Re-export para uso en componentes cliente
export function createClient() {
  return createBrowserClient(
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
