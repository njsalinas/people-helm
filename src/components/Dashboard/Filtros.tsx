/**
 * @component Filtros
 * Panel lateral de filtros para la Vista Gerencial
 *
 * @example
 * <Filtros filtros={filtros} onChange={setFiltros} onClear={clearFiltros} />
 */

'use client'

import { FOCOS_ESTRATEGICOS, ESTADOS_PROYECTO } from '@/types/domain'
import { useAreas } from '@/hooks/useAreas'
import type { ProyectosFilter } from '@/types/api'
import type { Usuario } from '@/types'
import { cn } from '@/lib/utils'

interface FiltrosProps {
  filtros: ProyectosFilter
  onChange: (filtros: Partial<ProyectosFilter>) => void
  onClear: () => void
  user?: Usuario | null
  expanded?: boolean
  onToggle?: () => void
}

export function Filtros({ filtros, onChange, onClear, expanded = true, onToggle }: FiltrosProps) {
  const { data: areas = [] } = useAreas()

  const hasFilters = Object.keys(filtros).some(
    (k) => filtros[k as keyof ProyectosFilter] !== undefined
  )

  // Mostrar filtro de Área para todos los roles
  const mostrarFiltroArea = true
  const conteoActivos = [
    filtros.areas?.length || 0,
    filtros.focos?.length || 0,
    filtros.estados?.length || 0,
    filtros.solo_con_bloqueos ? 1 : 0,
    filtros.solo_con_acciones_pendientes ? 1 : 0,
    filtros.solo_criticos ? 1 : 0,
    filtros.solo_vencidos ? 1 : 0,
  ].reduce((acc, n) => acc + n, 0)

  // Panel colapsado
  if (!expanded) {
    return (
      <aside className="w-10 flex-shrink-0 bg-white border border-gray-200 rounded-xl py-3 px-2 h-fit flex flex-col items-center gap-3">
        <button
          onClick={onToggle}
          className="text-gray-600 hover:text-gray-900 transition-colors p-1"
          title="Expandir filtros"
          aria-label="Expandir filtros"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {conteoActivos > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
            {conteoActivos}
          </span>
        )}
      </aside>
    )
  }

  // Panel expandido
  return (
    <aside className="w-60 flex-shrink-0 bg-white border border-gray-200 rounded-xl p-4 space-y-5 h-fit">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800 text-sm">Filtros</h3>
          {conteoActivos > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
              {conteoActivos}
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-2"
          title="Colapsar filtros"
          aria-label="Colapsar filtros"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
        >
          Limpiar todo
        </button>
      )}

      {/* Por Área */}
      {mostrarFiltroArea && (
        <FilterSection title={`Área (${filtros.areas?.length || 0})`}>
          {areas.map((area) => (
            <CheckboxItem
              key={area.id}
              label={area.nombre}
              checked={filtros.areas?.includes(area.id) ?? false}
              onChange={(checked) => {
                const current = filtros.areas ?? []
                onChange({
                  areas: checked ? [...current, area.id] : current.filter((a) => a !== area.id),
                })
              }}
            />
          ))}
        </FilterSection>
      )}

      {/* Por Foco */}
      <FilterSection title={`Foco Estratégico (${filtros.focos?.length || 0})`}>
        {FOCOS_ESTRATEGICOS.map((foco) => (
          <CheckboxItem
            key={foco}
            label={foco}
            checked={filtros.focos?.includes(foco) ?? false}
            onChange={(checked) => {
              const current = filtros.focos ?? []
              onChange({
                focos: checked ? [...current, foco] : current.filter((f) => f !== foco),
              })
            }}
          />
        ))}
      </FilterSection>

      {/* Por Estado */}
      <FilterSection title={`Estado (${filtros.estados?.length || 0})`}>
        {ESTADOS_PROYECTO.map((estado) => (
          <CheckboxItem
            key={estado}
            label={estado}
            checked={filtros.estados?.includes(estado) ?? false}
            onChange={(checked) => {
              const current = filtros.estados ?? []
              onChange({
                estados: checked ? [...current, estado] : current.filter((e) => e !== estado),
              })
            }}
          />
        ))}
      </FilterSection>

      {/* Filtros rápidos */}
      <FilterSection
        title={`Mostrar solo (${[
          filtros.solo_con_bloqueos,
          filtros.solo_con_acciones_pendientes,
          filtros.solo_criticos,
          filtros.solo_vencidos,
        ].filter(Boolean).length})`}
      >
        <CheckboxItem
          label="Con bloqueos"
          checked={filtros.solo_con_bloqueos ?? false}
          onChange={(checked) => onChange({ solo_con_bloqueos: checked || undefined })}
        />
        <CheckboxItem
          label="Con acciones pendientes"
          checked={filtros.solo_con_acciones_pendientes ?? false}
          onChange={(checked) =>
            onChange({ solo_con_acciones_pendientes: checked || undefined })
          }
        />
        <CheckboxItem
          label="Críticos (prioridad 1-2)"
          checked={filtros.solo_criticos ?? false}
          onChange={(checked) => onChange({ solo_criticos: checked || undefined })}
        />
        <CheckboxItem
          label="Vencidos"
          checked={filtros.solo_vencidos ?? false}
          onChange={(checked) => onChange({ solo_vencidos: checked || undefined })}
        />
      </FilterSection>
    </aside>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className={cn('text-sm text-gray-700 group-hover:text-gray-900', checked && 'font-medium')}>
        {label}
      </span>
    </label>
  )
}
