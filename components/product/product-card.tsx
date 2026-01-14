"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Star, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { TProductCard } from "@/core/catalog/product.customer"
import { useUpdateCart } from "@/core/order/cart"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: TProductCard
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const updateCart = useUpdateCart()

  const discount = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const imageUrl = product.resources?.[0]?.url

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Add first SKU or handle variant selection
    // For now, we'd need product details to get SKU - this is a placeholder
  }

  return (
    <Link href={`/product/${product.slug || product.id}`}>
      <Card className={cn(
        "group overflow-hidden border bg-card hover:shadow-md transition-all duration-200",
        className
      )}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-8 w-8" />
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive hover:bg-destructive text-xs px-1.5 py-0.5">
              -{discount}%
            </Badge>
          )}

          {/* Wishlist */}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Heart className="h-3.5 w-3.5" />
          </Button>
        </div>

        <CardContent className="p-2.5">
          {/* Product Name */}
          <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && product.rating.total > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {product.rating.score.toFixed(1)} ({product.rating.total})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-sm font-semibold">
              {formatPrice(product.price)}
            </span>
            {product.original_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <CardContent className="p-2.5 space-y-1.5">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  )
}
