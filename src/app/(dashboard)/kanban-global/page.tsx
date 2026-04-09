/**
 * @page KanbanGlobal
 * Vista global con kanban de proyectos por estado
 */

'use client'

import { KanbanGlobal } from '@/components/Proyectos/KanbanGlobal/KanbanGlobal'

export default function KanbanGlobalPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kanban Global</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vista de todas las tareas organizadas por estado. Las tareas están coloreadas por proyecto.
          Puedes arrastar tareas entre columnas para cambiar su estado.
        </p>
      </div>

      <KanbanGlobal />
    </div>
  )
}
