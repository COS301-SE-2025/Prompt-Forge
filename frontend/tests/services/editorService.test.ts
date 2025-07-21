import { Editor } from '@/services/editorService';
import 'web-streams-polyfill';

// Mock fetch
global.fetch = jest.fn();

// Helper to mock fetch responses
function mockFetchResponse(data, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? 'OK' : status === 404 ? 'Not Found' : 'Error',
    json: () => Promise.resolve(data)
  });
}

describe('Editor Service', () => {
  let editorService: Editor;

  beforeEach(() => {
    jest.clearAllMocks();
    editorService = new Editor();
  });

  describe('promptOpenRouter', () => {
    it('calls fetch with correct parameters', async () => {
      const mockRequestBody = {
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      const mockResponse = {
        choices: [{ message: { content: 'Hello, how can I help?' } }]
      };

      // Mock the fetch implementation
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        mockFetchResponse(mockResponse)
      );

      const result = await editorService.promptOpenRouter(mockRequestBody);

      // Check that fetch was called
      expect(global.fetch).toHaveBeenCalled();
      
      // Check the URL contains the right endpoint
      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchUrl).toContain('/api/test/openrouter/chat');
      
      // Check the options
      const fetchOptions = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(fetchOptions.method).toBe('POST');
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(fetchOptions.body)).toEqual(mockRequestBody);

      // Verify the result
      expect(result).toEqual(mockResponse);
    });

    it('returns error object on fetch errors', async () => {
      const mockRequestBody = {
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      };

      // Mock fetch to throw an error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await editorService.promptOpenRouter(mockRequestBody);
      
      // Should return an error object instead of throwing
      expect(result).toHaveProperty('error');
      expect(result.error.message).toBe('Network error');
    });

    it('returns error object on non-ok responses', async () => {
      const mockRequestBody = {
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      };

      // Mock fetch to return a non-ok response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        mockFetchResponse({ error: 'Not Found' }, false, 404)
      );

      const result = await editorService.promptOpenRouter(mockRequestBody);
      
      // Should return an error object
      expect(result).toHaveProperty('error');
      // The error message might vary, but it should exist
      expect(result.error.message).toBeTruthy();
    });
  });

  describe('promptOpenRouterStream', () => {
    it('handles successful stream responses', async () => {
      const mockRequestBody = {
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      };
      
      // Create mock callback functions
      const onContent = jest.fn();
      const onComplete = jest.fn();
      const onError = jest.fn();
      
      // Create a mock ReadableStream with encoded data
      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        start(controller) {
          // Simulate stream events
          controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });
      
      // Mock the fetch implementation
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          status: 200,
          body: mockStream,
          headers: new Headers({
            'Content-Type': 'text/event-stream'
          })
        })
      );
      
      // Call the method - just verify it doesn't throw an error
      await expect(editorService.promptOpenRouterStream(
        mockRequestBody,
        onContent,
        onComplete,
        onError
      )).resolves.not.toThrow();
      
      // Check that fetch was called with the right URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test/openrouter/chat/stream'),
        expect.any(Object)
      );
    });
  });
});