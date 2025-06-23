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
  return (
    <Card className="p-4 mb-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#3ebb9e] flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">
              {author}
            </p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <StarRating rating={rating} size="sm" />
      </div>
      <p className="text-sm text-muted-foreground">{comment}</p>
    </Card>
  );
};