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
      <div className="px-5 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">PH</span>
          </div>
          <span className="font-bold text-gray-900">{APP_NAME}</span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className="text-base leading-none flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}

        {/* Separator */}
        {isGerente && <div className="my-2 border-t border-gray-200" />}

        {/* Objetivos (solo Gerentes) */}
        {isGerente && (
          <Link
            href="/objetivos"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              pathname === '/objetivos' || pathname.startsWith('/objetivos/')
                ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <span className="text-base leading-none flex-shrink-0">🎖️</span>
            <span className="truncate">Objetivos</span>
          </Link>
        )}
      </div>

      {/* User */}
      {user && (
        <div className="px-3 py-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-150 cursor-default">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 shadow-sm">
              {obtenerIniciales(user.nombre_completo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.nombre_completo}</p>
              <p className="text-xs text-gray-500 truncate">{user.rol}</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-all duration-150 flex-shrink-0"
              aria-label="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
