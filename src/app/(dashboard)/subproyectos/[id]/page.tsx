/**
 * @file Página: /subproyectos/[id]
 * Detalle de un subproyecto
 */

'use client'

import { useParams } from 'next/navigation'
import { useSubproyecto } from '@/hooks/useSubproyecto'
import { SubproyectoDetail } from '@/components/Subproyectos/SubproyectoDetail'

export default function SubproyectoPage() {
  const params = useParams()
  const id = params.id as string

  const { data: subproyecto, isLoading, error } = useSubproyecto(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando subproyecto...</div>
      </div>
    )
  }

  if (error || !subproyecto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error al cargar el subproyecto</div>
      </div>
    )
  }

  return <SubproyectoDetail subproyecto={subproyecto} />
}
