class HttpClient {
  private baseURL = "http://localhost:8080";

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    console.log(`🌐 ${options.method || 'GET'} ${url}`);
    
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
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  }
}


export default new HttpClient();
