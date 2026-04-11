-- ============================================================
-- Migration 013: RBAC por Area Responsable
-- Filtra vistas según la area_responsable del usuario
-- ============================================================

-- Función helper: obtener area_responsable del usuario actual
-- Retorna NULL si es Gerente (area_responsable = NULL)
CREATE OR REPLACE FUNCTION public.get_mi_area()
RETURNS TEXT AS $$
  SELECT area_responsable FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Proyectos: filtrar por area_responsable
-- ============================================================

-- Reemplazar policy que permitía a líderes ver TODOS los proyectos
DROP POLICY IF EXISTS "lideres_ven_proyectos" ON proyectos;

-- Nueva policy: líderes ven solo proyectos de su área
CREATE POLICY "lideres_ven_proyectos_area" ON proyectos
  FOR SELECT
  USING (
    -- Gerentes ven todos
    public.get_mi_rol() = 'Gerente'
    -- Líderes ven proyectos de su área
    OR area_responsable = public.get_mi_area()
  );

-- ============================================================
-- Tareas: filtrar por area del proyecto o responsable
-- ============================================================

-- Reemplazar policy que permitía a todos ver TODAS las tareas
DROP POLICY IF EXISTS "todos_ven_tareas" ON tareas;

-- Nueva policy: líderes ven tareas si:
-- 1. Son el responsable, O
-- 2. El proyecto pertenece a su área
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
        AND p.area_responsable = public.get_mi_area()
    )
  );

-- ============================================================
-- Bloqueos: filtrar por area del proyecto
-- ============================================================

-- Reemplazar policy que permitía a todos ver TODOS los bloqueos
DROP POLICY IF EXISTS "todos_ven_bloqueos" ON bloqueos;

-- Nueva policy: líderes ven bloqueos de proyectos de su área
CREATE POLICY "lideres_ven_bloqueos_area" ON bloqueos
  FOR SELECT
  USING (
    -- Gerentes ven todos
    public.get_mi_rol() = 'Gerente'
    -- Líderes ven bloqueos de proyectos de su área
    OR EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = bloqueos.proyecto_id
        AND p.area_responsable = public.get_mi_area()
    )
  );

-- ============================================================
-- Riesgos: filtrar por area del proyecto
-- ============================================================

-- Si existe policy anterior, eliminarla (para futuras ejecuciones)
DROP POLICY IF EXISTS "todos_ven_riesgos" ON riesgos;

-- Nueva policy: líderes ven riesgos de proyectos de su área
CREATE POLICY "lideres_ven_riesgos_area" ON riesgos
  FOR SELECT
  USING (
    -- Gerentes ven todos
    public.get_mi_rol() = 'Gerente'
    -- Líderes ven riesgos de proyectos de su área
    OR EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = riesgos.proyecto_id
        AND p.area_responsable = public.get_mi_area()
    )
  );

-- ============================================================
-- Comentarios: filtrar igual que tareas
-- (Comentarios pertenecen a proyectos, así que usar area_responsable)
-- ============================================================

-- Si existe política anterior más restrictiva, eliminarla
DROP POLICY IF EXISTS "todos_ven_comentarios" ON comentarios;

-- Nueva policy: líderes ven comentarios de proyectos de su área
CREATE POLICY "lideres_ven_comentarios_area" ON comentarios
  FOR SELECT
  USING (
    -- Gerentes ven todos
    public.get_mi_rol() = 'Gerente'
    -- Líderes ven comentarios de proyectos de su área
    OR EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = comentarios.proyecto_id
        AND p.area_responsable = public.get_mi_area()
    )
  );
