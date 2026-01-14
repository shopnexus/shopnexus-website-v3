"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useListOrders, OrderStatus, TOrder } from "@/core/order/order.customer"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ChevronRight, ShoppingBag, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Pending",
  [OrderStatus.Confirmed]: "Confirmed",
  [OrderStatus.Shipped]: "Shipped",
  [OrderStatus.Delivered]: "Delivered",
  [OrderStatus.Cancelled]: "Cancelled",
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.Confirmed]: "bg-blue-100 text-blue-800",
  [OrderStatus.Shipped]: "bg-purple-100 text-purple-800",
  [OrderStatus.Delivered]: "bg-green-100 text-green-800",
  [OrderStatus.Cancelled]: "bg-red-100 text-red-800",
}

export default function OrdersPage() {
  const {
    data: ordersData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListOrders({ limit: 10 })

  const orders = useMemo(() => {
    return ordersData?.pages.flatMap((page) => page.data) ?? []
  }, [ordersData])

  const pendingOrders = orders.filter(
    (o) => o.status === OrderStatus.Pending || o.status === OrderStatus.Confirmed
  )
  const shippedOrders = orders.filter((o) => o.status === OrderStatus.Shipped)
  const completedOrders = orders.filter((o) => o.status === OrderStatus.Delivered)
  const cancelledOrders = orders.filter((o) => o.status === OrderStatus.Cancelled)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">View and track your orders</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({shippedOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <OrderList
            orders={orders}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <OrderList orders={pendingOrders} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="shipped" className="mt-6">
          <OrderList orders={shippedOrders} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <OrderList orders={completedOrders} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <OrderList orders={cancelledOrders} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrderList({
  orders,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  orders: TOrder[]
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
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No orders found</h3>
        <p className="text-muted-foreground mb-4">
          You haven&apos;t placed any orders yet.
        </p>
        <Button asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-4">
            {/* Order Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Order #{order.id.slice(0, 8)}
                </span>
                <span className="text-muted-foreground">
                  {new Date(order.date_created).toLocaleDateString()}
                </span>
              </div>
              <Badge
                variant="secondary"
                className={cn("font-normal", statusColors[order.status])}
              >
                {statusLabels[order.status]}
              </Badge>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {order.items.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.sku_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                </div>
              ))}
              {order.items.length > 2 && (
                <p className="text-sm text-muted-foreground">
                  +{order.items.length - 2} more items
                </p>
              )}
            </div>

            {/* Order Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold">{formatPrice(order.total)}</p>
              </div>
              <div className="flex gap-2">
                {order.status === OrderStatus.Delivered && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/orders/${order.id}/refund`}>
                      Request Refund
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/orders/${order.id}`}>
                    View Details
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
              "Load More Orders"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
