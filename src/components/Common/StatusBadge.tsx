'use client'

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  label: string
  color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'orange'
  className?: string
}

const colorStyles: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
}

export function StatusBadge({
  label,
  color = 'gray',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full',
        colorStyles[color],
        className
      )}
    >
      {label}
    </span>
  )
}
