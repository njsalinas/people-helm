-- ============================================================
-- Migration 016: Refactorizar area_responsable a UUID FK
-- Convierte area_responsable de VARCHAR a FK areas_responsables(id)
-- IMPORTANTE: Elimina vistas y policies primero, luego reconvierte
-- ============================================================

-- ============================================================
-- PASO 0: Eliminar vistas y policies que dependen de area_responsable
-- ============================================================

-- Eliminar vistas (con CASCADE para sus dependencias)
DROP VIEW IF EXISTS public.vista_semaforo_proyectos CASCADE;
DROP VIEW IF EXISTS public.vista_bloqueos_activos CASCADE;

-- Eliminar RLS policies que usan area_responsable
DROP POLICY IF EXISTS "lideres_ven_proyectos_area" ON proyectos;
DROP POLICY IF EXISTS "lideres_ven_tareas_area" ON tareas;
DROP POLICY IF EXISTS "lideres_ven_bloqueos_area" ON bloqueos;
DROP POLICY IF EXISTS "lideres_ven_riesgos_area" ON riesgos;
DROP POLICY IF EXISTS "lideres_ven_comentarios_area" ON comentarios;

-- ============================================================
-- PASO 1: USUARIOS - Agregar columna temporal y migrar datos
-- ============================================================

ALTER TABLE usuarios ADD COLUMN area_responsable_id UUID
  REFERENCES areas_responsables(id) ON DELETE SET NULL;

-- Migrar datos: mapear strings a UUIDs
UPDATE usuarios u
SET area_responsable_id = (
  SELECT id FROM areas_responsables
  WHERE nombre = u.area_responsable
)
WHERE u.area_responsable IS NOT NULL;

-- Eliminar columna vieja
ALTER TABLE usuarios DROP COLUMN area_responsable;

-- Recrear índice
DROP INDEX IF EXISTS idx_usuarios_area;
CREATE INDEX idx_usuarios_area ON usuarios(area_responsable_id);

-- ============================================================
-- PASO 2: PROYECTOS - Convertir con mayor cuidado (NOT NULL + UNIQUE)
-- ============================================================

-- Remover constraints que dependen de la columna string
ALTER TABLE proyectos DROP CONSTRAINT IF EXISTS proyectos_area_responsable_check;
ALTER TABLE proyectos DROP CONSTRAINT IF EXISTS proyectos_nombre_area_responsable_key;

-- Agregar columna temporal
ALTER TABLE proyectos ADD COLUMN area_responsable_id UUID;

-- Migrar datos
UPDATE proyectos p
SET area_responsable_id = (
  SELECT id FROM areas_responsables
  WHERE nombre = p.area_responsable
);

-- Hacer NOT NULL
ALTER TABLE proyectos ALTER COLUMN area_responsable_id SET NOT NULL;

-- Agregar FK constraint
ALTER TABLE proyectos ADD CONSTRAINT fk_proyectos_area
  FOREIGN KEY (area_responsable_id) REFERENCES areas_responsables(id);

-- Ahora eliminar la columna vieja (sin vistas/policies dependiendo)
ALTER TABLE proyectos DROP COLUMN area_responsable;

-- Recrear UNIQUE constraint
ALTER TABLE proyectos ADD CONSTRAINT proyectos_nombre_area_key
  UNIQUE (nombre, area_responsable_id);

-- Recrear índice
DROP INDEX IF EXISTS idx_proyectos_area;
CREATE INDEX idx_proyectos_area ON proyectos(area_responsable_id);

-- ============================================================
-- PASO 3: Actualizar función get_mi_area() para retornar UUID
-- ============================================================

-- Es necesario eliminarla porque no se puede cambiar el tipo de retorno de TEXT a UUID con REPLACE
DROP FUNCTION IF EXISTS public.get_mi_area();

CREATE OR REPLACE FUNCTION public.get_mi_area()
RETURNS UUID AS $$
  SELECT area_responsable_id FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PASO 4: Recrear 5 RLS Policies que usan get_mi_area()
-- ============================================================

-- Proyectos
CREATE POLICY "lideres_ven_proyectos_area" ON proyectos
  FOR SELECT
  USING (
    -- Gerentes ven todos
    public.get_mi_rol() = 'Gerente'
    -- Líderes ven proyectos de su área
    OR area_responsable_id = public.get_mi_area()
  );

-- Tareas
CREATE POLICY "lideres_ven_tareas_area" ON tareas
  FOR SELECT
  USING (
    -- Gerentes ven todos
    public.get_mi_rol() = 'Gerente'
    -- Usuario es responsable de la tarea
    OR responsable_id = auth.uid()
    -- O el proyecto está en la área del usuario
    OR EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = tareas.proyecto_id
        AND p.area_responsable_id = public.get_mi_area()
    )
  );

-- Bloqueos
CREATE POLICY "lideres_ven_bloqueos_area" ON bloqueos
  FOR SELECT
  USING (
    -- Gerentes ven todos
    public.get_mi_rol() = 'Gerente'
    -- Líderes ven bloqueos de proyectos de su área
    OR EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = bloqueos.proyecto_id
        AND p.area_responsable_id = public.get_mi_area()
    )
  );

-- Riesgos
CREATE POLICY "lideres_ven_riesgos_area" ON riesgos
  FOR SELECT
  USING (
    -- Gerentes ven todos
    public.get_mi_rol() = 'Gerente'
    -- Líderes ven riesgos de proyectos de su área
    OR EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = riesgos.proyecto_id
        AND p.area_responsable_id = public.get_mi_area()
    )
  );

-- Comentarios
CREATE POLICY "lideres_ven_comentarios_area" ON comentarios
  FOR SELECT
  USING (
    -- Gerentes ven todos
    public.get_mi_rol() = 'Gerente'
    -- Líderes ven comentarios de proyectos de su área
    OR EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = comentarios.proyecto_id
        AND p.area_responsable_id = public.get_mi_area()
    )
  );

-- ============================================================
-- PASO 5: Recrear vistas con nombre denormalizado (CORREGIDO)
-- ============================================================

CREATE VIEW public.vista_semaforo_proyectos AS
SELECT
  p.id,
  p.nombre,
  p.tipo,
  p.subtipo,
  p.foco_estrategico,
  a.nombre AS area_responsable,
  p.categoria,
  p.responsable_primario,
  p.descripcion_ejecutiva,
  p.objetivo,
  p.resultado_esperado,
  p.fecha_inicio,
  p.fecha_fin_planificada,
  p.fecha_fin_real,
  p.estado,
  p.porcentaje_avance,
  p.prioridad,
  p.requiere_escalamiento,
  p.proyecto_padre,
  p.created_at,
  p.updated_at,
  p.created_by,
  p.updated_by,
  u.nombre_completo AS responsable_nombre,
  u.email AS responsable_email,
  -- Lógica de semáforo
  CASE
    WHEN p.estado = 'Bloqueado' THEN 'ROJO'
    WHEN p.estado = 'En Riesgo' THEN 'AMARILLO'
    WHEN p.estado = 'Finalizado' AND p.porcentaje_avance = 100 THEN 'VERDE'
    WHEN p.porcentaje_avance >= 70 THEN 'VERDE'
    WHEN p.porcentaje_avance >= 40 THEN 'AMARILLO'
    ELSE 'ROJO'
  END AS color_semaforo,
  (SELECT COUNT(*) FROM bloqueos b WHERE b.proyecto_id = p.id AND b.estado = 'Activo') AS bloqueos_activos,
  -- CAMBIO AQUÍ: Restamos fechas casteadas a DATE para obtener un INTEGER puro
  COALESCE((
    SELECT MAX(CURRENT_DATE - b.fecha_registro::date) 
    FROM bloqueos b 
    WHERE b.proyecto_id = p.id AND b.estado = 'Activo'
  ), 0) AS dias_bloqueo_max,
  (SELECT COUNT(*) FROM riesgos r WHERE r.proyecto_id = p.id AND r.estado IN ('Identificado', 'Monitoreado')) AS riesgos_activos,
  CASE
    WHEN p.fecha_fin_planificada < CURRENT_DATE AND p.estado != 'Finalizado'
    -- CAMBIO AQUÍ: Simplificamos la resta de fechas
    THEN (CURRENT_DATE - p.fecha_fin_planificada::date)
    ELSE NULL
  END AS dias_vencido,
  -- CAMBIO AQUÍ: Simplificamos el GREATEST
  GREATEST(0, (p.fecha_fin_planificada::date - CURRENT_DATE)) AS dias_restantes
FROM proyectos p
LEFT JOIN areas_responsables a ON p.area_responsable_id = a.id
LEFT JOIN usuarios u ON p.responsable_primario = u.id;

CREATE VIEW public.vista_bloqueos_activos AS
SELECT
  b.id,
  b.proyecto_id,
  p.nombre AS proyecto_nombre,
  a.nombre AS area_responsable,
  b.descripcion,
  b.tipo,
  b.accion_requerida,
  b.requiere_escalamiento,
  b.estado,
  b.fecha_registro,
  -- CAMBIO AQUÍ: Uso de ::date para asegurar entero
  (CURRENT_DATE - b.fecha_registro::date) AS dias_bloqueado,
  u.nombre_completo AS creado_por_nombre,
  b.created_by,
  p.responsable_primario
FROM bloqueos b
JOIN proyectos p ON b.proyecto_id = p.id
LEFT JOIN areas_responsables a ON p.area_responsable_id = a.id
LEFT JOIN usuarios u ON b.created_by = u.id
WHERE b.estado = 'Activo'
ORDER BY b.fecha_registro DESC;