import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EditorPage from '@/pages/EditorPage';
import { StreamingService } from '@/services/streamingService';

// Create mock functions
const mockStreamRequest = jest.fn().mockImplementation(
  (_, __, callbacks) => {
    callbacks.onContent('Mock response');
    callbacks.onComplete();
    return Promise.resolve();
  }
);

const mockCreateImageRequestBody = jest.fn().mockReturnValue({
  model: 'test-model',
  messages: [{ role: 'user', content: 'Test prompt' }]
});

// Mock the streaming service
jest.mock('@/services/streamingService', () => {
  return {
    StreamingService: jest.fn().mockImplementation(() => {
      return {
        streamRequest: mockStreamRequest,
        createImageRequestBody: mockCreateImageRequestBody,
        decodeUnicode: jest.fn(str => str),
        validateAndOptimizeImage: jest.fn(img => img)
      };
    })
  };
});

// Mock the useTypingEffect hook
jest.mock('@/hooks/useTypingEffect', () => {
  return {
    useTypingEffect: jest.fn(() => ({
      displayText: 'Mock display text',
      isTyping: false,
      addText: jest.fn(),
      clear: jest.fn(),
      complete: jest.fn(),
      setSpeed: jest.fn(),
      setBatchSize: jest.fn(),
      setText: jest.fn()
    }))
  };
});

// Mock other dependencies that might cause issues
jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    save: jest.fn(),
    text: jest.fn(),
    html: jest.fn().mockImplementation((html, options, callback) => {
      if (callback) callback();
      return { then: cb => cb() };
    }),
  }))
}));

describe('EditorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the prompt editor', () => {
    render(
      <BrowserRouter>
        <EditorPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Prompt Editor')).toBeInTheDocument();
  });

  it('allows typing in the prompt textarea', () => {
    render(
      <BrowserRouter>
        <EditorPage />
      </BrowserRouter>
    );
    
    // Use a more reliable way to find the textarea
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test prompt text' } });
    
    expect(textarea).toHaveValue('Test prompt text');
  });

  it('calls testPrompt when Test Prompt button is clicked', async () => {
    render(
      <BrowserRouter>
        <EditorPage />
      </BrowserRouter>
    );

    // Add text to the prompt
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test prompt for testing' } });

    // Find the Test Prompt button more specifically - avoid the textarea content
    const testButton = screen.getByRole('button', { name: /^test prompt$/i });
    fireEvent.click(testButton);

    // Wait for the mocked functions to be called (using the top-level mocks)
    await waitFor(() => {
      expect(mockCreateImageRequestBody).toHaveBeenCalled();
      expect(mockStreamRequest).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});