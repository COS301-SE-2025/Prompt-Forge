import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating = ({ value, editable = false, onRatingChange }: StarRatingProps) => {
  const handleClick = (index: number) => {
    if (editable && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(value) ? 'text-yellow-400 fill-current' : 'text-gray-600'
          } ${editable ? 'cursor-pointer' : ''}`}
          onClick={editable ? () => handleClick(i) : undefined}
          role={editable ? 'img' : undefined}
        />
      ))}
    </div>
  );
};