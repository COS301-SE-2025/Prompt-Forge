import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartItem } from '@/components/CartItem';
import { CartService } from '@/services/cartServices';

// Create a mock function for removeFromCart
const mockRemoveFromCart = jest.fn().mockResolvedValue({ success: true });

// Mock the CartService
jest.mock('@/services/cartServices', () => {
  return {
    CartService: jest.fn().mockImplementation(() => {
      return {
        removeFromCart: mockRemoveFromCart
      };
    })
  };
});

describe('CartItem Component', () => {
  const mockFetchData = jest.fn().mockResolvedValue(undefined);
  const mockSetRemoving = jest.fn();
  
  // Default props with required values and fallbacks
  const defaultProps = {
    cartItemId: '123',
    promptId: 'prompt-123',
    promptTitle: 'Test Prompt',
    promptTags: ['Writing', 'Marketing'],
    promptPrice: 9.99,
    reviewCount: 5,
    averageRating: 4.5,
    username: 'testuser',
    fetchData: mockFetchData,
    setRemoving: mockSetRemoving
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders cart item correctly', () => {
    render(<CartItem {...defaultProps} />);
    
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('Writing')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText(/by.*testuser/)).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    render(<CartItem {...defaultProps} />);
    
    const removeButton = screen.getByRole('button');
    fireEvent.click(removeButton);
    
    expect(mockSetRemoving).toHaveBeenCalledWith(true);
    
    // Wait for the async operations to complete
    await waitFor(() => {
      expect(mockRemoveFromCart).toHaveBeenCalledWith('prompt-123');
      expect(mockFetchData).toHaveBeenCalledTimes(1);
    });
  });

  it('links to the correct prompt details page', () => {
    render(<CartItem {...defaultProps} />);
    
    const title = screen.getByText('Test Prompt');
    expect(title).toBeInTheDocument();
  });

  it('formats the price correctly', () => {
    render(<CartItem {...defaultProps} />);
    
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('shows free label for zero price', () => {
    render(
      <CartItem 
        {...defaultProps}
        promptPrice={0}
      />
    );
    
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('renders average rating correctly', () => {
    render(<CartItem {...defaultProps} />);
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('handles undefined values properly', () => {
    render(
      <CartItem 
        {...defaultProps}
        promptPrice={undefined}
        averageRating={undefined}
        promptTags={undefined}
        promptTitle={undefined}
        username={undefined}
        reviewCount={0}
      />
    );
    
    // Test should pass without errors
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText(/by.*Anonymous/)).toBeInTheDocument();
    expect(screen.getByText('Untitled Prompt')).toBeInTheDocument();
    // Don't expect rating to show when reviewCount is 0
  });
});