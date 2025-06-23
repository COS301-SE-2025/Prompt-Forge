import React, { useEffect, useState } from 'react';
import { ReviewCard } from './ReviewCard';
import { PromptService } from '@/services/promptService';
import { Review } from '@/models/Reviews';

interface ReviewsListProps {
  promptId: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ promptId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log("Fetching reviews...");
        const promptService = new PromptService();
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

    fetchReviews();
  }, [promptId]);

  if (loading) return <div className="text-center py-4">Loading reviews...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!reviews.length) return <div className="text-center py-4 text-gray-500">No reviews yet</div>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id} 
          userName={review.userName}
          rating={review.rating}
          comment={review.comment}
        />
      ))}
    </div>
  );
};