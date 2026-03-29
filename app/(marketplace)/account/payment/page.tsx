"use client"

import { useState } from "react"
import {
  useListPaymentMethods,
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
  useTokenizeCard,
  type PaymentMethod,
} from "@/core/account/payment-method"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Loader2,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type CardFormData = {
  provider: string
  label: string
  token: string
  is_default: boolean
}

const emptyCardForm: CardFormData = {
  provider: "",
  label: "",
  token: "",
  is_default: false,
}

function formatCardNumber(last4?: string) {
  if (!last4) return null
  return `**** **** **** ${last4}`
}

function formatExpiry(month?: number, year?: number) {
  if (month == null || year == null) return null
  return `${String(month).padStart(2, "0")}/${year}`
}

function capitalizeFirst(str?: string) {
  if (!str) return null
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function PaymentPage() {
  const { data: paymentMethods, isLoading } = useListPaymentMethods()
  const createPaymentMethod = useCreatePaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod()
  const tokenizeCard = useTokenizeCard()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState<CardFormData>(emptyCardForm)
  const [showDevForm, setShowDevForm] = useState(false)

  // Filter to only show card-type payment methods
  const cards = paymentMethods?.filter((m) => m.type === "card") ?? []

  const openAddDialog = () => {
    setFormData(emptyCardForm)
    setShowDevForm(false)
    setIsAddDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.label) {
      toast.error("Please enter a label for this card")
      return
    }
    if (!formData.provider) {
      toast.error("Please enter a provider")
      return
    }

    try {
      await createPaymentMethod.mutateAsync({
        type: "card",
        provider: formData.provider,
        label: formData.label,
        data: formData.token ? { token: formData.token } : {},
        is_default: formData.is_default,
      })
      toast.success("Card added successfully")
      setIsAddDialogOpen(false)
    } catch (error) {
      toast.error("Failed to add card")
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deletePaymentMethod.mutateAsync({ id: deleteConfirm.id })
      toast.success("Card deleted successfully")
      setDeleteConfirm(null)
    } catch (error) {
      toast.error("Failed to delete card")
      console.error(error)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(id)
      toast.success("Default card updated")
    } catch (error) {
      toast.error("Failed to set default card")
      console.error(error)
    }
  }

  if (isLoading) {
    return <PaymentMethodsSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your saved cards
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No cards yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Add a card for faster checkout.
          </p>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Card
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((method) => {
            const cardNumber = formatCardNumber(method.data?.last4)
            const expiry = formatExpiry(method.data?.exp_month, method.data?.exp_year)
            const brand = capitalizeFirst(method.data?.brand)
            const cardType = capitalizeFirst(method.data?.card_type)

            return (
              <Card
                key={method.id}
                className={cn(method.is_default && "border-primary")}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {cardType && (
                        <Badge variant="secondary">{cardType}</Badge>
                      )}
                      {method.is_default && (
                        <Badge className="gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(method)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">
                        {brand && cardNumber
                          ? `${brand} ${cardNumber}`
                          : cardNumber ?? method.label}
                      </span>
                    </div>
                    {expiry && (
                      <p className="text-muted-foreground pl-6">
                        Expires {expiry}
                      </p>
                    )}
                  </div>

                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleSetDefault(method.id)}
                      disabled={setDefaultPaymentMethod.isPending}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Card</DialogTitle>
            <DialogDescription>
              Add a credit or debit card to your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50 p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Card payment integration coming soon. You'll be able to add
                  credit/debit cards for one-click payments.
                </p>
              </div>
            </div>

            {!showDevForm && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowDevForm(true)}
              >
                Manual entry (dev/testing)
              </Button>
            )}

            {showDevForm && (
              <div className="space-y-4 border rounded-lg p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Dev / Testing Fallback
                </p>

                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    placeholder="e.g. stripe, adyen"
                    value={formData.provider}
                    onChange={(e) =>
                      setFormData({ ...formData, provider: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="label"
                      placeholder="e.g. My Visa ending in 4242"
                      className="pl-10"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token">Token</Label>
                  <Input
                    id="token"
                    placeholder="tok_xxxxxxxxxxxx"
                    className="font-mono text-sm"
                    value={formData.token}
                    onChange={(e) =>
                      setFormData({ ...formData, token: e.target.value })
                    }
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={formData.is_default}
                    onChange={(e) =>
                      setFormData({ ...formData, is_default: e.target.checked })
                    }
                  />
                  <span className="text-sm">Set as default card</span>
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            {showDevForm && (
              <Button
                onClick={handleSubmit}
                disabled={createPaymentMethod.isPending}
              >
                {createPaymentMethod.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Card"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deleteConfirm && (
            <div className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {deleteConfirm.data?.brand
                    ? `${capitalizeFirst(deleteConfirm.data.brand)} ${formatCardNumber(deleteConfirm.data.last4) ?? ""}`
                    : deleteConfirm.label}
                </p>
              </div>
              {deleteConfirm.data?.exp_month != null &&
                deleteConfirm.data?.exp_year != null && (
                  <p className="text-sm text-muted-foreground pl-6">
                    Expires{" "}
                    {formatExpiry(
                      deleteConfirm.data.exp_month,
                      deleteConfirm.data.exp_year
                    )}
                  </p>
                )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePaymentMethod.isPending}
            >
              {deletePaymentMethod.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PaymentMethodsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-56 mt-1" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
