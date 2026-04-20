"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useExchangeRates, usePreferredCurrency } from "@/core/common/currency"
import { formatPriceInline } from "@/lib/money"

interface OrderSummaryCardProps {
  productCost: number
  productDiscount: number
  transportCost: number
  total: number
  currency: string
}

export function OrderSummaryCard({
  productCost,
  productDiscount,
  transportCost,
  total,
  currency,
}: OrderSummaryCardProps) {
  const preferred = usePreferredCurrency()
  const { data: rateData } = useExchangeRates()
  const fmt = (amount: number) =>
    formatPriceInline(amount, currency, preferred, rateData?.rates, "native")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{fmt(productCost)}</span>
        </div>
        {productDiscount > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-green-600">-{fmt(productDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{transportCost === 0 ? "Free" : fmt(transportCost)}</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center font-semibold">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
