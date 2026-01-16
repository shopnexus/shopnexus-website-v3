"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { TProductCard } from "@/core/catalog/product.customer"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
	Star,
	Heart,
	ShoppingCart,
	Minus,
	Plus,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	X,
	Check,
	Share2,
	Truck,
	Shield,
	RotateCcw,
} from "lucide-react"

interface ProductQuickViewProps {
	product: TProductCard | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ProductQuickView({
	product,
	open,
	onOpenChange,
}: ProductQuickViewProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)
	const [quantity, setQuantity] = useState(1)
	const [isWishlisted, setIsWishlisted] = useState(false)
	const [isAddingToCart, setIsAddingToCart] = useState(false)
	const [justAdded, setJustAdded] = useState(false)

	if (!product) return null

	const images = product.resources || []
	const discount =
		product.original_price > product.price
			? Math.round(
					((product.original_price - product.price) / product.original_price) *
						100
			  )
			: 0

	const handlePrevImage = () => {
		setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
	}

	const handleNextImage = () => {
		setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
	}

	const handleAddToCart = async () => {
		setIsAddingToCart(true)
		// Simulate adding to cart
		await new Promise((resolve) => setTimeout(resolve, 800))
		setIsAddingToCart(false)
		setJustAdded(true)
		setTimeout(() => setJustAdded(false), 2000)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!lg:max-w-5xl md:max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh] sm:max-h-[85vh]">
				<DialogTitle className="sr-only">{product.name}</DialogTitle>

				{/* Close Button */}
				<button
					onClick={() => onOpenChange(false)}
					className="absolute right-3 top-3 z-50 rounded-full bg-white/90 backdrop-blur-sm p-1.5 shadow-lg hover:bg-white transition-colors"
				>
					<X className="h-4 w-4" />
				</button>

				<div className="grid md:grid-cols-2 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto md:overflow-hidden">
					{/* Image Gallery */}
					<div className="relative bg-gradient-to-br from-muted to-muted/50 md:h-full">
						<div className="relative aspect-square md:aspect-auto md:h-full">
							{images.length > 0 ? (
								<Image
									src={images[selectedImageIndex]?.url || ""}
									alt={product.name}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 50vw"
									priority
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center">
									<ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
								</div>
							)}

							{/* Discount Badge */}
							{discount > 0 && (
								<Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 text-sm px-2.5 py-1 font-bold shadow-lg">
									-{discount}%
								</Badge>
							)}

							{/* Navigation Arrows */}
							{images.length > 1 && (
								<>
									<button
										onClick={handlePrevImage}
										className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
									>
										<ChevronLeft className="h-5 w-5" />
									</button>
									<button
										onClick={handleNextImage}
										className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
									>
										<ChevronRight className="h-5 w-5" />
									</button>
								</>
							)}

							{/* Thumbnail Dots */}
							{images.length > 1 && (
								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
									{images.map((_, index) => (
										<button
											key={index}
											onClick={() => setSelectedImageIndex(index)}
											className={cn(
												"h-2 w-2 rounded-full transition-all",
												index === selectedImageIndex
													? "bg-white w-4"
													: "bg-white/50 hover:bg-white/75"
											)}
										/>
									))}
								</div>
							)}
						</div>

						{/* Thumbnail Strip - Desktop */}
						{images.length > 1 && (
							<div className="hidden md:flex absolute bottom-4 left-4 gap-2">
								{images.slice(0, 5).map((image, index) => (
									<button
										key={index}
										onClick={() => setSelectedImageIndex(index)}
										className={cn(
											"h-14 w-14 rounded-lg overflow-hidden border-2 transition-all",
											index === selectedImageIndex
												? "border-white shadow-lg"
												: "border-transparent opacity-70 hover:opacity-100"
										)}
									>
										<Image
											src={image.url}
											alt={`${product.name} ${index + 1}`}
											width={56}
											height={56}
											className="object-cover h-full w-full"
										/>
									</button>
								))}
								{images.length > 5 && (
									<div className="h-14 w-14 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-sm font-medium">
										+{images.length - 5}
									</div>
								)}
							</div>
						)}
					</div>

					{/* Product Info */}
					<div className="p-4 sm:p-6 flex flex-col md:overflow-y-auto md:max-h-[85vh]">
						{/* Header */}
						<div className="space-y-3">
							{/* Category */}
							{product.category_id && (
								<p className="text-xs text-muted-foreground uppercase tracking-wider">
									Category
								</p>
							)}

							{/* Title */}
							<h2 className="text-xl sm:text-2xl font-bold leading-tight">
								{product.name}
							</h2>

							{/* Rating */}
							{product.rating && product.rating.total > 0 && (
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-0.5">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												className={cn(
													"h-4 w-4",
													i < Math.round(product.rating.score)
														? "fill-amber-400 text-amber-400"
														: "fill-muted text-muted"
												)}
											/>
										))}
									</div>
									<span className="text-sm text-muted-foreground">
										{product.rating.score.toFixed(1)} ({product.rating.total}{" "}
										reviews)
									</span>
								</div>
							)}

							{/* Price */}
							<div className="flex items-baseline gap-3">
								<span
									className={cn(
										"text-2xl sm:text-3xl font-bold",
										discount > 0 && "text-red-600"
									)}
								>
									{formatPrice(product.price)}
								</span>
								{product.original_price > product.price && (
									<span className="text-lg text-muted-foreground line-through">
										{formatPrice(product.original_price)}
									</span>
								)}
								{discount > 0 && (
									<Badge
										variant="secondary"
										className="bg-green-100 text-green-700 border-0"
									>
										Save {formatPrice(product.original_price - product.price)}
									</Badge>
								)}
							</div>
						</div>

						{/* Divider */}
						<div className="my-4 sm:my-6 border-t" />

						{/* Quantity */}
						<div className="space-y-3">
							<label className="text-sm font-medium">Quantity</label>
							<div className="flex items-center gap-3">
								<div className="flex items-center border rounded-lg">
									<Button
										variant="ghost"
										size="icon"
										className="h-10 w-10 rounded-r-none"
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										disabled={quantity <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="w-12 text-center font-medium">
										{quantity}
									</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-10 w-10 rounded-l-none"
										onClick={() => setQuantity(quantity + 1)}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-3 mt-6">
							<Button
								size="lg"
								className={cn(
									"flex-1 text-base transition-all",
									justAdded && "bg-green-600 hover:bg-green-700"
								)}
								onClick={handleAddToCart}
								disabled={isAddingToCart}
							>
								{justAdded ? (
									<>
										<Check className="h-5 w-5 mr-2" />
										Added to Cart!
									</>
								) : isAddingToCart ? (
									<>
										<span className="h-5 w-5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
										Adding...
									</>
								) : (
									<>
										<ShoppingCart className="h-5 w-5 mr-2" />
										Add to Cart
									</>
								)}
							</Button>
							<Button
								size="lg"
								variant="outline"
								className={cn(
									"transition-all",
									isWishlisted &&
										"bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
								)}
								onClick={() => setIsWishlisted(!isWishlisted)}
							>
								<Heart
									className={cn("h-5 w-5", isWishlisted && "fill-current")}
								/>
							</Button>
							<Button size="lg" variant="outline">
								<Share2 className="h-5 w-5" />
							</Button>
						</div>

						{/* Features */}
						<div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t">
							{[
								{ icon: Truck, label: "Free Shipping" },
								{ icon: Shield, label: "Secure Pay" },
								{ icon: RotateCcw, label: "Easy Returns" },
							].map(({ icon: Icon, label }) => (
								<div
									key={label}
									className="flex flex-col items-center gap-1.5 text-center"
								>
									<div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
										<Icon className="h-4 w-4 text-muted-foreground" />
									</div>
									<span className="text-[10px] sm:text-xs text-muted-foreground">
										{label}
									</span>
								</div>
							))}
						</div>

						{/* View Full Details Link */}
						<div className="mt-auto pt-6">
							<Button variant="outline" className="w-full" asChild>
								<Link href={`/product/${product.slug || product.id}`}>
									<ExternalLink className="h-4 w-4 mr-2" />
									View Full Details
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
