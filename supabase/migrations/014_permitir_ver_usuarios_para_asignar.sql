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

-- Nueva política: Todos los usuarios autenticados ven la lista completa
CREATE POLICY "todos_ven_usuarios_para_asignar" ON usuarios
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));
