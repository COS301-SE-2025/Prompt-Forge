import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct classes for different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    const buttonElement = screen.getByText('Default');
    
    // Check for partial class name instead of exact match
    expect(buttonElement.className).toContain('bg-primary');
    
    // Secondary variant
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary').className).toContain('bg-secondary');
    
    // Destructive variant
    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByText('Destructive').className).toContain('bg-destructive');
  });

  it('disables the button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
    // Check that the disabled class is included in the className string
    expect(button.className).toContain('disabled:opacity-50');
  });
});