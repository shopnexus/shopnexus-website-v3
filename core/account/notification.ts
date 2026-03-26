import { useMutation, useQuery } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryclient/query-client'
import { customFetchStandard } from '@/lib/queryclient/custom-fetch'
import { useInfiniteQueryPagination } from '@/lib/queryclient/use-infinite-query'
import { PaginationParams } from '@/lib/queryclient/response.type'

// ===== Types =====

export type Notification = {
  id: number
  account_id: string
  type: string // "order_confirmed", "order_cancelled", "refund_approved", "new_message", etc.
  channel: string
  title: string
  content: string
  is_read: boolean
  metadata: Record<string, any> | null
  date_created: string
  date_updated: string
  date_sent: string | null
  date_scheduled: string | null
}

// ===== Hooks =====

export const useListNotifications = (params: PaginationParams<unknown>) =>
  useInfiniteQueryPagination<Notification>(
    ['notification', 'list'],
    'account/notification',
    params
  )

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notification', 'unread'],
    queryFn: async () => customFetchStandard<{ count: number }>('account/notification/unread-count'),
    refetchInterval: 30000,
  })

export const useMarkRead = () =>
  useMutation({
    mutationFn: async (params: { ids: number[] }) =>
      customFetchStandard<{ message: string }>('account/notification/read', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: async () => {
      const queryClient = getQueryClient()
      await queryClient.invalidateQueries({ queryKey: ['notification'] })
    },
  })

export const useMarkAllRead = () =>
  useMutation({
    mutationFn: async () =>
      customFetchStandard<{ message: string }>('account/notification/read-all', {
        method: 'POST',
      }),
    onSuccess: async () => {
      const queryClient = getQueryClient()
      await queryClient.invalidateQueries({ queryKey: ['notification'] })
    },
  })
