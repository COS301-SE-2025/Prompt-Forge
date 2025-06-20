import HttpClient from "./httpClient";
import { User } from "../Models/User";

export class AuthService {
    private httpClient = HttpClient;
    private baseUrl = "/auth";
    async login(userData: User) {
        try {
          const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // include cookies for HttpOnly cookie storage
            body: JSON.stringify(userData),
          });
      
          const isJson = response.headers.get("content-type")?.includes("application/json");
          let data = null;
          if (isJson) {
            data = await response.json();
          }
      
          if (!response.ok) {
            throw new Error(data?.message || `Login failed with status ${response.status}`);
          }
      
          return data;
        } catch (error: any) {
          console.error("Login failed:", error);
          throw new Error(error.message || "Login error");
        }
      }
      
    
    async signup(userData: User) {
        try {
            
            if (
                !userData.email?.trim() ||
                !userData.password?.trim() ||
                !userData.username?.trim() ||
                !userData.confirmPassword?.trim()
            ) {
                throw new Error("All fields are required");
            }
    
            const response = await this.httpClient.post(`${this.baseUrl}/signup`, userData);
            const data = await response.json(); //
            if (!response.ok) {
               
                throw new Error(data.message || "Signup failed");
            }
    
            return data;
        } catch (error : any) {
            console.error("Signup failed:", error);
        throw new Error(error.message || "Signup error");
        }
    }

    async logout() {
  try {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      credentials: 'include', // send cookies
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Logout failed with status ${response.status}`);
    }

    return await response.json(); // { message: "Logout successful" }
  } catch (error: any) {
    console.error("Logout failed:", error);
    throw new Error(error.message || "Logout error");
  }
}

}

