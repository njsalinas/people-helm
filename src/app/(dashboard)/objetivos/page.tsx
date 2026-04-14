/**
 * @page /dashboard/objetivos
 * Página principal de objetivos - Vista por áreas (Gerentes y Líderes de Área)
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ObjetivosMainView } from '@/components/Objetivos/ObjetivosMainView'

export default function ObjetivosPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const canAccess = user?.rol === 'Gerente' || user?.rol === 'Líder Area'

  // Proteger página: solo Gerentes y Líderes de Área
  useEffect(() => {
    if (!isLoading && !canAccess) {
      router.replace('/')
    }
  }, [canAccess, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (!canAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Objetivos Estratégicos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Seguimiento de objetivos por área, proyectos vinculados y métricas de progreso
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ObjetivosMainView anio={new Date().getFullYear()} />
      </div>
    </div>
  )
}
