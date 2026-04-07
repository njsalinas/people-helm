'use client'

import { useParams, useRouter } from 'next/navigation'
import { useProyecto } from '@/hooks/useProjects'
import { ProyectoDetail } from '@/components/Proyectos/ProyectoDetail'

export default function ProyectoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: proyecto, isLoading, error } = useProyecto(id)

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-48" />
        </div>
        <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
        <p className="font-semibold">No se pudo cargar el proyecto</p>
        <p className="text-sm mt-1">{error?.message}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-sm text-red-600 underline hover:no-underline"
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  return <ProyectoDetail proyecto={proyecto} />
}
