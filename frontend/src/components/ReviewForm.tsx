// Update ReviewForm.tsx
import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Button } from './ui/Button'
import { PromptService } from '@/services/promptService'

interface ReviewFormProps {
  promptId: string;
  onSubmitSuccess?: () => void;
  onUpdate?: (updatedReview: { rating: number; comment: string }) => void;
  editMode?: boolean;
  initialRating?: number;
  initialComment?: string;
}

export const ReviewForm = ({ 
  promptId, 
  onSubmitSuccess, 
  onUpdate,
  editMode = false,
  initialRating = 0,
  initialComment = ''
}: ReviewFormProps) => {
  const [rating, setRating] = useState(initialRating)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(initialComment)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const promptService = new PromptService();

  // Update form when edit mode props change
  useEffect(() => {
    setRating(initialRating)
    setComment(initialComment)
  }, [initialRating, initialComment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    
    if (comment.trim().length < 10) {
      setError('Please write a review of at least 10 characters')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      const reviewData = { 
        rating, 
        comment: comment.trim() 
      };

      if (editMode && onUpdate) {
        // Use the update callback for edit mode
        await onUpdate(reviewData);
      } else {
        // Create new review
        await promptService.postReview(promptId, reviewData);
      }
      
      // Reset form on success (only for new reviews)
      if (!editMode) {
        setRating(0)
        setComment('')
      }
      
      // Mark that ratings should be refreshed
      sessionStorage.setItem('needsRatingRefresh', 'true')
      
      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Review submission failed:', error)
      
      // Better error handling for specific cases
      let errorMessage = editMode ? 'Failed to update review' : 'Failed to submit review'
      
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase()
        
        if (errorText.includes('already reviewed') || errorText.includes('duplicate')) {
          errorMessage = 'You have already reviewed this prompt. You can only submit one review per prompt.'
        } else if (errorText.includes('unauthorized') || errorText.includes('authentication')) {
          errorMessage = 'Please log in to submit a review.'
        } else if (errorText.includes('forbidden')) {
          errorMessage = 'You do not have permission to review this prompt.'
        } else if (errorText.includes('400')) {
          errorMessage = 'Invalid review data. Please check your rating and comment.'
        } else if (errorText.includes('404')) {
          errorMessage = 'This prompt was not found.'
        } else if (errorText.includes('500')) {
          errorMessage = 'Server error. Please try again later.'
        } else if (error.message) {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={editMode ? '' : 'mt-6'}>
      {!editMode && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Write a Review
        </h3>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {editMode ? 'Unable to update review' : 'Unable to submit review'}
                </p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

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
                  className={`h-7 w-7 ${
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
                {editMode ? 'Updating...' : 'Submitting...'}
              </div>
            ) : (
              editMode ? 'Update Review' : 'Submit Review'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}