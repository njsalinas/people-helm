-- ============================================================
-- Migration 021: Agregar política DELETE a tareas
-- Depende de: 003_crear_tabla_tareas
-- ============================================================

-- Permitir DELETE a responsables de tareas, gerentes y responsables del proyecto
CREATE POLICY "responsables_eliminan_tareas" ON tareas
  FOR DELETE
  USING (
    responsable_id = auth.uid()
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Gerente')
    OR EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = tareas.proyecto_id
        AND p.responsable_primario = auth.uid()
    )
  );
