# Database Schema

*Auto-generated — do not edit manually*

## Tables

### usuarios

```sql
-- ============================================================
-- Migration 001: Tabla usuarios
-- Depende de: Supabase Auth (auth.users)
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY,  -- UUID de Supabase Auth
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre_completo VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'Líder Area'
    CHECK (rol IN ('Gerente', 'Líder Area', 'Espectador')),

  area_responsable VARCHAR(100),
  -- NULL si es Gerente, específica si es Líder de Área

  activo BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_area ON usuarios(area_responsable);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para obtener rol sin activar RLS (evita recursión infinita)
CREATE OR REPLACE FUNCTION public.get_mi_rol()
RETURNS TEXT AS $$
  SELECT rol FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Gerentes ven todos los usuarios
CREATE POLICY "gerentes_ven_todos" ON usuarios
  FOR SELECT
  USING (public.get_mi_rol() = 'Gerente');

-- Usuarios ven su propio perfil
CREATE POLICY "usuarios_ven_propio" ON usuarios
  FOR SELECT
  USING (id = auth.uid());

-- Gerentes pueden actualizar cualquier usuario
CREATE POLICY "gerentes_actualizan_usuarios" ON usuarios
  FOR UPDATE
  USING (public.get_mi_rol() = 'Gerente');

-- Cualquier usuario autenticado puede actualizar su propio perfil
CREATE POLICY "usuarios_actualizan_propio" ON usuarios
  FOR UPDATE
  USING (id = auth.uid());

-- Función: Crear usuario automáticamente al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre_completo, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'Espectador')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### proyectos

```sql
-- ============================================================
-- Migration 002: Tabla proyectos
-- Depende de: 001_usuarios
-- ============================================================

CREATE TABLE IF NOT EXISTS proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Proyecto', 'Línea')),
  subtipo VARCHAR(50) CHECK (subtipo IN ('Operativo', 'Campaña', 'Estratégico')),

  foco_estrategico VARCHAR(100) NOT NULL
    CHECK (foco_estrategico IN (
      'Desarrollo Organizacional',
      'Gestión de Personas',
      'Cultura de Seguridad',
      'Comunicaciones'
    )),

  area_responsable VARCHAR(100) NOT NULL
    CHECK (area_responsable IN ('DO', 'Gestión de Personas', 'SSO', 'Comunicaciones')),

  categoria VARCHAR(100) NOT NULL,

  responsable_primario UUID NOT NULL REFERENCES usuarios(id),
  descripcion_ejecutiva TEXT,
  objetivo TEXT,
  resultado_esperado TEXT,

  fecha_inicio DATE NOT NULL,
  fecha_fin_planificada DATE NOT NULL,
  fecha_fin_real DATE,

  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'En Curso', 'En Riesgo', 'Bloqueado', 'Finalizado')),
  porcentaje_avance INTEGER DEFAULT 0
    CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),

  prioridad INTEGER DEFAULT 3
    CHECK (prioridad >= 1 AND prioridad <= 5),
  requiere_escalamiento BOOLEAN DEFAULT FALSE,

  proyecto_padre UUID REFERENCES proyectos(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES usuarios(id),
  updated_by UUID NOT NULL REFERENCES usuarios(id),

  CONSTRAINT fecha_fin_mayor_inicio CHECK (fecha_fin_planificada > fecha_inicio),
  UNIQUE(nombre, area_responsable)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_area ON proyectos(area_responsable);
CREATE INDEX IF NOT EXISTS idx_proyectos_foco ON proyectos(foco_estrategico);
CREATE INDEX IF NOT EXISTS idx_proyectos_responsable ON proyectos(responsable_primario);
CREATE INDEX IF NOT EXISTS idx_proyectos_categoria ON proyectos(categoria);
CREATE INDEX IF NOT EXISTS idx_proyectos_fecha_fin ON proyectos(fecha_fin_planificada);
CREATE INDEX IF NOT EXISTS idx_proyectos_padre ON proyectos(proyecto_padre);

-- Trigger updated_at
CREATE TRIGGER proyectos_updated_at
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

-- Gerentes ven todos los proyectos
CREATE POLICY "gerentes_ven_proyectos" ON proyectos
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
  );

-- Líderes ven todos los proyectos (lectura), editan sus propios
CREATE POLICY "lideres_ven_proyectos" ON proyectos
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Líder Area', 'Espectador'))
  );

CREATE POLICY "lideres_editan_propios" ON proyectos
  FOR UPDATE
  USING (
    responsable_primario = auth.uid()
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
  );

CREATE POLICY "lideres_crean_proyectos" ON proyectos
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Gerente', 'Líder Area'))
  );
```

### tareas

```sql
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
```

### bloqueos

```sql
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
```

### riesgos

```sql
-- ============================================================
-- Migration 005: Tabla riesgos
-- Depende de: 001_usuarios, 002_proyectos
-- ============================================================

CREATE TABLE IF NOT EXISTS riesgos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,

  descripcion TEXT NOT NULL,
  probabilidad VARCHAR(50) NOT NULL
    CHECK (probabilidad IN ('Alta', 'Media', 'Baja')),
  impacto VARCHAR(50) NOT NULL
    CHECK (impacto IN ('Alto', 'Medio', 'Bajo')),

  -- Prioridad calculada automáticamente:
  -- Alta/Alto=1, Alta/Medio=2, Alta/Bajo=3, Media/Alto=2, Media/Medio=3,
  -- Media/Bajo=4, Baja/Alto=3, Baja/Medio=4, Baja/Bajo=5
  prioridad INTEGER NOT NULL CHECK (prioridad >= 1 AND prioridad <= 5),

  plan_mitigacion TEXT,
  estado VARCHAR(50) NOT NULL DEFAULT 'Identificado'
    CHECK (estado IN ('Identificado', 'Monitoreado', 'Mitigado', 'Cerrado')),

  fecha_identificacion TIMESTAMPTZ DEFAULT now(),
  fecha_cierre TIMESTAMPTZ,

  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Función para calcular prioridad de riesgo automáticamente
CREATE OR REPLACE FUNCTION calcular_prioridad_riesgo(
  p_probabilidad VARCHAR,
  p_impacto VARCHAR
) RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN p_probabilidad = 'Alta'  AND p_impacto = 'Alto'  THEN 1
    WHEN p_probabilidad = 'Alta'  AND p_impacto = 'Medio' THEN 2
    WHEN p_probabilidad = 'Media' AND p_impacto = 'Alto'  THEN 2
    WHEN p_probabilidad = 'Alta'  AND p_impacto = 'Bajo'  THEN 3
    WHEN p_probabilidad = 'Media' AND p_impacto = 'Medio' THEN 3
    WHEN p_probabilidad = 'Baja'  AND p_impacto = 'Alto'  THEN 3
    WHEN p_probabilidad = 'Media' AND p_impacto = 'Bajo'  THEN 4
    WHEN p_probabilidad = 'Baja'  AND p_impacto = 'Medio' THEN 4
    ELSE 5
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para auto-calcular prioridad
CREATE OR REPLACE FUNCTION set_prioridad_riesgo()
RETURNS TRIGGER AS $$
BEGIN
  NEW.prioridad := calcular_prioridad_riesgo(NEW.probabilidad, NEW.impacto);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER riesgos_calcular_prioridad
  BEFORE INSERT OR UPDATE OF probabilidad, impacto ON riesgos
  FOR EACH ROW EXECUTE FUNCTION set_prioridad_riesgo();

-- Índices
CREATE INDEX IF NOT EXISTS idx_riesgos_proyecto ON riesgos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_riesgos_estado ON riesgos(estado);
CREATE INDEX IF NOT EXISTS idx_riesgos_prioridad ON riesgos(prioridad);

-- Trigger updated_at
CREATE TRIGGER riesgos_updated_at
  BEFORE UPDATE ON riesgos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE riesgos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_ven_riesgos" ON riesgos
  FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "crear_riesgos" ON riesgos
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Gerente', 'Líder Area'))
  );

CREATE POLICY "actualizar_riesgos" ON riesgos
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
  );
```

### comentarios

```sql
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
```

### historial_cambios

```sql
-- ============================================================
-- Migration 007: Tabla historial_cambios
-- Depende de: 001_usuarios, 002_proyectos
-- ============================================================

CREATE TABLE IF NOT EXISTS historial_cambios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,

  entidad_tipo VARCHAR(50) NOT NULL
    CHECK (entidad_tipo IN ('Proyecto', 'Tarea', 'Bloqueo', 'Riesgo', 'Estado', 'Avance', 'Comentario')),

  campo_afectado VARCHAR(100),
  valor_anterior TEXT,
  valor_nuevo TEXT,

  comentario TEXT,

  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historial_proyecto ON historial_cambios(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_historial_created_at ON historial_cambios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historial_entidad ON historial_cambios(entidad_tipo);
CREATE INDEX IF NOT EXISTS idx_historial_created_by ON historial_cambios(created_by);

-- Row Level Security
ALTER TABLE historial_cambios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_ven_historial" ON historial_cambios
  FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

-- Solo insertable via triggers/functions (no UPDATE ni DELETE)
CREATE POLICY "insertar_historial" ON historial_cambios
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

-- ============================================================
-- Trigger: Auditoría automática de cambios en proyectos
-- ============================================================
CREATE OR REPLACE FUNCTION log_cambios_proyecto()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar cambio de estado
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO historial_cambios (proyecto_id, entidad_tipo, campo_afectado, valor_anterior, valor_nuevo, created_by)
    VALUES (NEW.id, 'Estado', 'estado', OLD.estado, NEW.estado, NEW.updated_by);
  END IF;

  -- Registrar cambio de porcentaje
  IF OLD.porcentaje_avance IS DISTINCT FROM NEW.porcentaje_avance THEN
    INSERT INTO historial_cambios (proyecto_id, entidad_tipo, campo_afectado, valor_anterior, valor_nuevo, created_by)
    VALUES (NEW.id, 'Avance', 'porcentaje_avance', OLD.porcentaje_avance::TEXT, NEW.porcentaje_avance::TEXT, NEW.updated_by);
  END IF;

  -- Registrar cambio de responsable
  IF OLD.responsable_primario IS DISTINCT FROM NEW.responsable_primario THEN
    INSERT INTO historial_cambios (proyecto_id, entidad_tipo, campo_afectado, valor_anterior, valor_nuevo, created_by)
    VALUES (NEW.id, 'Proyecto', 'responsable_primario', OLD.responsable_primario::TEXT, NEW.responsable_primario::TEXT, NEW.updated_by);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_proyectos
  AFTER UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION log_cambios_proyecto();
```

### semaforos

```sql
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
```

### notificaciones_config

```sql
-- ============================================================
-- Migration 009: Tabla notificaciones_config
-- Depende de: 001_usuarios
-- ============================================================

CREATE TABLE IF NOT EXISTS notificaciones_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

  evento VARCHAR(100) NOT NULL,
  -- Eventos válidos:
  -- 'bloqueo_registrado', 'estado_cambio', 'accion_asignada',
  -- 'bloqueo_3_dias', 'bloqueo_5_dias', 'plazo_vencido',
  -- 'comentario_nuevo', 'semaforo_generado', 'tarea_asignada',
  -- 'tarea_finalizada', 'proyecto_creado'

  canal_alerta_visual BOOLEAN DEFAULT TRUE,
  canal_email BOOLEAN DEFAULT FALSE,
  canal_popup BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(usuario_id, evento)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones_config(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_evento ON notificaciones_config(evento);

-- Trigger updated_at
CREATE TRIGGER notificaciones_config_updated_at
  BEFORE UPDATE ON notificaciones_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE notificaciones_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario_ve_propias_notificaciones" ON notificaciones_config
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "usuario_gestiona_propias_notificaciones" ON notificaciones_config
  FOR ALL USING (usuario_id = auth.uid());

-- Insertar config default para nuevos usuarios
CREATE OR REPLACE FUNCTION crear_notificaciones_default(p_usuario_id UUID)
RETURNS VOID AS $$
DECLARE
  eventos TEXT[] := ARRAY[
    'bloqueo_registrado',
    'estado_cambio',
    'accion_asignada',
    'bloqueo_3_dias',
    'bloqueo_5_dias',
    'plazo_vencido',
    'comentario_nuevo',
    'semaforo_generado',
    'tarea_asignada',
    'tarea_finalizada',
    'proyecto_creado'
  ];
  evento TEXT;
BEGIN
  FOREACH evento IN ARRAY eventos LOOP
    INSERT INTO notificaciones_config (usuario_id, evento, canal_alerta_visual, canal_email, canal_popup)
    VALUES (
      p_usuario_id,
      evento,
      TRUE,  -- alerta visual siempre activa
      CASE WHEN evento IN ('bloqueo_5_dias', 'plazo_vencido') THEN TRUE ELSE FALSE END,
      CASE WHEN evento IN ('bloqueo_registrado', 'accion_asignada', 'bloqueo_5_dias', 'plazo_vencido') THEN TRUE ELSE FALSE END
    )
    ON CONFLICT (usuario_id, evento) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: crear notificaciones default al crear usuario
CREATE OR REPLACE FUNCTION handle_new_usuario_notificaciones()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM crear_notificaciones_default(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_usuario_created_notificaciones
  AFTER INSERT ON usuarios
  FOR EACH ROW EXECUTE FUNCTION handle_new_usuario_notificaciones();
```

### 010_crear_indices_y_triggers

```sql
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
```

### 011_refactor_focos_y_prioridad

```sql
-- ============================================================
-- Migration 011: Refactorizar focos estratégicos (4 → 3)
--                Responsable opcional en tareas
--                Campos de bloqueo en tareas
-- Depende de: 010_crear_indices_y_triggers.sql
-- ============================================================

-- ============================================================
-- SECCIÓN 1: Actualizar constraint de foco_estrategico (PRIMERO)
-- ============================================================

ALTER TABLE proyectos
DROP CONSTRAINT IF EXISTS proyectos_foco_estrategico_check;

-- ============================================================
-- SECCIÓN 1B: Migrar datos existentes: mapeo automático 4 focos → 3 focos
-- ============================================================
-- Mapeo definido:
--   'Desarrollo Organizacional' → 'Alta prioridad (estratégico)'
--   'Gestión de Personas'       → 'Alta prioridad (estratégico)'
--   'Cultura de Seguridad'      → 'Prioridad media (habilitadores)'
--   'Comunicaciones'            → 'Prioridad media (habilitadores)'

UPDATE proyectos
SET foco_estrategico = CASE
  WHEN foco_estrategico = 'Desarrollo Organizacional' THEN 'Alta prioridad (estratégico)'
  WHEN foco_estrategico = 'Gestión de Personas' THEN 'Alta prioridad (estratégico)'
  WHEN foco_estrategico = 'Cultura de Seguridad' THEN 'Prioridad media (habilitadores)'
  WHEN foco_estrategico = 'Comunicaciones' THEN 'Prioridad media (habilitadores)'
  ELSE 'Prioridad operacional'
END;

-- ============================================================
-- SECCIÓN 1C: Agregar nuevo constraint
-- ============================================================

ALTER TABLE proyectos
ADD CONSTRAINT proyectos_foco_estrategico_check
CHECK (foco_estrategico IN (
  'Alta prioridad (estratégico)',
  'Prioridad media (habilitadores)',
  'Prioridad operacional'
));

-- ============================================================
-- SECCIÓN 1C: Agregar índice para queries de filtrado de prioridad
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_proyectos_prioridad ON proyectos(prioridad);

-- ============================================================
-- SECCIÓN 2: Permitir responsable_id NULL en tareas (mejora #15)
-- ============================================================

-- Primero, eliminar constraint existente
ALTER TABLE tareas
DROP CONSTRAINT tareas_responsable_id_fkey;

-- Hacer responsable_id nullable
ALTER TABLE tareas
ALTER COLUMN responsable_id DROP NOT NULL;

-- Re-crear constraint con ON DELETE SET NULL
ALTER TABLE tareas
ADD CONSTRAINT tareas_responsable_id_fkey
FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- ============================================================
-- SECCIÓN 2B: Trigger para asignar responsable automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION asignar_responsable_tarea_auto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.responsable_id IS NULL THEN
    NEW.responsable_id := NEW.created_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS tareas_asignar_responsable_auto ON tareas;

CREATE TRIGGER tareas_asignar_responsable_auto
  BEFORE INSERT ON tareas
  FOR EACH ROW EXECUTE FUNCTION asignar_responsable_tarea_auto();

-- ============================================================
-- SECCIÓN 2C: Actualizar tareas existentes sin responsable
-- ============================================================

UPDATE tareas
SET responsable_id = created_by
WHERE responsable_id IS NULL;

-- ============================================================
-- SECCIÓN 3: Agregar campos de bloqueo a nivel tarea
-- ============================================================

-- Almacena: ¿por qué estaba bloqueado?
ALTER TABLE tareas
ADD COLUMN IF NOT EXISTS bloqueado_razon TEXT;

-- Almacena: ¿cómo se desbloqueó? (comentario de desbloqueo)
ALTER TABLE tareas
ADD COLUMN IF NOT EXISTS desbloqueado_razon TEXT;

-- Quién lo desbloqueó
ALTER TABLE tareas
ADD COLUMN IF NOT EXISTS desbloqueado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- Cuándo se desbloqueó
ALTER TABLE tareas
ADD COLUMN IF NOT EXISTS fecha_desbloqueado TIMESTAMPTZ;
```

### 012_agregar_validacion_subproyectos

```sql
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
```

### 013_rbac_por_area

```sql
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
DROP POLICY IF EXISTS "lideres_ven_proyectos_area" ON proyectos;

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
DROP POLICY IF EXISTS "lideres_ven_tareas_area" ON tareas;

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
DROP POLICY IF EXISTS "lideres_ven_bloqueos_area" ON bloqueos;

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
DROP POLICY IF EXISTS "lideres_ven_riesgos_area" ON riesgos;

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
DROP POLICY IF EXISTS "lideres_ven_comentarios_area" ON comentarios;

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
```

### 014_permitir_ver_usuarios_para_asignar

```sql
-- ============================================================
-- Migration 014: Permitir ver todos los usuarios para asignar responsables
-- ============================================================

-- Descripción:
-- Agregar política RLS que permite a TODOS los usuarios autenticados
-- ver la lista completa de usuarios activos.
--
-- Esto es necesario para:
-- 1. Dropdown de responsable en formulario de crear tarea
-- 2. Mostrar usuario responsable en tareas, kanban, etc.
--
-- La política anterior solo permitía a Gerentes ver todos.
-- Los Líderes de Área solo podían verse a sí mismos.
DROP POLICY IF EXISTS "todos_ven_usuarios_para_asignar" ON usuarios; 
-- Nueva política: Todos los usuarios autenticados ven la lista completa
-- NOTA: No usar subquery recursiva (EXISTS) porque causa conflicto con RLS
-- Solo verificar que el usuario está autenticado (auth.uid() IS NOT NULL)
CREATE POLICY "todos_ven_usuarios_para_asignar" ON usuarios
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### areas

```sql
-- ============================================================
-- Migration 015: Crear tabla areas_responsables
-- Normaliza area_responsable de VARCHAR a tabla separada
-- ============================================================

CREATE TABLE IF NOT EXISTS areas_responsables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  es_gerencia BOOLEAN DEFAULT FALSE,  -- flag para identificar área de Gerencia
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice en nombre para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_areas_nombre ON areas_responsables(nombre);
CREATE INDEX IF NOT EXISTS idx_areas_activo ON areas_responsables(activo);

DROP TRIGGER IF EXISTS areas_updated_at ON areas_responsables;

-- Trigger para updated_at
CREATE TRIGGER areas_updated_at
  BEFORE UPDATE ON areas_responsables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE areas_responsables ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "todos_ven_areas" ON areas_responsables;
-- Todos pueden ver áreas activas
CREATE POLICY "todos_ven_areas" ON areas_responsables
  FOR SELECT
  USING (activo = TRUE);

DROP POLICY IF EXISTS "gerentes_gestionan_areas" ON areas_responsables;
-- Solo Gerentes pueden hacer CRUD en áreas (si es necesario en futuro)
CREATE POLICY  "gerentes_gestionan_areas" ON areas_responsables
  FOR ALL
  USING (public.get_mi_rol() = 'Gerente');

-- ============================================================
-- Seed: Insertar áreas existentes + nueva "Gerencia"
-- ============================================================

INSERT INTO areas_responsables (nombre, es_gerencia, activo) VALUES
  ('DO', FALSE, TRUE),
  ('Gestión de Personas', FALSE, TRUE),
  ('SSO', FALSE, TRUE),
  ('Comunicaciones', FALSE, TRUE),
  ('Gerencia', TRUE, TRUE)
ON CONFLICT (nombre) DO NOTHING;
```

### 016_refactorizar_area_responsable

```sql
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
```

### objetivos

```sql
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
```

