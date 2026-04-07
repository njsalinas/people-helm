/**
 * @file Hook de autenticación con Supabase
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { SessionUser } from '@/lib/auth'

export function useAuth() {
  const { user, isLoading, setUser, clearUser, setLoading } = useAuthStore()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session || event === 'SIGNED_OUT') {
        clearUser()
        if (event === 'SIGNED_OUT') router.push('/login')
        return
      }

      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED'
      ) {
        const res = await fetch('/api/me')
        if (res.ok) {
          const json = await res.json()
          setUser(json.data as SessionUser)
        } else {
          clearUser()
        }
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      throw error
    }
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    clearUser()
    router.push('/login')
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isGerente: user?.rol === 'Gerente',
    isLiderArea: user?.rol === 'Líder Area',
    login,
    logout,
  }
}
