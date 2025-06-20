import React, { useState } from 'react';
import { StarIcon } from 'lucide-react';
interface StarRatingProps {
  rating?: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}
export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onChange,
  size = 'md',
  interactive = false
}) => {
  const [ratingVal, setRating] = useState(rating);
  const [hoverRating, setHoverRating] = useState(0);
  const handleClick = (selectedRating: number) => {
    if (!interactive) return;
    setRating(selectedRating);
    if (onChange) {
      onChange(selectedRating);
    }
  };
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  return <div className="flex">
    {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} className={`${sizeClass[size]} ${star <= (hoverRating || ratingVal) ? 'text-yellow-400 fill-current' : 'text-gray-600'} ${interactive ? 'cursor-pointer' : ''}`} onClick={() => handleClick(star)} onMouseEnter={() => interactive && setHoverRating(star)} onMouseLeave={() => interactive && setHoverRating(0)} />)}
  </div>;
};