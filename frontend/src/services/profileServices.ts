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
    // If user wants to remove profile picture
    if (
      "profilePicture" in data &&
      (!data.profilePicture || data.profilePicture.trim() === "")
    ) {
      try {
        await this.deleteProfilePicture();
        // Remove profilePicture from payload so backend doesn't overwrite it
        delete data.profilePicture;
      } catch (err) {
        console.error("Error deleting profile picture:", err);
      }
    }

    // If user wants to upload a new profile picture (expects a File object)
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

    const response = await fetch(
      `${HttpClient.apiUrl}${this.baseUrl}/upload-picture`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Upload failed");
    }

    const result = await response.json();
    return result.url; // returns string URL
  }

  async deleteProfilePicture(): Promise<void> {
    const response = await fetch(
      `${HttpClient.apiUrl}${this.baseUrl}/delete-picture`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete picture");
    }
  }
}

export const profileService = new ProfileService();
