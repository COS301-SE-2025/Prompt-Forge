import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from './ui/Button';

interface ReviewFormProps {
  promptId: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ promptId }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get username from localStorage instead of just the ID
      const username = localStorage.getItem('username') || 'Anonymous';
      
      // Send review data to your API
      const response = await fetch('/api/store/prompts/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          promptId,
          rating,
          comment: review,
          author: username // Send username instead of authorId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Show success message with brand green color
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setRating(0);
        setReview('');
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Review submission error:', error);
      // You might want to show an error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      {submitted ? (
        <div className="bg-[#3ebb9e]/20 text-[#3ebb9e] p-4 rounded-lg border border-[#3ebb9e]/30">
          Thank you for your review! It will appear once approved.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Your Rating</label>
            <StarRating 
              rating={rating} 
              onChange={setRating} 
              interactive={true} 
              size="lg" 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="review" className="block text-gray-300 mb-2">
              Your Review
            </label>
            <textarea
              id="review"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm"
              rows={4}
              placeholder="Share your experience with this prompt..."
              value={review}
              onChange={e => setReview(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={rating === 0 || !review || isSubmitting}
            className="bg-[#3ebb9e] hover:bg-[#00674f] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      )}
    </div>
  );
};