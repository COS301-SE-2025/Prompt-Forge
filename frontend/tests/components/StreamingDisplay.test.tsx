import React from 'react';
import { render, screen } from '@testing-library/react';
import { StreamingDisplay } from '@/components/StreamingDisplay';

describe('StreamingDisplay Component', () => {
  it('displays content when provided', () => {
    render(
      <StreamingDisplay 
        content="Test content" 
        isLoading={false} 
        streamingEnabled={true} 
      />
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows placeholder when no content is provided', () => {
    render(
      <StreamingDisplay 
        content="" 
        isLoading={false} 
        streamingEnabled={true} 
        placeholder="No content yet" 
      />
    );
    expect(screen.getByText('No content yet')).toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true and streaming is disabled', () => {
    render(
      <StreamingDisplay 
        content="" 
        isLoading={true} 
        streamingEnabled={false} 
      />
    );
    expect(screen.getByText('Generating response...')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <StreamingDisplay 
        content="Test content" 
        isLoading={false} 
        streamingEnabled={true} 
        className="custom-class"
      />
    );
    const element = screen.getByText('Test content');
    expect(element).toHaveClass('custom-class');
  });
});