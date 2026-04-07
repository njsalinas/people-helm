-- ============================================================
-- Migration 006: Tabla comentarios
-- Depende de: 001_usuarios, 002_proyectos
-- ============================================================

CREATE TABLE IF NOT EXISTS comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,

  contenido TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'Comentario'
    CHECK (tipo IN ('Comentario', 'Decisión', 'Bloqueo', 'Avance', 'Riesgo')),

  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Para threading (comentarios anidados)
  comentario_padre UUID REFERENCES comentarios(id) ON DELETE CASCADE,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comentarios_proyecto ON comentarios(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_tipo ON comentarios(tipo);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_by ON comentarios(created_by);
CREATE INDEX IF NOT EXISTS idx_comentarios_padre ON comentarios(comentario_padre);

-- Trigger updated_at
CREATE TRIGGER comentarios_updated_at
  BEFORE UPDATE ON comentarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_ven_comentarios" ON comentarios
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

CREATE POLICY "crear_comentarios" ON comentarios
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "editar_comentario_propio" ON comentarios
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
  );
