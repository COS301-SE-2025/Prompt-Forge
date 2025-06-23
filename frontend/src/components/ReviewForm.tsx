import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from './ui/Button'

interface ReviewFormProps {
  onSubmit: (review: { rating: number; comment: string }) => Promise<void>
}

export const ReviewForm = ({ onSubmit }: ReviewFormProps) => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Please select a rating')
      return
    }
    
    if (comment.trim().length < 10) {
      alert('Please write a review of at least 10 characters')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ rating, comment: comment.trim() })
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Review submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star Rating Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 hover:scale-110 transition-transform"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
          </span>
        </div>
      </div>

      {/* Comment Input */}
      <div>
        <label 
          htmlFor="review-comment" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this prompt..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] focus:border-transparent
                     placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          maxLength={500}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {comment.length}/500 characters
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          className="bg-[#3ebb9e] hover:bg-[#00674f] text-white px-6 py-2 text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </div>
          ) : (
            'Submit Review'
          )}
        </Button>
      </div>
    </form>
  )
}