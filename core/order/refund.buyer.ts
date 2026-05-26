import { useMutation, useQueryClient } from "@tanstack/react-query"
import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useInfiniteQueryPagination } from "@/lib/queryclient/use-infinite-query"
import { PaginationParams } from "@/lib/queryclient/response.type"
import type { DisputeAttachment } from "./dispute"

// ===== Types =====

// Backend status enum (order.refund_status). One refund per order, terminal
// at Accepted or Rejected.
export type RefundStatus =
  | "Shipping"
  | "AwaitingSellerReview"
  | "Disputed"
  | "Accepted"
  | "Rejected"
  | "Cancelled"

// TRefund mirrors ordermodel.Refund. Buyer ships physical return at create
// time (return_transport_id is mandatory); seller decides within 3 days of
// delivery or auto-accept fires.
export type TRefund = {
  id: string
  account_id: string
  order_id: string
  reason: string
  attachments: DisputeAttachment[]
  date_created: string
  status: RefundStatus

  return_transport_id: number
  date_received_by_seller: string | null
  review_deadline: string | null

  seller_decision_at: string | null

  return_to_buyer_transport_id: number | null
  rejection_reason: string | null

  refund_tx_id: string | null
}

// ===== Hooks =====

export const useCreateRefund = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      order_id: string
      reason: string
      attachments: DisputeAttachment[]
      return_option: string
    }) =>
      customFetchStandard<TRefund>(`order/buyer/refund`, {
        method: "POST",
        body: JSON.stringify(params),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["order", "refund"] })
    },
  })
}

export const useListBuyerRefunds = (
  params: PaginationParams<{ status?: string }>,
) =>
  useInfiniteQueryPagination<TRefund>(
    ["order", "refund", "list"],
    "order/buyer/refund",
    params,
  )

// useWithdrawBuyerRefund cancels a Shipping refund. Backend rejects with
// ORDER_REFUND_NOT_WITHDRAWABLE if the refund has moved past Shipping (seller
// already has the items) or the caller is not the refund's buyer.
export const useWithdrawBuyerRefund = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { id: string }) =>
      customFetchStandard<TRefund>(`order/refunds/${params.id}/withdraw`, {
        method: "POST",
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["order", "refund"] })
    },
  })
}
