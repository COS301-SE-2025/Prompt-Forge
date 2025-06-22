import HttpClient from "./httpClient";
class ProfileService {
    private baseUrl = "/user";
   

    async getCurrentProfile(): Promise<any> {
  const response = await fetch(`${HttpClient.apiUrl}${this.baseUrl}/me`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return await response.json();
}

  
async updateCurrentProfile(data: any): Promise<any> {
    const response = await HttpClient.patch(`${this.baseUrl}/me`, data);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }
    return await response.json();
  }
  
    async uploadProfilePicture(file: File): Promise<string> {
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch(`${HttpClient.apiUrl}${this.baseUrl}/upload-picture`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }
  
      const result = await response.json();
      return result.url; // returns string URL
    }
  
    async deleteProfilePicture(): Promise<void> {
      const response = await fetch(`${HttpClient.apiUrl}${this.baseUrl}/delete-picture`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete picture");
      }
    }
  }
  
  export const profileService = new ProfileService();
  