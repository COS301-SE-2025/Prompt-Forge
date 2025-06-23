const HttpClient = {

    apiUrl: 'http://localhost:8080',
  
    async get(endpoint: string) {
      return await fetch(`${this.apiUrl}${endpoint}`, {
        credentials: 'include', // include cookies
      });
    },
  
    async post(endpoint: string, body: Object) {
      return await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // include cookies
      });

    },

    async patch(endpoint: string, body: Object): Promise<Response> {
        return fetch(this.apiUrl + endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
  };
  
  export default HttpClient;
  