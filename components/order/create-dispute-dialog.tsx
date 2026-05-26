"use client"

import { useState } from "react"
import { useSellerDisputeRefund } from "@/core/order/refund.seller"
import { Button } from "@/components/ui/button"
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
import { Loader2, Scale } from "lucide-react"
import { toast } from "sonner"

interface CreateDisputeDialogProps {
  refundId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// CreateDisputeDialog is the seller-side dispute escalation. Sellers fire
// this from the refund queue when they don't want to honour a buyer's claim;
// admin reviews the case. Photos of the received goods are mandatory.
export function CreateDisputeDialog({
  refundId,
  open,
  onOpenChange,
}: CreateDisputeDialogProps) {
  const dispute = useSellerDisputeRefund()

  const [reason, setReason] = useState("")
  const [attachments, setAttachments] = useState<UploadedImage[]>([])

  const canSubmit = reason.trim().length > 0 && attachments.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await dispute.mutateAsync({
        id: refundId,
        reason: reason.trim(),
        attachments: attachments.map((img) => ({ url: img.url, kind: "image" })),
      })
      toast.success("Dispute submitted. Admin will review the case.")
      onOpenChange(false)
      setReason("")
      setAttachments([])
    } catch {
      toast.error("Failed to submit dispute. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Dispute Refund
          </DialogTitle>
          <DialogDescription>
            Disputing escalates the refund to platform staff. Provide a reason
            and photos of the items you received so the admin can decide.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="dispute-reason" className="font-medium">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dispute-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Item not as described, wrong serial, fraud..."
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reason.length}/1000
            </p>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">
              Evidence Photos <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Photos of the returned items as you received them. At least one
              photo is required.
            </p>
            <ImageUpload
              value={attachments}
              onChange={setAttachments}
              maxFiles={10}
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
            disabled={!canSubmit || dispute.isPending}
          >
            {dispute.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Dispute"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
