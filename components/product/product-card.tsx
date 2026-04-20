"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatSoldCount, cn } from "@/lib/utils"
import { Price } from "@/components/ui/price"
import { TProductCard } from "@/core/catalog/product.customer"
import { useAddFavorite, useRemoveFavorite } from "@/core/account/favorite"
import { toast } from "@/components/ui/sonner"

interface ProductCardProps {
  product: TProductCard
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(product.is_favorite ?? false)
  const [imageError, setImageError] = useState(false)

  const discount = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const imageUrl = product.resources?.[0]?.url

  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (isWishlisted) {
        await removeFavorite.mutateAsync(product.id)
        setIsWishlisted(false)
        toast.info("Removed from wishlist")
      } else {
        await addFavorite.mutateAsync(product.id)
        setIsWishlisted(true)
        toast.success("Added to wishlist")
      }
    } catch {
      toast.error("Failed to update wishlist")
    }
  }

  return (
    <Link href={`/product/${product.slug || product.id}`}>
      <Card className={cn(
        "group relative overflow-hidden border-0 bg-card rounded-lg",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        "active:scale-[0.98] touch-manipulation",
        className
      )}>
        {/* Image Container - Square aspect ratio like Shopee */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}

          {/* Discount Badge - Top Left */}
          {discount > 0 && (
            <Badge className="absolute top-0 left-0 rounded-none rounded-br-lg bg-red-500 hover:bg-red-500 text-white border-0 text-xs px-2 py-1 font-semibold">
              -{discount}%
            </Badge>
          )}

          {/* Wishlist Button - Top Right */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-1.5 right-1.5 h-8 w-8 rounded-full",
              "bg-white/80 hover:bg-white shadow-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "sm:opacity-0",
              isWishlisted && "opacity-100 bg-red-50 hover:bg-red-100"
            )}
            onClick={handleWishlist}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 hover:text-red-500"
              )}
            />
          </Button>

        </div>

        {/* Content */}
        <CardContent className="p-2 sm:p-3">
          {/* Product Name - 2 lines max */}
          <h3 className="text-xs sm:text-sm font-normal line-clamp-2 leading-snug text-foreground min-h-[2.5rem] sm:min-h-[2.75rem]">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="mt-1.5 sm:mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <Price
                amount={product.price}
                currency={product.currency}
                emphasis="preferred"
                className={cn(
                  "text-base sm:text-lg font-bold",
                  discount > 0 ? "text-red-500" : "text-primary"
                )}
              />
              {product.original_price > product.price && (
                <Price
                  amount={product.original_price}
                  currency={product.currency}
                  emphasis="preferred"
                  hideConverted
                  className="text-[10px] sm:text-xs text-muted-foreground line-through"
                />
              )}
            </div>
          </div>

          {/* Bottom Row: Rating & Sold */}
          <div className="mt-1.5 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            {/* Rating - Compact Shopee style */}
            {product.rating && product.rating.total > 0 ? (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">
                  {(product.rating.score * 5).toFixed(1)}
                </span>
                <span className="hidden sm:inline">
                  ({product.rating.total > 999 ? formatSoldCount(product.rating.total) : product.rating.total})
                </span>
              </div>
            ) : (
              <div />
            )}

            {/* Sold Count - Social proof */}
            <span className="text-muted-foreground">
              {formatSoldCount(product.sold)} sold
            </span>
          </div>

          {/* Promotions/Tags - Optional */}
          {product.promotions && product.promotions.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {product.promotions.slice(0, 2).map((promo) => (
                <Badge
                  key={promo.id}
                  variant="outline"
                  className="text-[9px] sm:text-[10px] px-1 py-0 h-4 border-red-200 text-red-600 bg-red-50"
                >
                  {promo.title}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm rounded-lg">
      {/* Image skeleton - Square */}
      <div className="aspect-square bg-muted animate-pulse" />

      <CardContent className="p-2 sm:p-3 space-y-2">
        {/* Title skeleton */}
        <div className="space-y-1.5">
          <div className="h-3.5 bg-muted animate-pulse rounded w-full" />
          <div className="h-3.5 bg-muted animate-pulse rounded w-3/4" />
        </div>

        {/* Price skeleton */}
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />

        {/* Rating & Sold skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 bg-muted animate-pulse rounded" />
          <div className="h-3 w-14 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

// Compact variant for smaller grids
export function ProductCardCompact({ product, className }: ProductCardProps) {
  const discount = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const imageUrl = product.resources?.[0]?.url

  return (
    <Link href={`/product/${product.slug || product.id}`}>
      <Card className={cn(
        "group overflow-hidden border-0 rounded-lg shadow-sm hover:shadow-md transition-shadow",
        className
      )}>
        <div className="relative aspect-square bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 33vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ShoppingCart className="h-6 w-6 text-muted-foreground/30" />
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-0 left-0 rounded-none rounded-br bg-red-500 text-white text-[10px] px-1.5 py-0.5">
              -{discount}%
            </Badge>
          )}
        </div>
        <CardContent className="p-2">
          <h3 className="text-xs line-clamp-1 mb-1">{product.name}</h3>
          <Price
            amount={product.price}
            currency={product.currency}
            emphasis="preferred"
            className={cn(
              "text-sm font-bold",
              discount > 0 ? "text-red-500" : "text-primary"
            )}
          />
        </CardContent>
      </Card>
    </Link>
  )
}
