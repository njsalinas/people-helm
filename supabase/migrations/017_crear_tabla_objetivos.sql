-- ============================================================
-- Migration 017: Crear tabla objetivos y relación objetivo_proyecto
-- Mantenedor de Objetivos con RBAC por rol
-- ============================================================

-- ============================================================
-- Tabla de Objetivos
-- ============================================================

CREATE TABLE IF NOT EXISTS objetivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  anio INTEGER NOT NULL
    CHECK (anio >= 2020 AND anio <= 2100),
  area_responsable_id UUID NOT NULL
    REFERENCES areas_responsables(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  orden INTEGER DEFAULT 0,
  created_by UUID NOT NULL
    REFERENCES usuarios(id) ON DELETE RESTRICT,
  updated_by UUID NOT NULL
    REFERENCES usuarios(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ  -- soft-delete: NULL = activo
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_objetivos_area ON objetivos(area_responsable_id);
CREATE INDEX IF NOT EXISTS idx_objetivos_anio ON objetivos(anio);
CREATE INDEX IF NOT EXISTS idx_objetivos_status ON objetivos(status);
CREATE INDEX IF NOT EXISTS idx_objetivos_created_by ON objetivos(created_by);
-- Índice parcial para objetivos no archivados
CREATE INDEX IF NOT EXISTS idx_objetivos_activos
  ON objetivos(anio, area_responsable_id)
  WHERE archived_at IS NULL;

DROP TRIGGER IF EXISTS objetivos_updated_at ON objetivos;
-- Trigger updated_at
CREATE TRIGGER objetivos_updated_at
  BEFORE UPDATE ON objetivos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Tabla de relación n:n - Objetivos y Proyectos
-- ============================================================

CREATE TABLE IF NOT EXISTS objetivo_proyecto (
  objetivo_id UUID NOT NULL
    REFERENCES objetivos(id) ON DELETE CASCADE,
  proyecto_id UUID NOT NULL
    REFERENCES proyectos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (objetivo_id, proyecto_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_objetivo_proyecto_proyecto
  ON objetivo_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_objetivo_proyecto_objetivo
  ON objetivo_proyecto(objetivo_id);

-- ============================================================
-- Row Level Security - objetivos
-- ============================================================

ALTER TABLE objetivos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gerentes_crud_objetivos" ON objetivos;
-- Solo Gerentes pueden hacer CRUD en objetivos
CREATE POLICY "gerentes_crud_objetivos" ON objetivos
  FOR ALL
  USING (public.get_mi_rol() = 'Gerente');

DROP POLICY IF EXISTS "lideres_ven_objetivos_area" ON objetivos;
-- Líderes pueden ver objetivos activos relacionados con proyectos de su área
CREATE POLICY "lideres_ven_objetivos_area" ON objetivos
  FOR SELECT
  USING (
    archived_at IS NULL
    AND (
      public.get_mi_rol() = 'Gerente'
      OR EXISTS (
        SELECT 1 FROM objetivo_proyecto op
        JOIN proyectos p ON p.id = op.proyecto_id
        WHERE op.objetivo_id = objetivos.id
          AND p.area_responsable_id = public.get_mi_area()
      )
    )
  );

-- ============================================================
-- Row Level Security - objetivo_proyecto
-- ============================================================

ALTER TABLE objetivo_proyecto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gerentes_crud_objetivo_proyecto" ON objetivo_proyecto;
-- Solo Gerentes pueden hacer CRUD en las relaciones
CREATE POLICY  "gerentes_crud_objetivo_proyecto" ON objetivo_proyecto
  FOR ALL
  USING (public.get_mi_rol() = 'Gerente');

DROP POLICY IF EXISTS "usuarios_ven_objetivo_proyecto" ON objetivo_proyecto;
-- Todos pueden ver las relaciones (limitado por la política de objetivos)
CREATE POLICY "usuarios_ven_objetivo_proyecto" ON objetivo_proyecto
  FOR SELECT
  USING (true);  -- Filtrado por la política SELECT de objetivos y proyectos

-- ============================================================
-- Vistas útiles
-- ============================================================

-- Vista: Objetivos con cuenta de proyectos y avance promedio
CREATE OR REPLACE VIEW vista_objetivos_con_metricas AS
SELECT
  o.id,
  o.titulo,
  o.descripcion,
  o.anio,
  o.area_responsable_id,
  a.nombre AS area_nombre,
  o.status,
  o.orden,
  o.created_by,
  o.updated_by,
  o.created_at,
  o.updated_at,
  o.archived_at,
  COUNT(op.proyecto_id) AS total_proyectos,
  COALESCE(ROUND(AVG(p.porcentaje_avance)), 0) AS avance_promedio,
  COUNT(CASE WHEN p.estado = 'Bloqueado' THEN 1 END) AS proyectos_bloqueados,
  COUNT(CASE WHEN p.estado = 'En Riesgo' THEN 1 END) AS proyectos_riesgo,
  COUNT(CASE WHEN p.estado = 'Finalizado' THEN 1 END) AS proyectos_completados,
  CASE
    WHEN COUNT(op.proyecto_id) = 0 THEN 'SIN_PROYECTOS'
    WHEN COUNT(CASE WHEN p.estado = 'Bloqueado' THEN 1 END) > 0 THEN 'ROJO'
    WHEN COALESCE(ROUND(AVG(p.porcentaje_avance)), 0) < 40 THEN 'ROJO'
    WHEN COALESCE(ROUND(AVG(p.porcentaje_avance)), 0) < 70 THEN 'AMARILLO'
    ELSE 'VERDE'
  END AS color_semaforo
FROM objetivos o
LEFT JOIN areas_responsables a ON o.area_responsable_id = a.id
LEFT JOIN objetivo_proyecto op ON o.id = op.objetivo_id
LEFT JOIN proyectos p ON op.proyecto_id = p.id
GROUP BY o.id, a.id;

-- Vista: Proyectos de un objetivo con detalles
CREATE OR REPLACE VIEW vista_objetivo_proyectos AS
SELECT
  o.id AS objetivo_id,
  o.titulo AS objetivo_titulo,
  p.id AS proyecto_id,
  p.nombre AS proyecto_nombre,
  p.estado,
  p.porcentaje_avance,
  p.responsable_primario,
  u.nombre_completo AS responsable_nombre,
  p.fecha_fin_planificada,
  p.prioridad,
  op.created_at AS vinculado_at
FROM objetivo_proyecto op
JOIN objetivos o ON op.objetivo_id = o.id
JOIN proyectos p ON op.proyecto_id = p.id
LEFT JOIN usuarios u ON p.responsable_primario = u.id
WHERE o.archived_at IS NULL;
