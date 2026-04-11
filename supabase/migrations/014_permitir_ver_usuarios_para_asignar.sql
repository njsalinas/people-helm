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
-- NOTA: No usar subquery recursiva (EXISTS) porque causa conflicto con RLS
-- Solo verificar que el usuario está autenticado (auth.uid() IS NOT NULL)
CREATE POLICY "todos_ven_usuarios_para_asignar" ON usuarios
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
