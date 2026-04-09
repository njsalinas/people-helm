# Módulos y Componentes

*Auto-generated — do not edit manually*

## Componentes React

### `src/components/Bloqueos/BloqueosForm.tsx`
@component BloqueosForm
Modal formulario para registrar un nuevo bloqueo

@example
<BloqueosForm proyectoId={id} onClose={() => setOpen(false)} />
**Exports:** BloqueosForm

### `src/components/Bloqueos/BloqueosTable.tsx`
@component BloqueosTable
Tabla transversal de todos los bloqueos activos del sistema

@example
<BloqueosTable bloqueos={bloqueos} />
**Exports:** BloqueosTable

### `src/components/Common/Navbar.tsx`
@component Navbar
Barra de navegación lateral del dashboard
**Exports:** Navbar

### `src/components/Common/ToastProvider.tsx`
@component ToastProvider
Sistema de notificaciones toast (alertas visuales)
**Exports:** ToastProvider

### `src/components/Dashboard/Filtros.tsx`
@component Filtros
Panel lateral de filtros para la Vista Gerencial

@example
<Filtros filtros={filtros} onChange={setFiltros} onClear={clearFiltros} />
**Exports:** Filtros

### `src/components/Dashboard/KPIDashboard.tsx`
@component KPIDashboard
Panel de KPIs resumidos en la parte superior del dashboard

@example
<KPIDashboard proyectos={proyectos} />
**Exports:** KPIDashboard

### `src/components/Dashboard/VistaGerencial.tsx`
@component VistaGerencial
Tabla dinámica principal con todos los proyectos y su estado

@example
<VistaGerencial proyectos={proyectos} onSelectProject={(id) => router.push(`/proyectos/${id}`)} />
**Exports:** VistaGerencial

### `src/components/Proyectos/Kanban/DesbloquearTareaModal.tsx`
@component DesbloquearTareaModal
Modal para registrar la razón de desbloqueo al mover una tarea desde estado Bloqueado
**Exports:** DesbloquearTareaModal

### `src/components/Proyectos/Kanban/KanbanBoard.tsx`
@component KanbanBoard
Tablero Kanban principal con drag & drop entre columnas

@example
<KanbanBoard proyectoId={id} tareas={tareas} />
**Exports:** KanbanBoard

### `src/components/Proyectos/Kanban/KanbanColumn.tsx`
@component KanbanColumn
Columna del tablero Kanban (Pendiente | En Curso | Finalizado)

@example
<KanbanColumn column={column} onTaskClick={(id) => openDetail(id)} />
**Exports:** KanbanColumn

### `src/components/Proyectos/Kanban/TaskCard.tsx`
@component TaskCard
Tarjeta individual de tarea en el tablero Kanban

@example
<TaskCard tarea={tarea} onClick={() => openModal(tarea.id)} />
**Exports:** TaskCard

### `src/components/Proyectos/Kanban/TaskDetailModal.tsx`
@component TaskDetailModal
Modal con detalle completo de una tarea, bloqueos y comentarios

@example
<TaskDetailModal tareaId={id} proyectoId={proyId} onClose={() => setOpen(false)} />
**Exports:** TaskDetailModal

### `src/components/Proyectos/KanbanGlobal/KanbanColumnGlobal.tsx`
@component KanbanColumnGlobal
Columna de un Kanban global mostrando tareas por estado
**Exports:** KanbanColumnGlobal

### `src/components/Proyectos/KanbanGlobal/KanbanGlobal.tsx`
@component KanbanGlobal
Kanban global con tareas organizadas por estado
**Exports:** KanbanGlobal

### `src/components/Proyectos/KanbanGlobal/TaskCardGlobal.tsx`
@component TaskCardGlobal
Tarjeta de tarea para el Kanban Global con color del proyecto
**Exports:** TaskCardGlobal

### `src/components/Proyectos/Lista/TaskTable.tsx`
@component TaskTable
Vista de lista con todas las tareas de un proyecto en tabla

@example
<TaskTable tareas={tareas} onTaskClick={(id) => openDetail(id)} />
**Exports:** TaskTable

### `src/components/Proyectos/ProyectoCard.tsx`
@component ProyectoCard
Tarjeta compacta de proyecto para vistas de grid.

@example
<ProyectoCard proyecto={proyecto} />
**Exports:** ProyectoCard

### `src/components/Proyectos/ProyectoDetail.tsx`
@component ProyectoDetail
Vista de detalle de un proyecto con 3 pestañas: Kanban, Timeline, Lista

@example
<ProyectoDetail proyectoId={id} />
**Exports:** ProyectoDetail

### `src/components/Proyectos/ProyectoEditForm.tsx`
@component ProyectoEditForm
Formulario para editar un proyecto existente
**Exports:** ProyectoEditForm

### `src/components/Proyectos/ProyectoForm.tsx`
@component ProyectoForm
Modal de creación de proyecto

@example
<ProyectoForm onClose={() => setOpen(false)} />
**Exports:** ProyectoForm

### `src/components/Proyectos/SubproyectoCard.tsx`
@component SubproyectoCard
Card component para mostrar un subproyecto en la lista
**Exports:** SubproyectoCard

### `src/components/Proyectos/SubproyectoForm.tsx`
@component SubproyectoForm
Formulario para crear un subproyecto
Simplificado respecto a ProyectoForm: hereda area_responsable y foco_estrategico del padre
**Exports:** SubproyectoForm

### `src/components/Proyectos/SubproyectoList.tsx`
@component SubproyectoList
Sección para mostrar subproyectos en el detalle del proyecto
**Exports:** SubproyectoList

### `src/components/Proyectos/TareaForm.tsx`
**Exports:** TareaForm

### `src/components/Proyectos/Timeline/TaskProgressBar.tsx`
@component TaskProgressBar
Barra de progreso individual para la vista Timeline

@example
<TaskProgressBar tarea={tarea} />
**Exports:** TaskProgressBar

### `src/components/Proyectos/Timeline/TimelineChart.tsx`
@component TimelineChart
Vista tipo Gantt simplificada con barras de progreso por tarea

@example
<TimelineChart tareas={tareas} />
**Exports:** TimelineChart

### `src/components/Proyectos/Timeline/TimelineScaleSelector.tsx`
@component TimelineScaleSelector
Selector de escala temporal para el Timeline: 1 día / 1 semana / 1 mes.

@example
<TimelineScaleSelector value="semana" onChange={setScale} />
**Exports:** TimelineScale, TimelineScaleSelector

### `src/components/Reporteria/SemaforoAbreviado.tsx`
@component SemaforoAbreviado
Editor interactivo del semáforo abreviado (top 3 por color, editable)

@example
<SemaforoAbreviado semaforo={semaforo} proyectos={proyectos} onSave={handleSave} />
**Exports:** SemaforoAbreviadoData, SemaforoAbreviado

### `src/components/Reporteria/SemaforoCompleto.tsx`
@component SemaforoCompleto
Vista del semáforo mensual completo auto-generado

@example
<SemaforoCompleto semaforo={semaforo} onExport={handleExport} />
**Exports:** SemaforoCompleto

### `src/components/Reporteria/TablaEditable.tsx`
@component TablaEditable
Tabla editable para el semáforo abreviado (campo Detalle editable inline)

@example
<TablaEditable items={items} color="verde" onChange={handleChange} />
**Exports:** TablaEditableItem, TablaEditable

## Hooks Personalizados

### `src/hooks/useAuth.ts`
@file Hook de autenticación con Supabase
**Exports:** useAuth

### `src/hooks/useBloqueos.ts`
@file React Query hooks para gestión de bloqueos
**Exports:** useBloqueoActivos, useRegistrarBloqueo, useResolverBloqueo

### `src/hooks/useNotificaciones.ts`
@file useNotificaciones
Hooks para configuración y recepción de notificaciones en tiempo real
**Exports:** useNotificacionesConfig, useUpdateNotificacionConfig, useRealtimeAlertas

### `src/hooks/useProjects.ts`
@file React Query hooks para gestión de proyectos
**Exports:** useProyectos, useProyecto, useCrearProyecto, useActualizarEstadoProyecto, useCrearSubproyecto

### `src/hooks/useRiesgos.ts`
@file useRiesgos
Hooks para riesgos de proyectos
**Exports:** useRiesgos, useRegistrarRiesgo, useResolverRiesgo

### `src/hooks/useSemaforo.ts`
@file useSemaforo
Hooks para semáforos (reportería)
**Exports:** useSemaforos, useSemaforo, useGenerarSemaforo, useGuardarAbreviado, usePublicarSemaforo

### `src/hooks/useTareas.ts`
@file React Query hooks para gestión de tareas
**Exports:** useTareas, useTareasGlobal, useCrearTarea, useActualizarTarea

## Utilidades

### `src/lib/api-client.ts`
@file api-client.ts
Cliente HTTP centralizado para llamadas a las API routes de Next.js.
Usado principalmente para invocaciones server-side o utilitarias.
**Exports:** apiClient

### `src/lib/auth.ts`
@file Lógica de autenticación y sesiones
**Exports:** SessionUser, getServerUser

### `src/lib/constants.ts`
@file Constantes globales del sistema
**Exports:** APP_NAME, APP_VERSION, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, SESSION_DURATION_HOURS, DIAS_BLOQUEO_AMARILLO, DIAS_BLOQUEO_ROJO, NOMBRE_PROYECTO_MIN, NOMBRE_PROYECTO_MAX, DESCRIPCION_BLOQUEO_MIN, DESCRIPCION_BLOQUEO_MAX, COMENTARIO_ESTADO_MIN, COMENTARIO_ESTADO_MAX, DETALLE_SEMAFORO_MAX, COMENTARIO_EJECUTIVO_MAX, TOAST_DURATION_MS, SEMAFORO_ITEMS_POR_COLOR

### `src/lib/supabase-server.ts`
@file Cliente Supabase para Server Components y API routes
**Exports:** createServerSupabaseClient, createServiceRoleClient

### `src/lib/supabase-types.ts`
@file Tipos de Database para Supabase Client (generics)
Mapea las tablas para TypeScript autocomplete.

GenericTable exige { Row, Insert, Update, Relationships }.
Sin Relationships, Database['public'] no extiende GenericSchema
y Supabase cae a `any`, lo que hace que .insert()/.update() retornen `never`.
**Exports:** Database

### `src/lib/supabase.ts`
@file Clientes Supabase para browser y server
**Exports:** createClient, getSupabaseBrowserClient

### `src/lib/utils.ts`
@file Utilidades compartidas del sistema
**Exports:** cn, formatDate, calcularDiasRestantes, calcularPorcentajeTiempo, calcularColorSemaforo, calcularPrioridadRiesgo, colorPrioridadRiesgo, colorFilaBloqueo, formatPorcentaje, truncate, obtenerIniciales, calcularKPIs, canAccess, canEditProject, nombreMes

### `src/lib/validations.ts`
@file Schemas de validación Zod para inputs del sistema
**Exports:** CreateProjectSchema, CreateProjectInput, UpdateProjectStatusSchema, UpdateProjectStatusInput, UpdateProjectSchema, UpdateProjectInput, CreateTaskSchema, CreateTaskInput, UpdateTaskStatusSchema, UpdateTaskStatusInput, DesbloquearTareaSchema, DesbloquearTareaInput, CreateBloqueoSchema, CreateBloqueoInput, ResolveBloqueoSchema, ResolveBloqueoInput, CreateRiesgoSchema, CreateRiesgoInput, CreateComentarioSchema, CreateComentarioInput, LoginSchema, LoginInput, SemaforoItemManualSchema, SemaforoAbreviadoSchema, SemaforoAbreviadoInput

## Stores Zustand

### `src/stores/authStore.ts`
@file Zustand store para estado de autenticación
**Exports:** useAuthStore

### `src/stores/projectStore.ts`
@file Zustand store para cache de proyectos
React Query maneja el fetching; este store maneja optimistic updates
**Exports:** useProjectStore

### `src/stores/uiStore.ts`
@file Zustand store para estado de UI (modales, filtros, etc.)
**Exports:** useUIStore

