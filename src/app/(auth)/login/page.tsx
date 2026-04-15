'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema, type LoginInput } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/lib/constants'

/**
 * @component Página de Login - Material Design 3
 * Autenticación con email/contraseña usando Supabase Auth
 */
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await login(data.email, data.password)
      router.replace('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      if (message.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos')
      } else {
        setError(message)
      }
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-0">
      {/* Fondo con gradiente sutil (Material Design 3) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-50 to-transparent rounded-full blur-3xl opacity-40" />
      </div>

      {/* Contenedor principal */}
      <div className="relative w-full max-w-md">
        {/* Card con elevación Material Design */}
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="p-10 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              {/* Ícono con Material Design */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>

              {/* Título y subtítulo */}
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{APP_NAME}</h1>
              <p className="text-gray-600 text-base font-medium">
                Sistema de Dirección Operativa
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Área de Personas
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Email */}
              <div className="space-y-2.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@empresa.com"
                    {...form.register('email')}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-500 text-base
                      transition-all duration-200
                      focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                      hover:border-gray-300
                      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  />
                  {!form.formState.errors.email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 font-medium mt-1.5">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Contraseña
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...form.register('password')}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-500 text-base
                      transition-all duration-200
                      focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                      hover:border-gray-300
                      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  />
                  {!form.formState.errors.password && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500 font-medium mt-1.5">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Error general */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-900">{error}</p>
                  </div>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-2xl
                  transition-all duration-200 transform
                  hover:shadow-lg hover:-translate-y-0.5
                  active:translate-y-0 active:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                  flex items-center justify-center gap-2 text-base"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Ingresando...
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                Acceso restringido a usuarios autorizados
              </p>
            </div>
          </div>
        </div>

        {/* Texto adicional debajo del card */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Sistema de gestión operativa del Área de Personas
        </p>
      </div>
    </div>
  )
}
