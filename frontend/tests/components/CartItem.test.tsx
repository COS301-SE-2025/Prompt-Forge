import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartItem } from '@/components/CartItem';
import { BrowserRouter } from 'react-router-dom';
import { Category } from '@/types'; // Import the types you need

// Mock the Link component from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to} data-testid="link">
      {children}
    </a>
  ),
}));

describe('CartItem Component', () => {
  const defaultProps = {
    id: '123',
    title: 'Test Prompt',
    description: 'This is a test prompt description',
    price: 9.99,
    author: 'TestAuthor',
    rating: 4.5,
    reviewCount: 42,
    onRemove: jest.fn(),
    promptTags: ['Writing', 'Creative'] as Category[], // Add missing props
    // Add other required properties
  };

  it('renders cart item correctly', () => {
    render(
      <BrowserRouter>
        <CartItem {...defaultProps} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('This is a test prompt description')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('TestAuthor')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(42)')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    render(
      <BrowserRouter>
        <CartItem {...defaultProps} />
      </BrowserRouter>
    );
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    expect(defaultProps.onRemove).toHaveBeenCalledWith('123');
  });

  it('links to the correct prompt details page', () => {
    render(
      <BrowserRouter>
        <CartItem {...defaultProps} />
      </BrowserRouter>
    );
    
    const titleLink = screen.getByText('Test Prompt').closest('a');
    expect(titleLink).toHaveAttribute('href', `/prompts/123`);
  });

  it('formats the price correctly', () => {
    render(
      <BrowserRouter>
        <CartItem {...defaultProps} price={15} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('$15.00')).toBeInTheDocument();
  });

  it('shows free label for zero price', () => {
    render(
      <BrowserRouter>
        <CartItem {...defaultProps} price={0} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  // Add this test case
  it('renders average rating correctly', () => {
    render(
      <BrowserRouter>
        <CartItem {...defaultProps} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
});

// Add averageRating to your mock prompt:
const mockPrompt = {
  id: '1', 
  title: 'Test Prompt',
  price: 2.99,
  promptTags: ['Writing', 'Creative'],
  averageRating: 4.5, // Add this
  // other required props...
};