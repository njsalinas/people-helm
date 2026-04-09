# API Reference

*Auto-generated — do not edit manually*

## Next.js API Routes

### `/auth`
@file API Route: /api/auth
GET - Retorna el usuario autenticado actual

### `/health`
@file API Route: /api/health
GET - Health check del servidor

### `/me`


### `/notificaciones/config/[id]`
@file API Route: /api/notificaciones/config/[id]
PATCH - Activar / desactivar una configuración de notificación

### `/notificaciones/config`
@file API Route: /api/notificaciones/config
GET - Obtener configuración de notificaciones del usuario autenticado

### `/proyectos/[id]/bloqueos`
@file API Route: /api/proyectos/[id]/bloqueos
POST - Registrar bloqueo en un proyecto

### `/proyectos/[id]/estado`
@file API Route: /api/proyectos/[id]/estado
PATCH - Actualizar estado de un proyecto

### `/proyectos/[id]/riesgos`
@file API Route: /api/proyectos/[id]/riesgos
GET  - Listar riesgos del proyecto
POST - Registrar nuevo riesgo

### `/proyectos/[id]`
@file API Route: /api/proyectos/[id]
GET    - Obtener proyecto por ID con joins completos
PATCH  - Actualizar campos del proyecto (edición inline)
DELETE - Eliminar proyecto (solo Gerente)

### `/proyectos/[id]/subproyectos`
@file API Route: /api/proyectos/[id]/subproyectos
POST - Crear subproyecto
GET - Listar subproyectos (opcional)

### `/proyectos/[id]/tareas`
@file API Route: /api/proyectos/[id]/tareas
GET  - Listar tareas del proyecto
POST - Crear tarea

### `/proyectos`
@file API Route: /api/proyectos
GET  - Listar proyectos
POST - Crear proyecto (invoca Supabase Function)

### `/reporteria/semaforo/[id]`
@file API Route: /api/reporteria/semaforo/[id]
GET   - Obtener semáforo por ID
PATCH - Actualizar comentarios / publicar semáforo

### `/reporteria/semaforo`
@file API Route: /api/reporteria/semaforo
GET  - Listar semáforos (con paginación)
POST - Generar semáforo del mes actual (invoca Supabase Function)

### `/riesgos/[id]/resolver`
@file API Route: /api/riesgos/[id]/resolver
PATCH - Cambiar estado del riesgo a Mitigado o Cerrado

### `/tareas/[id]/desbloquear`
@file API Route: /api/tareas/[id]/desbloquear
PATCH - Desbloquear tarea registrando razón y metadata

### `/tareas/[id]/desbloqueos`
@file API Route: /api/tareas/[id]/desbloqueos
GET - Obtener historial de desbloqueos de una tarea

### `/tareas/[id]/estado`
@file API Route: /api/tareas/[id]/estado
PATCH - Actualizar estado/avance de una tarea

### `/tareas/proyecto`
@file API Route: /api/tareas/proyecto?id=xyz
GET - Obtener tareas de un proyecto específico

### `/tareas`
@file API Route: /api/tareas
GET - Obtener todas las tareas (para Kanban Global)

### `/usuarios`


## Supabase Functions

### `actualizar-estado`
Supabase Function: actualizar-estado
PATCH - Actualiza estado de un proyecto con validaciones y notificaciones

### `actualizar-tarea-estado`
Supabase Function: actualizar-tarea-estado
PATCH - Actualiza estado y/o avance de una tarea

### `crear-proyecto`
Supabase Function: crear-proyecto
POST - Crea un nuevo proyecto con validaciones y notificaciones

### `crear-tarea`
Supabase Function: crear-tarea
POST - Crea una nueva tarea y notifica al responsable

### `enviar-notificacion`
Supabase Function: enviar-notificacion
POST - Envía notificaciones (alerta visual via Realtime + email via Resend)

### `exportar-pdf`
Supabase Function: exportar-pdf
POST - Genera y exporta un PDF del semáforo o detalle de proyecto

### `generar-semaforo`
Supabase Function: generar-semaforo
POST - Genera el semáforo mensual automático
Ejecutada vía cron el 1º de cada mes a las 22:00 UTC, o on-demand

### `recalcular-avance-proyecto`
Supabase Function: recalcular-avance-proyecto
POST - Recalcula el % avance del proyecto basado en promedio de tareas

### `registrar-bloqueo`
Supabase Function: registrar-bloqueo
POST - Registra un bloqueo en un proyecto y notifica al gerente

