'use client'

import { cn } from '@/lib/utils'

interface UserAvatarProps {
  nombre: string
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

const sizeStyles: Record<string, { container: string; text: string }> = {
  xs: { container: 'w-5 h-5', text: 'text-[0.625rem]' },
  sm: { container: 'w-7 h-7', text: 'text-xs' },
  md: { container: 'w-9 h-9', text: 'text-sm' },
}

function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-yellow-100 text-yellow-700',
    'bg-green-100 text-green-700',
    'bg-cyan-100 text-cyan-700',
  ]
  if (!name) return colors[0]
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export function UserAvatar({
  nombre,
  size = 'sm',
  className,
}: UserAvatarProps) {
  const { container, text } = sizeStyles[size]
  const color = getColorFromName(nombre)
  const initials = getInitials(nombre)

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        container,
        color,
        text,
        className
      )}
      title={nombre}
    >
      {initials}
    </div>
  )
}
