"use client"

import { Suspense, useMemo, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
	useListProductCards,
} from "@/core/catalog/product.customer"
import { useGetCategory } from "@/core/catalog/category"
import { CategorySelect } from "@/components/ui/catalog-selects"
import { useListTags } from "@/core/catalog/tag"
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import {
	ChevronRight,
	Search,
	SlidersHorizontal,
	X,
	Loader2,
} from "lucide-react"

function SearchContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const query = searchParams.get("q") || ""
	const categoryParam = searchParams.get("category_id") || null
	const tagParams = searchParams.getAll("tag")

	// Filter states synced from URL on mount
	const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam)
	const [selectedTags, setSelectedTags] = useState<string[]>(tagParams)
	const [priceMin, setPriceMin] = useState("")
	const [priceMax, setPriceMax] = useState("")
	const [sortBy, setSortBy] = useState<string>("relevance")
	const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

	// Fetch filter options
	const { data: tagsData } = useListTags({ limit: 50 })
	const tags = tagsData?.pages.flatMap((p) => p.data) ?? []

	const { data: categoryDetail } = useGetCategory(selectedCategory ?? "")

	// Fetch products with all filters sent to API
	const {
		data: productsData,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useListProductCards({
		limit: 48,
		search: query || undefined,
		...(selectedCategory ? { category_id: [selectedCategory] } : {}),
		...(selectedTags.length > 0 ? { tag: selectedTags } : {}),
		...(priceMin ? { price_min: parseFloat(priceMin) } : {}),
		...(priceMax ? { price_max: parseFloat(priceMax) } : {}),
	}, {
		enabled: !!(query || selectedCategory || selectedTags.length > 0),
	})

	const allProducts = productsData?.pages.flatMap((p) => p.data) ?? []

	// Client-side sort (API handles filtering, we sort the results)
	const sortedProducts = useMemo(() => {
		const result = [...allProducts]
		switch (sortBy) {
			case "price-asc":
				result.sort((a, b) => a.price - b.price)
				break
			case "price-desc":
				result.sort((a, b) => b.price - a.price)
				break
			case "rating":
				result.sort((a, b) => b.rating.score - a.rating.score)
				break
			case "newest":
				result.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
				break
		}
		return result
	}, [allProducts, sortBy])

	// Update URL when filters change
	const updateURL = useCallback((cat: string | null, tgs: string[]) => {
		const params = new URLSearchParams()
		if (query) params.set("q", query)
		if (cat) params.set("category_id", cat)
		tgs.forEach((t) => params.append("tag", t))
		router.replace(`/search?${params.toString()}`, { scroll: false })
	}, [query, router])

	const changeCategory = useCallback((catId: string | null) => {
		setSelectedCategory(catId)
		updateURL(catId, selectedTags)
	}, [selectedTags, updateURL])

	const toggleTag = useCallback((tagId: string) => {
		setSelectedTags((prev) => {
			const next = prev.includes(tagId)
				? prev.filter((t) => t !== tagId)
				: [...prev, tagId]
			updateURL(selectedCategory, next)
			return next
		})
	}, [selectedCategory, updateURL])

	const activeFiltersCount = useMemo(() => {
		let count = 0
		if (query) count++
		if (selectedCategory) count++
		if (selectedTags.length > 0) count++
		if (priceMin || priceMax) count++
		return count
	}, [query, selectedCategory, selectedTags, priceMin, priceMax])

	const clearAllFilters = useCallback(() => {
		setSelectedCategory(null)
		setSelectedTags([])
		setPriceMin("")
		setPriceMax("")
		router.replace("/search", { scroll: false })
	}, [router])

	const hasActiveSearch = !!(query || selectedCategory || selectedTags.length > 0)

	// --- Filter sidebar content ---
	const FilterContent = () => (
		<div className="space-y-6">
			{/* Category */}
			<div>
				<h4 className="font-medium text-sm mb-3">Category</h4>
				<CategorySelect
					value={selectedCategory}
					onChange={changeCategory}
					placeholder="All categories"
				/>
			</div>

			<Separator />

			{/* Tags */}
			{tags.length > 0 && (
				<div>
					<h4 className="font-medium text-sm mb-3">Tags</h4>
					<div className="flex flex-wrap gap-2">
						{tags.map((tag) => (
							<Badge
								key={tag.id}
								variant={selectedTags.includes(tag.id) ? "default" : "outline"}
								className="cursor-pointer"
								onClick={() => toggleTag(tag.id)}
							>
								{tag.id}
							</Badge>
						))}
					</div>
				</div>
			)}

			{tags.length > 0 && <Separator />}

			{/* Price Range */}
			<div>
				<h4 className="font-medium text-sm mb-3">Price Range</h4>
				<div className="flex items-center gap-2">
					<Input
						type="number"
						placeholder="Min"
						className="h-8 text-sm"
						value={priceMin}
						onChange={(e) => setPriceMin(e.target.value)}
					/>
					<span className="text-muted-foreground">-</span>
					<Input
						type="number"
						placeholder="Max"
						className="h-8 text-sm"
						value={priceMax}
						onChange={(e) => setPriceMax(e.target.value)}
					/>
				</div>
			</div>

			<Separator />

			<Button
				variant="outline"
				className="w-full"
				size="sm"
				onClick={clearAllFilters}
				disabled={activeFiltersCount === 0}
			>
				Clear All Filters
			</Button>
		</div>
	)

	// --- Page title ---
	const pageTitle = useMemo(() => {
		if (query) {
			return (
				<>
					Search results for &quot;<span className="text-primary">{query}</span>&quot;
				</>
			)
		}
		if (selectedCategory && categoryDetail) {
			return <>{categoryDetail.name}</>
		}
		if (selectedTags.length > 0) {
			return (
				<>
					Tagged with{" "}
					{selectedTags.map((tag, i) => (
						<span key={tag}>
							{i > 0 && ", "}
							<span className="text-primary">{tag}</span>
						</span>
					))}
				</>
			)
		}
		return "Browse Products"
	}, [query, selectedCategory, categoryDetail, selectedTags])

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Breadcrumb */}
			<nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
				<Link href="/" className="hover:text-primary transition-colors">Home</Link>
				<ChevronRight className="h-4 w-4" />
				{selectedCategory && categoryDetail ? (
					<>
						<Link href="/search" className="hover:text-primary transition-colors">Search</Link>
						<ChevronRight className="h-4 w-4" />
						<span className="text-foreground">{categoryDetail.name}</span>
					</>
				) : (
					<span className="text-foreground">Search Results</span>
				)}
			</nav>

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold">{pageTitle}</h1>
				{selectedCategory && categoryDetail?.description && (
					<p className="text-muted-foreground mt-2">{categoryDetail.description}</p>
				)}
				{!isLoading && hasActiveSearch && (
					<p className="text-muted-foreground mt-2">
						{sortedProducts.length} products
						{activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} applied)`}
					</p>
				)}
			</div>

			<div className="flex flex-col lg:flex-row gap-8">
					{/* Desktop Sidebar */}
					<aside className="hidden lg:block w-64 flex-shrink-0">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									<SlidersHorizontal className="h-4 w-4" />
									Filters
									{activeFiltersCount > 0 && (
										<Badge variant="secondary" className="ml-auto">{activeFiltersCount}</Badge>
									)}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<FilterContent />
							</CardContent>
						</Card>
					</aside>

					{/* Main content */}
					<div className="flex-1">
						{/* Mobile filter + sort bar */}
						<div className="flex items-center justify-between mb-6 gap-4">
							<Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
								<SheetTrigger asChild>
									<Button variant="outline" size="sm" className="lg:hidden">
										<SlidersHorizontal className="h-4 w-4 mr-2" />
										Filters
										{activeFiltersCount > 0 && (
											<Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
										)}
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="w-80">
									<SheetHeader>
										<SheetTitle>Filters</SheetTitle>
									</SheetHeader>
									<div className="mt-6">
										<FilterContent />
									</div>
								</SheetContent>
							</Sheet>

							<p className="text-sm text-muted-foreground hidden sm:block">
								Showing {sortedProducts.length} results
							</p>

							<Select value={sortBy} onValueChange={setSortBy}>
								<SelectTrigger className="w-44">
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="relevance">Relevance</SelectItem>
									<SelectItem value="price-asc">Price: Low to High</SelectItem>
									<SelectItem value="price-desc">Price: High to Low</SelectItem>
									<SelectItem value="rating">Top Rated</SelectItem>
									<SelectItem value="newest">Newest</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Active filter badges */}
						{activeFiltersCount > 0 && (
							<div className="flex flex-wrap gap-2 mb-4">
								{selectedCategory && categoryDetail && (
									<Badge variant="secondary" className="gap-1">
										{categoryDetail.name}
										<button onClick={() => changeCategory(null)}>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								)}
								{selectedTags.map((tagId) => (
									<Badge key={tagId} variant="secondary" className="gap-1">
										{tagId}
										<button onClick={() => toggleTag(tagId)}>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
								{(priceMin || priceMax) && (
									<Badge variant="secondary" className="gap-1">
										${priceMin || "0"} - ${priceMax || "∞"}
										<button onClick={() => { setPriceMin(""); setPriceMax("") }}>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								)}
								<Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearAllFilters}>
									Clear all
								</Button>
							</div>
						)}

						{/* Products */}
						{!hasActiveSearch ? (
							<div className="text-center py-16">
								<div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
									<Search className="h-10 w-10 text-muted-foreground" />
								</div>
								<h2 className="text-xl font-semibold mb-2">Start searching</h2>
								<p className="text-muted-foreground max-w-md mx-auto">
									Use the search bar above to find products, or select a category to browse.
								</p>
							</div>
						) : isLoading ? (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
								{Array.from({ length: 20 }).map((_, i) => (
									<ProductCardSkeleton key={i} />
								))}
							</div>
						) : sortedProducts.length === 0 ? (
							<div className="text-center py-16">
								<div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
									<Search className="h-10 w-10 text-muted-foreground" />
								</div>
								<h2 className="text-xl font-semibold mb-2">No products found</h2>
								<p className="text-muted-foreground max-w-md mx-auto mb-6">
									Try adjusting your filters to find more products.
								</p>
								<Button onClick={clearAllFilters}>Clear Filters</Button>
							</div>
						) : (
							<>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
									{sortedProducts.map((product) => (
										<ProductCard key={product.id} product={product} />
									))}
								</div>

								{hasNextPage && (
									<div className="text-center mt-8">
										<Button
											variant="outline"
											onClick={() => fetchNextPage()}
											disabled={isFetchingNextPage}
										>
											{isFetchingNextPage ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Loading...
												</>
											) : (
												"Load More Products"
											)}
										</Button>
									</div>
								)}
							</>
						)}
					</div>
				</div>
		</div>
	)
}

export default function SearchPage() {
	return (
		<Suspense fallback={<SearchPageSkeleton />}>
			<SearchContent />
		</Suspense>
	)
}

function SearchPageSkeleton() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center gap-2 mb-8">
				<Skeleton className="h-4 w-12" />
				<Skeleton className="h-4 w-4" />
				<Skeleton className="h-4 w-24" />
			</div>
			<Skeleton className="h-10 w-80 mb-2" />
			<Skeleton className="h-5 w-32 mb-8" />
			<div className="flex gap-8">
				<div className="w-64 hidden lg:block">
					<Skeleton className="h-96 rounded-lg" />
				</div>
				<div className="flex-1">
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
						{Array.from({ length: 20 }).map((_, i) => (
							<ProductCardSkeleton key={i} />
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
