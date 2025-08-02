import HttpClient from "./httpClient";

class ProfileService {
  private baseUrl = "/user";

  async getCurrentProfile(): Promise<any> {
    const response = await HttpClient.get(`${this.baseUrl}/me`);
    if (!response.ok) throw new Error("Failed to fetch profile");
    return await response.json();
  }

  async updateCurrentProfile(data: any): Promise<any> {
    // Remove profile picture if user cleared it
    if (
      "profilePicture" in data &&
      (!data.profilePicture || data.profilePicture.trim() === "")
    ) {
      try {
        await this.deleteProfilePicture();
        delete data.profilePicture;
      } catch (err) {
        console.error("Error deleting profile picture:", err);
      }
    }

    // Upload new profile picture if present
    if (data.profilePicture instanceof File) {
      try {
        const url = await this.uploadProfilePicture(data.profilePicture);
        data.profilePicture = url;
      } catch (err) {
        console.error("Error uploading profile picture:", err);
        throw err;
      }
    }

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

    const response = await HttpClient.uploadForm(
      `${this.baseUrl}/upload-picture`,
      formData
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Upload failed");
    }

    const result = await response.json();
    return result.url;
  }

  async deleteProfilePicture(): Promise<void> {
    const response = await HttpClient.delete(`${this.baseUrl}/delete-picture`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete picture");
    }
  }
}

export const profileService = new ProfileService();
