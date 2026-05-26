"use client"

import { useState } from "react"
import { useCreateRefund } from "@/core/order/refund.buyer"
import { useListServiceOption } from "@/core/common/option"
import { type TOrder } from "@/core/order/order.buyer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload, type UploadedImage } from "@/components/ui/image-upload"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Loader2, Package } from "lucide-react"
import { toast } from "sonner"

interface CreateRefundDialogProps {
	order: TOrder
	open: boolean
	onOpenChange: (open: boolean) => void
}

// CreateRefundDialog opens a whole-order refund. The buyer commits to shipping
// the goods back here — the return transport is created server-side at the
// same moment. Photos are mandatory so the seller has evidence on arrival.
export function CreateRefundDialog({
	order,
	open,
	onOpenChange,
}: CreateRefundDialogProps) {
	const createRefund = useCreateRefund()
	const { data: transportOptions } = useListServiceOption({ type: "transport" })

	const [reason, setReason] = useState("")
	const [returnTransportOption, setReturnTransportOption] = useState("")
	const [attachments, setAttachments] = useState<UploadedImage[]>([])

	const canSubmit =
		reason.trim().length > 0 &&
		reason.trim().length <= 1000 &&
		returnTransportOption.trim().length > 0 &&
		attachments.length > 0

	const handleSubmit = async () => {
		if (!canSubmit) return

		try {
			await createRefund.mutateAsync({
				order_id: order.id,
				reason: reason.trim(),
				return_option: returnTransportOption.trim(),
				attachments: attachments.map((img) => ({
					url: img.url,
					kind: "image",
				})),
			})
			toast.success(
				"Refund request submitted. The carrier will collect your return shortly.",
			)
			onOpenChange(false)
			// Reset form
			setReason("")
			setReturnTransportOption("")
			setAttachments([])
		} catch {
			toast.error("Failed to submit refund request.")
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						Request Refund
					</DialogTitle>
					<DialogDescription>
						Refunds apply to the whole order. You will ship the goods back via
						the chosen carrier — the seller has 3 days to approve after the
						return arrives.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 py-2 overflow-hidden">
					{/* Return Transport Option */}
					<div className="space-y-2 ">
						<Label className="font-medium">
							Return Transport <span className="text-destructive">*</span>
						</Label>
						{transportOptions && transportOptions.length > 0 ? (
							<Select
								value={returnTransportOption}
								onValueChange={setReturnTransportOption}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a transport option" />
								</SelectTrigger>
								<SelectContent>
									{transportOptions.map((opt) => (
										<SelectItem key={opt.id} value={opt.id}>
											{opt.name}
											{opt.description ? ` — ${opt.description}` : ""}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						) : (
							<Input
								value={returnTransportOption}
								onChange={(e) => setReturnTransportOption(e.target.value)}
								placeholder="e.g. standard, express"
							/>
						)}
					</div>

					{/* Reason */}
					<div className="space-y-2">
						<Label htmlFor="refund-reason" className="font-medium">
							Reason <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="refund-reason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Describe the issue with your order..."
							maxLength={1000}
							rows={3}
						/>
						<p className="text-xs text-muted-foreground text-right">
							{reason.length}/1000
						</p>
					</div>

					{/* Evidence images — mandatory */}
					<div className="space-y-2">
						<Label className="font-medium">
							Evidence Photos <span className="text-destructive">*</span>
						</Label>
						<p className="text-xs text-muted-foreground">
							Upload images of the issue (damaged item, wrong product, etc.). At
							least one photo is required.
						</p>
						<ImageUpload
							value={attachments}
							onChange={setAttachments}
							maxFiles={5}
							maxSizeInMB={5}
							aspectRatio="square"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!canSubmit || createRefund.isPending}
					>
						{createRefund.isPending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Submitting...
							</>
						) : (
							"Submit Refund Request"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
