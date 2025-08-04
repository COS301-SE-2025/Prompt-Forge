"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { ReviewCard } from "./ReviewCard"
import { BookOpen, MessageSquare, Info, Edit, Trash2, X } from "lucide-react"
import { PurchaseButton } from "./PurchaseButton"
import { StarRating } from "./StarRating"
import { Card } from "./ui/Card"
import { ReviewForm } from "./ReviewForm"
import { PromptService } from "@/services/promptService"
import type { PromptWithTags, Review } from "@/models/Prompt"
import { Button } from "./ui/Button"
import { CartService } from "@/services/cartServices"
import httpClient from "../services/httpClient"

export const PromptDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [prompt, setPrompt] = useState<PromptWithTags | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  //const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userOwnsPrompt, setUserOwnsPrompt] = useState(false)
  const [userAddedToCart, setUserAddedToCart] = useState(false)

  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [deletingReview, setDeletingReview] = useState<string | null>(null)
  const [editingReviewData, setEditingReviewData] = useState<{id: string, rating: number, comment: string} | null>(null)

  const promptService = new PromptService()
  const cartService = new CartService()
  const notificationRef = useRef<HTMLDivElement | null>(null)

  // Notification helper (EditorPage style, bottom right)
  const showNotification = (type: "success" | "error", title: string, message: string) => {
    const bg = type === "success"
      ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
      : "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200"
    const icon = type === "success"
      ? `<svg class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`
      : `<svg class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`
    const notification = document.createElement('div')
    notification.className = `fixed bottom-4 right-4 ${bg} border p-4 rounded-lg shadow-lg z-50 max-w-md animate-fade-in`
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">${icon}</div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium">${title}</h3>
          <div class="mt-1 text-xs">${message}</div>
        </div>
      </div>
    `
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.classList.add('animate-fade-out')
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 500)
    }, 4000)
  }

  useEffect(() => {
    const fetchPromptData = async () => {
      try {
        setLoading(true)
        setError(null)

        // First fetch prompt, then reviews (sequential to avoid 405 errors)
        const promptData = await promptService.getPromptById(id!)
        setUserOwnsPrompt(promptData.ownership);
        setUserAddedToCart(promptData.addedToCart);
        setPrompt(promptData)
    
        // Only try to fetch reviews if we got a prompt successfully
        const reviewsData = await promptService.getPromptReviews(id!)
        setReviews(reviewsData)
        
        // Enhanced JWT token parsing (same as MyPromptsPage)
        const checkAuthAndGetUserId = async () => {
          try {
            // Check if user is logged in
            const username = localStorage.getItem('username')
            if (!username || username === 'Guest') {
              console.log("User not authenticated")
              setCurrentUserId(null)
              return
            }

            //Get user profile using JWT token (sent via cookies)
            console.log("Fetching user profile for review permissions...")
            const response = await httpClient.get('/user/me')

            if (response.ok) {
              const userData = await response.json()
              setCurrentUserId(userData.userId)
              console.log("User profile loaded for reviews:", userData.userId)
            } else if (response.status === 401) {
              console.log("Unauthorized")
              setCurrentUserId(null)
            } else {
              // Fallback: try to get from localStorage
              const fallbackUserId = localStorage.getItem('userId')
              if (fallbackUserId) {
                setCurrentUserId(fallbackUserId)
                console.log("Using fallback userId:", fallbackUserId)
              } else {
                console.log("No userId available")
                setCurrentUserId(null)
              }
            }
          } catch (error) {
            console.error("Auth check failed:", error)
            // Fallback: try to get from localStorage
            const fallbackUserId = localStorage.getItem('userId')
            if (fallbackUserId) {
              setCurrentUserId(fallbackUserId)
              console.log("Using fallback userId after error:", fallbackUserId)
            } else {
              setCurrentUserId(null)
            }
          }
        }

        await checkAuthAndGetUserId()
        
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
    if (currentUserId === prompt?.authorId) {
      showNotification("error", "Purchase not allowed", "You cannot purchase your own prompt.")
      return
    }

    cartService.addToCart(id)
      .then(res => {
        showNotification("success", "Added to cart", res.message)
        setUserAddedToCart(true)
      })
      .catch(err => {
        showNotification("error", "Add to cart failed", err.message)
      })
  }

  const handleReviewUpdate = async (reviewId: string, updatedReview: { rating: number; comment: string }) => {
    try {
      setEditingReview(reviewId)
      await promptService.updateReview(id!, reviewId, updatedReview)
      const reviewsData = await promptService.getPromptReviews(id!)
      setReviews(reviewsData)
      setEditingReview(null)
      setEditingReviewData(null)
      showNotification("success", "Review updated", "Your review was updated successfully.")
    } catch (err) {
      console.error("Review update error:", err)
      showNotification("error", "Update failed", "Failed to update review")
      setEditingReview(null)
    }
  }

  const handleReviewDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return
    }
    try {
      setDeletingReview(reviewId)
      await promptService.deleteReview(id!, reviewId)
      const reviewsData = await promptService.getPromptReviews(id!)
      setReviews(reviewsData)
      setDeletingReview(null)
      showNotification("success", "Review deleted", "Your review was deleted successfully.")
    } catch (err) {
      console.error("Review deletion error:", err)
      showNotification("error", "Delete failed", "Failed to delete review")
      setDeletingReview(null)
    }
  }

  // Check if current user can edit/delete a review
  const canModifyReview = (review: Review) => {
    if (!currentUserId) return false;
    
    // Log for debugging
    console.log('Current User ID:', currentUserId);
    console.log('Review User ID:', review.userId);
    console.log('Review object:', review);
    
    // Try both direct comparison and string comparison
    return currentUserId === review.userId || currentUserId === review.userId?.toString();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? "Loading prompt..." : "Checking access..."}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Error Loading Prompt</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            <svg
              className="h-12 w-12 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Prompt Not Found</h3>
          <p className="text-muted-foreground mb-4">
            This prompt may have been removed or doesn't exist
          </p>
          <a href="/marketplace">
            <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
              Back to Marketplace
            </Button>
          </a>
        </div>
      </div>
    )
  }

  // Check if this is a paid prompt that the user doesn't own
  const isPaidPrompt = prompt.price > 0
  const canViewContent = !isPaidPrompt || userOwnsPrompt

  return (
    <div className="container px-4 py-6 mx-auto max-w-6xl">
      {/* Back button */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Breadcrumb - More compact */}
      <div className="mb-4">
        <nav className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400">
          <a
            href="/marketplace"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
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
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {prompt.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Published {new Date(prompt.publishedAt).toLocaleDateString()}</span>
              <div className="flex items-center gap-1">
                <StarRating value={averageRating} size="sm" />
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
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {prompt.description}
            </p>
          </Card>

          {/* Prompt content - Only visible if user owns it or it's free */}
          {canViewContent ? (
            <Card className="p-4">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#3ebb9e]" />
                Prompt
              </h2>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto custom-scrollbar">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Premium Content
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This prompt is premium content. Purchase it to view the full prompt text and unlock its potential.
                  </p>
                </div>
                <div className="flex justify-center"></div>
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
                <StarRating value={averageRating} size="sm" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-3 mb-4">
                {reviews.map((review) => (
                  <div key={review.id} className="relative">
                    <ReviewCard
                      userName={review.userName}
                      rating={review.rating}
                      comment={review.comment}
                    />
                    
                    {/* Bigger Edit/Delete buttons for user's own reviews */}
                    {canModifyReview(review) && (
                      <div className="absolute top-3 right-3 flex gap-2 z-20 bg-white dark:bg-gray-800 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md"
                          onClick={() => {
                            setEditingReviewData({
                              id: review.id,
                              rating: review.rating,
                              comment: review.comment
                            })
                          }}
                          disabled={editingReview === review.id}
                          title="Edit review"
                        >
                          {editingReview === review.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <Edit className="h-4 w-4 text-blue-600" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
                          onClick={() => handleReviewDelete(review.id)}
                          disabled={deletingReview === review.id}
                          title="Delete review"
                        >
                          {deletingReview === review.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review this prompt!
              </div>
            )}

            {/* Only allow reviews if user owns the prompt or it's free AND user is not the author */}
            {canViewContent && currentUserId !== prompt.authorId && (
              <>
                {editingReviewData ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                        Edit Your Review
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingReviewData(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                    <ReviewForm
                      promptId={id!}
                      editMode={true}
                      initialRating={editingReviewData.rating}
                      initialComment={editingReviewData.comment}
                      onSubmitSuccess={() => {
                        // Refresh reviews after successful update
                        const fetchReviews = async () => {
                          const reviewsData = await promptService.getPromptReviews(id!)
                          setReviews(reviewsData)
                        }
                        fetchReviews()
                        setEditingReviewData(null) // Clear edit mode
                      }}
                      onUpdate={(updatedReview) => {
                        handleReviewUpdate(editingReviewData.id, updatedReview)
                      }}
                    />
                  </div>
                ) : (
                  <ReviewForm
                    promptId={id!}
                    onSubmitSuccess={() => {
                      // Refresh reviews after successful submission
                      const fetchReviews = async () => {
                        const reviewsData = await promptService.getPromptReviews(id!)
                        setReviews(reviewsData)
                      }
                      fetchReviews()
                    }}
                  />
                )}
              </>
            )}

            {/* Show message if user is the author */}
            {canViewContent && currentUserId === prompt.authorId && (
              <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">You can't review your own prompt</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Authors cannot leave reviews on their own prompts</p>
                </div>
              </div>
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

                {currentUserId === prompt.authorId ? (
                  <div className="text-center py-3 px-4 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg">
                    <span className="text-sm font-medium">📝 Your Prompt</span>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">You cannot purchase your own prompt</p>
                  </div>
                ) : userOwnsPrompt ? (
                  <div className="text-center py-2 px-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg">
                    <span className="text-sm font-medium">✓ Owned</span>
                  </div>
                ) : userAddedToCart ? (
                  <div className="text-center py-2 px-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg">
                    <span className="text-sm font-medium">✓ Added to cart</span>
                  </div>
                ) : (
                  <PurchaseButton
                    price={prompt.price}
                    onClick={handlePurchase}
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
