import { useMutation, useQueryClient } from "@tanstack/react-query"
import { customFetchStandard } from "@/lib/queryclient/custom-fetch"
import { useInfiniteQueryPagination } from "@/lib/queryclient/use-infinite-query"
import { PaginationParams } from "@/lib/queryclient/response.type"
import { Status } from "../common/status.type"

// ===== Types =====

export type TRefundDispute = {
  id: string
  refund_id: string
  issued_by_id: string
  reason: string
  status: Status
  date_created: string
  date_updated: string
}

// ===== Hooks =====

export const useCreateRefundDispute = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { refund_id: string; reason: string }) =>
      customFetchStandard<TRefundDispute>(
        `order/refunds/${params.refund_id}/disputes`,
        { method: "POST", body: JSON.stringify({ reason: params.reason }) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disputes"] })
    },
  })
}

export const useListRefundDisputes = (params?: PaginationParams) =>
  useInfiniteQueryPagination<TRefundDispute>({
    queryKey: ["disputes", params],
    url: "order/disputes",
    params,
  })

export const useListRefundDisputesByRefund = (
  refundId: string,
  params?: PaginationParams
) =>
  useInfiniteQueryPagination<TRefundDispute>({
    queryKey: ["disputes", "refund", refundId, params],
    url: `order/refunds/${refundId}/disputes`,
    params,
  })

export const useGetRefundDispute = (disputeId: string) =>
  useInfiniteQueryPagination<TRefundDispute>({
    queryKey: ["disputes", disputeId],
    url: `order/disputes/${disputeId}`,
  })
