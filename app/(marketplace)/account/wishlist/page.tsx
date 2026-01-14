"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react"
import { formatPrice } from "@/lib/utils"

// Static mock data for wishlist template
const mockWishlistItems = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 199.99,
    originalPrice: 249.99,
    image: null,
    inStock: true,
    rating: 4.5,
  },
  {
    id: "2",
    name: "Leather Messenger Bag",
    price: 89.99,
    originalPrice: 89.99,
    image: null,
    inStock: true,
    rating: 4.8,
  },
  {
    id: "3",
    name: "Smart Watch Pro",
    price: 299.99,
    originalPrice: 349.99,
    image: null,
    inStock: false,
    rating: 4.2,
  },
]

export default function WishlistPage() {
  const isEmpty = false // Set to true to show empty state

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {mockWishlistItems.length} items saved
          </p>
        </div>
        {!isEmpty && (
          <Button variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Save items you love by clicking the heart icon on products.
            </p>
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockWishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted flex items-center justify-center">
                <Heart className="h-12 w-12 text-muted-foreground/30" />
                {!item.inStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Out of Stock
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">
                    {item.rating}
                  </span>
                </div>
                <h3 className="font-medium text-sm line-clamp-1 mb-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                  {item.originalPrice > item.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                <Button
                  className="w-full"
                  size="sm"
                  disabled={!item.inStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {item.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-center gap-4">
          <Heart className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <p className="font-medium">Save for later</p>
            <p className="text-sm text-muted-foreground">
              Items in your wishlist will be saved here. We&apos;ll notify you when prices drop!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
