import { useQuery } from '@tanstack/react-query'
import { customFetchStandard } from '@/lib/queryclient/custom-fetch'
import { useInfiniteQueryPagination } from '@/lib/queryclient/use-infinite-query'
import type { PaginationParams } from '@/lib/queryclient/response.type'

// ===== Types =====

export type Tag = {
  id: string
  description: string
}

// ===== Hooks =====

export const useListTags = (params: PaginationParams<{
  search?: string
}>) =>
  useInfiniteQueryPagination<Tag>(
    ['tag', 'list'],
    'catalog/tag',
    params
  )

export const useGetTag = (id: string) =>
  useQuery({
    queryKey: ['tag', 'detail', id],
    queryFn: () => customFetchStandard<Tag>(`catalog/tag/${id}`),
  })

