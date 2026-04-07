'use client'

import { BloqueosTable } from '@/components/Bloqueos/BloqueosTable'
import { useBloqueoActivos } from '@/hooks/useBloqueos'

export default function BloqueosPage() {
  const { data: bloqueos = [], isLoading, error } = useBloqueoActivos()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bloqueos Activos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Vista transversal de todos los bloqueos activos en el área
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          Error al cargar bloqueos: {error.message}
        </div>
      )}

      <BloqueosTable bloqueos={bloqueos} isLoading={isLoading} />
    </div>
  )
}
