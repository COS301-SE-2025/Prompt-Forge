// src/components/ReviewsList.tsx
import React, { useEffect, useState } from 'react';
import { ReviewCard } from './ReviewCard';
import { PromptService } from '@/services/promptService';
import { Review } from '@/models/Review';

export const ReviewsList = ({ promptId }: { promptId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const promptService = new PromptService();
        const data = await promptService.getPromptReviews(promptId);
        setReviews(data);
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
          author={review.userName || 'Anonymous'}
          date={review.date || new Date().toISOString()}
          rating={review.rating}
          comment={review.comment}
        />
      ))}
    </div>
  );
};