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

-- Gerentes ven todos los usuarios
CREATE POLICY "gerentes_ven_todos" ON usuarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid() AND u.rol = 'Gerente'
    )
  );

-- Usuarios ven su propio perfil
CREATE POLICY "usuarios_ven_propio" ON usuarios
  FOR SELECT
  USING (id = auth.uid());

-- Gerentes pueden actualizar cualquier usuario
CREATE POLICY "gerentes_actualizan_usuarios" ON usuarios
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid() AND u.rol = 'Gerente'
    )
  );

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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
