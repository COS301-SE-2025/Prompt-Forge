import { APIResponse } from "@/Models/APIResponse";
import HttpClient from "./httpClient";
import { EnrichedPrompt } from "@/Models/CartPrompt";


export interface PaymentAccessCodeAndReference{
  amount:number
  customerEmail:string
  reference:string
}

interface APIResponseWithPaymentAccessCodeAndReference extends APIResponse {
  data: PaymentAccessCodeAndReference
}

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
      // Map EnrichedPrompt to backend-compatible format
      const mappedPrompts = prompts.map(prompt => ({
        cartItemId: prompt.cartItemId,
        promptId: prompt.promptId,
        promptTitle: prompt.promptTitle,
        promptTags: prompt.promptTags,
        promptPrice: prompt.promptPrice,
        authorName: prompt.authorName
      }));

      const Response = await this.httpClient.post(`/cart/checkout`, {"prompts": mappedPrompts });
      const rsp:APIResponse = await Response.json();
      // console.log("rsp:", rsp);
      
      if(rsp.status == "success"){
        return rsp.message
      }
      throw new Error(rsp.message)
      // }
      
      // Ensure tagIds exists and is an array
      // return rsp;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async initializePayment(prompts: EnrichedPrompt[], total:number) {
    try {

      // Get userId from localStorage
      // const userId = localStorage.getItem('userId');

      // Map EnrichedPrompt to backend-compatible format
      const mappedPrompts = prompts.map(prompt => ({
        cartItemId: prompt.cartItemId,
        promptId: prompt.promptId,
        promptTitle: prompt.promptTitle,
        promptTags: prompt.promptTags,
        promptPrice: prompt.promptPrice,
        authorName: prompt.authorName
      }));

      
      if (total > 0) {
        const Response = await this.httpClient.post(`/payment/initialize`, {total: total, "prompts": mappedPrompts });
        const rsp: APIResponseWithPaymentAccessCodeAndReference = await Response.json();
        if(rsp.status == "success"){
          return rsp.data
        }
        throw new Error(rsp.message)
      }
      
      throw new Error("amount must be greater than zero")

      // Ensure tagIds exists and is an array
      // return rsp;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}

