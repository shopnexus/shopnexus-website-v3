import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useInfiniteQueryPagination } from "@/lib/queryclient/use-infinite-query"
import qs from "qs"
import { PaginationParams, SuccessPaginationRes, SuccessResponse } from "@/lib/queryclient/response.type"
import { Resource } from "../common/resource.type"
import { Brand } from "./brand"
import { Category } from "./category"

// ===== Types =====

export type TProductDetail = {
  id: string
  slug: string
  vendor_id: string
  name: string
  description: string
  brand: Brand
  is_active: boolean
  category: Category
  rating: TRating
  resources: Resource[]
  promotions: {
    id: string
    title: string
    description: string
  }[]
  skus: {
    id: string
    price: number
    original_price: number
    attributes: { name: string; value: string }[]
    taken: number
  }[]
  specifications: { name: string; value: string }[]
}

export type TProductCard = {
  id: string
  slug: string
  vendor_id: string
  category_id: string
  brand_id: string
  name: string
  description: string
  is_active: boolean
  date_created: string
  date_updated: string
  date_deleted: string | null

  price: number
  original_price: number
  rating: TRating
  resources: Resource[]
  promotions: TProductCardPromotion[]
}

export type TProductCardPromotion = {
  id: string
  title: string
  description: string
}

export type TRating = {
  score: number
  total: number
  breakdown: Record<string, number>
}

// ===== Hooks =====

export const useListProductCards = (
  params: PaginationParams<{
    search?: string
    vendor_id?: string
  }>,
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
) =>
  useInfiniteQueryPagination<TProductCard>(
    ['product', 'cards'],
    'catalog/product-card',
    params,
    options
  )

export const useListProductCardsRecommended = (params: { limit?: number }) =>
  useQuery({
    queryKey: ['product', 'cards', 'recommended', params],
    queryFn: async () => customFetchStandard<TProductCard[]>(`catalog/product-card/recommended?${qs.stringify(params)}`),
  })

export const useGetProductDetail = ({
  id,
  slug,
}: {
  id?: string
  slug?: string
}) =>
  useQuery({
    queryKey: ['product', 'detail', (id ?? slug)],
    queryFn: () => customFetchStandard<TProductDetail>(`catalog/product-detail?${qs.stringify({ id, slug })}`),
  })


