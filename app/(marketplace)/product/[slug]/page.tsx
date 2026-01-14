"use client"

import { use, useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import {
	useGetProductDetail,
	useListProductCardsRecommended,
} from "@/core/catalog/product.customer"
import { useUpdateCart } from "@/core/order/cart"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
	ProductCard,
	ProductCardSkeleton,
} from "@/components/product/product-card"
import { ProductReviews } from "@/components/product/product-reviews"
import {
	Star,
	Heart,
	Share2,
	Minus,
	Plus,
	ShoppingCart,
	Truck,
	Shield,
	RotateCcw,
	ChevronRight,
	Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProductDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = use(params)
	const { data: product, isLoading, error } = useGetProductDetail({ slug })
	const { data: recommendedProducts, isLoading: isLoadingRecommended } =
		useListProductCardsRecommended({ limit: 4 })
	const updateCart = useUpdateCart()

	const [selectedSkuIndex, setSelectedSkuIndex] = useState(0)
	const [quantity, setQuantity] = useState(1)
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)

	const selectedSku = product?.skus?.[selectedSkuIndex]

	const discount =
		selectedSku && selectedSku.original_price > selectedSku.price
			? Math.round(
					((selectedSku.original_price - selectedSku.price) /
						selectedSku.original_price) *
						100
			  )
			: 0

	const handleAddToCart = () => {
		if (selectedSku) {
			updateCart.mutate({
				sku_id: selectedSku.id,
				delta_quantity: quantity,
			})
		}
	}

	if (isLoading) {
		return <ProductDetailSkeleton />
	}

	if (error || !product) {
		return (
			<div className="container mx-auto px-4 py-12 text-center">
				<h1 className="text-2xl font-bold mb-4">Product not found</h1>
				<p className="text-muted-foreground mb-6">
					The product you&apos;re looking for doesn&apos;t exist or has been
					removed.
				</p>
				<Button asChild>
					<Link href="/">Back to Home</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Breadcrumb */}
			<nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
				<Link href="/" className="hover:text-primary transition-colors">
					Home
				</Link>
				<ChevronRight className="h-4 w-4" />
				{product.category && (
					<>
						<Link
							href={`/categories/${product.category.id}`}
							className="hover:text-primary transition-colors"
						>
							{product.category.name}
						</Link>
						<ChevronRight className="h-4 w-4" />
					</>
				)}
				<span className="text-foreground truncate">{product.name}</span>
			</nav>

			<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
				{/* Product Images */}
				<div className="space-y-4">
					<div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
						{product.resources?.[selectedImageIndex]?.url ? (
							<Image
								src={product.resources[selectedImageIndex].url}
								alt={product.name}
								fill
								className="object-cover"
								priority
							/>
						) : (
							<div className="flex items-center justify-center h-full">
								<ShoppingCart className="h-24 w-24 text-muted-foreground/30" />
							</div>
						)}
						{discount > 0 && (
							<Badge className="absolute top-4 left-4 bg-destructive hover:bg-destructive text-lg px-3 py-1">
								-{discount}%
							</Badge>
						)}
					</div>

					{/* Thumbnail Gallery */}
					{product.resources && product.resources.length > 1 && (
						<div className="flex gap-2 overflow-x-auto pb-2">
							{product.resources.map((resource, index) => (
								<button
									key={resource.id}
									onClick={() => setSelectedImageIndex(index)}
									className={cn(
										"relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
										selectedImageIndex === index
											? "border-primary"
											: "border-transparent"
									)}
								>
									<Image
										src={resource.url}
										alt={`${product.name} ${index + 1}`}
										fill
										className="object-cover"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Product Info */}
				<div className="space-y-6">
					{/* Brand */}
					{product.brand && (
						<Link
							href={`/brands/${product.brand.id}`}
							className="text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							{product.brand.name}
						</Link>
					)}

					{/* Title */}
					<h1 className="text-3xl font-bold">{product.name}</h1>

					{/* Rating */}
					{product.rating && product.rating.total > 0 && (
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star
										key={i}
										className={cn(
											"h-5 w-5",
											i < Math.round(product.rating.score)
												? "fill-yellow-400 text-yellow-400"
												: "text-muted-foreground/30"
										)}
									/>
								))}
							</div>
							<span className="text-sm">
								<span className="font-medium">
									{product.rating.score.toFixed(1)}
								</span>
								<span className="text-muted-foreground">
									{" "}
									({product.rating.total} reviews)
								</span>
							</span>
						</div>
					)}

					{/* Price */}
					<div className="space-y-1">
						<div className="flex items-center gap-3">
							<span className="text-3xl font-bold">
								{selectedSku ? formatPrice(selectedSku.price) : "N/A"}
							</span>
							{selectedSku &&
								selectedSku.original_price > selectedSku.price && (
									<span className="text-xl text-muted-foreground line-through">
										{formatPrice(selectedSku.original_price)}
									</span>
								)}
						</div>
						{discount > 0 && (
							<p className="text-sm text-green-600 font-medium">
								You save{" "}
								{formatPrice(
									(selectedSku?.original_price ?? 0) - (selectedSku?.price ?? 0)
								)}
							</p>
						)}
					</div>

					{/* Promotions */}
					{product.promotions && product.promotions.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{product.promotions.map((promo) => (
								<Badge key={promo.id} variant="secondary">
									{promo.title}
								</Badge>
							))}
						</div>
					)}

					<Separator />

					{/* SKU Selection */}
					{product.skus && product.skus.length > 1 && (
						<div className="space-y-3">
							<p className="font-medium">Select Option:</p>
							<div className="flex flex-wrap gap-2">
								{product.skus.map((sku, index) => {
									const label =
										sku.attributes?.map((a) => a.value).join(" / ") ||
										`Option ${index + 1}`
									return (
										<Button
											key={sku.id}
											variant={
												selectedSkuIndex === index ? "default" : "outline"
											}
											size="sm"
											onClick={() => setSelectedSkuIndex(index)}
											className="relative"
										>
											{label}
											{selectedSkuIndex === index && (
												<Check className="h-3 w-3 ml-1" />
											)}
										</Button>
									)
								})}
							</div>
						</div>
					)}

					{/* Quantity */}
					<div className="space-y-3">
						<p className="font-medium">Quantity:</p>
						<div className="flex items-center gap-3">
							<div className="flex items-center">
								<Button
									variant="outline"
									size="icon"
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									disabled={quantity <= 1}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="w-12 text-center font-medium">{quantity}</span>
								<Button
									variant="outline"
									size="icon"
									onClick={() => setQuantity(quantity + 1)}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							{selectedSku && selectedSku.taken !== undefined && (
								<span className="text-sm text-muted-foreground">
									{selectedSku.taken} sold
								</span>
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<Button
							size="lg"
							className="flex-1"
							onClick={handleAddToCart}
							disabled={updateCart.isPending || !selectedSku}
						>
							<ShoppingCart className="h-5 w-5 mr-2" />
							Add to Cart
						</Button>
						<Button size="lg" variant="outline">
							<Heart className="h-5 w-5" />
						</Button>
						<Button size="lg" variant="outline">
							<Share2 className="h-5 w-5" />
						</Button>
					</div>

					{/* Features */}
					<div className="grid grid-cols-3 gap-4 pt-4">
						{[
							{ icon: Truck, text: "Free Shipping" },
							{ icon: Shield, text: "Secure Payment" },
							{ icon: RotateCcw, text: "Easy Returns" },
						].map(({ icon: Icon, text }) => (
							<div
								key={text}
								className="flex flex-col items-center gap-2 text-center"
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
									<Icon className="h-5 w-5 text-muted-foreground" />
								</div>
								<span className="text-xs text-muted-foreground">{text}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Tabs Section */}
			<Tabs defaultValue="description" className="mt-12">
				<TabsList className="w-full justify-start">
					<TabsTrigger value="description">Description</TabsTrigger>
					<TabsTrigger value="specifications">Specifications</TabsTrigger>
					<TabsTrigger value="reviews">
						Reviews ({product.rating?.total ?? 0})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="description" className="mt-6">
					<Card>
						<CardContent className="p-6 prose prose-stone dark:prose-invert max-w-none">
							<p>{product.description || "No description available."}</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="specifications" className="mt-6">
					<Card>
						<CardContent className="p-6">
							{product.specifications && product.specifications.length > 0 ? (
								<div className="grid gap-3">
									{product.specifications.map((spec, index) => (
										<div
											key={index}
											className={cn(
												"grid grid-cols-2 gap-4 py-3",
												index !== product.specifications.length - 1 &&
													"border-b"
											)}
										>
											<span className="text-muted-foreground">{spec.name}</span>
											<span className="font-medium">{spec.value}</span>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted-foreground">
									No specifications available.
								</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="reviews" className="mt-6">
					<Card>
						<CardContent className="p-6">
							<ProductReviews productId={product.id} rating={product.rating} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Recommended Products */}
			{(isLoadingRecommended ||
				(recommendedProducts && recommendedProducts.length > 0)) && (
				<section className="mt-12">
					<h2 className="text-xl font-bold mb-4">You May Also Like</h2>
					{isLoadingRecommended ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<ProductCardSkeleton key={i} />
							))}
						</div>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
							{recommendedProducts?.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					)}
				</section>
			)}
		</div>
	)
}

function ProductDetailSkeleton() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center gap-2 mb-8">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-4 w-4" />
				<Skeleton className="h-4 w-24" />
			</div>

			<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
				<div className="space-y-4">
					<Skeleton className="aspect-square rounded-xl" />
					<div className="flex gap-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-20 w-20 rounded-lg" />
						))}
					</div>
				</div>

				<div className="space-y-6">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10 w-3/4" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-5 w-32" />
					</div>
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-px w-full" />
					<div className="space-y-3">
						<Skeleton className="h-4 w-24" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-20" />
							<Skeleton className="h-9 w-20" />
						</div>
					</div>
					<div className="flex gap-3">
						<Skeleton className="h-12 flex-1" />
						<Skeleton className="h-12 w-12" />
						<Skeleton className="h-12 w-12" />
					</div>
				</div>
			</div>
		</div>
	)
}
