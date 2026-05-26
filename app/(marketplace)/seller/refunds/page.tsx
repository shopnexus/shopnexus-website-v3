"use client"

import { useState } from "react"
import {
  useListRefundsSeller,
  useSellerApproveRefund,
} from "@/core/order/refund.seller"
import { TRefund, RefundStatus } from "@/core/order/refund.buyer"
import { CreateDisputeDialog } from "@/components/order/create-dispute-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Loader2,
  Clock,
  RotateCcw,
  AlertCircle,
  Scale,
  Truck,
  Package,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const statusBadge: Record<RefundStatus, { label: string; className: string }> = {
  Shipping: { label: "Return in transit", className: "bg-blue-100 text-blue-800" },
  AwaitingSellerReview: { label: "Awaiting your review", className: "bg-yellow-100 text-yellow-800" },
  Disputed: { label: "Disputed — admin review", className: "bg-purple-100 text-purple-800" },
  Accepted: { label: "Refunded", className: "bg-green-100 text-green-800" },
  Rejected: { label: "Rejected — return shipped back", className: "bg-red-100 text-red-800" },
  Cancelled: { label: "Withdrawn by buyer", className: "bg-gray-100 text-gray-800" },
}

function RefundRow({
  refund,
  onApprove,
  onDisputeOpen,
  approvePending,
}: {
  refund: TRefund
  onApprove: (id: string) => void
  onDisputeOpen: (refundId: string) => void
  approvePending: boolean
}) {
  const badge = statusBadge[refund.status] ?? statusBadge.Shipping
  const isReviewable = refund.status === "AwaitingSellerReview"

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-sm">#{refund.id.slice(0, 8)}</h3>
              <Badge variant="secondary" className={cn("font-normal", badge.className)}>
                {badge.label}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Truck className="h-3 w-3" />
                Return shipment #{refund.return_transport_id}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Order #{refund.order_id.slice(0, 8)} &middot;{" "}
              {new Date(refund.date_created).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {refund.date_received_by_seller && (
                <> &middot; Received {new Date(refund.date_received_by_seller).toLocaleDateString()}</>
              )}
            </p>

            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{refund.reason}</p>
            </div>

            {refund.attachments && refund.attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {refund.attachments.slice(0, 6).map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-14 w-14 overflow-hidden rounded border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.url}
                      alt={att.name || `evidence ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            )}

            {refund.status === "Rejected" && refund.rejection_reason && (
              <p className="text-sm text-muted-foreground">
                Admin upheld dispute — {refund.rejection_reason}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isReviewable && (
              <>
                <Button size="sm" onClick={() => onApprove(refund.id)} disabled={approvePending}>
                  {approvePending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve refund
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDisputeOpen(refund.id)}>
                  <Scale className="h-4 w-4 mr-1" />
                  Dispute
                </Button>
              </>
            )}

            {refund.status === "Accepted" && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 font-normal">
                <CheckCircle className="h-3 w-3 mr-1" />
                Refunded
              </Badge>
            )}

            {refund.status === "Rejected" && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 font-normal">
                <Package className="h-3 w-3 mr-1" />
                Returned to buyer
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SellerRefundsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [pendingApproveId, setPendingApproveId] = useState<string | null>(null)
  const [disputeRefundId, setDisputeRefundId] = useState<string | null>(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useListRefundsSeller({
    limit: 20,
    ...(activeTab !== "all" ? { status: activeTab } : {}),
  })

  const approveMutation = useSellerApproveRefund()

  const refunds = data?.pages.flatMap((page) => page.data) ?? []

  const handleApprove = async (id: string) => {
    setPendingApproveId(id)
    try {
      await approveMutation.mutateAsync({ id })
      toast.success("Refund approved. Buyer wallet credited.")
    } catch {
      toast.error("Failed to approve refund.")
    } finally {
      setPendingApproveId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refunds</h1>
        <p className="text-muted-foreground">Review and process refund requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Shipping">
            <Truck className="h-3.5 w-3.5 mr-1" />
            Incoming
          </TabsTrigger>
          <TabsTrigger value="AwaitingSellerReview">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Awaiting You
          </TabsTrigger>
          <TabsTrigger value="Disputed">Disputed</TabsTrigger>
          <TabsTrigger value="Accepted">Refunded</TabsTrigger>
          <TabsTrigger value="Rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : refunds.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No refunds found</h3>
            <p className="text-muted-foreground">Refund requests will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <RefundRow
              key={refund.id}
              refund={refund}
              onApprove={handleApprove}
              onDisputeOpen={setDisputeRefundId}
              approvePending={pendingApproveId === refund.id}
            />
          ))}

          {hasNextPage && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {disputeRefundId && (
        <CreateDisputeDialog
          refundId={disputeRefundId}
          open={true}
          onOpenChange={(o) => {
            if (!o) setDisputeRefundId(null)
          }}
        />
      )}
    </div>
  )
}
