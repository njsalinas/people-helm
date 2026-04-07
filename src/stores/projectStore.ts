/**
 * @file Zustand store para cache de proyectos
 * React Query maneja el fetching; este store maneja optimistic updates
 */

import { create } from 'zustand'
import type { ProyectoGerencial } from '@/types'

interface ProjectState {
  // Cache local para optimistic updates
  proyectosCache: Map<string, ProyectoGerencial>
  selectedProyectoId: string | null

  // Actions
  cacheProyecto: (proyecto: ProyectoGerencial) => void
  updateProyectoCache: (id: string, updates: Partial<ProyectoGerencial>) => void
  selectProyecto: (id: string | null) => void
  clearCache: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  proyectosCache: new Map(),
  selectedProyectoId: null,

  cacheProyecto: (proyecto) =>
    set((state) => {
      const newMap = new Map(state.proyectosCache)
      newMap.set(proyecto.id, proyecto)
      return { proyectosCache: newMap }
    }),

  updateProyectoCache: (id, updates) =>
    set((state) => {
      const existing = state.proyectosCache.get(id)
      if (!existing) return state
      const newMap = new Map(state.proyectosCache)
      newMap.set(id, { ...existing, ...updates })
      return { proyectosCache: newMap }
    }),

  selectProyecto: (id) => set({ selectedProyectoId: id }),

  clearCache: () => set({ proyectosCache: new Map() }),
}))
