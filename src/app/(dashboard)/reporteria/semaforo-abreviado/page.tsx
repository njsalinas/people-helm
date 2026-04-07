'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { SemaforoAbreviado } from '@/components/Reporteria/SemaforoAbreviado'
import { useSemaforo, useGuardarAbreviado } from '@/hooks/useSemaforo'
import { useProyectos } from '@/hooks/useProjects'
import { useUIStore } from '@/stores/uiStore'
import type { SemaforoAbreviadoData } from '@/components/Reporteria/SemaforoAbreviado'

function SemaforoAbreviadoContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''

  const { data: semaforo, isLoading: loadingSemaforo } = useSemaforo(id)
  const { data: proyectos = [], isLoading: loadingProyectos } = useProyectos({})
  const guardarMutation = useGuardarAbreviado()
  const addToast = useUIStore((s) => s.addToast)

  const handleSave = async (data: SemaforoAbreviadoData) => {
    try {
      await guardarMutation.mutateAsync(data)
      addToast({ type: 'success', title: 'Semáforo abreviado guardado' })
    } catch (e: unknown) {
      addToast({ type: 'error', title: e instanceof Error ? e.message : 'Error al guardar' })
    }
  }

  if (!id) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm">Selecciona un semáforo desde la vista completa.</p>
      </div>
    )
  }

  if (loadingSemaforo || loadingProyectos) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">Cargando...</p>
      </div>
    )
  }

  if (!semaforo) {
    return (
      <div className="text-center py-20 text-red-400">
        <p className="text-sm">Semáforo no encontrado.</p>
      </div>
    )
  }

  return (
    <SemaforoAbreviado
      semaforo={semaforo}
      proyectos={proyectos}
      onSave={handleSave}
    />
  )
}

export default function SemaforoAbreviadoPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>}>
      <SemaforoAbreviadoContent />
    </Suspense>
  )
}
