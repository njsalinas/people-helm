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
}

export function Filtros({ filtros, onChange, onClear, user }: FiltrosProps) {
  const { data: areas = [] } = useAreas()

  const hasFilters = Object.keys(filtros).some(
    (k) => filtros[k as keyof ProyectosFilter] !== undefined
  )

  // Solo mostrar filtro de Área para Gerentes
  const mostrarFiltroArea = user?.rol === 'Gerente'

  return (
    <aside className="w-60 flex-shrink-0 bg-white border border-gray-200 rounded-xl p-4 space-y-5 h-fit">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">Filtros</h3>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Por Área - Solo para Gerentes */}
      {mostrarFiltroArea && (
        <FilterSection title="Área">
          {areas.map((area) => (
            <CheckboxItem
              key={area.id}
              label={area.nombre}
              checked={filtros.areas?.includes(area.nombre) ?? false}
              onChange={(checked) => {
                const current = filtros.areas ?? []
                onChange({
                  areas: checked ? [...current, area.nombre] : current.filter((a) => a !== area.nombre),
                })
              }}
            />
          ))}
        </FilterSection>
      )}

      {/* Por Foco */}
      <FilterSection title="Foco Estratégico">
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
      <FilterSection title="Estado">
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
      <FilterSection title="Mostrar solo">
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
