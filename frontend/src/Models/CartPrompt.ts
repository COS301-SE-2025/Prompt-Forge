import { Category } from "./Prompt";

export interface CartPrompt {
    cartItemId: string;
    promptId: string;
    promptTitle: string;
    promptTags: Category[];
    promptPrice: number;
    // rating: number;
    // author: string;
    username: string;
    fetchData:()=>Promise<void>
    // removeItem: (id: string) => void;
  }

export interface EnrichedPrompt extends CartPrompt {
    averageRating: number;
    reviewCount: number;
}