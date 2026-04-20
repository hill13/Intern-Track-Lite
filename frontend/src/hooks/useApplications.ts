// useApplications.ts — React Query hook for fetching all applications
// Wraps useQuery so any component can get the applications list without
// manually managing loading/error state or worrying about duplicate API calls.
// React Query caches the result — multiple components can call this hook
// and only one network request will be made.

import { useQuery } from '@tanstack/react-query'
import { getApplications } from '../api/applications'
import type { Application } from '../types'

export function useApplications() {
  const { data: applications, isLoading, isError } = useQuery<Application[]>({
    queryKey: ['applications'],  // cache key — React Query uses this to identify and reuse cached data
    queryFn: () => getApplications(),  // wrapped in arrow function so React Query's context object isn't passed as filters
  })

  return { applications, isLoading, isError }
}
