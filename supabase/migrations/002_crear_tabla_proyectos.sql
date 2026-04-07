-- ============================================================
-- Migration 002: Tabla proyectos
-- Depende de: 001_usuarios
-- ============================================================

CREATE TABLE IF NOT EXISTS proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Proyecto', 'Línea')),
  subtipo VARCHAR(50) CHECK (subtipo IN ('Operativo', 'Campaña', 'Estratégico')),

  foco_estrategico VARCHAR(100) NOT NULL
    CHECK (foco_estrategico IN (
      'Desarrollo Organizacional',
      'Gestión de Personas',
      'Cultura de Seguridad',
      'Comunicaciones'
    )),

  area_responsable VARCHAR(100) NOT NULL
    CHECK (area_responsable IN ('DO', 'Gestión de Personas', 'SSO', 'Comunicaciones')),

  categoria VARCHAR(100) NOT NULL,

  responsable_primario UUID NOT NULL REFERENCES usuarios(id),
  descripcion_ejecutiva TEXT,
  objetivo TEXT,
  resultado_esperado TEXT,

  fecha_inicio DATE NOT NULL,
  fecha_fin_planificada DATE NOT NULL,
  fecha_fin_real DATE,

  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'En Curso', 'En Riesgo', 'Bloqueado', 'Finalizado')),
  porcentaje_avance INTEGER DEFAULT 0
    CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),

  prioridad INTEGER DEFAULT 3
    CHECK (prioridad >= 1 AND prioridad <= 5),
  requiere_escalamiento BOOLEAN DEFAULT FALSE,

  proyecto_padre UUID REFERENCES proyectos(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES usuarios(id),
  updated_by UUID NOT NULL REFERENCES usuarios(id),

  CONSTRAINT fecha_fin_mayor_inicio CHECK (fecha_fin_planificada > fecha_inicio),
  UNIQUE(nombre, area_responsable)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_area ON proyectos(area_responsable);
CREATE INDEX IF NOT EXISTS idx_proyectos_foco ON proyectos(foco_estrategico);
CREATE INDEX IF NOT EXISTS idx_proyectos_responsable ON proyectos(responsable_primario);
CREATE INDEX IF NOT EXISTS idx_proyectos_categoria ON proyectos(categoria);
CREATE INDEX IF NOT EXISTS idx_proyectos_fecha_fin ON proyectos(fecha_fin_planificada);
CREATE INDEX IF NOT EXISTS idx_proyectos_padre ON proyectos(proyecto_padre);

-- Trigger updated_at
CREATE TRIGGER proyectos_updated_at
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

-- Gerentes ven todos los proyectos
CREATE POLICY "gerentes_ven_proyectos" ON proyectos
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
  );

-- Líderes ven todos los proyectos (lectura), editan sus propios
CREATE POLICY "lideres_ven_proyectos" ON proyectos
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Líder Area', 'Espectador'))
  );

CREATE POLICY "lideres_editan_propios" ON proyectos
  FOR UPDATE
  USING (
    responsable_primario = auth.uid()
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
  );

CREATE POLICY "lideres_crean_proyectos" ON proyectos
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Gerente', 'Líder Area'))
  );
