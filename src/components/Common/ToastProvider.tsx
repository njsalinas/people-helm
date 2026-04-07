/**
 * @component ToastProvider
 * Sistema de notificaciones toast (alertas visuales)
 */

'use client'

import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function ToastProvider() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm animate-in slide-in-from-right-full duration-300',
            toast.type === 'success' && 'bg-green-50 border-green-200 text-green-800',
            toast.type === 'error' && 'bg-red-50 border-red-200 text-red-800',
            toast.type === 'warning' && 'bg-yellow-50 border-yellow-200 text-yellow-800',
            toast.type === 'info' && 'bg-blue-50 border-blue-200 text-blue-800'
          )}
        >
          <span className="text-base leading-none mt-0.5">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <div className="flex-1">
            <p className="font-medium">{toast.title}</p>
            {toast.description && <p className="text-xs opacity-80 mt-0.5">{toast.description}</p>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
