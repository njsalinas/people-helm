/**
 * @page /dashboard/objetivos
 * Página de gestión de objetivos (solo Gerentes)
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCrearObjetivo, useActualizarObjetivo, useEliminarObjetivo } from '@/hooks/useObjetivos'
import { VistaObjetivosPorArea } from '@/components/Objetivos/VistaObjetivosPorArea'
import type { CreateObjetivoInput, UpdateObjetivoInput } from '@/lib/validations'

export default function ObjetivosPage() {
  const router = useRouter()
  const { user, isGerente, isLoading } = useAuth()
  const crearObjetivo = useCrearObjetivo()
  const handleRefresh = useCallback(() => {
    // Forzar recarga de objetivos en VistaObjetivosPorArea
  }, [])

  // Proteger página: solo Gerentes
  useEffect(() => {
    if (!isLoading && !isGerente) {
      router.replace('/proyectos')
    }
  }, [isGerente, isLoading, router])

  const handleSubmitObjetivo = async (data: CreateObjetivoInput | UpdateObjetivoInput) => {
    await crearObjetivo.mutateAsync(data as CreateObjetivoInput)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (!isGerente) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Objetivos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona los objetivos estratégicos por área y año
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <VistaObjetivosPorArea anio={new Date().getFullYear()} onRefresh={handleRefresh} />
      </div>
    </div>
  )
}
