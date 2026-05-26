import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useInfiniteQueryPagination } from "@/lib/queryclient/use-infinite-query"
import { PaginationParams } from "@/lib/queryclient/response.type"

// ===== Types =====

export type DisputeAttachment = {
  url: string
  kind?: string
  name?: string
}

// DisputeStatus mirrors the backend order.dispute_status enum.
export type DisputeStatus = "Open" | "SellerWins" | "BuyerWins"

// TRefundDispute mirrors ordermodel.RefundDispute. Disputes are seller-
// initiated escalations against a buyer's refund; admin resolves.
export type TRefundDispute = {
  id: string
  refund_id: string
  account_id: string // seller (the disputer)
  reason: string
  attachments: DisputeAttachment[]
  status: DisputeStatus
  date_created: string
  resolved_by_id: string | null
  date_resolved: string | null
  resolution_note: string | null
}

// ===== Hooks =====

export const useListRefundDisputes = (
  params?: PaginationParams<{ status?: DisputeStatus }>,
) =>
  useInfiniteQueryPagination<TRefundDispute>(
    ["disputes", params],
    "order/disputes",
    params ?? { limit: 20 },
  )

export const useListRefundDisputesByRefund = (
  refundId: string,
  params: PaginationParams,
) =>
  useInfiniteQueryPagination<TRefundDispute>(
    ["disputes", "refund", refundId, params],
    `order/refunds/${refundId}/disputes`,
    params ?? { limit: 20 },
  )

export const useGetRefundDispute = (disputeId: string) =>
  useQuery({
    queryKey: ["disputes", disputeId],
    queryFn: () =>
      customFetchStandard<TRefundDispute>(`order/disputes/${disputeId}`),
    enabled: !!disputeId,
  })

// useAdminUpholdDispute: seller wins. Refund flips to Rejected, items are
// shipped back to the buyer, no refund is issued. Backend enforces admin role.
export const useAdminUpholdDispute = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { id: string; resolution_note: string }) =>
      customFetchStandard<TRefundDispute>(
        `order/disputes/${params.id}/uphold`,
        {
          method: "POST",
          body: JSON.stringify({ resolution_note: params.resolution_note }),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disputes"] })
      qc.invalidateQueries({ queryKey: ["order", "refund"] })
    },
  })
}

// useAdminDismissDispute: buyer wins. Refund flips to Accepted, buyer wallet
// is credited. Backend enforces admin role.
export const useAdminDismissDispute = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { id: string; resolution_note: string }) =>
      customFetchStandard<TRefundDispute>(
        `order/disputes/${params.id}/dismiss`,
        {
          method: "POST",
          body: JSON.stringify({ resolution_note: params.resolution_note }),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disputes"] })
      qc.invalidateQueries({ queryKey: ["order", "refund"] })
    },
  })
}
