import React from 'react';
import { StarRating } from './StarRating';
import { Card } from './ui/Card';

interface ReviewCardProps {
  userName: string;
  rating: number;
  comment: string;
  className?: string;
}

export const ReviewCard = ({
  userName = 'Anonymous', 
  rating,
  comment,
  className = ''
}: ReviewCardProps) => {
  const userInitial = userName?.charAt?.(0)?.toUpperCase() || 'A';

  return (
    <Card className={`relative p-4 mb-4 border border-border rounded-lg bg-card ${className}`}>
      <div className="flex items-center justify-between mb-2 pr-24">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#3ebb9e] flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {userInitial}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">
              {userName}
            </p>
          </div>
        </div>
        <StarRating rating={rating} size="sm" />
      </div>
      <p className="text-sm text-muted-foreground pr-24">{comment}</p>
    </Card>
  );
};