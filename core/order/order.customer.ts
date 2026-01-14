import { useMutation, useQuery } from "@tanstack/react-query"
import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useInfiniteQueryPagination } from "@/lib/queryclient/use-infinite-query"
import { PaginationParams } from "@/lib/queryclient/response.type"

// ===== Types =====

export enum OrderStatus {
  Pending,
  Confirmed,
  Shipped,
  Delivered,
  Cancelled,
}

export type OrderItem = {
  id: string
  order_id: string
  sku_id: string
  sku_name: string
  quantity: number
  unit_price: number
  note: string | null
  serial_ids: string[]
}

export type TOrder = {
  id: string
  customer_id: string
  vendor_id: string
  shipment_id: string
  payment: TPayment
  status: OrderStatus
  address: string
  product_cost: number
  ship_cost: number
  product_discount: number
  ship_discount: number
  total: number
  note: string
  data: Record<string, any>
  date_created: string
  items: OrderItem[]
}

export type TPayment = {
  id: string
  account_id: string
  option: string
  status: string
  amount: number
  data: Record<string, any>
  date_created: string
  date_paid: string | null
  date_expired: string
}

// ===== Hooks =====

export const useQuote = () => useMutation({
  mutationKey: ['quote'],
  mutationFn: (params: {
    address: string
    items: Array<{
      sku_id: string
      quantity: number
      promotion_codes?: string[]
      shipment_option: string
      note?: string
      data?: Record<string, any>
    }>
  }) => customFetchStandard<{
    total: number
    product_cost: number
    ship_cost: number
  }>(`order/quote`, {
    method: 'POST',
    body: JSON.stringify(params),
  }),
})

export const useCheckout = () =>
  useMutation({
    mutationKey: ['checkout'],
    mutationFn: (params: {
      address: string
      payment_option: string
      buy_now: boolean
      items: Array<{
        sku_id: string
        quantity: number
        promotion_codes?: string[]
        shipment_option: string
        note?: string
        data?: Record<string, any>
      }>
    }) => customFetchStandard<{
      order: TOrder
      url: string | null
    }>(`order/checkout`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  })

export const useGetOrder = (id: string) =>
  useQuery({
    queryKey: ['order', id],
    queryFn: () => customFetchStandard<TOrder>(`order/${id}`),
    enabled: !!id,
  })

export const useListOrders = (params: PaginationParams<unknown>) =>
  useInfiniteQueryPagination<TOrder>(
    ['order', 'list'],
    'order',
    params
  )

