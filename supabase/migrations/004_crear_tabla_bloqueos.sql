-- ============================================================
-- Migration 004: Tabla bloqueos
-- Depende de: 001_usuarios, 002_proyectos
-- ============================================================

CREATE TABLE IF NOT EXISTS bloqueos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,

  descripcion TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL
    CHECK (tipo IN ('Pendiente definición', 'Espera recursos', 'Espera decisión', 'Capacity')),

  accion_requerida VARCHAR(50) NOT NULL
    CHECK (accion_requerida IN ('Informar', 'Seguimiento', 'Decisión', 'Intervención')),

  requiere_escalamiento BOOLEAN DEFAULT FALSE,

  estado VARCHAR(50) NOT NULL DEFAULT 'Activo'
    CHECK (estado IN ('Activo', 'Resuelto', 'Escalado')),

  fecha_registro TIMESTAMPTZ DEFAULT now(),
  fecha_resolucion TIMESTAMPTZ,
  comentario_resolucion TEXT,

  created_by UUID NOT NULL REFERENCES usuarios(id),
  resolved_by UUID REFERENCES usuarios(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_bloqueos_proyecto ON bloqueos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_bloqueos_estado ON bloqueos(estado);
CREATE INDEX IF NOT EXISTS idx_bloqueos_accion ON bloqueos(accion_requerida);
CREATE INDEX IF NOT EXISTS idx_bloqueos_fecha_registro ON bloqueos(fecha_registro);
CREATE INDEX IF NOT EXISTS idx_bloqueos_escalamiento ON bloqueos(requiere_escalamiento);

-- Trigger updated_at
CREATE TRIGGER bloqueos_updated_at
  BEFORE UPDATE ON bloqueos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE bloqueos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_ven_bloqueos" ON bloqueos
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "crear_bloqueos" ON bloqueos
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Gerente', 'Líder Area'))
  );

CREATE POLICY "actualizar_bloqueos" ON bloqueos
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
  );
