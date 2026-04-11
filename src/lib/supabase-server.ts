/**
 * @file Cliente Supabase para Server Components y API routes
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from './env'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Component - ignorar
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Server Component - ignorar
          }
        },
      },
    }
  )
}

export function createServiceRoleClient() {
  return createServerClient(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  )
}
