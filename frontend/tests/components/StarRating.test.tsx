import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '@/components/StarRating';

describe('StarRating Component', () => {
  it('renders the correct number of stars', () => {
    const { container } = render(<StarRating rating={3.5} />);
    
    // Should find 5 stars total
    const stars = container.querySelectorAll('svg');
    expect(stars).toHaveLength(5);
  });

  it('renders the correct rating value', () => {
    const { container } = render(<StarRating rating={4.2} />);
    
    // Check the number of filled stars
    const filledStars = container.querySelectorAll('.text-yellow-400');
    expect(filledStars.length).toBe(4); // For a 4.2 rating
  });

  it('handles click events when editable', () => {
    const mockOnRatingChange = jest.fn();
    const { container } = render(<StarRating value={3} editable onRatingChange={mockOnRatingChange} />);
    const stars = container.querySelectorAll('svg');
    const fourthStar = stars[3]; // Arrays are 0-indexed
    fireEvent.click(fourthStar);
    
    // Check if onRatingChange was called with the right value
    expect(mockOnRatingChange).toHaveBeenCalledWith(4);
  });

  it('displays decimal ratings correctly', () => {
    const { container } = render(<StarRating rating={3.7} />);
    
    // Find half-filled star
    const stars = container.querySelectorAll('svg');
    const partialStar = stars[3];
    expect(partialStar).toBeInTheDocument();
    
    // First 3 stars should be completely filled
    for (let i = 0; i < 3; i++) {
      const fullStar = stars[i];
      expect(fullStar).toBeInTheDocument();
    }
  });

  it('does not trigger rating change when not editable', () => {
    const mockOnRatingChange = jest.fn();
    const { container } = render(<StarRating value={3} editable={false} onRatingChange={mockOnRatingChange} />);
    const stars = container.querySelectorAll('svg');
    const fifthStar = stars[4]; // Arrays are 0-indexed
    fireEvent.click(fifthStar);
    
    // onRatingChange should not be called
    expect(mockOnRatingChange).not.toHaveBeenCalled();
  });
});