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

