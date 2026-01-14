"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Static mock data for payment methods template
const mockPaymentMethods = [
  {
    id: "1",
    type: "visa",
    last4: "4242",
    expiry: "12/25",
    isDefault: true,
  },
  {
    id: "2",
    type: "mastercard",
    last4: "8888",
    expiry: "06/24",
    isDefault: false,
  },
]

const cardIcons: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
}

export default function PaymentPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const isEmpty = false // Set to true to show empty state

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your saved payment methods</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
            <p className="text-muted-foreground mb-4">
              Add a payment method for faster checkout.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mockPaymentMethods.map((method) => (
            <Card
              key={method.id}
              className={cn(method.isDefault && "border-primary")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 rounded bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold">
                      {cardIcons[method.type] || "CARD"}
                    </div>
                    <div>
                      <p className="font-medium">
                        •••• •••• •••• {method.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiry}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  {method.isDefault ? (
                    <Badge className="gap-1">
                      <Star className="h-3 w-3" />
                      Default
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      Set as Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Security Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-center gap-4">
          <Shield className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <p className="font-medium">Your payment info is secure</p>
            <p className="text-sm text-muted-foreground">
              We use industry-standard encryption to protect your payment information.
              Your card details are never stored on our servers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Card Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new credit or debit card
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" maxLength={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" maxLength={4} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input id="name" placeholder="Name on card" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">Set as default payment method</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsDialogOpen(false)}>
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this payment method?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteConfirm(null)}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
