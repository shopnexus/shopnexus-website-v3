"use client"

import { useExchangeRates, usePreferredCurrency } from "@/core/common/currency"
import { convertMoney, formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

type Emphasis = "preferred" | "native" | "native-only"

export type PriceProps = {
  /** smallest-unit integer in `currency` */
  amount: number
  /** ISO 4217 code of `amount` */
  currency: string
  /** Which side is visually dominant. Default "preferred". */
  emphasis?: Emphasis
  /** Force-hide converted line (e.g. per-line items when header already shows both) */
  hideConverted?: boolean
  /** Append "at current rate" hint under converted line */
  showRateHint?: boolean
  className?: string
}

export function Price({
  amount,
  currency,
  emphasis = "preferred",
  hideConverted = false,
  showRateHint = false,
  className,
}: PriceProps) {
  const preferred = usePreferredCurrency()
  const { data: rateData } = useExchangeRates()

  const sameCurrency = currency === preferred
  const ratesReady = !!rateData
  const showBoth =
    !sameCurrency && ratesReady && !hideConverted && emphasis !== "native-only"

  const native = formatMoney(amount, currency)
  const convertedAmount = showBoth
    ? convertMoney(amount, currency, preferred, rateData!.rates)
    : null
  const converted =
    convertedAmount !== null ? formatMoney(convertedAmount, preferred) : null

  if (!showBoth || converted === null) {
    return <span className={className}>{native}</span>
  }

  const primary = emphasis === "preferred" ? converted : native
  const secondary = emphasis === "preferred" ? native : converted
  // For "preferred" emphasis the secondary IS the original price the buyer
  // is charged in. For "native" emphasis the secondary is an approximation
  // in the buyer's preferred currency.
  const secondaryLabel =
    emphasis === "preferred" ? "(original price)" : `(in ${preferred})`

  return (
    <span className={cn("inline-flex flex-col leading-tight", className)}>
      <span className="font-semibold">{primary}</span>
      <span className="text-xs text-muted-foreground font-normal">
        {secondary} <span className="opacity-70">{secondaryLabel}</span>
        {showRateHint && <span className="ml-1 opacity-60"> at current rate</span>}
      </span>
    </span>
  )
}
