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

  /**
   * Get bounce rate for user's prompts
   * @returns Promise<number> - The average bounce rate
   */
  static async getBounceRate(): Promise<number> {
    try {
      const response = await HttpClient.get('/api/dashboard');
      
      if (!response.ok) {
        throw new Error(`Failed to get bounce rate: ${response.status}`);
      }

      const data = await response.json();
      return data.averageBounceRate || 0;
    } catch (error) {
      console.error('Error fetching bounce rate:', error);
      return 0;
    }
  }

  /**
   * Get engagement funnel data for heat map
   * @returns Promise<EngagementFunnelData> - The engagement funnel metrics
   */
  static async getEngagementFunnelData(): Promise<{
    totalViews: number;
    totalCartAdds: number;
    totalPurchases: number;
    viewToCartRate: number;
    cartToPurchaseRate: number;
  }> {
    try {
      const response = await HttpClient.get('/api/dashboard/engagement-funnel');
      
      if (!response.ok) {
        throw new Error(`Failed to get engagement funnel data: ${response.status}`);
      }

      const data = await response.json();
      return {
        totalViews: data.totalViews || 0,
        totalCartAdds: data.totalCartAdds || 0,
        totalPurchases: data.totalPurchases || 0,
        viewToCartRate: data.viewToCartRate || 0,
        cartToPurchaseRate: data.cartToPurchaseRate || 0,
      };
    } catch (error) {
      console.error('Error fetching engagement funnel data:', error);
      return {
        totalViews: 0,
        totalCartAdds: 0,
        totalPurchases: 0,
        viewToCartRate: 0,
        cartToPurchaseRate: 0,
      };
    }
  }
}

export default PromptInteractionService;