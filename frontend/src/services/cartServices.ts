import { Query } from "@/Models/Query";
import HttpClient from "./httpClient";
import { Prompt, Tag, PromptWithTags, MarketplacePrompt } from "@/Models/Prompt";
import { Review, ReviewsApiResponse } from '@/Models/Reviews';
import { EnrichedPrompt } from "@/Models/CartPrompt";

export class CartService {
  private httpClient = HttpClient;

  async getCart() {
    try {
      const cartResponse = await this.httpClient.get(`/cart`);
      // const prompt: Prompt = await promptResponse.json();
      const prompts = await cartResponse.json()

      // Ensure tagIds exists and is an array
      return prompts;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async addToCart(promptId: string | undefined) {
    try {
      const response = await this.httpClient.post(`/cart/add`, { promptId });
      // const prompt: Prompt = await promptcart.json();
      const prompts = await response.json()
      // Ensure tagIds exists and is an array
      return prompts;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async removeFromCart(promptId: string) {
    try {
      const response = await this.httpClient.delete(`/cart/remove/${encodeURIComponent(promptId)}`);
      // const prompt: Prompt = await promptResponse.json();

      const removeResponse = await response.json()

      // Ensure tagIds exists and is an array
      return removeResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async checkout(prompts: EnrichedPrompt[]) {
    try {

      // Get userId from localStorage
      const userId = localStorage.getItem('userId');

      // Map EnrichedPrompt to backend-compatible format
      const mappedPrompts = prompts.map(prompt => ({
        cartItemId: prompt.cartItemId,
        userId: userId, // Include userId from localStorage
        promptId: prompt.promptId,
        promptTitle: prompt.promptTitle,
        promptTags: prompt.promptTags,
        promptPrice: prompt.promptPrice,
        username: prompt.username // Include username as it's part of CartItemDTO
        // Exclude averageRating, reviewCount, and fetchData as they're not needed for checkout
      }));


      const Response = await this.httpClient.post(`/cart/checkout`, { "prompts": mappedPrompts });
      // const prompt: Prompt = await promptResponse.json();
      const rsp = await Response.json()

      // Ensure tagIds exists and is an array
      return rsp;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}

