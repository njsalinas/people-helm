/**
 * @file Clientes Supabase para browser y server
 */

import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseUrl, getSupabaseAnonKey } from './env'

// Re-export para uso en componentes cliente
export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey()
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
