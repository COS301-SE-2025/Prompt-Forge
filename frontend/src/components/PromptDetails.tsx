import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ReviewCard } from './ReviewCard'
import { User, Share2, BookOpen, MessageSquare, Info, Star } from 'lucide-react'
import { PurchaseButton } from './PurchaseButton'
import { StarRating } from './StarRating'
import { Card } from './ui/Card'
import { ReviewForm } from './ReviewForm'
import { PromptService } from '@/services/promptService'
import { PromptWithTags, Review } from '@/models/Prompt'

export const PromptDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [prompt, setPrompt] = useState<PromptWithTags | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const promptService = new PromptService()

  useEffect(() => {
    const fetchPromptData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First fetch prompt, then reviews (sequential to avoid 405 errors)
        const promptData = await promptService.getPromptById(id!)
        setPrompt(promptData)
        
        // Only try to fetch reviews if we got a prompt successfully
        const reviewsData = await promptService.getPromptReviews(id!)
        setReviews(reviewsData)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPromptData()
  }, [id])

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/store/prompts/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Purchase failed')
      }
      
      alert('Purchase successful!')
    } catch (err) {
      console.error('Purchase error:', err)
      alert(err instanceof Error ? err.message : 'Purchase failed. Please try again.')
    }
  }

  const handleReviewSubmit = async (review: { rating: number; comment: string }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/store/prompts/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: review.rating,
          comment: review.comment
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      const newReview = await response.json()
      setReviews(prev => [...prev, newReview])
    } catch (err) {
      console.error('Review submission error:', err)
      alert('Failed to submit review')
    }
  }

  if (loading) return <div className="container p-8 text-center">Loading...</div>
  if (error) return <div className="container p-8 text-red-500">{error}</div>
  if (!prompt) return <div className="container p-8">Prompt not found</div>

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      {/* Breadcrumb - Shows all tags */}
      <div className="mb-6">
        <nav className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400">
          <a href="/marketplace" className="hover:text-gray-700 dark:hover:text-gray-300">
            Marketplace
          </a>
          {prompt.tags.length > 0 && (
            <>
              <span className="mx-2">/</span>
              <div className="flex flex-wrap items-center gap-1">
                {prompt.tags.map((tag, index) => (
                  <span key={tag.id} className="flex items-center">
                    <a 
                      href={`/marketplace?tag=${tag.name}`}
                      className="hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {tag.name}
                    </a>
                    {index < prompt.tags.length - 1 && <span className="mx-1">,</span>}
                  </span>
                ))}
              </div>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">{prompt.title}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Prompt header with all tags */}
          <div className="mb-6">
            {prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {prompt.tags.map(tag => (
                  <span 
                    key={tag.id}
                    className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {prompt.title}
            </h1>
            <div className="text-sm text-muted-foreground">
              Published on {new Date(prompt.publishedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Prompt description */}
          <Card id="description" className="mb-5 p-5">
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Description</h2>
            <p className="text-gray-700 dark:text-gray-300">{prompt.description}</p>
          </Card>

          {/* Prompt content */}
          <Card className="mb-5 p-5">
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Prompt</h2>
            <div className="p-4 rounded-md bg-card dark:bg-[#191919]">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {prompt.content}
              </p>
            </div>
          </Card>

          {/* Reviews */}
          <Card id="reviews" className="p-5 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reviews</h2>
              <div className="flex items-center">
                <StarRating rating={averageRating} size="lg" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  author={review.userId}
                  date={review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'No date'}
                  rating={review.rating}
                  comment={review.comment}
                />
              ))}
            </div>
            <ReviewForm 
              promptId={id!} 
              // onSubmit={handleReviewSubmit} 
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="sticky p-5 border rounded-lg top-20">
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Pricing</h3>
                <p className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                  ${prompt.price.toFixed(2)}
                </p>
                <PurchaseButton 
                  price={prompt.price} 
                  onClick={handlePurchase} 
                  // disabled={prompt.visibility !== 'public'}
                />
              </div>

              {/* Author Info */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">Author</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm">@{prompt.authorId.substring(0, 8)}</span>
                </div>
              </div>

              {/* All Tags */}
              {prompt.tags.length > 0 && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map(tag => (
                      <a
                        key={tag.id}
                        href={`/marketplace?tag=${tag.name}`}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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