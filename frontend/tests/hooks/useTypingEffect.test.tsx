import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useTypingEffect } from '@/hooks/useTypingEffect';

// Test component that uses the hook
function TestTypingEffect() {
  const typingEffect = useTypingEffect({ speed: 10 });
  
  return (
    <div>
      <div data-testid="display-text">{typingEffect.displayText}</div>
      <div data-testid="is-typing">{typingEffect.isTyping ? 'typing' : 'not-typing'}</div>
      <button 
        data-testid="add-text-btn" 
        onClick={() => typingEffect.addText('Test Text')}
      >
        Add Text
      </button>
      <button 
        data-testid="clear-btn" 
        onClick={() => typingEffect.clear()}
      >
        Clear
      </button>
      <button 
        data-testid="complete-btn" 
        onClick={() => typingEffect.complete()}
      >
        Complete
      </button>
      <button
        data-testid="set-text-btn"
        onClick={() => typingEffect.setText('Instant Text')}
      >
        Set Text
      </button>
    </div>
  );
}

describe('useTypingEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes with empty text', () => {
    render(<TestTypingEffect />);
    expect(screen.getByTestId('display-text')).toHaveTextContent('');
    expect(screen.getByTestId('is-typing')).toHaveTextContent('not-typing');
  });

  it('adds text to the queue and types it out', () => {
    render(<TestTypingEffect />);
    
    fireEvent.click(screen.getByTestId('add-text-btn'));
    
    expect(screen.getByTestId('is-typing')).toHaveTextContent('typing');
    
    // Fast-forward until all timers have been executed
    act(() => {
      jest.runAllTimers();
    });
    
    expect(screen.getByTestId('display-text')).toHaveTextContent('Test Text');
    expect(screen.getByTestId('is-typing')).toHaveTextContent('not-typing');
  });

  it('clears the text when clear is called', () => {
    render(<TestTypingEffect />);
    
    fireEvent.click(screen.getByTestId('add-text-btn'));
    act(() => {
      jest.runAllTimers();
    });
    
    expect(screen.getByTestId('display-text')).toHaveTextContent('Test Text');
    
    fireEvent.click(screen.getByTestId('clear-btn'));
    
    expect(screen.getByTestId('display-text')).toHaveTextContent('');
  });

  it('completes typing immediately when complete is called', () => {
    render(<TestTypingEffect />);
    
    fireEvent.click(screen.getByTestId('add-text-btn'));
    expect(screen.getByTestId('is-typing')).toHaveTextContent('typing');
    
    fireEvent.click(screen.getByTestId('complete-btn'));
    
    expect(screen.getByTestId('display-text')).toHaveTextContent('Test Text');
    expect(screen.getByTestId('is-typing')).toHaveTextContent('not-typing');
  });

  it('allows setting text immediately without animation', () => {
    render(<TestTypingEffect />);
    
    fireEvent.click(screen.getByTestId('set-text-btn'));
    
    expect(screen.getByTestId('display-text')).toHaveTextContent('Instant Text');
    expect(screen.getByTestId('is-typing')).toHaveTextContent('not-typing');
  });
});