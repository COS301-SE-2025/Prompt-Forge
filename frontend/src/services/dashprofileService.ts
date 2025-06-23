import HttpClient from "./httpClient";


class DashProfileService {
  private baseUrl = "/user";

  async getDashboardProfile(): Promise<any> {
    const response = await fetch(`${HttpClient.apiUrl}${this.baseUrl}/me/card`, {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch dashboard profile");
    }

    return await response.json();
  }
}

export const dashProfileService = new DashProfileService();
