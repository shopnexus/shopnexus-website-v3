"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
	useListRefundDisputes,
	useAdminUpholdDispute,
	useAdminDismissDispute,
	type TRefundDispute,
	type DisputeStatus,
} from "@/core/order/dispute"
import { useGetMe, AccountRole } from "@/core/account/account"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
	CheckCircle,
	XCircle,
	Loader2,
	Scale,
	ExternalLink,
	ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ResolveDialogState = {
	dispute: TRefundDispute
	decision: "uphold" | "dismiss"
} | null

const statusConfig: Record<
	DisputeStatus,
	{ label: string; className: string }
> = {
	Open: { label: "Under Review", className: "bg-yellow-100 text-yellow-800" },
	SellerWins: { label: "Seller won", className: "bg-red-100 text-red-800" },
	BuyerWins: { label: "Buyer won", className: "bg-green-100 text-green-800" },
}

export default function AdminDisputesPage() {
	const { data: me, isLoading: meLoading } = useGetMe()
	const isAdmin = me?.role === AccountRole.Admin

	const [activeTab, setActiveTab] = useState<string>("Open")
	const [resolveDialog, setResolveDialog] = useState<ResolveDialogState>(null)
	const [resolutionNote, setResolutionNote] = useState("")

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useListRefundDisputes({ limit: 20 })

	const upholdMutation = useAdminUpholdDispute()
	const dismissMutation = useAdminDismissDispute()

	const disputes = useMemo(
		() => data?.pages.flatMap((p) => p.data) ?? [],
		[data],
	)
	const filtered = useMemo(() => {
		if (activeTab === "all") return disputes
		return disputes.filter((d) => d.status === activeTab)
	}, [disputes, activeTab])

	if (meLoading) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-72" />
			</div>
		)
	}
	if (!isAdmin) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
					<ShieldAlert className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-semibold mb-2">Admin access required</h3>
				<p className="text-muted-foreground max-w-sm">
					This console is only available to platform staff. Sign in with an
					admin account.
				</p>
			</div>
		)
	}

	const handleSubmit = async () => {
		if (!resolveDialog || !resolutionNote.trim()) return
		try {
			if (resolveDialog.decision === "uphold") {
				await upholdMutation.mutateAsync({
					id: resolveDialog.dispute.id,
					resolution_note: resolutionNote.trim(),
				})
				toast.success("Dispute upheld. Items will be shipped back to buyer.")
			} else {
				await dismissMutation.mutateAsync({
					id: resolveDialog.dispute.id,
					resolution_note: resolutionNote.trim(),
				})
				toast.success("Dispute dismissed. Buyer wallet credited.")
			}
			setResolveDialog(null)
			setResolutionNote("")
		} catch {
			toast.error("Failed to resolve dispute.")
		}
	}

	const pending =
		resolveDialog?.decision === "uphold"
			? upholdMutation.isPending
			: dismissMutation.isPending

	return (
		<div className="space-y-6 mx-auto max-w-7xl py-8">
			<div>
				<h1 className="text-2xl font-bold">Admin · Refund Disputes</h1>
				<p className="text-muted-foreground">
					Review seller escalations and rule on their outcome.
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="all">All</TabsTrigger>
					<TabsTrigger value="Open">Pending</TabsTrigger>
					<TabsTrigger value="SellerWins">Seller won</TabsTrigger>
					<TabsTrigger value="BuyerWins">Buyer won</TabsTrigger>
				</TabsList>
			</Tabs>

			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={i}>
							<CardContent className="p-4 space-y-2">
								<Skeleton className="h-5 w-48" />
								<Skeleton className="h-4 w-full" />
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
							Nothing waiting for review in this bucket.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{filtered.map((dispute) => {
						const config = statusConfig[dispute.status] ?? statusConfig.Open
						const isPending = dispute.status === "Open"

						return (
							<Card key={dispute.id}>
								<CardContent className="p-4">
									<div className="flex flex-col gap-3">
										<div className="flex items-start justify-between gap-3 flex-wrap">
											<div className="flex flex-col gap-0.5">
												<div className="flex items-center gap-2">
													<Scale className="h-4 w-4 text-muted-foreground" />
													<span className="font-medium">
														Dispute (seller escalation)
													</span>
													<Badge
														variant="secondary"
														className={cn("font-normal", config.className)}
													>
														{config.label}
													</Badge>
												</div>
												<span className="text-xs text-muted-foreground">
													#{dispute.id.slice(0, 8)} · Refund #
													{dispute.refund_id.slice(0, 8)} · Seller #
													{dispute.account_id.slice(0, 8)} ·{" "}
													{new Date(dispute.date_created).toLocaleDateString()}
												</span>
											</div>
										</div>

										<div className="space-y-2 text-sm">
											<div>
												<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
													Seller's reason
												</p>
												<p>{dispute.reason}</p>
											</div>
											{dispute.attachments &&
												dispute.attachments.length > 0 && (
													<div>
														<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
															Seller's evidence ({dispute.attachments.length})
														</p>
														<div className="flex flex-wrap gap-1.5">
															{dispute.attachments.map((att, idx) => (
																<a
																	key={idx}
																	href={att.url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="block h-16 w-16 overflow-hidden rounded border bg-muted"
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
											{dispute.resolution_note && (
												<div>
													<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
														Resolution
													</p>
													<p className="text-muted-foreground whitespace-pre-wrap">
														{dispute.resolution_note}
													</p>
												</div>
											)}
										</div>

										<div className="flex items-center justify-between flex-wrap gap-2">
											<Button variant="ghost" size="sm" asChild>
												<Link
													href={`/account/refunds`}
													className="gap-1 text-xs"
												>
													<ExternalLink className="h-3.5 w-3.5" />
													View refund
												</Link>
											</Button>
											{isPending && (
												<div className="flex items-center gap-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															setResolveDialog({ dispute, decision: "dismiss" })
														}
													>
														<CheckCircle className="h-4 w-4 mr-1" />
														Buyer wins (Dismiss)
													</Button>
													<Button
														size="sm"
														onClick={() =>
															setResolveDialog({ dispute, decision: "uphold" })
														}
													>
														<XCircle className="h-4 w-4 mr-1" />
														Seller wins (Uphold)
													</Button>
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						)
					})}

					{hasNextPage && (
						<div className="text-center pt-4">
							<Button
								variant="outline"
								onClick={() => fetchNextPage()}
								disabled={isFetchingNextPage}
							>
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

			<Dialog
				open={resolveDialog !== null}
				onOpenChange={(open) => {
					if (!open) {
						setResolveDialog(null)
						setResolutionNote("")
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{resolveDialog?.decision === "uphold"
								? "Uphold dispute (seller wins)"
								: "Dismiss dispute (buyer wins)"}
						</DialogTitle>
						<DialogDescription>
							{resolveDialog?.decision === "uphold"
								? "The seller's claim is accepted. The refund will be rejected, items shipped back to buyer, and no money refunded."
								: "The buyer's claim stands. The refund will be accepted and the buyer's wallet credited."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3 py-2">
						<Label htmlFor="resolution-note" className="font-medium">
							Resolution note <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="resolution-note"
							value={resolutionNote}
							onChange={(e) => setResolutionNote(e.target.value)}
							placeholder="Explain the platform's decision..."
							maxLength={2000}
							rows={4}
						/>
						<p className="text-xs text-muted-foreground text-right">
							{resolutionNote.length}/2000
						</p>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setResolveDialog(null)
								setResolutionNote("")
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={!resolutionNote.trim() || pending}
						>
							{pending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Submitting...
								</>
							) : (
								"Confirm"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
