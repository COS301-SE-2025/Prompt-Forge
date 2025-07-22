import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/Label';

describe('Label Component', () => {
  it('renders with default styles', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('applies custom className', () => {
    render(
      <Label htmlFor="test-input" className="custom-class">
        Custom Label
      </Label>
    );
    
    const label = screen.getByText('Custom Label');
    expect(label.className).toContain('custom-class');
  });

  it('forwards additional props to the label element', () => {
    render(
      <Label htmlFor="test-input" data-testid="test-label" required>
        Required Label
      </Label>
    );
    
    const label = screen.getByTestId('test-label');
    expect(label).toHaveAttribute('required');
  });

  it('renders with children', () => {
    render(
      <Label htmlFor="test-input">
        <span>Child Element</span>
      </Label>
    );
    
    expect(screen.getByText('Child Element')).toBeInTheDocument();
  });
});