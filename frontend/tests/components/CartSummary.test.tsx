import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartSummary } from '@/components/CartSummary';

describe('CartSummary Component', () => {
  const mockCheckout = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with subtotal and checkout button', () => {
    render(
      <CartSummary 
        subtotal={29.99} 
        onCheckout={mockCheckout} 
        isCheckingOut={false}
        prompts={[{ id: '1', title: 'Test Prompt', price: 9.99 }]}
      />
    );
    
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /checkout/i })).toBeInTheDocument();
  });

  it('displays free for zero subtotal', () => {
    render(<CartSummary 
      subtotal={0} 
      onCheckout={mockCheckout} 
      prompts={[{ id: '1', title: 'Test Prompt', price: 9.99 }]}
    />);
    
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('calls onCheckout when checkout button is clicked', () => {
    render(<CartSummary 
      subtotal={19.99} 
      onCheckout={mockCheckout} 
      prompts={[{ id: '1', title: 'Test Prompt', price: 9.99 }]}
    />);
    
    const checkoutButton = screen.getByRole('button', { name: /checkout/i });
    fireEvent.click(checkoutButton);
    
    expect(mockCheckout).toHaveBeenCalledTimes(1);
  });

  it('disables checkout button and shows loading state when isCheckingOut is true', () => {
    render(<CartSummary 
      subtotal={19.99} 
      onCheckout={mockCheckout} 
      isCheckingOut={true} 
      prompts={[{ id: '1', title: 'Test Prompt', price: 9.99 }]}
    />);
    
    const checkoutButton = screen.getByRole('button');
    expect(checkoutButton).toBeDisabled();
    
    // Check for loading indicator
    const loadingIndicator = screen.getByTestId('loading-spinner');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('formats the price correctly with decimals', () => {
    render(<CartSummary 
      subtotal={19.5} 
      onCheckout={mockCheckout} 
      prompts={[{ id: '1', title: 'Test Prompt', price: 9.99 }]}
    />);
    expect(screen.getByText('$19.50')).toBeInTheDocument();
  });
});