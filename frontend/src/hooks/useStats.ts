// useStats.ts — React Query hooks for the stats dashboard.
// Two separate hooks (not one) so each chart caches and invalidates independently:
//   - by-stage invalidates when a card is dragged to a new stage
//   - velocity invalidates only when an application is created
// Separate queryKeys = separate caches. Both namespaced under 'stats' so they
// can be invalidated together (['stats']) or individually (full key).

import { useQuery } from '@tanstack/react-query'
import { getByStage, getVelocity } from '../api/stats'
import type { StageCount, VelocityPoint } from '../types'

export function useByStage() {
  const { data, isLoading, isError } = useQuery<StageCount[]>({
    queryKey: ['stats', 'by-stage'],
    queryFn: () => getByStage(),  // arrow wrapper keeps React Query's context object out of the call
  })
  return { data, isLoading, isError }
}

export function useVelocity() {
  const { data, isLoading, isError } = useQuery<VelocityPoint[]>({
    queryKey: ['stats', 'velocity'],
    queryFn: () => getVelocity(),
  })
  return { data, isLoading, isError }
}
