import { useMutation, useQueryClient } from "@tanstack/react-query"
import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useInfiniteQueryPagination } from "@/lib/queryclient/use-infinite-query"
import { PaginationParams } from "@/lib/queryclient/response.type"
import { Status } from "../common/status.type"
import { TOrder } from "./order.customer"

// ===== Hooks =====

export const useListVendorOrders = (params: PaginationParams<unknown>) =>
  useInfiniteQueryPagination<TOrder>(
    ['order', 'list'],
    'order/vendor',
    params
  )

export const useConfirmOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['order', 'confirm'],
    mutationFn: (params: {
      order_id: string
      from_address?: string | null
      package?: Record<string, any> // weight_grams, length_cm, width_cm, height_cm, ...
    }) =>
      customFetchStandard<{
        message: string
      }>(`order/confirm`, {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['order', 'list'] })
      await queryClient.invalidateQueries({ queryKey: ['order', 'vendor'] })
    },
  })
}


