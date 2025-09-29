import React, { useEffect, useState } from 'react';
import { ReviewCard } from './ReviewCard';
import { PromptService } from '@/services/promptService';
import { Review } from '@/Models/Reviews';
import { Button } from './ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface ReviewsListProps {
  promptId: string;
  onReviewsChange?: () => void; // Callback for when reviews are updated
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ promptId, onReviewsChange }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);

  const promptService = new PromptService();

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub || payload.userId);
      } catch (e) {
        console.warn("Could not decode token:", e);
      }
    }
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await promptService.getPromptReviews(promptId);
      const validReviews = data.filter(review => review?.id); 
      setReviews(validReviews);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [promptId]);

  const handleReviewUpdate = async (reviewId: string, updatedReview: { rating: number; comment: string }) => {
    try {
      setEditingReview(reviewId);
      await promptService.updateReview(promptId, reviewId, updatedReview);
      
      // Refresh reviews after successful update
      await fetchReviews();
      
      // Notify parent component
      if (onReviewsChange) {
        onReviewsChange();
      }
      
      setEditingReview(null);
    } catch (err) {
      console.error("Review update error:", err);
      alert("Failed to update review");
      setEditingReview(null);
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingReview(reviewId);
      await promptService.deleteReview(promptId, reviewId);
      
      // Refresh reviews after successful deletion
      await fetchReviews();
      
      // Notify parent component
      if (onReviewsChange) {
        onReviewsChange();
      }
      
      setDeletingReview(null);
    } catch (err) {
      console.error("Review deletion error:", err);
      alert("Failed to delete review");
      setDeletingReview(null);
    }
  };

  // Check if current user can edit/delete a review
  const canModifyReview = (review: Review) => {
    return currentUserId && review.userId === currentUserId;
  };

  if (loading) return <div className="text-center py-4">Loading reviews...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!reviews.length) return <div className="text-center py-4 text-gray-500">No reviews yet</div>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="relative">
          <ReviewCard
            userName={review.userName}
            rating={review.rating}
            comment={review.comment}
          />
          
          {/* Edit/Delete buttons for user's own reviews */}
          {canModifyReview(review) && (
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                onClick={() => {
                  // Simple prompt for now - can be enhanced with a modal later
                  const newRating = window.prompt("New rating (1-5):", review.rating.toString());
                  const newComment = window.prompt("New comment:", review.comment);
                  
                  if (newRating && newComment && !isNaN(Number(newRating))) {
                    const rating = Math.max(1, Math.min(5, Number(newRating)));
                    handleReviewUpdate(review.id, { rating, comment: newComment });
                  }
                }}
                disabled={editingReview === review.id}
                title="Edit review"
              >
                {editingReview === review.id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                ) : (
                  <Edit className="h-3 w-3 text-blue-600" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                onClick={() => handleReviewDelete(review.id)}
                disabled={deletingReview === review.id}
                title="Delete review"
              >
                {deletingReview === review.id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
                ) : (
                  <Trash2 className="h-3 w-3 text-red-600" />
                )}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};