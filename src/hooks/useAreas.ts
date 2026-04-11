/**
 * @file Hook: useAreas - Obtener lista de áreas responsables
 */

import { useQuery } from '@tanstack/react-query'
import type { DbArea } from '@/types/database'

export function useAreas() {
  return useQuery<DbArea[]>({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch('/api/areas')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error fetching areas')
      }
      return response.json()
    },
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}
