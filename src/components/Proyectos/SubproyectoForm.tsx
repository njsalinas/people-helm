/**
 * @component SubproyectoForm
 * Formulario para crear un subproyecto
 * Simplificado respecto a ProyectoForm: hereda area_responsable y foco_estrategico del padre
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Proyecto } from '@/types'
import { CATEGORIAS_POR_AREA } from '@/types/domain'
import type { DbUsuario } from '@/types/database'
import { useCrearSubproyecto } from '@/hooks/useProjects'
import { CreateSubprojectSchema, type CreateSubprojectInput } from '@/lib/validations'

interface SubproyectoFormProps {
  proyectoPadre: Proyecto
  onClose: () => void
}

export function SubproyectoForm({ proyectoPadre, onClose }: SubproyectoFormProps) {
  const [usuarios, setUsuarios] = useState<DbUsuario[]>([])
  const crearSubproyecto = useCrearSubproyecto(proyectoPadre.id)

  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((json) => setUsuarios(json.data ?? []))
      .catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSubprojectInput>({
    resolver: zodResolver(CreateSubprojectSchema),
    defaultValues: {
      nombre: '',
      descripcion_ejecutiva: '',
      objetivo: '',
      resultado_esperado: '',
      categoria: '',
      responsable_primario: '',
      subtipo: undefined,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin_planificada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prioridad: 3,
    },
  })

  // Obtener nombre del área: puede venir como area_responsable (string) o area.nombre
  const areaNombre = typeof (proyectoPadre as any).area_responsable === 'string'
    ? (proyectoPadre as any).area_responsable
    : (proyectoPadre as any).area?.nombre || ''

  const categorias = areaNombre
    ? (CATEGORIAS_POR_AREA[areaNombre] ?? [])
    : []

  const onSubmit = async (data: CreateSubprojectInput) => {
    try {
      // Agregar los campos heredados del proyecto padre
      const dataWithInherited: CreateSubprojectInput = {
        ...data,
        proyecto_id: proyectoPadre.id,
        area_responsable_id: proyectoPadre.area_responsable_id,
        foco_estrategico: proyectoPadre.foco_estrategico,
      }
      await crearSubproyecto.mutateAsync(dataWithInherited)
      onClose()
    } catch (error) {
      // Error handling is done by the mutation's onError
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Crear Subproyecto</h2>
            <p className="text-xs text-gray-500 mt-1">En: {proyectoPadre.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 overflow-y-auto">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              {...register('nombre')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Implementación de nuevos procesos"
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          {/* Descripción Ejecutiva */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Ejecutiva</label>
            <textarea
              {...register('descripcion_ejecutiva')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Resumen ejecutivo del subproyecto"
            />
            {errors.descripcion_ejecutiva && (
              <p className="text-red-500 text-xs mt-1">{errors.descripcion_ejecutiva.message}</p>
            )}
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
            <textarea
              {...register('objetivo')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="¿Qué se pretende lograr?"
            />
            {errors.objetivo && <p className="text-red-500 text-xs mt-1">{errors.objetivo.message}</p>}
          </div>

          {/* Resultado Esperado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resultado Esperado</label>
            <textarea
              {...register('resultado_esperado')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="¿Cuál es el resultado final esperado?"
            />
            {errors.resultado_esperado && (
              <p className="text-red-500 text-xs mt-1">{errors.resultado_esperado.message}</p>
            )}
          </div>

          {/* Info panel: Inherited from parent */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-900 mb-2">Heredado del Proyecto Padre:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div>
                <span className="font-medium">Área:</span> {areaNombre}
              </div>
              <div>
                <span className="font-medium">Foco:</span> {proyectoPadre.foco_estrategico}
              </div>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              {...register('categoria')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>}
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable Principal *</label>
            <select
              {...register('responsable_primario')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un responsable</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo}
                </option>
              ))}
            </select>
            {errors.responsable_primario && (
              <p className="text-red-500 text-xs mt-1">{errors.responsable_primario.message}</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
              <input
                type="date"
                {...register('fecha_inicio')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fecha_inicio && (
                <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
              <input
                type="date"
                {...register('fecha_fin_planificada')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fecha_fin_planificada && (
                <p className="text-red-500 text-xs mt-1">{errors.fecha_fin_planificada.message}</p>
              )}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad (1-5) *</label>
            <input
              type="number"
              min={1}
              max={5}
              {...register('prioridad', { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.prioridad && <p className="text-red-500 text-xs mt-1">{errors.prioridad.message}</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={crearSubproyecto.isPending}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {crearSubproyecto.isPending ? 'Creando...' : 'Crear Subproyecto'}
          </button>
        </div>
      </div>
    </div>
  )
}
