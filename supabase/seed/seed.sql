-- ============================================================
-- Seed: Datos de prueba para desarrollo
-- SOLO USAR EN ENTORNO DE DESARROLLO
-- ============================================================

-- Nota: Los IDs de auth.users deben crearse primero en Supabase Auth
-- Este seed asume que ya existen los usuarios en auth.users

-- Insertar usuarios de prueba (si no existen)
INSERT INTO usuarios (id, email, nombre_completo, rol, area_responsable) VALUES
  ('00000000-0000-0000-0000-000000000001', 'gerente@empresa.com', 'Ana García Directora', 'Gerente', NULL),
  ('00000000-0000-0000-0000-000000000002', 'lider.do@empresa.com', 'Carlos Rojas DO', 'Líder Area', 'DO'),
  ('00000000-0000-0000-0000-000000000003', 'lider.gp@empresa.com', 'Sandra López GP', 'Líder Area', 'Gestión de Personas'),
  ('00000000-0000-0000-0000-000000000004', 'lider.sso@empresa.com', 'Miguel Torres SSO', 'Líder Area', 'SSO'),
  ('00000000-0000-0000-0000-000000000005', 'lider.com@empresa.com', 'Patricia Mora COM', 'Líder Area', 'Comunicaciones')
ON CONFLICT (email) DO NOTHING;

-- Proyectos de ejemplo
INSERT INTO proyectos (
  nombre, tipo, subtipo, foco_estrategico, area_responsable, categoria,
  responsable_primario, descripcion_ejecutiva, objetivo,
  fecha_inicio, fecha_fin_planificada, estado, porcentaje_avance, prioridad,
  created_by, updated_by
) VALUES
  (
    'Planes de Desarrollo 2026',
    'Proyecto', 'Estratégico',
    'Desarrollo Organizacional', 'DO', 'Capacitación',
    '00000000-0000-0000-0000-000000000002',
    'Diseño e implementación de planes de desarrollo individualizados para colaboradores clave.',
    'Aumentar en 20% las competencias técnicas y blandas del equipo DO.',
    '2026-01-15', '2026-07-31',
    'En Curso', 65, 2,
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'Diplomado Liderazgo Operacional',
    'Proyecto', 'Estratégico',
    'Desarrollo Organizacional', 'DO', 'Liderazgo',
    '00000000-0000-0000-0000-000000000002',
    'Programa de certificación de liderazgo para jefaturas operacionales.',
    'Certificar a 24 personas en habilidades de liderazgo situacional.',
    '2026-02-01', '2026-06-30',
    'En Curso', 80, 1,
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'Normalización Jornada 40 Horas',
    'Proyecto', 'Operativo',
    'Gestión de Personas', 'Gestión de Personas', 'Temas Legales/Normativos',
    '00000000-0000-0000-0000-000000000003',
    'Implementación de la ley de jornada de 40 horas semanales.',
    'Cumplir normativa legal antes del plazo de 2026-04-30.',
    '2026-01-01', '2026-04-30',
    'En Riesgo', 55, 1,
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'Migración Sistema BUK',
    'Proyecto', 'Operativo',
    'Gestión de Personas', 'Gestión de Personas', 'Reportería',
    '00000000-0000-0000-0000-000000000003',
    'Migración del sistema de remuneraciones al nuevo módulo BUK.',
    'Tener el 100% de la nómina operando en BUK al 30/06/2026.',
    '2026-03-01', '2026-06-30',
    'En Curso', 35, 2,
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'Programa Cultura de Seguridad 2026',
    'Línea', NULL,
    'Cultura de Seguridad', 'SSO', 'Cultura de Seguridad',
    '00000000-0000-0000-0000-000000000004',
    'Programa anual de formación y sensibilización en cultura de seguridad.',
    'Reducir accidentabilidad en 15% respecto al año anterior.',
    '2026-01-01', '2026-12-31',
    'En Curso', 25, 2,
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004'
  ),
  (
    'Plan Sucesión Posiciones Críticas',
    'Proyecto', 'Estratégico',
    'Desarrollo Organizacional', 'DO', 'Liderazgo',
    '00000000-0000-0000-0000-000000000002',
    'Identificar y desarrollar sucesores para las 5 posiciones más críticas.',
    'Tener al menos 1 sucesor identificado por posición crítica.',
    '2026-02-15', '2026-08-31',
    'Bloqueado', 20, 1,
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002'
  )
ON CONFLICT (nombre, area_responsable) DO NOTHING;

-- Bloqueo de ejemplo
INSERT INTO bloqueos (
  proyecto_id, descripcion, tipo, accion_requerida, requiere_escalamiento,
  estado, created_by
)
SELECT
  p.id,
  'Definir criterios de evaluación para sucesores: antigüedad vs potencial vs desempeño. GG debe aprobar los pesos.',
  'Espera decisión',
  'Decisión',
  TRUE,
  'Activo',
  '00000000-0000-0000-0000-000000000002'
FROM proyectos p
WHERE p.nombre = 'Plan Sucesión Posiciones Críticas'
  AND p.area_responsable = 'DO'
  AND NOT EXISTS (
    SELECT 1 FROM bloqueos b WHERE b.proyecto_id = p.id AND b.estado = 'Activo'
  );

-- Tareas de ejemplo para "Planes de Desarrollo 2026"
INSERT INTO tareas (
  proyecto_id, nombre, descripcion, estado, porcentaje_avance,
  responsable_id, fecha_inicio, fecha_fin_planificada,
  created_by, updated_by
)
SELECT
  p.id,
  unnest(ARRAY[
    'Diagnóstico necesidades de desarrollo',
    'Diseño planes individualizados',
    'Validación con jefaturas',
    'Implementación y seguimiento',
    'Evaluación y cierre'
  ]),
  NULL,
  unnest(ARRAY['Finalizado', 'En Curso', 'En Curso', 'Pendiente', 'Pendiente']::VARCHAR[]),
  unnest(ARRAY[100, 70, 40, 0, 0]),
  '00000000-0000-0000-0000-000000000002',
  unnest(ARRAY[
    '2026-01-15'::DATE, '2026-02-15'::DATE, '2026-04-01'::DATE,
    '2026-05-01'::DATE, '2026-07-01'::DATE
  ]),
  unnest(ARRAY[
    '2026-02-14'::DATE, '2026-03-31'::DATE, '2026-04-30'::DATE,
    '2026-06-30'::DATE, '2026-07-31'::DATE
  ]),
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002'
FROM proyectos p
WHERE p.nombre = 'Planes de Desarrollo 2026' AND p.area_responsable = 'DO'
ON CONFLICT (proyecto_id, nombre) DO NOTHING;
