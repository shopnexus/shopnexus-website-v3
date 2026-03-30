import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useQuery } from "@tanstack/react-query"

// ===== Types =====

export type DashboardComparison = {
  revenue_change: number | null
  orders_change: number | null
  items_sold_change: number | null
}

export type DashboardSummary = {
  total_revenue: number
  total_orders: number
  items_sold: number
  average_rating: number
  pending_actions: number
  comparison: DashboardComparison
}

export type TimeSeriesPoint = {
  date: string
  value: number
}

export type DashboardCharts = {
  revenue: TimeSeriesPoint[]
  orders: TimeSeriesPoint[]
}

export type DashboardTopProduct = {
  sku_id: string
  sku_name: string
  sold_count: number
  revenue: number
}

export type SellerDashboard = {
  summary: DashboardSummary
  charts: DashboardCharts
  top_products: DashboardTopProduct[]
}

// ===== Hooks =====

export type UseSellerDashboardParams = {
  start?: string // RFC3339
  end?: string   // RFC3339
  granularity?: 'day' | 'week' | 'month'
}

export const useSellerDashboard = (params: UseSellerDashboardParams = {}) => {
  const searchParams = new URLSearchParams()
  if (params.start) searchParams.set('start', params.start)
  if (params.end) searchParams.set('end', params.end)
  if (params.granularity) searchParams.set('granularity', params.granularity)

  const queryString = searchParams.toString()
  const url = `analytic/seller-dashboard${queryString ? `?${queryString}` : ''}`

  return useQuery({
    queryKey: ['seller-dashboard', params.start, params.end, params.granularity],
    queryFn: () => customFetchStandard<SellerDashboard>(url),
  })
}
