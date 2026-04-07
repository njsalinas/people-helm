'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export default function LogoutPage() {
  const router = useRouter()
  const clearUser = useAuthStore((s) => s.clearUser)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.signOut().then(() => {
      clearUser()
      router.replace('/login')
    })
  }, [clearUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Cerrando sesión...</p>
    </div>
  )
}
