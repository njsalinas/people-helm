-- ============================================================
-- Migration 007: Tabla historial_cambios
-- Depende de: 001_usuarios, 002_proyectos
-- ============================================================

CREATE TABLE IF NOT EXISTS historial_cambios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,

  entidad_tipo VARCHAR(50) NOT NULL
    CHECK (entidad_tipo IN ('Proyecto', 'Tarea', 'Bloqueo', 'Riesgo', 'Estado', 'Avance', 'Comentario')),

  campo_afectado VARCHAR(100),
  valor_anterior TEXT,
  valor_nuevo TEXT,

  comentario TEXT,

  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historial_proyecto ON historial_cambios(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_historial_created_at ON historial_cambios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historial_entidad ON historial_cambios(entidad_tipo);
CREATE INDEX IF NOT EXISTS idx_historial_created_by ON historial_cambios(created_by);

-- Row Level Security
ALTER TABLE historial_cambios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_ven_historial" ON historial_cambios
  FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

-- Solo insertable via triggers/functions (no UPDATE ni DELETE)
CREATE POLICY "insertar_historial" ON historial_cambios
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

-- ============================================================
-- Trigger: Auditoría automática de cambios en proyectos
-- ============================================================
CREATE OR REPLACE FUNCTION log_cambios_proyecto()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar cambio de estado
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO historial_cambios (proyecto_id, entidad_tipo, campo_afectado, valor_anterior, valor_nuevo, created_by)
    VALUES (NEW.id, 'Estado', 'estado', OLD.estado, NEW.estado, NEW.updated_by);
  END IF;

  -- Registrar cambio de porcentaje
  IF OLD.porcentaje_avance IS DISTINCT FROM NEW.porcentaje_avance THEN
    INSERT INTO historial_cambios (proyecto_id, entidad_tipo, campo_afectado, valor_anterior, valor_nuevo, created_by)
    VALUES (NEW.id, 'Avance', 'porcentaje_avance', OLD.porcentaje_avance::TEXT, NEW.porcentaje_avance::TEXT, NEW.updated_by);
  END IF;

  -- Registrar cambio de responsable
  IF OLD.responsable_primario IS DISTINCT FROM NEW.responsable_primario THEN
    INSERT INTO historial_cambios (proyecto_id, entidad_tipo, campo_afectado, valor_anterior, valor_nuevo, created_by)
    VALUES (NEW.id, 'Proyecto', 'responsable_primario', OLD.responsable_primario::TEXT, NEW.responsable_primario::TEXT, NEW.updated_by);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_proyectos
  AFTER UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION log_cambios_proyecto();
