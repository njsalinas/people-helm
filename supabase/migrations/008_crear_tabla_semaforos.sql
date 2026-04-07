-- ============================================================
-- Migration 008: Tabla semaforos
-- Depende de: 001_usuarios
-- ============================================================

CREATE TABLE IF NOT EXISTS semaforos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  anio INTEGER NOT NULL CHECK (anio >= 2024),

  -- Semáforo completo (auto-generado)
  -- Estructura: { verde: [{id, nombre, area, comentario}], amarillo: [...], rojo: [...] }
  contenido_automatico JSONB,

  -- Semáforo abreviado (selección manual)
  -- Estructura: { verde: [{area, categoria, proyecto, detalle, indicadores}], ... }
  contenido_manual JSONB,

  -- Comentarios ejecutivos por color
  comentario_ejecutivo_verde TEXT,
  comentario_ejecutivo_amarillo TEXT,
  comentario_ejecutivo_rojo TEXT,

  estado VARCHAR(50) NOT NULL DEFAULT 'Borrador'
    CHECK (estado IN ('Borrador', 'Publicado', 'Archivado')),

  created_by UUID NOT NULL REFERENCES usuarios(id),
  publicado_by UUID REFERENCES usuarios(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  publicado_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(mes, anio)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_semaforos_mes_anio ON semaforos(mes, anio);
CREATE INDEX IF NOT EXISTS idx_semaforos_estado ON semaforos(estado);

-- Trigger updated_at
CREATE TRIGGER semaforos_updated_at
  BEFORE UPDATE ON semaforos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE semaforos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_ven_semaforos" ON semaforos
  FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "gerentes_gestionan_semaforos" ON semaforos
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
  );
