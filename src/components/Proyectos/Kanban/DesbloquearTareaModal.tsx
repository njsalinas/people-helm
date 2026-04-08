/**
 * @component DesbloquearTareaModal
 * Modal para registrar la razón de desbloqueo al mover una tarea desde estado Bloqueado
 */

'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
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

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Registrar desbloqueo</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Cómo se resolvió el bloqueo de &quot;<strong>{tarea.nombre}</strong>&quot;?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="text-sm">
            <p className="text-gray-600 mb-2">
              Nueva estado: <span className="font-semibold">{nuevoEstado}</span>
            </p>
            <label htmlFor="razon" className="block text-sm font-medium text-gray-700 mb-2">
              Razón del desbloqueo
            </label>
            <Textarea
              id="razon"
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
              placeholder="Describe brevemente cómo se resolvió el bloqueo (mínimo 10 caracteres)"
              className="w-full min-h-[100px]"
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {razon.length}/500 caracteres
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={razon.length < 10 || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Desbloqueando...' : 'Desbloquear'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
