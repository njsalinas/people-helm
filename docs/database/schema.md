# Database Schema

*Auto-generated — see `scripts/docs-generator.js` para regenerar*

---

## Tablas

### usuarios
Extiende `auth.users` de Supabase. Se crea automáticamente vía trigger al registrar un usuario.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | Mismo UUID que auth.users |
| nombre | TEXT | Nombre completo |
| email | TEXT UNIQUE | Email del usuario |
| rol | TEXT | Gerente / Líder Area / Espectador |
| area_responsable | TEXT | Área asignada (nullable) |
| activo | BOOLEAN | Si puede iniciar sesión |
| created_at | TIMESTAMPTZ | Fecha creación |
| updated_at | TIMESTAMPTZ | Última modificación |

---

### proyectos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | Identificador único |
| nombre | TEXT | Nombre del proyecto |
| descripcion | TEXT | Descripción detallada |
| tipo | TEXT | Proyecto / Proceso / Iniciativa |
| estado | TEXT | Planificado / En Progreso / Bloqueado / En Riesgo / Finalizado / Cancelado |
| foco_estrategico | TEXT | Eficiencia / Cultura / Talento / Cumplimiento / Tecnología |
| area_responsable | TEXT | Reclutamiento / Desarrollo / Clima / etc. |
| categoria | TEXT | Subcategoría del área |
| porcentaje_avance | INTEGER | 0–100 |
| fecha_inicio | DATE | Fecha de inicio planificada |
| fecha_fin | DATE | Fecha de fin planificada |
| fecha_fin_real | DATE | Fecha de fin real (nullable) |
| responsable_id | UUID FK→usuarios | Responsable del proyecto |
| created_by | UUID FK→usuarios | Creador |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Constraints:** `fecha_fin > fecha_inicio`, UNIQUE(nombre, area_responsable)

---

### tareas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| proyecto_id | UUID FK→proyectos | Proyecto padre |
| nombre | TEXT | Nombre de la tarea |
| descripcion | TEXT | |
| estado | TEXT | Pendiente / En Curso / Finalizado / Bloqueado |
| prioridad | TEXT | Baja / Media / Alta / Crítica |
| porcentaje_avance | INTEGER | 0–100 |
| responsable_id | UUID FK→usuarios | |
| tarea_padre | UUID FK→tareas | Para subtareas |
| fecha_inicio | DATE | |
| fecha_fin | DATE | |
| fecha_fin_real | DATE | |
| orden | INTEGER | Para ordenar en Kanban |
| created_by | UUID FK→usuarios | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### bloqueos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| proyecto_id | UUID FK→proyectos | |
| tipo | TEXT | Técnico / Recursos / Decisión / Externo / Otro |
| descripcion | TEXT | Descripción del bloqueo |
| accion_requerida | TEXT | Qué se necesita para desbloquear |
| responsable_resolucion | UUID FK→usuarios | |
| estado | TEXT | Activo / Resuelto / Escalado |
| fecha_resolucion | DATE | |
| created_by | UUID FK→usuarios | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Trigger:** Al INSERT, cambia `proyectos.estado` a 'Bloqueado'.

---

### riesgos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| proyecto_id | UUID FK→proyectos | |
| descripcion | TEXT | |
| probabilidad | TEXT | Baja / Media / Alta |
| impacto | TEXT | Bajo / Medio / Alto |
| prioridad | TEXT | Baja / Media / Alta / Crítico (calculado) |
| estado | TEXT | Identificado / Mitigado / Materializado |
| plan_mitigacion | TEXT | |
| created_by | UUID FK→usuarios | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Trigger:** `calcular_prioridad_riesgo()` auto-asigna prioridad.

---

### semaforos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | |
| mes | INTEGER | 1–12 |
| anio | INTEGER | 2025, 2026... |
| estado | TEXT | Borrador / Publicado / Archivado |
| contenido_automatico | JSONB | { verde: [], amarillo: [], rojo: [] } |
| contenido_manual | JSONB | Versión editada por el Gerente |
| comentario_ejecutivo_verde | TEXT | |
| comentario_ejecutivo_amarillo | TEXT | |
| comentario_ejecutivo_rojo | TEXT | |
| created_by | UUID FK→usuarios | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Constraint:** UNIQUE(mes, anio)

---

## Vistas

### vista_semaforo_proyectos
Proyectos con color calculado, responsable, bloqueos activos.

```sql
SELECT
  p.*,
  u.nombre as responsable_nombre,
  u.email as responsable_email,
  COUNT(b.id) FILTER (WHERE b.estado = 'Activo') as bloqueos_activos,
  MAX(EXTRACT(EPOCH FROM (NOW() - b.created_at))/86400)
    FILTER (WHERE b.estado = 'Activo') as dias_bloqueo_max,
  calcular_color_semaforo(...) as color_semaforo
FROM proyectos p
LEFT JOIN usuarios u ON u.id = p.responsable_id
LEFT JOIN bloqueos b ON b.proyecto_id = p.id
GROUP BY p.id, u.id
```

### vista_bloqueos_activos
Bloqueos no resueltos con datos de proyecto y responsable.

---

## Funciones SQL

### calcular_color_semaforo(estado, bloqueos_activos, dias_bloqueo_max)
Retorna: `'VERDE' | 'AMARILLO' | 'ROJO'`

| Condición | Color |
|-----------|-------|
| estado IN ('Bloqueado','En Riesgo','Cancelado') | ROJO |
| dias_bloqueo_max > 5 | ROJO |
| dias_bloqueo_max BETWEEN 3 AND 5 | AMARILLO |
| resto | VERDE |

### calcular_prioridad_riesgo(probabilidad, impacto)
Matriz probabilidad × impacto → prioridad.

### recalcular_avance_proyecto(proyecto_id)
Recalcula `porcentaje_avance` como AVG de tareas hijas.
