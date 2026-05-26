"use client"
export const dynamic = "force-dynamic"

import { Suspense, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatPriceInline } from "@/lib/money"
import { useCurrency, useExchangeRates } from "@/core/common/currency"
import {
  useGetCheckoutSummary,
  type TCheckoutSummary,
} from "@/core/order/order.buyer"
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Package,
  Receipt,
  RefreshCw,
  ImageOff,
} from "lucide-react"

type Outcome = "success" | "failed" | "pending"

// VNPay-only gateway error codes — kept so we can surface a useful failure
// reason on the result page when the VNPay redirect carries them. Other
// providers do not pass extra info; outcome is read from the transaction
// status alone.
const VNPAY_RESPONSE_MESSAGES: Record<string, string> = {
  "00": "Transaction completed.",
  "07": "Suspected fraudulent transaction.",
  "09": "Cardholder has not registered for Internet Banking.",
  "10": "Invalid card information (3 attempts).",
  "11": "Payment timeout.",
  "12": "Card is locked.",
  "13": "Wrong OTP.",
  "24": "Customer cancelled the transaction.",
  "51": "Insufficient balance.",
  "65": "Daily transaction limit exceeded.",
  "75": "Bank is under maintenance.",
  "79": "Wrong payment password (too many attempts).",
  "99": "Other error.",
}

// readRef extracts the transaction id from the redirect URL. We accept `ref`
// (our normalized param) plus VNPay's `vnp_TxnRef` for backward compatibility
// — VNPay always appends its own params to whatever return URL we register.
function readRef(params: URLSearchParams): string | null {
  return params.get("ref") ?? params.get("vnp_TxnRef")
}

// statusToOutcome maps the backend session status enum to the UI outcome.
function statusToOutcome(status: string | undefined): Outcome {
  switch (status) {
    case "Success":
      return "success"
    case "Failed":
    case "Cancelled":
      return "failed"
    default:
      // Pending / Processing / undefined while loading
      return "pending"
  }
}

const OUTCOME_STYLE: Record<
  Outcome,
  {
    badgeVariant: "default" | "destructive" | "secondary"
    title: string
    Icon: React.ComponentType<{ className?: string }>
    iconClass: string
    bandClass: string
  }
> = {
  success: {
    badgeVariant: "default",
    title: "Payment successful",
    Icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    bandClass:
      "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/15",
  },
  failed: {
    badgeVariant: "destructive",
    title: "Payment failed",
    Icon: XCircle,
    iconClass: "text-destructive",
    bandClass: "bg-destructive/10 border-destructive/30",
  },
  pending: {
    badgeVariant: "secondary",
    title: "Payment processing",
    Icon: Clock,
    iconClass: "text-amber-600 dark:text-amber-400",
    bandClass: "bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/15",
  },
}

function SummarySkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

function OrderSummary({
  summary,
  preferredCurrency,
  rates,
}: {
  summary: TCheckoutSummary
  preferredCurrency: string
  rates: Record<string, number> | undefined
}) {
  const { session, items } = summary
  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Package className="h-4 w-4" />
            What you paid for
          </h2>
          <Badge variant="outline" className="text-xs">
            {items.length} {items.length === 1 ? "item" : "items"}
          </Badge>
        </div>

        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex gap-3 rounded-lg border bg-card/50 p-3"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {it.image_url ? (
                  <Image
                    src={it.image_url}
                    alt={it.sku_name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${it.slug}`}
                  className="line-clamp-2 text-sm font-medium hover:underline"
                >
                  {it.sku_name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  Qty {it.quantity} ·{" "}
                  {formatPriceInline(
                    Math.round(it.total_amount / it.quantity),
                    it.currency,
                    preferredCurrency,
                    rates ?? {},
                  )}{" "}
                  each
                </p>
              </div>
              <div className="text-right text-sm font-semibold tabular-nums">
                {formatPriceInline(
                  it.total_amount,
                  it.currency,
                  preferredCurrency,
                  rates ?? {},
                )}
              </div>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Order total</span>
          <span className="text-xl font-bold tabular-nums">
            {formatPriceInline(
              session.total_amount,
              session.currency,
              preferredCurrency,
              rates ?? {},
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultBody() {
  const params = useSearchParams()
  const refID = useMemo(
    () => readRef(new URLSearchParams(params?.toString() ?? "")),
    [params],
  )
  const preferred = useCurrency()
  const { data: rateData } = useExchangeRates()

  // Single source of truth: fetch the transaction by ref. Outcome is derived
  // from session.status — the redirect URL no longer carries outcome.
  const summaryQuery = useGetCheckoutSummary(refID, { pollWhilePending: true })
  const sessionStatus = summaryQuery.data?.session.status

  // VNPay attaches its own response code; surface it as the message when
  // present. Other providers fall back to a generic status message.
  const vnpResponseCode = params?.get("vnp_ResponseCode") ?? null
  const outcome = statusToOutcome(sessionStatus)
  const message = useMemo(() => {
    if (vnpResponseCode && VNPAY_RESPONSE_MESSAGES[vnpResponseCode]) {
      return VNPAY_RESPONSE_MESSAGES[vnpResponseCode]
    }
    switch (outcome) {
      case "success":
        return "Payment received."
      case "failed":
        return "Payment was not completed."
      default:
        return "Waiting for the bank to confirm your transfer."
    }
  }, [outcome, vnpResponseCode])

  const style = OUTCOME_STYLE[outcome]
  const Icon = style.Icon

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      {/* Status banner */}
      <div
        className={cn(
          "flex items-start gap-4 rounded-xl border p-5",
          style.bandClass,
        )}
      >
        <div className="shrink-0 rounded-full bg-background p-2.5 ring-4 ring-background/50">
          <Icon className={cn("h-7 w-7", style.iconClass)} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {style.title}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
          {refID && (
            <p className="text-xs text-muted-foreground font-mono break-all">
              Ref: {refID}
            </p>
          )}
        </div>
      </div>

      {/* Order summary — only if we have a ref */}
      {refID ? (
        summaryQuery.isLoading ? (
          <SummarySkeleton />
        ) : summaryQuery.data ? (
          <OrderSummary
            summary={summaryQuery.data}
            preferredCurrency={preferred}
            rates={rateData?.rates}
          />
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              We couldn’t load this order’s details.{" "}
              <Link
                href="/account/orders"
                className="text-primary hover:underline"
              >
                Go to your orders →
              </Link>
            </CardContent>
          </Card>
        )
      ) : null}

      {/* Helpers */}
      {outcome === "pending" && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200">
          <RefreshCw className="h-3.5 w-3.5 mt-0.5 shrink-0 animate-spin [animation-duration:3s]" />
          <p>
            Your order will update automatically once the gateway confirms the
            transfer. You can safely close this page.
          </p>
        </div>
      )}
      {outcome === "failed" && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p>
            No charge was made. Retry from your pending orders or pick a
            different payment method.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/account/orders">
            <Receipt className="mr-2 h-4 w-4" />
            View my orders
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-3xl px-4 py-10">
          <SummarySkeleton />
        </div>
      }
    >
      <ResultBody />
    </Suspense>
  )
}
