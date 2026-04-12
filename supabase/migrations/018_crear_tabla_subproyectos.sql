-- ============================================================
-- Migration 018: Crear tabla subproyectos separada
-- Refactorizar subproyectos de proyectos.proyecto_padre
-- Depende de: 002_proyectos, 001_usuarios, 015_areas
-- ============================================================

-- ============================================================
-- Tabla subproyectos
-- ============================================================

CREATE TABLE IF NOT EXISTS subproyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación obligatoria al proyecto raíz
  proyecto_id UUID NOT NULL
    REFERENCES proyectos(id) ON DELETE CASCADE,

  -- Campos idénticos a proyectos (sin proyecto_padre, sin tipo fijo)
  nombre VARCHAR(200) NOT NULL,
  subtipo VARCHAR(50)
    CHECK (subtipo IN ('Operativo', 'Campaña', 'Estratégico')),

  foco_estrategico VARCHAR(100) NOT NULL
    CHECK (foco_estrategico IN (
      'Alta prioridad (estratégico)',
      'Prioridad media (habilitadores)',
      'Prioridad operacional'
    )),

  area_responsable_id UUID NOT NULL
    REFERENCES areas_responsables(id) ON DELETE RESTRICT,

  categoria VARCHAR(100) NOT NULL,

  responsable_primario UUID NOT NULL
    REFERENCES usuarios(id) ON DELETE RESTRICT,

  descripcion_ejecutiva TEXT,
  objetivo TEXT,
  resultado_esperado TEXT,

  fecha_inicio DATE NOT NULL,
  fecha_fin_planificada DATE NOT NULL,
  fecha_fin_real DATE,

  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN (
      'Pendiente', 'En Curso', 'En Riesgo', 'Bloqueado', 'Finalizado'
    )),

  porcentaje_avance INTEGER DEFAULT 0
    CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),

  prioridad INTEGER DEFAULT 3
    CHECK (prioridad >= 1 AND prioridad <= 5),

  requiere_escalamiento BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL
    REFERENCES usuarios(id) ON DELETE RESTRICT,
  updated_by UUID NOT NULL
    REFERENCES usuarios(id) ON DELETE RESTRICT,

  -- Constraints
  CONSTRAINT subproyecto_fecha_fin_mayor_inicio
    CHECK (fecha_fin_planificada > fecha_inicio),

  UNIQUE (proyecto_id, nombre)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subproyectos_proyecto
  ON subproyectos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_subproyectos_estado
  ON subproyectos(estado);
CREATE INDEX IF NOT EXISTS idx_subproyectos_responsable
  ON subproyectos(responsable_primario);
CREATE INDEX IF NOT EXISTS idx_subproyectos_area
  ON subproyectos(area_responsable_id);
CREATE INDEX IF NOT EXISTS idx_subproyectos_fecha_fin
  ON subproyectos(fecha_fin_planificada);

-- Trigger updated_at
DROP TRIGGER IF EXISTS subproyectos_updated_at ON subproyectos;
CREATE TRIGGER subproyectos_updated_at
  BEFORE UPDATE ON subproyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security - subproyectos
-- ============================================================

ALTER TABLE subproyectos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gerentes_gestionan_subproyectos" ON subproyectos;
-- Gerentes ven y gestionan todos los subproyectos
CREATE POLICY "gerentes_gestionan_subproyectos" ON subproyectos
  FOR ALL
  USING (public.get_mi_rol() = 'Gerente');

DROP POLICY IF EXISTS "lideres_ven_subproyectos_area" ON subproyectos;
-- Líderes ven subproyectos de su área
CREATE POLICY "lideres_ven_subproyectos_area" ON subproyectos
  FOR SELECT
  USING (
    public.get_mi_rol() = 'Gerente'
    OR area_responsable_id = public.get_mi_area()
  );

DROP POLICY IF EXISTS "crear_subproyectos" ON subproyectos;
-- Líderes y Gerentes pueden crear subproyectos
CREATE POLICY "crear_subproyectos" ON subproyectos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
        AND rol IN ('Gerente', 'Líder Area')
    )
  );

DROP POLICY IF EXISTS "editar_subproyectos" ON subproyectos;
-- El responsable primario o Gerente pueden editar
CREATE POLICY "editar_subproyectos" ON subproyectos
  FOR UPDATE
  USING (
    responsable_primario = auth.uid()
    OR public.get_mi_rol() = 'Gerente'
  );

DROP POLICY IF EXISTS "eliminar_subproyectos" ON subproyectos;
-- Solo Gerente puede eliminar
CREATE POLICY "eliminar_subproyectos" ON subproyectos
  FOR DELETE
  USING (public.get_mi_rol() = 'Gerente');
