-- ============================================================
-- Migration 012: Validación de subproyectos
-- Función RPC para validar relaciones circulares
-- Trigger para evitar circular references en proyectos
-- ============================================================

-- ============================================================
-- SECCIÓN 1: Función para detectar relaciones circulares
-- ============================================================

CREATE OR REPLACE FUNCTION validar_proyecto_circular(
  p_proyecto_id UUID,
  p_nuevo_padre_id UUID
)
RETURNS TABLE (es_circular BOOLEAN) AS $$
BEGIN
  -- Buscar si nuevo_padre está en la cadena ascendente de proyecto_id
  -- Si lo está, sería circular: A → B → A
  RETURN QUERY
  WITH RECURSIVE ancestors AS (
    SELECT id, proyecto_padre
    FROM proyectos
    WHERE id = p_nuevo_padre_id

    UNION ALL

    SELECT p.id, p.proyecto_padre
    FROM proyectos p
    INNER JOIN ancestors a ON a.proyecto_padre = p.id
    WHERE p.proyecto_padre IS NOT NULL
  )
  SELECT EXISTS (
    SELECT 1 FROM ancestors WHERE id = p_proyecto_id
  ) AS es_circular;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- SECCIÓN 2: Trigger para validar en INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION validar_proyecto_padre_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_es_circular BOOLEAN;
BEGIN
  IF NEW.proyecto_padre IS NOT NULL THEN
    -- Validar que no sea circular
    SELECT validar_proyecto_circular(NEW.id, NEW.proyecto_padre).es_circular
    INTO v_es_circular;

    IF v_es_circular THEN
      RAISE EXCEPTION 'Relación circular detectada: un proyecto no puede ser ancestro de sí mismo';
    END IF;

    -- Validar que hereda el area_responsable del padre
    PERFORM 1
    FROM proyectos
    WHERE id = NEW.proyecto_padre
      AND area_responsable = NEW.area_responsable;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'El subproyecto debe estar en la misma área que el proyecto padre';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS validar_proyecto_padre_insert_trigger ON proyectos;
CREATE TRIGGER validar_proyecto_padre_insert_trigger
  BEFORE INSERT ON proyectos
  FOR EACH ROW
  EXECUTE FUNCTION validar_proyecto_padre_insert();

-- ============================================================
-- SECCIÓN 3: Trigger para validar en UPDATE
-- ============================================================

CREATE OR REPLACE FUNCTION validar_proyecto_padre_update()
RETURNS TRIGGER AS $$
DECLARE
  v_es_circular BOOLEAN;
BEGIN
  -- Solo validar si proyecto_padre cambió
  IF (OLD.proyecto_padre IS DISTINCT FROM NEW.proyecto_padre) THEN
    IF NEW.proyecto_padre IS NOT NULL THEN
      -- Validar que no sea circular
      SELECT validar_proyecto_circular(NEW.id, NEW.proyecto_padre).es_circular
      INTO v_es_circular;

      IF v_es_circular THEN
        RAISE EXCEPTION 'Relación circular detectada: un proyecto no puede ser ancestro de sí mismo';
      END IF;

      -- Validar que hereda el area_responsable del padre
      PERFORM 1
      FROM proyectos
      WHERE id = NEW.proyecto_padre
        AND area_responsable = NEW.area_responsable;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'El subproyecto debe estar en la misma área que el proyecto padre';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS validar_proyecto_padre_update_trigger ON proyectos;
CREATE TRIGGER validar_proyecto_padre_update_trigger
  BEFORE UPDATE ON proyectos
  FOR EACH ROW
  EXECUTE FUNCTION validar_proyecto_padre_update();

-- ============================================================
-- SECCIÓN 4: Índice para mejorar performance en recursión
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_proyectos_padre_no_null
  ON proyectos(proyecto_padre)
  WHERE proyecto_padre IS NOT NULL;
