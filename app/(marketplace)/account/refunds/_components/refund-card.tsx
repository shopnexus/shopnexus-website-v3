"use client"

import { memo } from "react"
import Link from "next/link"
import {
  TRefund,
  RefundStatus,
  useWithdrawBuyerRefund,
} from "@/core/order/refund.buyer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  Truck,
  PackageCheck,
  Scale,
  CheckCircle,
  XCircle,
  Ban,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  RefundStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  Shipping: {
    label: "Return shipping to seller",
    className: "bg-blue-100 text-blue-800",
    icon: Truck,
  },
  AwaitingSellerReview: {
    label: "Awaiting seller decision",
    className: "bg-yellow-100 text-yellow-800",
    icon: PackageCheck,
  },
  Disputed: {
    label: "Disputed — under admin review",
    className: "bg-purple-100 text-purple-800",
    icon: Scale,
  },
  Accepted: {
    label: "Refunded",
    className: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  Rejected: {
    label: "Rejected — items returned",
    className: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  Cancelled: {
    label: "Withdrawn by you",
    className: "bg-gray-100 text-gray-800",
    icon: Ban,
  },
}

function Stage({ refund }: { refund: TRefund }) {
  const stages = [
    { label: "Ship return", done: true },
    { label: "Seller received", done: refund.date_received_by_seller !== null },
    {
      label: "Resolved",
      done: refund.status === "Accepted" || refund.status === "Rejected",
    },
  ]
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {stages.map((stage, idx) => (
        <span key={stage.label} className="flex items-center gap-1">
          {idx > 0 && <span className="text-muted-foreground/50">›</span>}
          <span className={cn(stage.done ? "text-foreground font-medium" : "")}>
            {stage.label}
          </span>
        </span>
      ))}
    </div>
  )
}

export const RefundCard = memo(function RefundCard({ refund }: { refund: TRefund }) {
  const config = statusConfig[refund.status] ?? statusConfig.Shipping
  const Icon = config.icon
  const withdraw = useWithdrawBuyerRefund()
  const canWithdraw = refund.status === "Shipping"

  const handleWithdraw = () => {
    withdraw.mutate(
      { id: refund.id },
      {
        onSuccess: () => toast.success("Refund withdrawn."),
        onError: () =>
          toast.error(
            "Cannot withdraw — the seller already received the items.",
          ),
      },
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">Refund request</span>
            <span className="text-xs text-muted-foreground">
              #{refund.id.slice(0, 8)} &middot; Order #{refund.order_id.slice(0, 8)}
            </span>
          </div>
          <Badge variant="secondary" className={cn("font-normal gap-1", config.className)}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        <Stage refund={refund} />

        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {refund.reason}
        </p>

        {refund.status === "Rejected" && refund.rejection_reason && (
          <p className="text-sm text-destructive mt-1">
            Admin upheld dispute — {refund.rejection_reason}
          </p>
        )}

        {refund.attachments && refund.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {refund.attachments.slice(0, 4).map((att, idx) => (
              <a
                key={idx}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-12 w-12 overflow-hidden rounded border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.url}
                  alt={att.name || `evidence ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
            {refund.attachments.length > 4 && (
              <span className="self-center text-xs text-muted-foreground">
                +{refund.attachments.length - 4} more
              </span>
            )}
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {new Date(refund.date_created).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            {canWithdraw && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleWithdraw}
                disabled={withdraw.isPending}
                className="gap-1"
              >
                {withdraw.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
                Withdraw
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/account/disputes?refund=${refund.id}`} className="gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                Disputes
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
