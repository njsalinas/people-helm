'use client'

import { useState } from 'react'
import { useProyectos } from '@/hooks/useProjects'
import { FOCOS_ESTRATEGICOS } from '@/types/domain'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const COLOR_DOT: Record<string, string> = {
  VERDE: 'bg-green-500',
  AMARILLO: 'bg-yellow-400',
  ROJO: 'bg-red-500',
}

export default function FocosPage() {
  const { data: proyectos = [], isLoading } = useProyectos({})
  const [foco, setFoco] = useState<string>(FOCOS_ESTRATEGICOS[0])

  const byFoco = proyectos.filter((p) => p.foco_estrategico === foco)
  const totales = FOCOS_ESTRATEGICOS.map((f) => ({
    foco: f,
    total: proyectos.filter((p) => p.foco_estrategico === f).length,
    verde: proyectos.filter((p) => p.foco_estrategico === f && p.color_semaforo === 'VERDE').length,
    rojo: proyectos.filter((p) => p.foco_estrategico === f && p.color_semaforo === 'ROJO').length,
  }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vista por Foco Estratégico</h1>
        <p className="text-sm text-gray-500 mt-0.5">Proyectos agrupados por foco estratégico del área</p>
      </div>

      {/* Foco tabs */}
      <div className="flex gap-2 flex-wrap">
        {totales.map(({ foco: f, total, rojo }) => (
          <button
            key={f}
            onClick={() => setFoco(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium border transition-colors',
              foco === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            )}
          >
            {f}
            <span className={cn(
              'ml-2 text-xs px-1.5 py-0.5 rounded-full',
              foco === f ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            )}>
              {total}
            </span>
            {rojo > 0 && (
              <span className="ml-1 text-xs text-red-500">⚠ {rojo}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tabla de proyectos */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
      ) : byFoco.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No hay proyectos para este foco.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Proyecto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Área</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Avance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Semáforo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byFoco.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/proyectos/${p.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.area_responsable}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.categoria}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-24">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${p.porcentaje_avance}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{p.porcentaje_avance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'w-2.5 h-2.5 rounded-full inline-block',
                        COLOR_DOT[p.color_semaforo ?? 'VERDE']
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
