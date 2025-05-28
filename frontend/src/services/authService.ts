import HttpClient from "./httpClient";

class AuthService {
    private httpClient:HttpClient;
    private apiUrl = 'https://localhost:7049/api/'
    constructor(httpClient:HttpClient) {
        this.httpClient = httpClient;
    }

    async login(userData:Object){
        try {
            const response = await this.httpClient.post(`${this.apiUrl}/login`,userData)
            return response.json()
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async signup(userData:Object){
        try {
            const response = await this.httpClient.post(`${this.apiUrl}/signup`,userData)
            return response.json()
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

