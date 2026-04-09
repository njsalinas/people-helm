/**
 * @component DesbloquearTareaModal
 * Modal para registrar la razón de desbloqueo al mover una tarea desde estado Bloqueado
 */

'use client'

import { useState } from 'react'
import type { Tarea } from '@/types'

interface DesbloquearTareaModalProps {
  tarea: Tarea
  nuevoEstado: string
  open: boolean
  onClose: () => void
  onConfirm: (razon: string) => Promise<void>
}

export function DesbloquearTareaModal({
  tarea,
  nuevoEstado,
  open,
  onClose,
  onConfirm,
}: DesbloquearTareaModalProps) {
  const [razon, setRazon] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (razon.length < 10) {
      alert('Por favor, proporciona una razón de al menos 10 caracteres')
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(razon)
      setRazon('')
      onClose()
    } catch (error) {
      console.error('Error desbloqueando tarea:', error)
      alert('Error al desbloquear la tarea. Por favor, intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registrar desbloqueo</h2>
          <p className="text-sm text-gray-600 mt-1">
            ¿Cómo se resolvió el bloqueo de <strong>{tarea.nombre}</strong>?
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div className="text-sm">
            <p className="text-gray-600 mb-4">
              Nueva estado: <span className="font-semibold">{nuevoEstado}</span>
            </p>
            <label htmlFor="razon" className="block text-sm font-medium text-gray-700 mb-2">
              Razón del desbloqueo
            </label>
            <textarea
              id="razon"
              value={razon}
              onChange={(e) => setRazon(e.target.value.slice(0, 500))}
              placeholder="Describe brevemente cómo se resolvió el bloqueo (mínimo 10 caracteres)"
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {razon.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={razon.length < 10 || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Desbloqueando...' : 'Desbloquear'}
          </button>
        </div>
      </div>
    </div>
  )
}
