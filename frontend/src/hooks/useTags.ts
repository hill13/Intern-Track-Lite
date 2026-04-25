import { useQuery } from '@tanstack/react-query'
import { getTags } from '../api/tags'
import type { Tag } from '../types'

export function useTags() {
  const { data: tags, isLoading, isError } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => getTags(),
  })

  return { tags, isLoading, isError }
}
