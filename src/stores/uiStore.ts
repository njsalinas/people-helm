/**
 * @file Zustand store para estado de UI (modales, filtros, etc.)
 */

import { create } from 'zustand'
import type { ProyectosFilter } from '@/types/api'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
}

interface UIState {
  // Modales
  isProyectoFormOpen: boolean
  isBloqueoFormOpen: boolean
  isRiesgoFormOpen: boolean
  isTaskDetailOpen: boolean
  isTareaFormOpen: boolean
  selectedProyectoId: string | null
  selectedTareaId: string | null

  // Filtros Vista Gerencial
  filtros: ProyectosFilter

  // Toasts
  toasts: Toast[]

  // Sidebar
  sidebarOpen: boolean

  // Actions
  openProyectoForm: (proyectoId?: string) => void
  closeProyectoForm: () => void
  openBloqueoForm: (proyectoId: string) => void
  closeBloqueoForm: () => void
  openRiesgoForm: (proyectoId: string) => void
  closeRiesgoForm: () => void
  openTaskDetail: (tareaId: string) => void
  closeTaskDetail: () => void
  openTareaForm: (proyectoId: string) => void
  closeTareaForm: () => void
  setFiltros: (filtros: Partial<ProyectosFilter>) => void
  clearFiltros: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Estado inicial
  isProyectoFormOpen: false,
  isBloqueoFormOpen: false,
  isRiesgoFormOpen: false,
  isTaskDetailOpen: false,
  isTareaFormOpen: false,
  selectedProyectoId: null,
  selectedTareaId: null,
  filtros: {},
  toasts: [],
  sidebarOpen: true,

  // Actions
  openProyectoForm: (proyectoId) =>
    set({ isProyectoFormOpen: true, selectedProyectoId: proyectoId ?? null }),
  closeProyectoForm: () => set({ isProyectoFormOpen: false, selectedProyectoId: null }),

  openBloqueoForm: (proyectoId) =>
    set({ isBloqueoFormOpen: true, selectedProyectoId: proyectoId }),
  closeBloqueoForm: () => set({ isBloqueoFormOpen: false }),

  openRiesgoForm: (proyectoId) =>
    set({ isRiesgoFormOpen: true, selectedProyectoId: proyectoId }),
  closeRiesgoForm: () => set({ isRiesgoFormOpen: false }),

  openTaskDetail: (tareaId) => set({ isTaskDetailOpen: true, selectedTareaId: tareaId }),
  closeTaskDetail: () => set({ isTaskDetailOpen: false, selectedTareaId: null }),
  openTareaForm: (proyectoId) => set({ isTareaFormOpen: true, selectedProyectoId: proyectoId }),
  closeTareaForm: () => set({ isTareaFormOpen: false }),

  setFiltros: (nuevos) => set((state) => ({ filtros: { ...state.filtros, ...nuevos } })),
  clearFiltros: () => set({ filtros: {} }),

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    // Auto-remove
    setTimeout(() => get().removeToast(id), 5000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
