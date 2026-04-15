/**
 * @component Navbar
 * Barra de navegación lateral del dashboard - Material Design 3
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/lib/constants'
import { UserAvatar } from './UserAvatar'
import {
  LayoutGrid,
  Target,
  Activity,
  Lock,
  Clock,
  LogOut,
  Settings,
  Zap,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Vista General', icon: LayoutGrid },
  { href: '/focos', label: 'Por Prioridad', icon: Zap },
  { href: '/kanban-global', label: 'Kanban Global', icon: Clock },
  { href: '/bloqueos', label: 'Bloqueos', icon: Lock },
  { href: '/reporteria/semaforo', label: 'Semáforo', icon: Activity },
  { href: '/reporteria/semaforo-abreviado', label: 'Semáforo Abreviado', icon: Activity },
  { href: '/settings', label: 'Configuración', icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout, isGerente } = useAuth()

  return (
    <nav className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">PH</span>
          </div>
          <span className="font-bold text-gray-900">{APP_NAME}</span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}

        {/* Separator */}
        {(isGerente || user?.rol === 'Líder Area') && <div className="my-2 border-t border-gray-100" />}

        {/* Objetivos (Gerentes y Líderes de Área) */}
        {(isGerente || user?.rol === 'Líder Area') && (
          <Link
            href="/objetivos"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              pathname === '/objetivos' || pathname.startsWith('/objetivos/')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            <Target className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate">Objetivos</span>
          </Link>
        )}
      </div>

      {/* User */}
      {user && (
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-default">
            <UserAvatar nombre={user.nombre_completo} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.nombre_completo}</p>
              <p className="text-xs text-gray-500 truncate">{user.rol}</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1 rounded-xl transition-all duration-150 flex-shrink-0"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
