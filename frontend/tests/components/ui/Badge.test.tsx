import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge Component', () => {
  it('renders with default styles', () => {
    render(<Badge>Default</Badge>);
    
    const badge = screen.getByText('Default');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('DIV');
    // Default variant should have specific classes
    expect(badge.className).toContain('bg-primary');
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
    
    let badge = screen.getByText('Secondary');
    expect(badge.className).toContain('bg-secondary');
    
    rerender(<Badge variant="destructive">Destructive</Badge>);
    badge = screen.getByText('Destructive');
    expect(badge.className).toContain('bg-destructive');
    
    rerender(<Badge variant="outline">Outline</Badge>);
    badge = screen.getByText('Outline');
    expect(badge.className).toContain('border');
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Badge size="default">Default Size</Badge>);
    
    let badge = screen.getByText('Default Size');
    expect(badge.className).toContain('text-xs');
    
    rerender(<Badge size="sm">Small</Badge>);
    badge = screen.getByText('Small');
    expect(badge.className).toContain('text-xs');
    
    rerender(<Badge size="lg">Large</Badge>);
    badge = screen.getByText('Large');
    expect(badge.className).toContain('text-xs');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    
    const badge = screen.getByText('Custom');
    expect(badge.className).toContain('custom-class');
  });

  it('forwards additional props to the badge element', () => {
    render(
      <Badge data-testid="test-badge" onClick={jest.fn()}>
        Interactive Badge
      </Badge>
    );
    
    const badge = screen.getByTestId('test-badge');
    expect(badge).toHaveAttribute('data-testid', 'test-badge');
  });
});