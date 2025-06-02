import HttpClient from "./httpClient";
import { User } from "./User";

export class AuthService {
    private httpClient:HttpClient;
    private apiUrl = 'https://localhost:8080'
    constructor(httpClient:HttpClient) {
        this.httpClient = httpClient;
    }

    async login(userData:User){
        try {
            const response = await this.httpClient.post(`${this.apiUrl}/login`,userData)
            return response.json()
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async signup(userData:User){
        try {
            const response = await this.httpClient.post(`${this.apiUrl}/signup`,userData)
            return response.json()
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

