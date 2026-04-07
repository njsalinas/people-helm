/**
 * @component TimelineScaleSelector
 * Selector de escala temporal para el Timeline: 1 día / 1 semana / 1 mes.
 *
 * @example
 * <TimelineScaleSelector value="semana" onChange={setScale} />
 */

'use client'

import { cn } from '@/lib/utils'

export type TimelineScale = 'dia' | 'semana' | 'mes'

interface TimelineScaleSelectorProps {
  value: TimelineScale
  onChange: (scale: TimelineScale) => void
}

const OPTIONS: { value: TimelineScale; label: string }[] = [
  { value: 'dia', label: '1 día' },
  { value: 'semana', label: '1 semana' },
  { value: 'mes', label: '1 mes' },
]

export function TimelineScaleSelector({ value, onChange }: TimelineScaleSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'text-xs px-3 py-1.5 rounded-md font-medium transition-colors',
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
