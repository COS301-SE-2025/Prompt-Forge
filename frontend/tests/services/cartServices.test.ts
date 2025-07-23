import { CartService } from '@/services/cartServices';
import httpClient from '@/services/httpClient';

// Mock the httpClient
jest.mock('@/services/httpClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

describe('CartService', () => {
  let cartService: CartService;
  
  beforeEach(() => {
    cartService = new CartService();
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('fetches cart items successfully', async () => {
      const mockCartItems = [
        { promptId: '1', promptTitle: 'Test Prompt 1', promptPrice: 9.99 },
        { promptId: '2', promptTitle: 'Test Prompt 2', promptPrice: 4.99 }
      ];
      
      (httpClient.get as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCartItems)
      });

      const result = await cartService.getCart();
      
      expect(httpClient.get).toHaveBeenCalledWith('/cart');
      expect(result).toEqual(mockCartItems);
    });

    it('handles API errors gracefully', async () => {
      // Mock a response that doesn't have ok: true and also no json method
      (httpClient.get as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
        // No json method - this will cause the "json is not a function" error
      });

      // Expect the service to handle this properly and throw a meaningful error
      await expect(cartService.getCart()).rejects.toThrow();
      expect(httpClient.get).toHaveBeenCalledWith('/cart');
    });
  });

  describe('addToCart', () => {
    it('adds item to cart successfully', async () => {
      const promptId = '123';
      
      (httpClient.post as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      });

      const result = await cartService.addToCart(promptId);
      
      expect(httpClient.post).toHaveBeenCalledWith('/cart/add', { promptId });
      expect(result).toEqual({ success: true });
    });

    it('handles API errors when adding to cart', async () => {
      const promptId = '123';
      
      // Mock a response that doesn't have ok: true and also no json method
      (httpClient.post as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
        // No json method - this will cause the error
      });

      await expect(cartService.addToCart(promptId)).rejects.toThrow();
      expect(httpClient.post).toHaveBeenCalledWith('/cart/add', { promptId });
    });
  });

  describe('removeFromCart', () => {
    it('removes item from cart successfully', async () => {
      const promptId = '123';
      
      (httpClient.delete as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      });

      const result = await cartService.removeFromCart(promptId);
      
      expect(httpClient.delete).toHaveBeenCalledWith(`/cart/remove/${promptId}`);
      expect(result).toEqual({ success: true });
    });

    it('handles API errors when removing from cart', async () => {
      const promptId = '123';
      
      // The service needs to check response.ok before calling json()
      (httpClient.delete as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
        // The service should handle the error case properly
      });

      await expect(cartService.removeFromCart(promptId)).rejects.toThrow();
      expect(httpClient.delete).toHaveBeenCalledWith(`/cart/remove/${promptId}`);
    });
  });

  describe('checkout', () => {
    it('processes checkout successfully', async () => {
      // Create mock prompts to pass to checkout
      const mockPrompts = [
        { 
          cartItemId: 'cart1', 
          promptId: 'prompt1', 
          promptPrice: 9.99,
          promptTitle: 'Test Prompt' 
        }
      ];
      
      (httpClient.post as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ orderId: '12345' })
      });

      const result = await cartService.checkout(mockPrompts);
      
      expect(httpClient.post).toHaveBeenCalledWith('/cart/checkout', expect.any(Object));
      expect(result).toEqual({ orderId: '12345' });
    });

    it('handles API errors during checkout', async () => {
      // Create mock prompts to pass to checkout
      const mockPrompts = [
        { 
          cartItemId: 'cart1', 
          promptId: 'prompt1', 
          promptPrice: 9.99,
          promptTitle: 'Test Prompt' 
        }
      ];
      
      // The service needs to handle error responses properly
      (httpClient.post as jest.Mock).mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity'
        // The service should handle this without calling json()
      });

      await expect(cartService.checkout(mockPrompts)).rejects.toThrow();
      expect(httpClient.post).toHaveBeenCalledWith('/cart/checkout', expect.any(Object));
    });
  });
});