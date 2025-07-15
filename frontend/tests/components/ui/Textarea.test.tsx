import React from 'react';
import { render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/Textarea';

describe('Textarea Component', () => {
  it('renders with default styles', () => {
    render(<Textarea placeholder="Enter text here" />);
    
    const textarea = screen.getByPlaceholderText('Enter text here');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('applies custom className', () => {
    render(
      <Textarea
        className="custom-class"
        placeholder="Custom textarea"
      />
    );
    
    const textarea = screen.getByPlaceholderText('Custom textarea');
    expect(textarea.className).toContain('custom-class');
  });

  it('forwards additional props to the textarea element', () => {
    render(
      <Textarea
        placeholder="Test textarea"
        id="test-id"
        rows={10}
        maxLength={500}
        required
        data-testid="test-textarea"
      />
    );
    
    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toHaveAttribute('id', 'test-id');
    expect(textarea).toHaveAttribute('rows', '10');
    expect(textarea).toHaveAttribute('maxlength', '500');
    expect(textarea).toHaveAttribute('required');
  });
  
  it('applies the default styles', () => {
    render(<Textarea data-testid="styled-textarea" />);
    
    const textarea = screen.getByTestId('styled-textarea');
    // Check that it has the base classes
    expect(textarea.className).toContain('flex');
    expect(textarea.className).toContain('min-h-[80px]');
    expect(textarea.className).toContain('w-full');
    expect(textarea.className).toContain('rounded-md');
    expect(textarea.className).toContain('border');
  });
});