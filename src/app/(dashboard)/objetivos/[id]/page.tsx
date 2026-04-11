/**
 * @page /dashboard/objetivos/[id]
 * Página de detalle de un objetivo específico
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useObjetivo } from '@/hooks/useObjetivos'
import { useProyectos } from '@/hooks/useProjects'
import { ObjetivoDetalle } from '@/components/Objetivos/ObjetivoDetalle'
import { ProyectosEnObjetivo } from '@/components/Objetivos/ProyectosEnObjetivo'
import { BloqueosObjetivo } from '@/components/Objetivos/BloqueosObjetivo'
import { AlertasObjetivo } from '@/components/Objetivos/AlertasObjetivo'

interface ObjetivoDetailPageProps {
  params: { id: string }
}

export default function ObjetivoDetailPage({ params }: ObjetivoDetailPageProps) {
  const router = useRouter()
  const { isGerente, isLoading: authLoading } = useAuth()
  const { data: objetivo, isLoading: objetivoLoading } = useObjetivo(params.id)
  const { data: todosProyectos = [] } = useProyectos()

  // Proteger página: solo Gerentes
  useEffect(() => {
    if (!authLoading && !isGerente) {
      router.replace('/proyectos')
    }
  }, [isGerente, authLoading, router])

  if (authLoading || objetivoLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (!isGerente) {
    return null
  }

  if (!objetivo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Objetivo no encontrado</p>
            <Link href="/dashboard/objetivos" className="text-blue-600 hover:underline">
              Volver a Objetivos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Filtrar proyectos vinculados
  const proyectosVinculados = todosProyectos.filter(p =>
    objetivo.objetivo_proyecto?.some((op: any) => op.proyecto_id === p.id)
  )

  // Simular bloqueos (en producción vendrían de la API)
  const bloqueos = proyectosVinculados
    .filter(p => p.estado?.toLowerCase() === 'bloqueado')
    .map(p => ({
      id: p.id,
      tipo: 'Dependencia',
      descripcion: `Proyecto "${p.nombre}" está bloqueado`,
      accion_requerida: 'Escalación',
      proyecto_nombre: p.nombre,
      created_at: new Date().toISOString(),
    }))

  // Simular alertas (en producción vendrían de la API)
  const alertas = [
    ...(proyectosVinculados.some(p => p.porcentaje_avance < 40 && p.estado?.toLowerCase() !== 'completado')
      ? [{
        id: 'alerta-1',
        tipo: 'desviacion' as const,
        titulo: 'Proyecto con bajo progreso',
        descripcion: 'Algunos proyectos están por debajo del 40% de avance esperado',
        severidad: 'media' as const,
        proyectoNombre: proyectosVinculados.find(p => p.porcentaje_avance < 40)?.nombre || '',
      }]
      : []),
    ...(objetivo.avance_promedio < 50 && objetivo.status === 'active'
      ? [{
        id: 'alerta-2',
        tipo: 'riesgo' as const,
        titulo: 'Objetivo en riesgo',
        descripcion: 'El avance general es menor al 50%, se requiere acción inmediata',
        severidad: 'alta' as const,
        proyectoNombre: 'Objetivo General',
      }]
      : []),
    ...(proyectosBloqueados > 0
      ? [{
        id: 'alerta-3',
        tipo: 'bloqueo' as const,
        titulo: 'Bloqueos activos',
        descripcion: `${proyectosBloqueados} proyecto${proyectosBloqueados !== 1 ? 's' : ''} están bloqueados`,
        severidad: 'alta' as const,
        proyectoNombre: 'Múltiples proyectos',
      }]
      : []),
  ]

  const proyectosBloqueados = objetivo.proyectos_bloqueados || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/objetivos" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ← Volver a Objetivos
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Detalle del objetivo */}
        <ObjetivoDetalle
          id={objetivo.id}
          titulo={objetivo.titulo}
          descripcion={objetivo.descripcion}
          anio={objetivo.anio}
          areaNombre={objetivo.area?.nombre || 'Desconocida'}
          status={objetivo.status}
          avancePromedio={objetivo.avance_promedio || 0}
          totalProyectos={objetivo.total_proyectos || 0}
          proyectosBloqueados={proyectosBloqueados}
          proyectosCompletados={objetivo.proyectos_completados || 0}
          proyectosEnRiesgo={objetivo.proyectos_en_riesgo || 0}
          colorSemaforo={objetivo.color_semaforo || 'VERDE'}
        />

        {/* Grid de información */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Proyectos - Columna ancha */}
          <div className="lg:col-span-2">
            <ProyectosEnObjetivo
              proyectos={proyectosVinculados}
              isLoading={false}
            />
          </div>

          {/* Bloqueos y Alertas - Columna lateral */}
          <div className="space-y-6">
            <BloqueosObjetivo
              bloqueos={bloqueos}
              isLoading={false}
            />
          </div>
        </div>

        {/* Alertas completas */}
        <AlertasObjetivo
          alertas={alertas}
          isLoading={false}
        />
      </div>
    </div>
  )
}
