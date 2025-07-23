import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardCard } from '@/components/DashboardCard';

describe('DashboardCard Component', () => {
  it('renders with a heading and value', () => {
    render(
      <DashboardCard 
        heading="Total Prompts" 
        headingIcon={<span data-testid="mock-icon" />} 
        value={42} 
      />
    );
    
    expect(screen.getByText('Total Prompts')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('displays percentage change for gain', () => {
    render(
      <DashboardCard 
        heading="Monthly Usage" 
        headingIcon={<span data-testid="mock-icon" />} 
        value={100} 
        change="gain"
        changeValue={15.5} 
      />
    );
    
    expect(screen.getByText('Monthly Usage')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/\+15\.5.*last month/)).toBeInTheDocument();
    
    // In gain mode, should display green text
    const percentElement = screen.getByText(/\+15\.5/);
    expect(percentElement.className).toContain('text-green-500');
  });

  it('displays percentage change for loss', () => {
    render(
      <DashboardCard 
        heading="Average Rating" 
        headingIcon={<span data-testid="mock-icon" />} 
        value={4.2} 
        change="loss"
        changeValue={2.3} 
      />
    );
    
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText(/-2\.3.*last month/)).toBeInTheDocument();
    
    // In loss mode, should display red text
    const percentElement = screen.getByText(/-2\.3/);
    expect(percentElement.className).toContain('text-red-500');
  });

  it('handles no change value correctly', () => {
    render(
      <DashboardCard 
        heading="Total Users" 
        headingIcon={<span data-testid="mock-icon" />} 
        value={500} 
        change="none"
      />
    );
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    
    // Should not display any percentage change
    expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
  });
});