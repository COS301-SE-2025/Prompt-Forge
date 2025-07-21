import { AuthService } from '@/services/authService';
import httpClient from '@/services/httpClient';

// Mock the httpClient
jest.mock('@/services/httpClient', () => ({
  post: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('login', () => {
    it('logs in successfully and stores user data', async () => {
      const credentials = { username: 'testuser', password: 'password123' };
      const mockResponse = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        token: 'jwt-token',
      };
      
      (httpClient.post as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await authService.login(credentials);
      
      expect(httpClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('username', 'testuser');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', 'user123');
    });

    it('handles login failure correctly', async () => {
      const credentials = { username: 'testuser', password: 'wrongpassword' };
      
      (httpClient.post as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(authService.login(credentials)).rejects.toThrow('Login failed: 401 Unauthorized');
      expect(httpClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('registers a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      };
      
      const mockResponse = {
        id: 'user456',
        username: 'newuser',
        email: 'new@example.com'
      };
      
      (httpClient.post as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await authService.register(userData);
      
      expect(httpClient.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('handles registration failure correctly', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      (httpClient.post as jest.Mock).mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict'
      });

      await expect(authService.register(userData)).rejects.toThrow('Registration failed: 409 Conflict');
      expect(httpClient.post).toHaveBeenCalledWith('/auth/register', userData);
    });
  });

  describe('logout', () => {
    it('clears user data from localStorage', () => {
      // Set some mock user data
      localStorageMock.setItem('username', 'testuser');
      localStorageMock.setItem('userId', 'user123');
      
      authService.logout();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('username');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userId');
    });
  });
});