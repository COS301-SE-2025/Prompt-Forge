import { BankIdentifier, PayoutCard } from "@/Models/Payout";
import HttpClient from "./httpClient";
import { APIResponse } from "@/Models/APIResponse";

interface APIResponseWithBankList extends APIResponse {
  data: Array<BankIdentifier>
}

interface APIResponseForPayoutDetails extends APIResponse {
  data: PayoutCard
}


class ProfileService {
  private baseUrl = "/user";
  private httpClient = HttpClient;

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

  async getBankList(): Promise<Array<BankIdentifier>> {
    try {
      const bankListResponse = await this.httpClient.get(`/payment/bank-list`);
      const response: APIResponseWithBankList = await bankListResponse.json()

      if (response.status === "success") {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getPayoutDetails(): Promise<PayoutCard> {
    try {
      const bankListResponse = await this.httpClient.get(`/payment/user-payout-details`);
      const apiResponse: APIResponseForPayoutDetails = await bankListResponse.json()
      let details: PayoutCard = apiResponse.data

      if (apiResponse.status === "success") {
        return details;
      }

      throw new Error(apiResponse.message)
    } catch (error) {
      console.log("error", error);

      throw error
    }
  }

  async addPayoutCard(newCard: PayoutCard): Promise<void> {
    try {
      const bankListResponse = await this.httpClient.post(`/payment/add-payout-card`, newCard);
      const response: APIResponse = await bankListResponse.json()

      if (response.status === "success") {
        return;
      }

      throw new Error(response.message)
    } catch (error) {
      console.log("error", error);

      throw error
    }
  }

  async updatePayoutCard(newCard: PayoutCard): Promise<void> {
    try {
      const bankListResponse = await this.httpClient.put(`/payment/update-payout-card`, newCard);
      const response: APIResponse = await bankListResponse.json()

      if (response.status === "success") {
        return;
      }

      throw new Error(response.message)
    } catch (error) {
      console.log("error", error);

      throw error
    }
  }
}

export const profileService = new ProfileService();
