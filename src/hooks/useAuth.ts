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
    // Obtener sesión actual
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) {
        clearUser()
        return
      }

      const { data: perfil } = await supabase
        .from('usuarios')
        .select('id, email, nombre_completo, rol, area_responsable')
        .eq('id', authUser.id)
        .single()

      if (perfil) {
        setUser(perfil as SessionUser)
      } else {
        clearUser()
      }
    })

    // Escuchar cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        clearUser()
        router.push('/login')
        return
      }

      if (event === 'SIGNED_IN' && session.user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('id, email, nombre_completo, rol, area_responsable')
          .eq('id', session.user.id)
          .single()

        if (perfil) setUser(perfil as SessionUser)
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
