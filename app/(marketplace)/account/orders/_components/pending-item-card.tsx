"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useExchangeRates, useCurrency } from "@/core/common/currency"
import { formatPriceInline } from "@/lib/money"
import { useEnsureBuyerPaymentURL, TOrderItem } from "@/core/order/order.buyer"
import { toast } from "sonner"

type Props = {
  item: TOrderItem
  onCancel?: (id: number) => void
  readOnly?: boolean
}

export function PendingItemCard({ item, onCancel, readOnly = false }: Props) {
  const preferred = useCurrency()
  const { data: rateData } = useExchangeRates()
  const fmt = (amount: number) =>
    formatPriceInline(amount, "VND", preferred, rateData?.rates, "native")

  const txStatus = item.payment_session?.status
  let badgeLabel: string
  let badgeColor: string
  if (txStatus === "Pending") {
    badgeLabel = "Awaiting Payment"
    badgeColor = "bg-yellow-100 text-yellow-800"
  } else if (txStatus === "Failed") {
    badgeLabel = "Payment Failed"
    badgeColor = "bg-red-100 text-red-800"
  } else if (txStatus === "Cancelled") {
    badgeLabel = "Cancelled"
    badgeColor = "bg-gray-100 text-gray-800"
  } else {
    badgeLabel = "Awaiting Seller"
    badgeColor = "bg-yellow-100 text-yellow-800"
  }

  const ensurePaymentURL = useEnsureBuyerPaymentURL()
  const handleContinuePayment = async () => {
    const sessionID = item.payment_session?.id
    if (!sessionID) {
      toast.error("Payment session not found")
      return
    }
    try {
      const { payment_url } = await ensurePaymentURL.mutateAsync(String(sessionID))
      if (payment_url) {
        window.location.href = payment_url
        return
      }
      toast.error("Payment URL unavailable")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start payment"
      toast.error(msg)
    }
  }

  const isTerminal = txStatus === "Failed" || txStatus === "Cancelled"
  const showCancel = !readOnly && !item.order_id && !item.date_cancelled && !isTerminal && onCancel

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.sku_name}</p>
            <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
              Qty: {item.quantity} &middot; {fmt(item.subtotal_amount)} total
            </p>
            {item.note && (
              <p className="text-sm text-muted-foreground truncate">{item.note}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge variant="secondary" className={cn("font-normal gap-1", badgeColor)}>
              <Clock className="h-3 w-3" />
              {badgeLabel}
            </Badge>
            <span className="text-sm font-medium">{fmt(item.total_amount)}</span>
            {!readOnly && txStatus === "Pending" && (
              <Button variant="default" size="sm" onClick={handleContinuePayment}>
                Continue Payment
              </Button>
            )}
            {showCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive h-7 px-2"
                onClick={() => onCancel(item.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
