"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Inbox } from "lucide-react"
import { TOrderItem, useCancelBuyerPending } from "@/core/order/order.buyer"
import { PendingItemCard } from "./pending-item-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

type Props = {
  items: TOrderItem[]
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  cancellable?: boolean
  emptyMessage?: string
}

export function ItemList({
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  cancellable = false,
  emptyMessage = "No items",
}: Props) {
  const cancelMutation = useCancelBuyerPending()
  const [cancelId, setCancelId] = useState<number | null>(null)

  const handleCancel = async () => {
    if (cancelId === null) return
    try {
      await cancelMutation.mutateAsync(cancelId)
      toast.success("Item cancelled.")
      setCancelId(null)
    } catch {
      toast.error("Failed to cancel item.")
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground inline-flex flex-col items-center gap-2 w-full">
        <Inbox className="h-6 w-6" />
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <PendingItemCard
          key={item.id}
          item={item}
          onCancel={cancellable ? setCancelId : undefined}
          readOnly={!cancellable}
        />
      ))}
      {hasNextPage && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isFetchingNextPage}>
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

      <Dialog open={cancelId !== null} onOpenChange={(open) => { if (!open) setCancelId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this item? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)}>Keep Item</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
