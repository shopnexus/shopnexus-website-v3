import { useMutation, useQueryClient } from "@tanstack/react-query"
import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useInfiniteQueryPagination } from "@/lib/queryclient/use-infinite-query"
import { PaginationParams } from "@/lib/queryclient/response.type"
import type { TRefund } from "./refund.buyer"
import type { DisputeAttachment, TRefundDispute } from "./dispute"

export const useListRefundsSeller = (
  params: PaginationParams<{ status?: string }>,
) =>
  useInfiniteQueryPagination<TRefund>(
    ["order", "refund", "list", "seller"],
    "order/seller/refund",
    params,
  )

// SellerApproveRefund: seller agrees with the buyer's claim → buyer wallet
// is auto-credited.
export const useSellerApproveRefund = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { id: string }) =>
      customFetchStandard<TRefund>(`order/refunds/${params.id}/approve`, {
        method: "POST",
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["order", "refund"] })
    },
  })
}

// SellerDisputeRefund: seller escalates to admin. Photos of the received
// goods are mandatory so admin can see the seller's side of the story.
export const useSellerDisputeRefund = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      id: string
      reason: string
      attachments: DisputeAttachment[]
    }) =>
      customFetchStandard<TRefundDispute>(`order/refunds/${params.id}/dispute`, {
        method: "POST",
        body: JSON.stringify({
          reason: params.reason,
          attachments: params.attachments,
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["order", "refund"] })
      await qc.invalidateQueries({ queryKey: ["disputes"] })
    },
  })
}
