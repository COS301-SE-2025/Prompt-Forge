import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecentActivity } from '@/components/RecentActivity';

describe('RecentActivity Component', () => {
  it('renders correctly with all props', () => {
    render(
      <RecentActivity 
        username="testuser" 
        activity="followed you" 
        time="2h ago"
      />
    );
    
    // Check that all elements are rendered
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('followed you')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('displays long usernames correctly', () => {
    render(
      <RecentActivity 
        username="verylongusernamethatmightoverflow" 
        activity="rated your prompt" 
        time="5h"
      />
    );
    
    expect(screen.getByText('verylongusernamethatmightoverflow')).toBeInTheDocument();
    expect(screen.getByText('rated your prompt')).toBeInTheDocument();
  });

  it('handles empty time values', () => {
    render(
      <RecentActivity 
        username="testuser" 
        activity="followed you" 
        time=""
      />
    );
    
    // Even with empty time, the other elements should be present
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('followed you')).toBeInTheDocument();
  });
});