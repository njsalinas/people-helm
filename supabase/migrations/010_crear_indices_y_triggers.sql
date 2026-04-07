-- ============================================================
-- Migration 010: Índices adicionales, triggers y funciones de negocio
-- Depende de: todas las migraciones anteriores
-- ============================================================

-- ============================================================
-- FUNCIÓN: Calcular color semáforo de un proyecto
-- ============================================================
CREATE OR REPLACE FUNCTION calcular_color_semaforo(p_proyecto_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_proyecto proyectos%ROWTYPE;
  v_bloqueos_activos INTEGER;
  v_dias_bloqueado INTEGER;
  v_dias_totales INTEGER;
  v_dias_transcurridos INTEGER;
  v_porcentaje_tiempo NUMERIC;
BEGIN
  -- Obtener proyecto
  SELECT * INTO v_proyecto FROM proyectos WHERE id = p_proyecto_id;
  IF NOT FOUND THEN RETURN 'DESCONOCIDO'; END IF;

  -- Contar bloqueos activos y máximo tiempo bloqueado
  SELECT
    COUNT(*),
    COALESCE(MAX(EXTRACT(DAY FROM (now() - fecha_registro))::INTEGER), 0)
  INTO v_bloqueos_activos, v_dias_bloqueado
  FROM bloqueos
  WHERE proyecto_id = p_proyecto_id AND estado = 'Activo';

  -- Calcular % tiempo transcurrido
  v_dias_totales := (v_proyecto.fecha_fin_planificada - v_proyecto.fecha_inicio);
  v_dias_transcurridos := LEAST(
    (CURRENT_DATE - v_proyecto.fecha_inicio),
    v_dias_totales
  );

  IF v_dias_totales > 0 THEN
    v_porcentaje_tiempo := (v_dias_transcurridos::NUMERIC / v_dias_totales) * 100;
  ELSE
    v_porcentaje_tiempo := 100;
  END IF;

  -- Lógica de color
  IF v_proyecto.estado = 'Finalizado' THEN
    RETURN 'VERDE';
  ELSIF v_proyecto.estado = 'Bloqueado' OR v_dias_bloqueado >= 5 THEN
    RETURN 'ROJO';
  ELSIF v_proyecto.estado = 'En Riesgo' THEN
    RETURN 'AMARILLO';
  ELSIF v_proyecto.estado = 'En Curso'
    AND v_proyecto.porcentaje_avance >= v_porcentaje_tiempo
    AND v_bloqueos_activos = 0 THEN
    RETURN 'VERDE';
  ELSIF v_proyecto.estado = 'En Curso'
    AND (v_proyecto.porcentaje_avance < v_porcentaje_tiempo OR v_bloqueos_activos > 0) THEN
    RETURN 'AMARILLO';
  ELSE
    RETURN 'AMARILLO';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- FUNCIÓN: Recalcular % avance de proyecto basado en tareas
-- ============================================================
CREATE OR REPLACE FUNCTION recalcular_avance_proyecto(p_proyecto_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_promedio INTEGER;
BEGIN
  SELECT COALESCE(ROUND(AVG(porcentaje_avance)), 0)
  INTO v_promedio
  FROM tareas
  WHERE proyecto_id = p_proyecto_id;

  UPDATE proyectos
  SET porcentaje_avance = v_promedio,
      updated_at = now()
  WHERE id = p_proyecto_id;

  RETURN v_promedio;
END;
$$ LANGUAGE plpgsql;

-- Trigger: recalcular avance proyecto cuando cambia una tarea
CREATE OR REPLACE FUNCTION trigger_recalcular_avance()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalcular_avance_proyecto(NEW.proyecto_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tareas_recalcular_avance_proyecto
  AFTER INSERT OR UPDATE OF porcentaje_avance, estado ON tareas
  FOR EACH ROW EXECUTE FUNCTION trigger_recalcular_avance();

-- ============================================================
-- FUNCIÓN: Actualizar proyecto a Bloqueado cuando hay bloqueo activo
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_proyecto_bloqueado()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'Activo' THEN
    UPDATE proyectos
    SET estado = 'Bloqueado', updated_at = now()
    WHERE id = NEW.proyecto_id
      AND estado NOT IN ('Finalizado', 'Bloqueado');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER bloqueo_actualiza_proyecto
  AFTER INSERT ON bloqueos
  FOR EACH ROW EXECUTE FUNCTION trigger_proyecto_bloqueado();

-- ============================================================
-- FUNCIÓN: Cuando se resuelve último bloqueo, actualizar proyecto
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_bloqueo_resuelto()
RETURNS TRIGGER AS $$
DECLARE
  v_bloqueos_activos INTEGER;
BEGIN
  IF NEW.estado = 'Resuelto' AND OLD.estado = 'Activo' THEN
    -- Actualizar updated_at del proyecto
    UPDATE proyectos SET updated_at = now() WHERE id = NEW.proyecto_id;

    -- Contar bloqueos activos restantes
    SELECT COUNT(*) INTO v_bloqueos_activos
    FROM bloqueos
    WHERE proyecto_id = NEW.proyecto_id AND estado = 'Activo';

    -- Si no hay más bloqueos activos, sugerir "En Curso" (no forzar)
    -- La lógica de sugerencia se maneja en el frontend
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER bloqueo_resuelto_actualiza_proyecto
  AFTER UPDATE OF estado ON bloqueos
  FOR EACH ROW
  WHEN (NEW.estado = 'Resuelto')
  EXECUTE FUNCTION trigger_bloqueo_resuelto();

-- ============================================================
-- VISTA: Dashboard con estadísticas de proyectos por color
-- ============================================================
CREATE OR REPLACE VIEW vista_semaforo_proyectos AS
SELECT
  p.id,
  p.nombre,
  p.tipo,
  p.foco_estrategico,
  p.area_responsable,
  p.categoria,
  p.estado,
  p.porcentaje_avance,
  p.prioridad,
  p.fecha_inicio,
  p.fecha_fin_planificada,
  p.fecha_fin_real,
  p.responsable_primario,
  u.nombre_completo AS responsable_nombre,
  calcular_color_semaforo(p.id) AS color_semaforo,
  (
    SELECT COUNT(*) FROM bloqueos b
    WHERE b.proyecto_id = p.id AND b.estado = 'Activo'
  ) AS bloqueos_activos,
  (
    SELECT COUNT(*) FROM riesgos r
    WHERE r.proyecto_id = p.id AND r.estado NOT IN ('Mitigado', 'Cerrado')
  ) AS riesgos_activos,
  CASE
    WHEN p.fecha_fin_planificada < CURRENT_DATE AND p.estado != 'Finalizado'
    THEN (CURRENT_DATE - p.fecha_fin_planificada)
    ELSE NULL
  END AS dias_vencido,
  CASE
    WHEN p.fecha_fin_planificada >= CURRENT_DATE
    THEN (p.fecha_fin_planificada - CURRENT_DATE)
    ELSE 0
  END AS dias_restantes,
  p.requiere_escalamiento,
  p.created_at,
  p.updated_at
FROM proyectos p
JOIN usuarios u ON u.id = p.responsable_primario;

-- ============================================================
-- VISTA: Bloqueos activos con info de proyecto
-- ============================================================
CREATE OR REPLACE VIEW vista_bloqueos_activos AS
SELECT
  bl.id,
  bl.proyecto_id,
  p.nombre AS proyecto_nombre,
  p.area_responsable,
  bl.descripcion,
  bl.tipo,
  bl.accion_requerida,
  bl.requiere_escalamiento,
  bl.estado,
  bl.fecha_registro,
  EXTRACT(DAY FROM (now() - bl.fecha_registro))::INTEGER AS dias_bloqueado,
  u.nombre_completo AS creado_por_nombre,
  bl.created_by,
  p.responsable_primario
FROM bloqueos bl
JOIN proyectos p ON p.id = bl.proyecto_id
JOIN usuarios u ON u.id = bl.created_by
WHERE bl.estado = 'Activo'
ORDER BY bl.fecha_registro ASC;

-- ============================================================
-- ÍNDICES ADICIONALES para optimizar consultas frecuentes
-- ============================================================

-- Proyectos con bloqueos activos
CREATE INDEX IF NOT EXISTS idx_bloqueos_activos
  ON bloqueos(proyecto_id, estado)
  WHERE estado = 'Activo';

-- Proyectos no finalizados
CREATE INDEX IF NOT EXISTS idx_proyectos_no_finalizados
  ON proyectos(estado, fecha_fin_planificada)
  WHERE estado != 'Finalizado';

-- Historial reciente
CREATE INDEX IF NOT EXISTS idx_historial_reciente
  ON historial_cambios(created_at DESC, proyecto_id);
