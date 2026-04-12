-- ============================================================
-- Migration 020: Agregar columna color_semaforo y trigger de actualización
-- Problema: El API consultaba proyectos sin calcular color_semaforo
-- Solución: Agregar columna y mantenerla actualizada con triggers
-- ============================================================

-- Agregar columnas de caché a proyectos (si no existen)
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS color_semaforo VARCHAR(20) DEFAULT 'AMARILLO',
ADD COLUMN IF NOT EXISTS bloqueos_activos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS riesgos_activos INTEGER DEFAULT 0;

-- Crear índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_proyectos_color_semaforo
  ON proyectos(color_semaforo)
  WHERE estado != 'Finalizado';

CREATE INDEX IF NOT EXISTS idx_proyectos_bloqueos_activos
  ON proyectos(bloqueos_activos)
  WHERE bloqueos_activos > 0;

-- ============================================================
-- FUNCIÓN: Actualizar conteos de bloqueos y riesgos del proyecto
-- ============================================================
CREATE OR REPLACE FUNCTION fn_actualizar_conteos_proyecto(p_proyecto_id UUID)
RETURNS VOID AS $$
DECLARE
  v_bloqueos INTEGER;
  v_riesgos INTEGER;
BEGIN
  -- Contar bloqueos activos
  SELECT COUNT(*) INTO v_bloqueos
  FROM bloqueos
  WHERE proyecto_id = p_proyecto_id AND estado = 'Activo';

  -- Contar riesgos activos
  SELECT COUNT(*) INTO v_riesgos
  FROM riesgos
  WHERE proyecto_id = p_proyecto_id AND estado NOT IN ('Mitigado', 'Cerrado');

  -- Actualizar en proyectos
  UPDATE proyectos
  SET bloqueos_activos = v_bloqueos,
      riesgos_activos = v_riesgos,
      updated_at = now()
  WHERE id = p_proyecto_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN: Actualizar color_semaforo del proyecto
-- ============================================================
CREATE OR REPLACE FUNCTION fn_actualizar_color_semaforo(p_proyecto_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_proyecto proyectos%ROWTYPE;
  v_color VARCHAR(20);
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

  -- Lógica de color (debe ser consistente con el frontend)
  IF v_proyecto.estado = 'Finalizado' THEN
    v_color := 'VERDE';
  ELSIF v_proyecto.estado = 'Bloqueado' THEN
    v_color := 'ROJO';
  ELSIF v_proyecto.estado = 'En Riesgo' THEN
    v_color := 'ROJO';  -- En Riesgo también es ROJO
  ELSIF v_dias_bloqueado >= 5 THEN
    v_color := 'ROJO';
  ELSIF v_dias_bloqueado >= 3 THEN
    v_color := 'AMARILLO';
  ELSIF v_proyecto.estado = 'En Curso'
    AND v_proyecto.porcentaje_avance >= v_porcentaje_tiempo
    AND v_bloqueos_activos = 0 THEN
    v_color := 'VERDE';
  ELSIF v_proyecto.estado = 'En Curso'
    AND (v_proyecto.porcentaje_avance < v_porcentaje_tiempo OR v_bloqueos_activos > 0) THEN
    v_color := 'AMARILLO';
  ELSE
    v_color := 'AMARILLO';
  END IF;

  -- Actualizar la columna color_semaforo
  UPDATE proyectos
  SET color_semaforo = v_color, updated_at = now()
  WHERE id = p_proyecto_id;

  RETURN v_color;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: Actualizar color y conteos cuando cambia el proyecto
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_proyectos_actualizar_color()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular color cuando cambia: estado, porcentaje_avance, fecha_fin_planificada
  IF (TG_OP = 'UPDATE' AND (NEW.estado != OLD.estado OR NEW.porcentaje_avance != OLD.porcentaje_avance)) OR TG_OP = 'INSERT' THEN
    PERFORM fn_actualizar_color_semaforo(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS proyectos_actualizar_color ON proyectos;
CREATE TRIGGER proyectos_actualizar_color
  AFTER INSERT OR UPDATE OF estado, porcentaje_avance, fecha_fin_planificada ON proyectos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_proyectos_actualizar_color();

-- ============================================================
-- TRIGGER: Actualizar conteos de bloqueos cuando cambian en la tabla bloqueos
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_bloqueos_actualizar_conteos()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    -- Usar el id del proyecto del registro nuevo o viejo
    PERFORM fn_actualizar_conteos_proyecto(COALESCE(NEW.proyecto_id, OLD.proyecto_id));
    PERFORM fn_actualizar_color_semaforo(COALESCE(NEW.proyecto_id, OLD.proyecto_id));
  ELSIF TG_OP = 'UPDATE' AND NEW.estado != OLD.estado THEN
    -- Si cambia el estado del bloqueo, actualizar conteos y color
    PERFORM fn_actualizar_conteos_proyecto(NEW.proyecto_id);
    PERFORM fn_actualizar_color_semaforo(NEW.proyecto_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bloqueos_actualizar_conteos ON bloqueos;
CREATE TRIGGER bloqueos_actualizar_conteos
  AFTER INSERT OR UPDATE OR DELETE ON bloqueos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_bloqueos_actualizar_conteos();

-- ============================================================
-- TRIGGER: Actualizar conteos de riesgos cuando cambian en la tabla riesgos
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_riesgos_actualizar_conteos()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    PERFORM fn_actualizar_conteos_proyecto(COALESCE(NEW.proyecto_id, OLD.proyecto_id));
  ELSIF TG_OP = 'UPDATE' AND NEW.estado != OLD.estado THEN
    PERFORM fn_actualizar_conteos_proyecto(NEW.proyecto_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS riesgos_actualizar_conteos ON riesgos;
CREATE TRIGGER riesgos_actualizar_conteos
  AFTER INSERT OR UPDATE OR DELETE ON riesgos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_riesgos_actualizar_conteos();

-- ============================================================
-- TRIGGER: Actualizar color del proyecto cuando se registra un bloqueo
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_bloqueo_actualizar_color_proyecto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'Activo' THEN
    -- Actualizar el proyecto a Bloqueado (ya existe este trigger)
    UPDATE proyectos
    SET estado = 'Bloqueado', updated_at = now()
    WHERE id = NEW.proyecto_id
      AND estado NOT IN ('Finalizado', 'Bloqueado');

    -- Recalcular el color del proyecto
    PERFORM fn_actualizar_color_semaforo(NEW.proyecto_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reemplazar el trigger anterior
DROP TRIGGER IF EXISTS bloqueo_actualiza_proyecto ON bloqueos;
CREATE TRIGGER bloqueo_actualiza_proyecto
  AFTER INSERT ON bloqueos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_bloqueo_actualizar_color_proyecto();

-- ============================================================
-- TRIGGER: Actualizar color cuando se resuelve un bloqueo
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_bloqueo_resuelto_actualizar_color()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'Resuelto' AND OLD.estado = 'Activo' THEN
    -- Recalcular el color del proyecto (ahora con menos bloqueos)
    PERFORM fn_actualizar_color_semaforo(NEW.proyecto_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reemplazar el trigger anterior
DROP TRIGGER IF EXISTS bloqueo_resuelto_actualiza_proyecto ON bloqueos;
CREATE TRIGGER bloqueo_resuelto_actualiza_proyecto
  AFTER UPDATE OF estado ON bloqueos
  FOR EACH ROW
  WHEN (NEW.estado = 'Resuelto')
  EXECUTE FUNCTION trigger_bloqueo_resuelto_actualizar_color();

-- ============================================================
-- INICIALIZAR: Recalcular color y conteos para todos los proyectos existentes
-- ============================================================
-- Esto es necesario para corregir los proyectos existentes
DO $$
DECLARE
  v_proyecto_id UUID;
BEGIN
  FOR v_proyecto_id IN SELECT id FROM proyectos LOOP
    -- Primero actualizar conteos
    PERFORM fn_actualizar_conteos_proyecto(v_proyecto_id);
    -- Luego actualizar color (que depende de los conteos)
    PERFORM fn_actualizar_color_semaforo(v_proyecto_id);
  END LOOP;
  RAISE NOTICE 'Color semáforo y conteos recalculados para todos los proyectos';
END $$;
