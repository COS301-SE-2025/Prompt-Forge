"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ReviewCard } from "./ReviewCard"
import { BookOpen, MessageSquare, Info } from "lucide-react"
import { PurchaseButton } from "./PurchaseButton"
import { StarRating } from "./StarRating"
import { Card } from "./ui/Card"
import { ReviewForm } from "./ReviewForm"
import { PromptService } from "@/services/promptService"
import type { PromptWithTags, Review } from "@/Models/Prompt"

export const PromptDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [prompt, setPrompt] = useState<PromptWithTags | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userOwnsPrompt, setUserOwnsPrompt] = useState(false)
  const [checkingOwnership, setCheckingOwnership] = useState(true)
  const promptService = new PromptService()

  useEffect(() => {
    const fetchPromptData = async () => {
      try {
        setLoading(true)
        setError(null)

        // First fetch prompt, then reviews (sequential to avoid 405 errors)
        const promptData = await promptService.getPromptById(id!)
        setPrompt(promptData)

        // Check if user owns the prompt (for paid prompts)
        if (promptData.price > 0) {
          setCheckingOwnership(true)
          try {
            const token = localStorage.getItem("token")
            if (token) {
              const response = await fetch(`/api/store/prompts/${id}/ownership`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })

              if (response.ok) {
                const ownershipData = await response.json()
                setUserOwnsPrompt(ownershipData.owns || false)
              }
            }
          } catch (ownershipError) {
            console.warn("Could not check prompt ownership:", ownershipError)
            setUserOwnsPrompt(false)
          } finally {
            setCheckingOwnership(false)
          }
        } else {
          // Free prompts are always accessible
          setUserOwnsPrompt(true)
          setCheckingOwnership(false)
        }

        // Only try to fetch reviews if we got a prompt successfully
        const reviewsData = await promptService.getPromptReviews(id!)
        setReviews(reviewsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchPromptData()
  }, [id])

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`/api/store/prompts/${id}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Purchase failed")
      }

      // Update ownership status after successful purchase
      setUserOwnsPrompt(true)
      alert("Purchase successful!")
    } catch (err) {
      console.error("Purchase error:", err)
      alert(err instanceof Error ? err.message : "Purchase failed. Please try again.")
    }
  }

  const handleReviewSubmit = async (review: { rating: number; comment: string }) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`/api/store/prompts/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: review.rating,
          comment: review.comment,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      const newReview = await response.json()
      setReviews((prev) => [...prev, newReview])
    } catch (err) {
      console.error("Review submission error:", err)
      alert("Failed to submit review")
    }
  }

  if (loading || checkingOwnership) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3ebb9e] mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading prompt..." : "Checking access..."}
          </p>
        </div>
      </div>
    )
  }

  if (error) return <div className="container p-6 text-red-500 text-sm">{error}</div>
  if (!prompt) return <div className="container p-6 text-sm">Prompt not found</div>

  // Check if this is a paid prompt that the user doesn't own
  const isPaidPrompt = prompt.price > 0
  const canViewContent = !isPaidPrompt || userOwnsPrompt

  return (
    <div className="container px-4 py-6 mx-auto max-w-6xl">
      {/* Breadcrumb - More compact */}
      <div className="mb-4">
        <nav className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400">
          <a href="/marketplace" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Marketplace
          </a>
          {prompt.tags.length > 0 && (
            <>
              <span className="mx-1.5">/</span>
              <div className="flex flex-wrap items-center gap-1">
                {prompt.tags.slice(0, 2).map((tag, index) => (
                  <span key={tag.id} className="flex items-center">
                    <a
                      href={`/marketplace?tag=${tag.name}`}
                      className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {tag.name}
                    </a>
                    {index < Math.min(prompt.tags.length, 2) - 1 && <span className="mx-1">,</span>}
                  </span>
                ))}
                {prompt.tags.length > 2 && <span className="text-gray-400">+{prompt.tags.length - 2}</span>}
              </div>
            </>
          )}
          <span className="mx-1.5">/</span>
          <span className="text-gray-900 dark:text-white font-medium">{prompt.title}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prompt header - More compact */}
          <div className="mb-4">
            {prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white leading-tight">{prompt.title}</h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Published {new Date(prompt.publishedAt).toLocaleDateString()}</span>
              <div className="flex items-center gap-1">
                <StarRating rating={averageRating} size="sm" />
                <span>({reviews.length})</span>
              </div>
              {isPaidPrompt && (
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                  Premium
                </span>
              )}
            </div>
          </div>

          {/* Prompt description - Always visible */}
          <Card className="p-4">
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-[#3ebb9e]" />
              Description
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{prompt.description}</p>
          </Card>

          {/* Prompt content - Only visible if user owns it or it's free */}
          {canViewContent ? (
            <Card className="p-4">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#3ebb9e]" />
                Prompt
              </h2>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
                  {prompt.content}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#3ebb9e]" />
                Prompt
              </h2>
              <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Premium Content</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This prompt is premium content. Purchase it to view the full prompt text and unlock its potential.
                  </p>
                </div>
                <div className="flex justify-center">
                </div>
              </div>
            </Card>
          )}

          {/* Reviews - Always visible */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#3ebb9e]" />
                Reviews
              </h2>
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} size="sm" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-3 mb-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    author={review.userId}
                    date={review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "No date"}
                    rating={review.rating}
                    comment={review.comment}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review this prompt!
              </div>
            )}

            {/* Only allow reviews if user owns the prompt or it's free */}
            {canViewContent && (
              <ReviewForm
                promptId={id!}
                // onSubmit={handleReviewSubmit}
              />
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            {/* Purchase Card */}
            <Card className="sticky top-4 p-4 shadow-lg border-2 border-gray-100 dark:border-gray-800">
              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Price</h3>
                  <p className="text-2xl font-bold text-[#3ebb9e]">
                    {prompt.price === 0 ? "Free" : `$${prompt.price.toFixed(2)}`}
                  </p>
                </div>

                {userOwnsPrompt ? (
                  <div className="text-center py-2 px-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg">
                    <span className="text-sm font-medium">✓ Owned</span>
                  </div>
                ) : (
                  <PurchaseButton
                    price={prompt.price}
                    onClick={handlePurchase}
                    className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white font-medium py-2.5 text-sm transition-colors"
                  />
                )}
              </div>

              {/* Author Info - More compact */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Author</h3>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    @{prompt.authorId.substring(0, 8)}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Stats</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-semibold text-gray-900 dark:text-white">{reviews.length}</div>
                    <div className="text-gray-500 dark:text-gray-400">Reviews</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-semibold text-gray-900 dark:text-white">{averageRating.toFixed(1)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Rating</div>
                  </div>
                </div>
              </div>

              {/* Tags - More compact */}
              {prompt.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.map((tag) => (
                      <a
                        key={tag.id}
                        href={`/marketplace?tag=${tag.name}`}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {tag.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
