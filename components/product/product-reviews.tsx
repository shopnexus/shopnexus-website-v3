"use client"

import { useState } from "react"
import Image from "next/image"
import {
	useListComments,
	useCreateComment,
	TComment,
} from "@/core/catalog/comment.customer"
import { useGetMe } from "@/core/account/account"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Star,
	ThumbsUp,
	ThumbsDown,
	MessageSquare,
	Loader2,
	Pencil,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductReviewsProps {
	productId: string
	rating?: {
		score: number
		total: number
		breakdown: Record<string, number>
	}
}

export function ProductReviews({ productId, rating }: ProductReviewsProps) {
	const { data: user } = useGetMe()
	const isLoggedIn = !!user
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useListComments({
			limit: 10,
			ref_type: "ProductSpu",
			ref_id: productId,
		})
	const createComment = useCreateComment()

	const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false)
	const [reviewScore, setReviewScore] = useState(5)
	const [reviewBody, setReviewBody] = useState("")
	const [hoverScore, setHoverScore] = useState<number | null>(null)

	const comments = data?.pages.flatMap((page) => page.data) ?? []

	const handleSubmitReview = async () => {
		await createComment.mutateAsync({
			ref_type: "product",
			ref_id: productId,
			body: reviewBody,
			score: reviewScore,
			resource_ids: [],
		})
		setIsWriteDialogOpen(false)
		setReviewBody("")
		setReviewScore(5)
	}

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	}

	return (
		<div className="space-y-6">
			{/* Rating Summary */}
			{rating && rating.total > 0 && (
				<div className="flex flex-col md:flex-row gap-8">
					<div className="text-center md:text-left">
						<div className="text-5xl font-bold">
							{(rating.score / 20).toFixed(1)}
						</div>
						<div className="flex items-center gap-1 mt-2 justify-center md:justify-start">
							{Array.from({ length: 5 }).map((_, i) => (
								<Star
									key={i}
									className={cn(
										"h-4 w-4",
										i < Math.round(rating.score / 20)
											? "fill-yellow-400 text-yellow-400"
											: "text-muted-foreground/30"
									)}
								/>
							))}
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							{rating.total} reviews
						</p>
					</div>

					{/* Rating Breakdown */}
					<div className="flex-1 space-y-2">
						{[5, 4, 3, 2, 1].map((stars) => {
							const count = rating.breakdown?.[String(stars)] || 0
							return (
								<div key={stars} className="flex items-center gap-2">
									<span className="text-sm w-8">{stars}★</span>
									<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
										<div
											className="h-full bg-yellow-400"
											style={{
												width: `${
													rating.total > 0 ? (count / rating.total) * 100 : 0
												}%`,
											}}
										/>
									</div>
									<span className="text-sm text-muted-foreground w-12 text-right">
										{count}
									</span>
								</div>
							)
						})}
					</div>
				</div>
			)}

			<Separator />

			{/* Write Review Button */}
			<div className="flex items-center justify-between">
				<h3 className="font-medium">Customer Reviews</h3>
				<Button onClick={() => setIsWriteDialogOpen(true)}>
					<Pencil className="h-4 w-4 mr-2" />
					Write a Review
				</Button>
			</div>

			{/* Reviews List */}
			{isLoading ? (
				<div className="space-y-4">
					{[...Array(3)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-4">
								<div className="flex gap-4">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-16 w-full" />
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : comments.length === 0 ? (
				<Card>
					<CardContent className="p-8 text-center">
						<MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						{isLoggedIn ? (
							<>
								<h3 className="font-medium mb-2">No reviews yet</h3>
								<p className="text-muted-foreground text-sm mb-4">
									Be the first to review this product
								</p>
								<Button onClick={() => setIsWriteDialogOpen(true)}>
									Write a Review
								</Button>
							</>
						) : (
							<>
								{/* only logged in can see the reviews */}
								<h3 className="font-medium mb-2">Reviews are hidden</h3>
								<p className="text-muted-foreground text-sm mb-4">
									Please{" "}
									<a href="/login" className="text-primary underline">
										log in
									</a>{" "}
									to see reviews.
								</p>
							</>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{comments.map((comment) => (
						<ReviewCard
							key={comment.id}
							comment={comment}
							formatDate={formatDate}
						/>
					))}

					{hasNextPage && (
						<div className="text-center pt-4">
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
									"Load More Reviews"
								)}
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Write Review Dialog */}
			<Dialog open={isWriteDialogOpen} onOpenChange={setIsWriteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Write a Review</DialogTitle>
						<DialogDescription>
							Share your experience with this product
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* Star Rating */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Your Rating</label>
							<div className="flex items-center gap-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										type="button"
										onMouseEnter={() => setHoverScore(star)}
										onMouseLeave={() => setHoverScore(null)}
										onClick={() => setReviewScore(star)}
										className="p-1"
									>
										<Star
											className={cn(
												"h-8 w-8 transition-colors",
												star <= (hoverScore ?? reviewScore)
													? "fill-yellow-400 text-yellow-400"
													: "text-muted-foreground/30"
											)}
										/>
									</button>
								))}
								<span className="ml-2 text-sm text-muted-foreground">
									{reviewScore} out of 5
								</span>
							</div>
						</div>

						{/* Review Text */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Your Review</label>
							<Textarea
								placeholder="What did you like or dislike about this product?"
								className="min-h-[120px]"
								value={reviewBody}
								onChange={(e) => setReviewBody(e.target.value)}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsWriteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmitReview}
							disabled={createComment.isPending || !reviewBody.trim()}
						>
							{createComment.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Submitting...
								</>
							) : (
								"Submit Review"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

function ReviewCard({
	comment,
	formatDate,
}: {
	comment: TComment
	formatDate: (date: string) => string
}) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex gap-4">
					<Avatar className="h-10 w-10">
						<AvatarImage src={comment.profile?.avatar_url ?? undefined} />
						<AvatarFallback>
							{comment.profile?.name?.charAt(0) ||
								comment.profile?.username?.charAt(0) ||
								"U"}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-2">
							<div>
								<p className="font-medium">
									{comment.profile?.name ||
										comment.profile?.username ||
										"Anonymous"}
								</p>
								<div className="flex items-center gap-2 mt-1">
									<div className="flex items-center gap-0.5">
										{Array.from({ length: 5 }).map((_, i) => (
											<Star
												key={i}
												className={cn(
													"h-3 w-3",
													i < comment.score
														? "fill-yellow-400 text-yellow-400"
														: "text-muted-foreground/30"
												)}
											/>
										))}
									</div>
									<span className="text-xs text-muted-foreground">
										{formatDate(comment.date_created)}
									</span>
								</div>
							</div>
						</div>

						<p className="text-sm text-muted-foreground mt-3">{comment.body}</p>

						{/* Review Images */}
						{comment.resources && comment.resources.length > 0 && (
							<div className="flex gap-2 mt-3 flex-wrap">
								{comment.resources.map((resource, idx) => (
									<div
										key={idx}
										className="relative h-16 w-16 rounded overflow-hidden bg-muted"
									>
										<Image
											src={resource.url}
											alt="Review"
											fill
											className="object-cover"
										/>
									</div>
								))}
							</div>
						)}

						{/* Helpful Buttons */}
						<div className="flex items-center gap-4 mt-4">
							<button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
								<ThumbsUp className="h-3 w-3" />
								Helpful ({comment.upvote})
							</button>
							<button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
								<ThumbsDown className="h-3 w-3" />({comment.downvote})
							</button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
