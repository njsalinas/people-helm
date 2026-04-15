'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  color?: 'blue' | 'green' | 'red' | 'yellow'
  className?: string
}

const colorStyles: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
}

export function ProgressBar({
  value,
  color = 'blue',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div
      className={cn('h-1.5 bg-gray-100 rounded-full overflow-hidden', className)}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', colorStyles[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
