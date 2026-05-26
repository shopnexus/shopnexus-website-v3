"use client"

import { memo } from "react"
import Link from "next/link"
import { TRefundDispute, DisputeStatus } from "@/core/order/dispute"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, ExternalLink, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig: Record<DisputeStatus, { label: string; color: string; icon: React.ElementType }> = {
  Open: { label: "Under Review", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  SellerWins: { label: "Seller won", color: "bg-red-100 text-red-800", icon: XCircle },
  BuyerWins: { label: "Buyer won", color: "bg-green-100 text-green-800", icon: CheckCircle },
}

export const DisputeCard = memo(function DisputeCard({ dispute }: { dispute: TRefundDispute }) {
  const config = statusConfig[dispute.status] ?? statusConfig.Open
  const StatusIcon = config.icon

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-sm">Dispute</span>
            </div>
            <span className="text-xs text-muted-foreground">
              #{dispute.id.slice(0, 8)} &middot; Refund #{dispute.refund_id.slice(0, 8)}
            </span>
          </div>
          <Badge variant="secondary" className={cn("font-normal gap-1 flex-shrink-0", config.color)}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        <div className="space-y-1.5 mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Seller's reason</p>
          <p className="text-sm line-clamp-3">{dispute.reason}</p>
        </div>

        {dispute.resolution_note && (
          <div className="space-y-1.5 mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin resolution</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{dispute.resolution_note}</p>
          </div>
        )}

        {dispute.attachments && dispute.attachments.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Seller's evidence ({dispute.attachments.length})
            </p>
            <ul className="space-y-1">
              {dispute.attachments.map((att, idx) => (
                <li key={idx} className="text-xs">
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {att.name || att.url}
                  </a>
                  {att.kind && <span className="text-muted-foreground"> · {att.kind}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Opened {formatDate(dispute.date_created)}</span>
            {dispute.date_resolved && (
              <span className="text-xs text-muted-foreground">Resolved {formatDate(dispute.date_resolved)}</span>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/account/refunds`} className="gap-1 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />
              View Refund
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
