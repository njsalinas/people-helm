# Módulos y Componentes

*Auto-generado por pre-commit hook — ver `scripts/docs-generator.js` para regenerar*

---

## Componentes React

### `src/components/Common/Navbar.tsx`
Barra de navegación lateral fija con links activos y avatar de usuario.
**Exports:** `Navbar`

### `src/components/Common/ToastProvider.tsx`
Stack de notificaciones toast en posición fija. Se alimenta desde `uiStore`.
**Exports:** `ToastProvider`

### `src/components/Dashboard/KPIDashboard.tsx`
6 tarjetas KPI: total proyectos, verde/amarillo/rojo (%), bloqueos activos, acciones pendientes.
**Exports:** `KPIDashboard`

### `src/components/Dashboard/Filtros.tsx`
Sidebar de filtros: área, foco estratégico, estado, color semáforo.
**Exports:** `Filtros`

### `src/components/Dashboard/VistaGerencial.tsx`
Tabla principal de proyectos con semáforo, avance, responsable y días restantes.
**Exports:** `VistaGerencial`

### `src/components/Proyectos/ProyectoDetail.tsx`
Header del proyecto con selector de estado + tabs: Kanban / Timeline / Lista.
**Exports:** `ProyectoDetail`

### `src/components/Proyectos/ProyectoForm.tsx`
Modal de creación de proyecto con validación Zod.
**Exports:** `ProyectoForm`

### `src/components/Proyectos/Kanban/KanbanBoard.tsx`
Tablero DnD con DndContext, PointerSensor y DragOverlay.
**Exports:** `KanbanBoard`

### `src/components/Proyectos/Kanban/KanbanColumn.tsx`
Columna droppable con SortableContext y botón de agregar tarea.
**Exports:** `KanbanColumn`

### `src/components/Proyectos/Kanban/TaskCard.tsx`
Tarjeta sortable de tarea con indicadores de bloqueo, avance y responsable.
**Exports:** `TaskCard`

### `src/components/Proyectos/Kanban/TaskDetailModal.tsx`
Modal de detalle de tarea: estado, avance, bloqueos activos.
**Exports:** `TaskDetailModal`

### `src/components/Proyectos/Timeline/TimelineChart.tsx`
Diagrama de Gantt simplificado con barras proporcionales por tarea.
**Exports:** `TimelineChart`

### `src/components/Proyectos/Timeline/TaskProgressBar.tsx`
Barra individual con marcador de tiempo actual y color por estado.
**Exports:** `TaskProgressBar`

### `src/components/Proyectos/Lista/TaskTable.tsx`
Tabla ordenable de tareas con indicador de actividad reciente.
**Exports:** `TaskTable`

### `src/components/Bloqueos/BloqueosTable.tsx`
Tabla transversal de bloqueos filtrable con color por días activos.
**Exports:** `BloqueosTable`

### `src/components/Bloqueos/BloqueosForm.tsx`
Modal de registro de bloqueo con validación Zod.
**Exports:** `BloqueosForm`

### `src/components/Reporteria/SemaforoCompleto.tsx`
Vista completa del semáforo mensual auto-generado por sección de color.
**Exports:** `SemaforoCompleto`

### `src/components/Reporteria/SemaforoAbreviado.tsx`
Editor interactivo del semáforo abreviado (top 3 por color, comentarios ejecutivos).
**Exports:** `SemaforoAbreviado`, `SemaforoAbreviadoData`

### `src/components/Reporteria/TablaEditable.tsx`
Tabla con columna Detalle editable inline (click-to-edit, contador de caracteres).
**Exports:** `TablaEditable`, `TablaEditableItem`

---

## Hooks Personalizados

### `src/hooks/useAuth.ts`
Suscribe a `onAuthStateChange` de Supabase. Expone `login`, `logout`, `isGerente`, `isLiderArea`.
**Exports:** `useAuth`

### `src/hooks/useProjects.ts`
`useProyectos(filtros)` — lista desde `vista_semaforo_proyectos`.
`useProyecto(id)` — detalle con joins.
`useCrearProyecto()` — mutation.
`useActualizarEstadoProyecto()` — mutation.
**Exports:** `useProyectos`, `useProyecto`, `useCrearProyecto`, `useActualizarEstadoProyecto`

### `src/hooks/useTareas.ts`
CRUD de tareas por proyecto. Invalida `['tareas', proyectoId]` en cada mutation.
**Exports:** `useTareas`, `useCrearTarea`, `useActualizarTarea`

### `src/hooks/useBloqueos.ts`
`useBloqueoActivos()` desde vista, `useRegistrarBloqueo()`, `useResolverBloqueo()`.
**Exports:** `useBloqueoActivos`, `useRegistrarBloqueo`, `useResolverBloqueo`

### `src/hooks/useRiesgos.ts`
CRUD de riesgos por proyecto.
**Exports:** `useRiesgos`, `useRegistrarRiesgo`, `useResolverRiesgo`

### `src/hooks/useSemaforo.ts`
`useSemaforos(anio)`, `useSemaforo(id)`, `useGenerarSemaforo()`, `useGuardarAbreviado()`, `usePublicarSemaforo()`.
**Exports:** `useSemaforos`, `useSemaforo`, `useGenerarSemaforo`, `useGuardarAbreviado`, `usePublicarSemaforo`

### `src/hooks/useNotificaciones.ts`
`useNotificacionesConfig()`, `useUpdateNotificacionConfig()`, `useRealtimeAlertas(usuarioId)`.
**Exports:** `useNotificacionesConfig`, `useUpdateNotificacionConfig`, `useRealtimeAlertas`

---

## Utilidades (`src/lib/`)

### `src/lib/utils.ts`
Funciones puras utilitarias.

| Función | Descripción |
|---------|-------------|
| `cn(...classes)` | Merge de clases Tailwind con clsx + tailwind-merge |
| `formatDate(date)` | ISO → DD/MM/YYYY |
| `calcularDiasRestantes(fecha)` | Días hasta fecha_fin |
| `calcularPorcentajeTiempo(inicio, fin)` | % tiempo transcurrido |
| `calcularColorSemaforo(proyecto)` | VERDE/AMARILLO/ROJO |
| `calcularPrioridadRiesgo(prob, impacto)` | Baja/Media/Alta/Crítico |
| `calcularKPIs(proyectos)` | Total, por color, bloqueos |
| `colorFilaBloqueo(dias)` | Color CSS por antigüedad |
| `obtenerIniciales(nombre)` | "María González" → "MG" |
| `nombreMes(num)` | 1 → "Enero" |

### `src/lib/validations.ts`
Schemas Zod: `CreateProjectSchema`, `CreateTaskSchema`, `CreateBloqueoSchema`, `CreateRiesgoSchema`, `LoginSchema`, `SemaforoAbreviadoSchema`.

### `src/lib/constants.ts`
`DIAS_BLOQUEO_AMARILLO = 3`, `DIAS_BLOQUEO_ROJO = 5`, límites de campos de texto.

### `src/lib/auth.ts`
`getServerUser()`, `canAccess(user, rol)`, `canEditProject(user, proyecto)`.

---

## Stores Zustand

### `src/stores/authStore.ts`
`{ user, isLoading, setUser, clearUser, setLoading }` — persisted en localStorage.

### `src/stores/uiStore.ts`
`{ modals, filtros, toasts, sidebarOpen }` — toasts auto-eliminados a los 5s.

### `src/stores/projectStore.ts`
Cache Map de proyectos para optimistic updates.
