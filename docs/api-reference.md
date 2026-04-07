# API Reference — People Helm

Todos los endpoints requieren sesión autenticada (cookie `sb-*`). Las respuestas usan JSON.

---

## Proyectos

### `GET /api/proyectos`
Lista proyectos desde `vista_semaforo_proyectos`.

**Query params:** `estado`, `area`, `foco`, `color_semaforo`

**Response 200:**
```json
{ "data": [ VistaSemaforoProyecto ] }
```

---

### `POST /api/proyectos`
Crea un nuevo proyecto.

**Rol requerido:** Gerente o Líder Area

**Body:**
```json
{
  "nombre": "string (3-100)",
  "tipo": "Proyecto | Proceso | Iniciativa",
  "foco_estrategico": "Eficiencia | ...",
  "area_responsable": "Reclutamiento | ...",
  "categoria": "string",
  "fecha_inicio": "YYYY-MM-DD",
  "fecha_fin": "YYYY-MM-DD",
  "descripcion": "string (opcional)"
}
```

**Response 201:** `{ "data": DbProyecto, "mensaje": "Proyecto creado" }`  
**Response 409:** `{ "error": "Ya existe un proyecto con ese nombre en el área" }`

---

### `PATCH /api/proyectos/[id]/estado`
Cambia el estado de un proyecto.

**Rol requerido:** Gerente o Líder Area

**Body:**
```json
{
  "estado": "En Progreso | Bloqueado | En Riesgo | Finalizado | Cancelado",
  "comentario": "string (mín. 10 chars)"
}
```

**Restricción:** No se puede pasar a `Finalizado` si hay bloqueos activos.

---

## Tareas

### `GET /api/proyectos/[id]/tareas`
Lista tareas del proyecto con responsable + bloqueos.

### `POST /api/proyectos/[id]/tareas`
Crea tarea. **Body:** `{ nombre, estado, prioridad, responsable_id?, fecha_inicio?, fecha_fin? }`

### `PATCH /api/tareas/[id]/estado`
Actualiza estado de tarea. Registra `fecha_fin_real` si nuevo estado es `Finalizado`.

---

## Bloqueos

### `POST /api/proyectos/[id]/bloqueos`
Registra bloqueo. Automáticamente pone el proyecto en estado `Bloqueado` (trigger SQL).

**Body:** `{ tipo, descripcion (mín. 10), accion_requerida (mín. 5) }`

---

## Riesgos

### `GET /api/proyectos/[id]/riesgos`
### `POST /api/proyectos/[id]/riesgos`

**Body:** `{ descripcion, probabilidad: Baja|Media|Alta, impacto: Bajo|Medio|Alto }`

La prioridad (`Baja|Media|Alta|Crítico`) se calcula automáticamente por trigger SQL.

---

## Reportería — Semáforo

### `GET /api/reporteria/semaforo`
Lista semáforos. **Query:** `anio`, `limit` (default 12).

### `POST /api/reporteria/semaforo`
Genera semáforo del mes. **Rol:** Gerente. Invoca la Supabase Function `generar-semaforo`.

**Body (opcional):** `{ mes: number, anio: number }`

### `GET /api/reporteria/semaforo/[id]`
Obtiene un semáforo por ID.

### `PATCH /api/reporteria/semaforo/[id]`
Actualiza comentarios ejecutivos o publica el semáforo.

**Body:** `{ comentario_ejecutivo_verde?, comentario_ejecutivo_amarillo?, comentario_ejecutivo_rojo?, contenido_manual?, estado? }`

---

## Notificaciones

### `GET /api/notificaciones/config`
Configuración de notificaciones del usuario autenticado.

### `PATCH /api/notificaciones/config/[id]`
Activa o desactiva una preferencia.

**Body:** `{ activo: boolean }`

---

## Códigos de error comunes

| Código | Significado |
|--------|------------|
| 400 | Datos inválidos (Zod parse failed) |
| 401 | No autenticado |
| 403 | Sin permisos (rol insuficiente) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (nombre duplicado) |
| 500 | Error interno / Supabase error |
