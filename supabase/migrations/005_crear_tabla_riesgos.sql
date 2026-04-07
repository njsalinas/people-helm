-- ============================================================
-- Migration 005: Tabla riesgos
-- Depende de: 001_usuarios, 002_proyectos
-- ============================================================

CREATE TABLE IF NOT EXISTS riesgos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,

  descripcion TEXT NOT NULL,
  probabilidad VARCHAR(50) NOT NULL
    CHECK (probabilidad IN ('Alta', 'Media', 'Baja')),
  impacto VARCHAR(50) NOT NULL
    CHECK (impacto IN ('Alto', 'Medio', 'Bajo')),

  -- Prioridad calculada automáticamente:
  -- Alta/Alto=1, Alta/Medio=2, Alta/Bajo=3, Media/Alto=2, Media/Medio=3,
  -- Media/Bajo=4, Baja/Alto=3, Baja/Medio=4, Baja/Bajo=5
  prioridad INTEGER NOT NULL CHECK (prioridad >= 1 AND prioridad <= 5),

  plan_mitigacion TEXT,
  estado VARCHAR(50) NOT NULL DEFAULT 'Identificado'
    CHECK (estado IN ('Identificado', 'Monitoreado', 'Mitigado', 'Cerrado')),

  fecha_identificacion TIMESTAMPTZ DEFAULT now(),
  fecha_cierre TIMESTAMPTZ,

  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Función para calcular prioridad de riesgo automáticamente
CREATE OR REPLACE FUNCTION calcular_prioridad_riesgo(
  p_probabilidad VARCHAR,
  p_impacto VARCHAR
) RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN p_probabilidad = 'Alta'  AND p_impacto = 'Alto'  THEN 1
    WHEN p_probabilidad = 'Alta'  AND p_impacto = 'Medio' THEN 2
    WHEN p_probabilidad = 'Media' AND p_impacto = 'Alto'  THEN 2
    WHEN p_probabilidad = 'Alta'  AND p_impacto = 'Bajo'  THEN 3
    WHEN p_probabilidad = 'Media' AND p_impacto = 'Medio' THEN 3
    WHEN p_probabilidad = 'Baja'  AND p_impacto = 'Alto'  THEN 3
    WHEN p_probabilidad = 'Media' AND p_impacto = 'Bajo'  THEN 4
    WHEN p_probabilidad = 'Baja'  AND p_impacto = 'Medio' THEN 4
    ELSE 5
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para auto-calcular prioridad
CREATE OR REPLACE FUNCTION set_prioridad_riesgo()
RETURNS TRIGGER AS $$
BEGIN
  NEW.prioridad := calcular_prioridad_riesgo(NEW.probabilidad, NEW.impacto);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER riesgos_calcular_prioridad
  BEFORE INSERT OR UPDATE OF probabilidad, impacto ON riesgos
  FOR EACH ROW EXECUTE FUNCTION set_prioridad_riesgo();

-- Índices
CREATE INDEX IF NOT EXISTS idx_riesgos_proyecto ON riesgos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_riesgos_estado ON riesgos(estado);
CREATE INDEX IF NOT EXISTS idx_riesgos_prioridad ON riesgos(prioridad);

-- Trigger updated_at
CREATE TRIGGER riesgos_updated_at
  BEFORE UPDATE ON riesgos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE riesgos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_ven_riesgos" ON riesgos
  FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "crear_riesgos" ON riesgos
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Gerente', 'Líder Area'))
  );

CREATE POLICY "actualizar_riesgos" ON riesgos
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
  );
