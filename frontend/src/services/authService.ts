import HttpClient from "./httpClient";
import { User } from "../Models/User";

export class AuthService {
    private httpClient = HttpClient;

    async login(userData:User){
        try {
            // const response = await this.httpClient.post(`/login`,userData)
            // return response.json()
            const mock_response = await fetch('/data/users.json');
            if (!mock_response.ok) {
                throw new Error('Failed to fetch data');
            }

           const users = await mock_response.json()
           const user = users.find((u:User) => u.email === userData.email)
            
           if (!user) {
                throw new Error('User not found');
            }
            if (user.password !== userData.password) {
                throw new Error("Invalid password");
            }

            return {status:"success",message:"Login successful"}
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async signup(userData:User){
        try {
            // const response = await this.httpClient.post(`/signup`,userData)
            // return response.json()
            // const response = await this.httpClient.post(`/login`,userData)
            // return response.json()

            if (!userData.email || !userData.password || !userData.username || !userData.confirmPassword) {
                throw new Error("All fields are required")
            }
            const mock_response = await fetch('/data/users.json');
            if (!mock_response.ok) {
                throw new Error('Failed to fetch data');
            }

           const users = await mock_response.json()
           const user = users.find((u:User) => u.email === userData.email)
            
           if (!user) {
                throw new Error('User not found');
            }
            if (user.password !== userData.password) {
                throw new Error("Invalid password");
            }

            return {status:"success",message:"Login successful"}
            
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

