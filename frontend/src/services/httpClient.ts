import { API_BASE_URL } from '../config/api';

class HttpClient {
  private baseURL = API_BASE_URL;
  
  // Expose for services that need direct access
  get apiUrl() {
    return this.baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('jwtToken') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token');
    
    console.log('🔐 Token check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) + '...' || 'none'
    });
    
    // Only set default JSON content type if body is not FormData
    const isFormData = options.body instanceof FormData;
    const headers = new Headers(options.headers);
    
    if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Add JWT token if available and not already set
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('JWT token added to request');
    } else if (!token) {
      console.log('No JWT token found');
    }

    const config: RequestInit = {
      headers,
      credentials: 'include',
      ...options,
    };

    console.log(`🔍 ${options.method || 'GET'} ${url}`);
    console.log('📋 Request headers:', Object.fromEntries(headers.entries()));
    
    return fetch(url, config);
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string, options?: RequestInit): Promise<Response> {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  async patch(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async uploadForm(endpoint: string, formData: FormData, options?: RequestInit): Promise<Response> {
    // Explicitly remove Content-Type header to let browser set it automatically
    const { headers, ...restOptions } = options || {};
    const newHeaders = new Headers(headers);
    newHeaders.delete('Content-Type');

    return this.request(endpoint, {
      ...restOptions,
      method: "POST",
      body: formData,
      headers: newHeaders,
    });
  }
}

export default new HttpClient();