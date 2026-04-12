-- ============================================================
-- Migration 019: Agregar subproyecto_id a tareas
-- Permite que las tareas pertenezcan a un subproyecto específico
-- Depende de: 018_crear_tabla_subproyectos
-- ============================================================

-- Agregar columna nullable para vincular tareas a subproyectos
ALTER TABLE tareas
  ADD COLUMN subproyecto_id UUID
    REFERENCES subproyectos(id) ON DELETE CASCADE;

-- Índice para queries por subproyecto
CREATE INDEX IF NOT EXISTS idx_tareas_subproyecto
  ON tareas(subproyecto_id);

-- Nota importante sobre integridad referencial:
-- Una tarea que tiene subproyecto_id debe cumplir que el proyecto_id
-- sea igual al proyecto_id del subproyecto. Esta validación se debe
-- hacer en la capa de API antes del INSERT, no en un CHECK constraint,
-- porque PostgreSQL no permite CHECKs que referencien otras tablas de
-- forma dinámica. Ver validación en src/app/api/subproyectos/[id]/tareas/route.ts
