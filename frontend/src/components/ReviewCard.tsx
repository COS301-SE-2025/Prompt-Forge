import React from 'react';
import { StarRating } from './StarRating';
import { Card } from './ui/Card';
interface ReviewCardProps {
  author: string;
  date: string;
  rating: number;
  comment: string;
}
export const ReviewCard = ({
  
  author,
  date,
  rating,
  comment
}: ReviewCardProps) => {
  return <Card className="p-4 mb-4 border-none rounded-lg ">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {author}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
          </div>
        </div>
        <StarRating rating={rating} size="sm" />
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">{comment}</p>
    </Card>;
};