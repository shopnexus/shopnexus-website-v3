"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useListRefunds, RefundMethod } from "@/core/order/refund.customer"
import { Status } from "@/core/common/status.type"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, ChevronRight, Package, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const statusLabels: Record<Status, string> = {
  [Status.Pending]: "Pending",
  [Status.Processing]: "Processing",
  [Status.Success]: "Completed",
  [Status.Canceled]: "Cancelled",
  [Status.Failed]: "Failed",
}

const statusColors: Record<Status, string> = {
  [Status.Pending]: "bg-yellow-100 text-yellow-800",
  [Status.Processing]: "bg-blue-100 text-blue-800",
  [Status.Success]: "bg-green-100 text-green-800",
  [Status.Canceled]: "bg-gray-100 text-gray-800",
  [Status.Failed]: "bg-red-100 text-red-800",
}

const methodLabels: Record<RefundMethod, string> = {
  [RefundMethod.PickUp]: "Pick Up",
  [RefundMethod.DropOff]: "Drop Off",
}

export default function RefundsPage() {
  const {
    data: refundsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListRefunds({ limit: 10 })

  const refunds = useMemo(() => {
    return refundsData?.pages.flatMap((page) => page.data) ?? []
  }, [refundsData])

  const pendingRefunds = refunds.filter(
    (r) => r.status === Status.Pending || r.status === Status.Processing
  )
  const completedRefunds = refunds.filter((r) => r.status === Status.Success)
  const cancelledRefunds = refunds.filter(
    (r) => r.status === Status.Canceled || r.status === Status.Failed
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Refunds</h1>
        <p className="text-muted-foreground">Track your refund requests</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({refunds.length})</TabsTrigger>
          <TabsTrigger value="pending">In Progress ({pendingRefunds.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedRefunds.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledRefunds.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <RefundList
            refunds={refunds}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <RefundList refunds={pendingRefunds} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <RefundList refunds={completedRefunds} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <RefundList refunds={cancelledRefunds} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RefundList({
  refunds,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  refunds: Array<{
    id: string
    order_id: string
    method: RefundMethod
    status: Status
    reason: string
    date_created: string
  }>
  isLoading?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (refunds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <RotateCcw className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No refunds found</h3>
        <p className="text-muted-foreground mb-4">
          You haven&apos;t requested any refunds yet.
        </p>
        <Button asChild>
          <Link href="/account/orders">View Orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {refunds.map((refund) => (
        <Card key={refund.id}>
          <CardContent className="p-4">
            {/* Refund Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Refund #{refund.id.slice(0, 8)}
                </span>
                <span className="text-muted-foreground">
                  {new Date(refund.date_created).toLocaleDateString()}
                </span>
              </div>
              <Badge
                variant="secondary"
                className={cn("font-normal", statusColors[refund.status])}
              >
                {statusLabels[refund.status]}
              </Badge>
            </div>

            {/* Refund Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Order #{refund.order_id.slice(0, 8)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                <span className="font-medium">Reason:</span> {refund.reason}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Return Method:</span>{" "}
                {methodLabels[refund.method]}
              </p>
            </div>

            {/* Refund Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {refund.status === Status.Pending && "Awaiting review"}
                {refund.status === Status.Processing && "Being processed"}
                {refund.status === Status.Success && "Refund completed"}
                {refund.status === Status.Canceled && "Request cancelled"}
                {refund.status === Status.Failed && "Request failed"}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/orders/${refund.order_id}`}>
                    View Order
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
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
  )
}
