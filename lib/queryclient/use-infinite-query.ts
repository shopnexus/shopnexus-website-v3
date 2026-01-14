import { useInfiniteQuery } from "@tanstack/react-query"
import { customFetchPagination } from "./custom-fetch"
import { PaginationParams, SuccessPaginationRes } from "./response.type"
import qs from "qs"

/**
 * Creates a reusable infinite query hook with standardized pagination logic
 * 
 * @param queryKey - The base query key (e.g., ['brand', 'list'])
 * @param endpoint - The API endpoint URL (e.g., 'catalog/brand')
 * @param params - Pagination parameters
 * @param options - Additional options for useInfiniteQuery (excluding queryKey, queryFn, getNextPageParam, initialPageParam)
 * @returns Configured useInfiniteQuery hook
 */
export function useInfiniteQueryPagination<TData>(
  queryKey: (string | unknown)[],
  endpoint: string,
  params: PaginationParams<Record<string, any>>,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    refetchOnWindowFocus?: boolean
    refetchOnMount?: boolean
    refetchOnReconnect?: boolean
    retry?: number | boolean
    retryDelay?: number | ((attemptIndex: number) => number)
  }
) {
  return useInfiniteQuery({
    queryKey: [...queryKey, params],
    queryFn: async ({ pageParam }) =>
      customFetchPagination<TData>(
        `${endpoint}?${qs.stringify(pageParam, { arrayFormat: 'repeat' })}`
      ),
    getNextPageParam: (
      lastPageRes: SuccessPaginationRes<TData>,
      _,
      lastPageParam
    ) => {
      if (
        !lastPageRes.pagination.next_page &&
        !lastPageRes.pagination.next_cursor
      ) {
        return undefined
      }
      return {
        ...lastPageParam,
        page: lastPageRes.pagination.next_page,
        cursor: lastPageRes.pagination.next_cursor,
        limit: lastPageParam.limit,
      }
    },
    initialPageParam: params,
    ...options,
  })
}

