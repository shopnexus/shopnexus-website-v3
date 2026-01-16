"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, ShoppingCart, Eye, Plus, Check } from "lucide-react"
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
  onQuickView?: (product: TProductCard) => void
}

export function ProductCard({ product, className, onQuickView }: ProductCardProps) {
  const updateCart = useUpdateCart()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const discount = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const imageUrl = product.resources?.[0]?.url
  const secondImageUrl = product.resources?.[1]?.url

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAddingToCart(true)

    // Simulate adding to cart - in real implementation, we'd need SKU info
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsAddingToCart(false)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }

  return (
    <Link href={`/product/${product.slug || product.id}`}>
      <Card className={cn(
        "group relative overflow-hidden border bg-card transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        "active:scale-[0.98] touch-manipulation",
        className
      )}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {imageUrl ? (
            <>
              {/* Primary Image */}
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-all duration-500",
                  secondImageUrl && "group-hover:opacity-0"
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              {/* Secondary Image (shown on hover) */}
              {secondImageUrl && (
                <Image
                  src={secondImageUrl}
                  alt={`${product.name} - alternate view`}
                  fill
                  className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/50">
              <ShoppingCart className="h-10 w-10" />
            </div>
          )}

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges - Top Left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {discount > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0 text-[10px] sm:text-xs px-1.5 py-0.5 font-bold shadow-lg">
                -{discount}%
              </Badge>
            )}
            {product.rating && product.rating.score >= 4.5 && (
              <Badge variant="secondary" className="bg-amber-500/90 text-white border-0 text-[10px] px-1.5 py-0.5 hidden sm:flex">
                Top Rated
              </Badge>
            )}
          </div>

          {/* Action Buttons - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200",
                "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                "sm:delay-0 delay-0",
                isWishlisted
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white/90 hover:bg-white text-gray-700 hover:text-red-500"
              )}
              onClick={handleWishlist}
            >
              <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isWishlisted && "fill-current")} />
            </Button>

            {onQuickView && (
              <Button
                size="icon"
                variant="secondary"
                className={cn(
                  "h-7 w-7 sm:h-8 sm:w-8 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200",
                  "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                  "sm:delay-75 delay-75",
                  "bg-white/90 hover:bg-white text-gray-700 hover:text-primary hidden sm:flex"
                )}
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Quick Add to Cart - Bottom */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-2 sm:p-3",
            "transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          )}>
            <Button
              size="sm"
              className={cn(
                "w-full text-xs sm:text-sm font-medium shadow-lg",
                "bg-white text-gray-900 hover:bg-gray-100",
                justAdded && "bg-green-500 hover:bg-green-600 text-white"
              )}
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  Added!
                </>
              ) : isAddingToCart ? (
                <span className="flex items-center">
                  <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  Quick Add
                </>
              )}
            </Button>
          </div>

          {/* Mobile Quick Add Button (always visible on mobile) */}
          <Button
            size="icon"
            className={cn(
              "absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-lg sm:hidden",
              "bg-primary text-primary-foreground",
              justAdded && "bg-green-500"
            )}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {justAdded ? (
              <Check className="h-4 w-4" />
            ) : isAddingToCart ? (
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Content */}
        <CardContent className="p-2.5 sm:p-3 space-y-1">
          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[2.5em]">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && product.rating.total > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-2.5 w-2.5 sm:h-3 sm:w-3",
                      i < Math.round(product.rating.score)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                ({product.rating.total})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className={cn(
              "text-sm sm:text-base font-bold",
              discount > 0 && "text-red-600"
            )}>
              {formatPrice(product.price)}
            </span>
            {product.original_price > product.price && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </CardContent>

        {/* Subtle border glow on hover */}
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5 group-hover:ring-primary/20 transition-all duration-300 pointer-events-none" />
      </Card>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border">
      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
      <CardContent className="p-2.5 sm:p-3 space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  )
}
