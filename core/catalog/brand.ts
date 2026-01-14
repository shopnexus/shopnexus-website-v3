import { useQuery } from '@tanstack/react-query'
import { customFetchStandard } from '@/lib/queryclient/custom-fetch'
import { useInfiniteQueryPagination } from '@/lib/queryclient/use-infinite-query'
import type { PaginationParams } from '@/lib/queryclient/response.type'

// ===== Types =====

export type Brand = {
  id: string
  code: string
  name: string
  description: string
}

// ===== Hooks =====

export const useListBrands = (params: PaginationParams<{
  search?: string
}>) =>
  useInfiniteQueryPagination<Brand>(
    ['brand', 'list'],
    'catalog/brand',
    params
  )

export const useGetBrand = (id: string) =>
  useQuery({
    queryKey: ['brand', 'detail', id],
    queryFn: () => customFetchStandard<Brand>(`catalog/brand/${id}`),
  })

