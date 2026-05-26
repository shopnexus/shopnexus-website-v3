"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useListRefundDisputes, type DisputeStatus } from "@/core/order/dispute"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Scale,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig: Record<DisputeStatus, { label: string; color: string; icon: React.ElementType }> = {
  Open: { label: "Under Review", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  SellerWins: { label: "You won", color: "bg-green-100 text-green-800", icon: CheckCircle },
  BuyerWins: { label: "Buyer won", color: "bg-red-100 text-red-800", icon: XCircle },
}

export default function SellerDisputesPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useListRefundDisputes({
    limit: 20,
  })

  const disputes = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data])

  const filtered = useMemo(() => {
    let result = disputes
    if (activeTab !== "all") result = result.filter((d) => d.status === activeTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.refund_id.toLowerCase().includes(q) ||
          d.reason.toLowerCase().includes(q),
      )
    }
    return result
  }, [disputes, activeTab, search])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Disputes</h1>
        <p className="text-muted-foreground">Track disputes you raised against refund requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Open">Under Review</TabsTrigger>
          <TabsTrigger value="SellerWins">You won</TabsTrigger>
          <TabsTrigger value="BuyerWins">Buyer won</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by dispute ID, refund ID, or reason..."
          className="pl-10 max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No disputes</h3>
            <p className="text-muted-foreground">
              {search ? "Try a different search term" : "Disputes you raise against refunds will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((dispute) => {
            const config = statusConfig[dispute.status] ?? statusConfig.Open
            const StatusIcon = config.icon
            return (
              <Card key={dispute.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">Dispute</h3>
                        <Badge variant="secondary" className={cn("gap-1", config.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/seller/refunds`} className="gap-1 text-xs">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View refund
                        </Link>
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      #{dispute.id.slice(0, 8)} &middot; Refund #{dispute.refund_id.slice(0, 8)} &middot;{" "}
                      {formatDate(dispute.date_created)}
                    </p>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your reason</p>
                      <p className="text-sm">{dispute.reason}</p>
                    </div>

                    {dispute.resolution_note && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin resolution</p>
                        <p className="text-sm text-muted-foreground">{dispute.resolution_note}</p>
                      </div>
                    )}

                    {dispute.attachments && dispute.attachments.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Evidence ({dispute.attachments.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {dispute.attachments.slice(0, 8).map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block h-14 w-14 overflow-hidden rounded border bg-muted"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={att.url}
                                alt={att.name || `evidence ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {dispute.date_resolved && (
                      <p className="text-xs text-muted-foreground">
                        Resolved {formatDate(dispute.date_resolved)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {hasNextPage && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
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
      )}
    </div>
  )
}
