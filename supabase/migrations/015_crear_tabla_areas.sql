-- ============================================================
-- Migration 015: Crear tabla areas_responsables
-- Normaliza area_responsable de VARCHAR a tabla separada
-- ============================================================

CREATE TABLE IF NOT EXISTS areas_responsables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  es_gerencia BOOLEAN DEFAULT FALSE,  -- flag para identificar área de Gerencia
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice en nombre para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_areas_nombre ON areas_responsables(nombre);
CREATE INDEX IF NOT EXISTS idx_areas_activo ON areas_responsables(activo);

DROP TRIGGER IF EXISTS areas_updated_at ON areas_responsables;

-- Trigger para updated_at
CREATE TRIGGER areas_updated_at
  BEFORE UPDATE ON areas_responsables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE areas_responsables ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "todos_ven_areas" ON areas_responsables;
-- Todos pueden ver áreas activas
CREATE POLICY "todos_ven_areas" ON areas_responsables
  FOR SELECT
  USING (activo = TRUE);

DROP POLICY IF EXISTS "gerentes_gestionan_areas" ON areas_responsables;
-- Solo Gerentes pueden hacer CRUD en áreas (si es necesario en futuro)
CREATE POLICY  "gerentes_gestionan_areas" ON areas_responsables
  FOR ALL
  USING (public.get_mi_rol() = 'Gerente');

-- ============================================================
-- Seed: Insertar áreas existentes + nueva "Gerencia"
-- ============================================================

INSERT INTO areas_responsables (nombre, es_gerencia, activo) VALUES
  ('DO', FALSE, TRUE),
  ('Gestión de Personas', FALSE, TRUE),
  ('SSO', FALSE, TRUE),
  ('Comunicaciones', FALSE, TRUE),
  ('Gerencia', TRUE, TRUE)
ON CONFLICT (nombre) DO NOTHING;
