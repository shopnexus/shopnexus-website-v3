"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  useListBuyerPendingItems,
  useListBuyerPendingOrders,
  useListBuyerCompletedOrders,
  useListBuyerCancelledItems,
  useListBuyerCancelledOrders,
} from "@/core/order/order.buyer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderList } from "./_components/order-list"
import { ItemList } from "./_components/item-list"
import { Inbox } from "lucide-react"

const PAGE_SIZE = 20

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-16 w-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState({ message, cta }: { message: string; cta?: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      {cta && (
        <Button asChild className="mt-4">
          <Link href="/">Start Shopping</Link>
        </Button>
      )}
    </div>
  )
}

function PendingTab() {
  const itemsQ = useListBuyerPendingItems({ limit: PAGE_SIZE })
  const ordersQ = useListBuyerPendingOrders({ limit: PAGE_SIZE })

  const items = useMemo(() => itemsQ.data?.pages.flatMap((p) => p.data) ?? [], [itemsQ.data])
  const orders = useMemo(() => ordersQ.data?.pages.flatMap((p) => p.data) ?? [], [ordersQ.data])

  if (itemsQ.isLoading || ordersQ.isLoading) return <LoadingSkeleton />
  if (items.length === 0 && orders.length === 0) {
    return <EmptyState message="No pending orders" cta />
  }

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Awaiting Payment / Seller Confirm</h3>
          <ItemList
            items={items}
            cancellable
            hasNextPage={itemsQ.hasNextPage}
            isFetchingNextPage={itemsQ.isFetchingNextPage}
            onLoadMore={() => itemsQ.fetchNextPage()}
          />
        </section>
      )}
      {orders.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Awaiting Delivery & Payout</h3>
          <OrderList
            orders={orders}
            hasNextPage={ordersQ.hasNextPage}
            isFetchingNextPage={ordersQ.isFetchingNextPage}
            onLoadMore={() => ordersQ.fetchNextPage()}
          />
        </section>
      )}
    </div>
  )
}

function CompletedTab() {
  const ordersQ = useListBuyerCompletedOrders({ limit: PAGE_SIZE })
  const orders = useMemo(() => ordersQ.data?.pages.flatMap((p) => p.data) ?? [], [ordersQ.data])

  if (ordersQ.isLoading) return <LoadingSkeleton />
  if (orders.length === 0) return <EmptyState message="No completed orders" />

  return (
    <OrderList
      orders={orders}
      hasNextPage={ordersQ.hasNextPage}
      isFetchingNextPage={ordersQ.isFetchingNextPage}
      onLoadMore={() => ordersQ.fetchNextPage()}
    />
  )
}

function CancelledTab() {
  const itemsQ = useListBuyerCancelledItems({ limit: PAGE_SIZE })
  const ordersQ = useListBuyerCancelledOrders({ limit: PAGE_SIZE })

  const items = useMemo(() => itemsQ.data?.pages.flatMap((p) => p.data) ?? [], [itemsQ.data])
  const orders = useMemo(() => ordersQ.data?.pages.flatMap((p) => p.data) ?? [], [ordersQ.data])

  if (itemsQ.isLoading || ordersQ.isLoading) return <LoadingSkeleton />
  if (items.length === 0 && orders.length === 0) return <EmptyState message="No cancelled orders" />

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Cancelled Items (pre-confirm)</h3>
          <ItemList
            items={items}
            hasNextPage={itemsQ.hasNextPage}
            isFetchingNextPage={itemsQ.isFetchingNextPage}
            onLoadMore={() => itemsQ.fetchNextPage()}
          />
        </section>
      )}
      {orders.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Cancelled Orders</h3>
          <OrderList
            orders={orders}
            hasNextPage={ordersQ.hasNextPage}
            isFetchingNextPage={ordersQ.isFetchingNextPage}
            onLoadMore={() => ordersQ.fetchNextPage()}
          />
        </section>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">View and track your orders</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <PendingTab />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <CompletedTab />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <CancelledTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
