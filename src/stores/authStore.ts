/**
 * @file Zustand store para estado de autenticación
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessionUser } from '@/lib/auth'

interface AuthState {
  user: SessionUser | null
  isLoading: boolean
  setUser: (user: SessionUser | null) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      clearUser: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'people-helm-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
