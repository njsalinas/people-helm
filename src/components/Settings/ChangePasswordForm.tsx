'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function ChangePasswordForm() {
  const { changePassword } = useAuth()
  const addToast = useUIStore((s) => s.addToast)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'La contraseña es requerida'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await changePassword(formData.newPassword)
      addToast({
        type: 'success',
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada exitosamente',
      })
      setFormData({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar la contraseña'
      addToast({
        type: 'error',
        title: 'Error al cambiar contraseña',
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">
          Nueva contraseña
        </label>
        <input
          id="newPassword"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Mínimo 8 caracteres"
          disabled={isLoading}
          className={cn(
            'w-full px-3 py-2.5 border rounded-xl text-sm transition-colors',
            errors.newPassword
              ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          )}
        />
        {errors.newPassword && (
          <p className="text-xs text-red-600 font-medium">{errors.newPassword}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Escribe la contraseña de nuevo"
          disabled={isLoading}
          className={cn(
            'w-full px-3 py-2.5 border rounded-xl text-sm transition-colors',
            errors.confirmPassword
              ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          )}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 font-medium">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
