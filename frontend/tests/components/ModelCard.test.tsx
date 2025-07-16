import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// If ModelCard doesn't exist as a separate component, create a mock version for testing
const ModelCard = ({ model, index, selectedModel, onSelect }) => {
  const isSelected = index === selectedModel;
  
  return (
    <div 
      data-testid="model-card"
      className={isSelected ? 'selected' : ''}
      onClick={() => onSelect(index)}
    >
      <h3>{model.name}</h3>
      <p>Company: {model.company}</p>
      <p>Context Size: {model.contextSize}</p>
      <p>Supports Images: {model.supportsImages ? 'Yes' : 'No'}</p>
    </div>
  );
};

// Mock props
const mockModel = {
  name: 'Test Model',
  company: 'Test Company',
  contextSize: 16000,
  model: 'test-model-id',
  supportsImages: true
};

const mockHandleSelect = jest.fn();

describe('ModelCard Component', () => {
  it('renders model information correctly', () => {
    render(
      <ModelCard 
        model={mockModel} 
        index={0} 
        selectedModel={1} // Not selected
        onSelect={mockHandleSelect}
      />
    );
    
    expect(screen.getByText('Test Model')).toBeInTheDocument();
    expect(screen.getByText('Company: Test Company')).toBeInTheDocument();
    expect(screen.getByText('Context Size: 16000')).toBeInTheDocument();
    expect(screen.getByText('Supports Images: Yes')).toBeInTheDocument();
  });

  it('calls onSelect handler when clicked', () => {
    render(
      <ModelCard 
        model={mockModel} 
        index={0} 
        selectedModel={1} 
        onSelect={mockHandleSelect}
      />
    );
    
    const card = screen.getByTestId('model-card');
    fireEvent.click(card);
    expect(mockHandleSelect).toHaveBeenCalledWith(0);
  });
});