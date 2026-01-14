"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useGetCart } from "@/core/order/cart"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  CreditCard,
  Lock,
  ShoppingBag,
  Truck,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, name: "Shipping" },
  { id: 2, name: "Payment" },
  { id: 3, name: "Review" },
]

export default function CheckoutPage() {
  const { data: cart, isLoading } = useGetCart()
  const [currentStep, setCurrentStep] = useState(1)

  const subtotal = cart?.reduce((acc, item) => acc + item.sku.price * item.quantity, 0) ?? 0
  const itemCount = cart?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (isLoading) {
    return <CheckoutPageSkeleton />
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products before checking out.</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/cart"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-colors",
                currentStep > step.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep === step.id
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-5 w-5" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={cn(
                "ml-2 text-sm font-medium hidden sm:inline",
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 sm:w-24 h-0.5 mx-4",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                  <Input id="address2" placeholder="Apt 4B" />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ny">New York</SelectItem>
                        <SelectItem value="ca">California</SelectItem>
                        <SelectItem value="tx">Texas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" placeholder="10001" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Shipping Method</Label>
                  <Tabs defaultValue="standard" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="standard">Standard</TabsTrigger>
                      <TabsTrigger value="express">Express</TabsTrigger>
                    </TabsList>
                    <TabsContent value="standard" className="border rounded-lg p-4 mt-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Standard Shipping</p>
                          <p className="text-sm text-muted-foreground">5-7 business days</p>
                        </div>
                        <p className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="express" className="border rounded-lg p-4 mt-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Express Shipping</p>
                          <p className="text-sm text-muted-foreground">2-3 business days</p>
                        </div>
                        <p className="font-medium">{formatPrice(14.99)}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <Button size="lg" className="w-full" onClick={() => setCurrentStep(2)}>
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="John Doe" />
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Your payment information is encrypted and secure.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button size="lg" className="flex-1" onClick={() => setCurrentStep(3)}>
                    Review Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Shipping Address</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>John Doe</p>
                    <p>123 Main St, Apt 4B</p>
                    <p>New York, NY 10001</p>
                    <p>john@example.com</p>
                  </div>
                  <Button variant="link" className="px-0 h-auto" onClick={() => setCurrentStep(1)}>
                    Edit
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Payment Method</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Visa ending in 3456</span>
                  </div>
                  <Button variant="link" className="px-0 h-auto" onClick={() => setCurrentStep(2)}>
                    Edit
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Items ({itemCount})</h4>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.sku.id} className="flex gap-3">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {item.resource?.url ? (
                            <Image
                              src={item.resource.url}
                              alt="Product"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.sku.attributes?.map(a => a.value).join(" / ") || "Product"}
                          </p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.sku.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button size="lg" className="flex-1">
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Preview */}
              <div className="space-y-3">
                {cart.slice(0, 3).map((item) => (
                  <div key={item.sku.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.resource?.url ? (
                        <Image
                          src={item.resource.url}
                          alt="Product"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {item.sku.attributes?.map(a => a.value).join(" / ") || "Product"}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.sku.price * item.quantity)}
                    </p>
                  </div>
                ))}
                {cart.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{cart.length - 3} more items
                  </p>
                )}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CheckoutPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-5 w-24 mb-6" />
      <Skeleton className="h-10 w-32 mb-8" />
      <div className="flex items-center justify-center mb-8 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
            {i < 2 && <Skeleton className="h-0.5 w-12 sm:w-24 mx-4" />}
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-96 rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
