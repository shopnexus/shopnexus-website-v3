"use client"

import { use, useState, useMemo, useEffect } from "react"
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
	AlertCircle,
	Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SelectedAttributes = Record<string, string>

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

	const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttributes>({})
	const [quantity, setQuantity] = useState(1)
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)
	const [isAddingToCart, setIsAddingToCart] = useState(false)
	const [justAdded, setJustAdded] = useState(false)

	// Extract all unique attribute names and their possible values
	const attributeOptions = useMemo(() => {
		if (!product?.skus || product.skus.length === 0) return {}

		const options: Record<string, Set<string>> = {}

		product.skus.forEach((sku) => {
			sku.attributes?.forEach((attr) => {
				if (!options[attr.name]) {
					options[attr.name] = new Set()
				}
				options[attr.name].add(attr.value)
			})
		})

		// Convert sets to arrays
		const result: Record<string, string[]> = {}
		Object.entries(options).forEach(([name, values]) => {
			result[name] = Array.from(values)
		})

		return result
	}, [product?.skus])

	// Get attribute names in order
	const attributeNames = useMemo(() => Object.keys(attributeOptions), [attributeOptions])

	// Initialize selected attributes when product loads
	useEffect(() => {
		if (product?.skus && product.skus.length > 0 && attributeNames.length > 0) {
			// Initialize with the first SKU's attributes
			const firstSku = product.skus[0]
			const initial: SelectedAttributes = {}
			firstSku.attributes?.forEach((attr) => {
				initial[attr.name] = attr.value
			})
			setSelectedAttributes(initial)
		}
	}, [product?.skus, attributeNames])

	// Find the matching SKU based on selected attributes
	const selectedSku = useMemo(() => {
		if (!product?.skus || Object.keys(selectedAttributes).length === 0) {
			return product?.skus?.[0] || null
		}

		return product.skus.find((sku) => {
			if (!sku.attributes) return false
			return sku.attributes.every(
				(attr) => selectedAttributes[attr.name] === attr.value
			)
		}) || null
	}, [product?.skus, selectedAttributes])

	// Check which values are available for each attribute given current selections
	const getAvailableValues = (attributeName: string): Set<string> => {
		if (!product?.skus) return new Set()

		const available = new Set<string>()

		product.skus.forEach((sku) => {
			if (!sku.attributes) return

			// Check if this SKU matches all OTHER selected attributes
			const matchesOthers = Object.entries(selectedAttributes).every(([name, value]) => {
				if (name === attributeName) return true // Skip the current attribute
				const skuAttr = sku.attributes?.find((a) => a.name === name)
				return skuAttr?.value === value
			})

			if (matchesOthers) {
				const attr = sku.attributes.find((a) => a.name === attributeName)
				if (attr) {
					available.add(attr.value)
				}
			}
		})

		return available
	}

	const handleAttributeSelect = (attributeName: string, value: string) => {
		setSelectedAttributes((prev) => ({
			...prev,
			[attributeName]: value,
		}))
	}

	const discount =
		selectedSku && selectedSku.original_price > selectedSku.price
			? Math.round(
					((selectedSku.original_price - selectedSku.price) /
						selectedSku.original_price) *
						100
			  )
			: 0

	const handleAddToCart = async () => {
		if (selectedSku) {
			setIsAddingToCart(true)
			try {
				await updateCart.mutateAsync({
					sku_id: selectedSku.id,
					delta_quantity: quantity,
				})
				setJustAdded(true)
				setTimeout(() => setJustAdded(false), 2000)
			} finally {
				setIsAddingToCart(false)
			}
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

	const hasMultipleVariants = product.skus && product.skus.length > 1 && attributeNames.length > 0

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
							<span className={cn("text-3xl font-bold", discount > 0 && "text-red-600")}>
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

					{/* Variant Selection */}
					{hasMultipleVariants && (
						<div className="space-y-5">
							{attributeNames.map((attributeName) => {
								const values = attributeOptions[attributeName]
								const availableValues = getAvailableValues(attributeName)
								const selectedValue = selectedAttributes[attributeName]

								return (
									<div key={attributeName} className="space-y-3">
										<div className="flex items-center justify-between">
											<p className="font-medium">
												{attributeName}:{" "}
												<span className="text-muted-foreground font-normal">
													{selectedValue || "Select"}
												</span>
											</p>
										</div>
										<div className="flex flex-wrap gap-2">
											{values.map((value) => {
												const isSelected = selectedValue === value
												const isAvailable = availableValues.has(value)

												return (
													<Button
														key={value}
														variant={isSelected ? "default" : "outline"}
														size="sm"
														onClick={() => handleAttributeSelect(attributeName, value)}
														disabled={!isAvailable}
														className={cn(
															"relative min-w-[60px] transition-all",
															!isAvailable && "opacity-50 line-through",
															isSelected && "ring-2 ring-primary ring-offset-2"
														)}
													>
														{value}
														{isSelected && (
															<Check className="h-3 w-3 ml-1.5" />
														)}
													</Button>
												)
											})}
										</div>
									</div>
								)
							})}

							{/* Selected variant info */}
							{selectedSku && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
									<Check className="h-4 w-4 text-green-600" />
									<span>
										Selected: {selectedSku.attributes?.map(a => a.value).join(" / ")}
									</span>
									{selectedSku.taken !== undefined && selectedSku.taken > 0 && (
										<Badge variant="secondary" className="ml-auto">
											{selectedSku.taken}+ sold
										</Badge>
									)}
								</div>
							)}

							{!selectedSku && Object.keys(selectedAttributes).length > 0 && (
								<div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
									<AlertCircle className="h-4 w-4" />
									<span>This combination is not available</span>
								</div>
							)}
						</div>
					)}

					{/* Single SKU display */}
					{!hasMultipleVariants && product.skus && product.skus.length === 1 && (
						<div className="text-sm text-muted-foreground">
							{selectedSku?.taken !== undefined && selectedSku.taken > 0 && (
								<span>{selectedSku.taken}+ sold</span>
							)}
						</div>
					)}

					{/* Quantity */}
					<div className="space-y-3">
						<p className="font-medium">Quantity:</p>
						<div className="flex items-center gap-3">
							<div className="flex items-center border rounded-lg">
								<Button
									variant="ghost"
									size="icon"
									className="rounded-r-none"
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									disabled={quantity <= 1}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="w-12 text-center font-medium">{quantity}</span>
								<Button
									variant="ghost"
									size="icon"
									className="rounded-l-none"
									onClick={() => setQuantity(quantity + 1)}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<Button
							size="lg"
							className={cn(
								"flex-1 transition-all",
								justAdded && "bg-green-600 hover:bg-green-700"
							)}
							onClick={handleAddToCart}
							disabled={isAddingToCart || !selectedSku}
						>
							{justAdded ? (
								<>
									<Check className="h-5 w-5 mr-2" />
									Added to Cart!
								</>
							) : isAddingToCart ? (
								<>
									<Loader2 className="h-5 w-5 mr-2 animate-spin" />
									Adding...
								</>
							) : (
								<>
									<ShoppingCart className="h-5 w-5 mr-2" />
									Add to Cart
								</>
							)}
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
							<div dangerouslySetInnerHTML={{ __html: product.description || "No description available." }} />
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
					<div className="space-y-4">
						<Skeleton className="h-4 w-20" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-16" />
							<Skeleton className="h-9 w-16" />
							<Skeleton className="h-9 w-16" />
						</div>
					</div>
					<div className="space-y-4">
						<Skeleton className="h-4 w-20" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-12" />
							<Skeleton className="h-9 w-12" />
							<Skeleton className="h-9 w-12" />
							<Skeleton className="h-9 w-12" />
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
