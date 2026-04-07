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
