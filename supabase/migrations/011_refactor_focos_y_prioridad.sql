-- ============================================================
-- Migration 011: Refactorizar focos estratégicos (4 → 3)
--                Responsable opcional en tareas
--                Campos de bloqueo en tareas
-- Depende de: 010_crear_indices_y_triggers.sql
-- ============================================================

-- ============================================================
-- SECCIÓN 1: Migrar datos existentes: mapeo automático 4 focos → 3 focos
-- ============================================================
-- Mapeo definido:
--   'Desarrollo Organizacional' → 'Alta prioridad (estratégico)'
--   'Gestión de Personas'       → 'Alta prioridad (estratégico)'
--   'Cultura de Seguridad'      → 'Prioridad media (habilitadores)'
--   'Comunicaciones'            → 'Prioridad media (habilitadores)'

UPDATE proyectos
SET foco_estrategico = CASE
  WHEN foco_estrategico = 'Desarrollo Organizacional' THEN 'Alta prioridad (estratégico)'
  WHEN foco_estrategico = 'Gestión de Personas' THEN 'Alta prioridad (estratégico)'
  WHEN foco_estrategico = 'Cultura de Seguridad' THEN 'Prioridad media (habilitadores)'
  WHEN foco_estrategico = 'Comunicaciones' THEN 'Prioridad media (habilitadores)'
  ELSE 'Prioridad operacional'
END
WHERE foco_estrategico IN (
  'Desarrollo Organizacional',
  'Gestión de Personas',
  'Cultura de Seguridad',
  'Comunicaciones'
);

-- ============================================================
-- SECCIÓN 1B: Actualizar constraint de foco_estrategico
-- ============================================================

ALTER TABLE proyectos
DROP CONSTRAINT proyectos_foco_estrategico_check;

ALTER TABLE proyectos
ADD CONSTRAINT proyectos_foco_estrategico_check
CHECK (foco_estrategico IN (
  'Alta prioridad (estratégico)',
  'Prioridad media (habilitadores)',
  'Prioridad operacional'
));

-- ============================================================
-- SECCIÓN 1C: Agregar índice para queries de filtrado de prioridad
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_proyectos_prioridad ON proyectos(prioridad);

-- ============================================================
-- SECCIÓN 2: Permitir responsable_id NULL en tareas (mejora #15)
-- ============================================================

-- Primero, eliminar constraint existente
ALTER TABLE tareas
DROP CONSTRAINT tareas_responsable_id_fkey;

-- Hacer responsable_id nullable
ALTER TABLE tareas
ALTER COLUMN responsable_id DROP NOT NULL;

-- Re-crear constraint con ON DELETE SET NULL
ALTER TABLE tareas
ADD CONSTRAINT tareas_responsable_id_fkey
FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- ============================================================
-- SECCIÓN 2B: Trigger para asignar responsable automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION asignar_responsable_tarea_auto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.responsable_id IS NULL THEN
    NEW.responsable_id := NEW.created_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS tareas_asignar_responsable_auto ON tareas;

CREATE TRIGGER tareas_asignar_responsable_auto
  BEFORE INSERT ON tareas
  FOR EACH ROW EXECUTE FUNCTION asignar_responsable_tarea_auto();

-- ============================================================
-- SECCIÓN 2C: Actualizar tareas existentes sin responsable
-- ============================================================

UPDATE tareas
SET responsable_id = created_by
WHERE responsable_id IS NULL;

-- ============================================================
-- SECCIÓN 3: Agregar campos de bloqueo a nivel tarea
-- ============================================================

-- Almacena: ¿por qué estaba bloqueado?
ALTER TABLE tareas
ADD COLUMN IF NOT EXISTS bloqueado_razon TEXT;

-- Almacena: ¿cómo se desbloqueó? (comentario de desbloqueo)
ALTER TABLE tareas
ADD COLUMN IF NOT EXISTS desbloqueado_razon TEXT;

-- Quién lo desbloqueó
ALTER TABLE tareas
ADD COLUMN IF NOT EXISTS desbloqueado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- Cuándo se desbloqueó
ALTER TABLE tareas
ADD COLUMN IF NOT EXISTS fecha_desbloqueado TIMESTAMPTZ;
