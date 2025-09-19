import HttpClient from "./httpClient";
import { APIResponse } from "@/Models/APIResponse";

export enum InteractionType {
  VIEW = "VIEW",
  ADD_TO_CART = "ADD_TO_CART", 
  PURCHASE = "PURCHASE"
}

export interface PromptInteractionResponse {
  status: "success" | "error";
  message: string;
}

export class PromptInteractionService {
  private httpClient = HttpClient;

  /**
   * Record a prompt interaction (VIEW, ADD_TO_CART, PURCHASE)
   * @param promptId - The ID of the prompt
   * @param action - The interaction type
   * @returns Promise<APIResponse>
   */
  async recordInteraction(promptId: string, action: InteractionType): Promise<PromptInteractionResponse> {
    try {
      const response = await this.httpClient.post(`/prompts/${promptId}/interact?action=${action}`, {});
      
      if (!response.ok) {
        throw new Error(`Failed to record interaction: ${response.status}`);
      }

      const result = await response.text();
      return {
        status: "success",
        message: result || "Interaction recorded successfully"
      };
    } catch (error) {
      console.error(`Error recording ${action} interaction for prompt ${promptId}:`, error);
      throw error;
    }
  }

  /**
   * Get bounce rate for a specific prompt
   * @param promptId - The ID of the prompt
   * @returns Promise<number> - The bounce rate percentage
   */
  async getBounceRate(promptId: string): Promise<number> {
    try {
      const response = await this.httpClient.get(`/prompts/${promptId}/bounce-rate`);
      
      if (!response.ok) {
        throw new Error(`Failed to get bounce rate: ${response.status}`);
      }

      const bounceRate = await response.json();
      return bounceRate;
    } catch (error) {
      console.error(`Error getting bounce rate for prompt ${promptId}:`, error);
      throw error;
    }
  }

  /**
   * Get view count for a specific prompt
   * @param promptId - The ID of the prompt
   * @returns Promise<number> - The view count
   */
  async getViewCount(promptId: string): Promise<number> {
    try {
      const response = await this.httpClient.get(`/prompts/${promptId}/views`);
      
      if (!response.ok) {
        throw new Error(`Failed to get view count: ${response.status}`);
      }

      const viewCount = await response.json();
      return viewCount;
    } catch (error) {
      console.error(`Error getting view count for prompt ${promptId}:`, error);
      throw error;
    }
  }

  /**
   * Record a VIEW interaction
   * @param promptId - The ID of the prompt
   */
  async recordView(promptId: string): Promise<PromptInteractionResponse> {
    return this.recordInteraction(promptId, InteractionType.VIEW);
  }

  /**
   * Record an ADD_TO_CART interaction
   * @param promptId - The ID of the prompt
   */
  async recordAddToCart(promptId: string): Promise<PromptInteractionResponse> {
    return this.recordInteraction(promptId, InteractionType.ADD_TO_CART);
  }

  /**
   * Record a PURCHASE interaction
   * @param promptId - The ID of the prompt
   */
  async recordPurchase(promptId: string): Promise<PromptInteractionResponse> {
    return this.recordInteraction(promptId, InteractionType.PURCHASE);
  }
}

export default PromptInteractionService;