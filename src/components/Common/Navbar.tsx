/**
 * @component Navbar
 * Barra de navegación lateral del dashboard
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, obtenerIniciales } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/lib/constants'

const navItems = [
  { href: '/', label: 'Vista General', icon: '📊' },
  { href: '/focos', label: 'Por Prioridad', icon: '🎯' },
  { href: '/kanban-global', label: 'Kanban Global', icon: '📌' },
  { href: '/bloqueos', label: 'Bloqueos', icon: '🔒' },
  { href: '/reporteria/semaforo', label: 'Semáforo', icon: '🚦' },
  { href: '/reporteria/semaforo-abreviado', label: 'Semáforo Abreviado', icon: '📋' },
  { href: '/settings', label: 'Configuración', icon: '⚙️' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout, isGerente } = useAuth()

  return (
    <nav className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">PH</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">{APP_NAME}</span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        {/* Objetivos (solo Gerentes) */}
        {isGerente && (
          <Link
            href="/objetivos"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === '/objetivos' || pathname.startsWith('/objetivos/')
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <span className="text-base leading-none">🎖️</span>
            Objetivos
          </Link>
        )}
      </div>

      {/* User */}
      {user && (
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {obtenerIniciales(user.nombre_completo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user.nombre_completo}</p>
              <p className="text-xs text-gray-400 truncate">{user.rol}</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
