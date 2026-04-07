-- ============================================================
-- Migration 003: Tabla tareas
-- Depende de: 001_usuarios, 002_proyectos
-- ============================================================

CREATE TABLE IF NOT EXISTS tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,

  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,

  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'En Curso', 'Finalizado', 'Bloqueado')),
  porcentaje_avance INTEGER DEFAULT 0
    CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),

  responsable_id UUID NOT NULL REFERENCES usuarios(id),

  fecha_inicio DATE NOT NULL,
  fecha_fin_planificada DATE NOT NULL,
  fecha_fin_real DATE,

  prioridad INTEGER DEFAULT 3
    CHECK (prioridad >= 1 AND prioridad <= 5),

  tarea_padre UUID REFERENCES tareas(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES usuarios(id),
  updated_by UUID NOT NULL REFERENCES usuarios(id),

  CONSTRAINT tarea_fecha_fin_mayor_inicio CHECK (fecha_fin_planificada >= fecha_inicio),
  UNIQUE(proyecto_id, nombre)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tareas_proyecto ON tareas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_responsable ON tareas(responsable_id);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_fin ON tareas(fecha_fin_planificada);
CREATE INDEX IF NOT EXISTS idx_tareas_padre ON tareas(tarea_padre);

-- Trigger updated_at
CREATE TRIGGER tareas_updated_at
  BEFORE UPDATE ON tareas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_ven_tareas" ON tareas
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

CREATE POLICY "responsables_editan_tareas" ON tareas
  FOR UPDATE
  USING (
    responsable_id = auth.uid()
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
    OR EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = tareas.proyecto_id
        AND p.responsable_primario = auth.uid()
    )
  );

CREATE POLICY "crear_tareas" ON tareas
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Gerente', 'Líder Area'))
  );
