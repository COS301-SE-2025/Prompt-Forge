import { Query } from "@/Models/Query";
import HttpClient from "./httpClient";
import { Prompt, Tag, PromptWithTags,  MarketplacePrompt } from "@/Models/Prompt";
import { Review,ReviewsApiResponse } from '@/Models/Reviews';

export class PromptService {
    private httpClient = HttpClient;
    private ratingsCache = new Map<string, { rating: number; count: number; timestamp: number }>();
    private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes


    async getPromptById(promptId: string) {
    try {
      const [promptResponse, ownershipResponse, addedToCartResponse] = await Promise.all([this.httpClient.get(`/prompts/${promptId}`),
        this.httpClient.get(`/store/prompts/ownership/${promptId}`),
        this.httpClient.get(`/cart/added/${promptId}`)])
      
      const prompt: Prompt = await promptResponse.json();
      
      console.log("ownershipResponse");
      const ownership = await ownershipResponse.json();
      console.log(ownership);
      
      console.log("addedToCartResponse");
      const addedToCart = await addedToCartResponse.json();
      console.log(addedToCart);
    
      // Ensure tagIds exists and is an array
      const tagIds = prompt.tagIds || [];
      
      // Fetch tags only if we have tagIds
      //This is supposed to be done by the DB
      let tags: Tag[] = [];
      if (tagIds.length > 0) {
        const tagsResponse = await this.httpClient.get('/store/prompts/tags');
        const allTags: Tag[] = await tagsResponse.json();
        
        tags = tagIds.map(tagId => 
          allTags.find(tag => tag.id === tagId) || 
          { id: tagId, name: 'Unknown', slug: 'unknown' }
        );
      }
      return { ...prompt, tags, ownership, addedToCart };
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

  async fetchMarketplacePrompts(searchStructure:Query,page: number): Promise<any> {
    try {

      //filter=new && tags=all && search!=""
      if(searchStructure.search!==""){
        const promptResponse = await this.httpClient.get(`/store/prompts/search?query=${encodeURIComponent(searchStructure.search)}`)
        const prompts = await promptResponse.json();
        return prompts;
      }

      if(searchStructure.tag === "all"){
        //filter=new && tags=all && search=""
        if(searchStructure.filter === "new"){
          return this.getRecentPrompts(page);
        }
        
        //filter=top-ranked && tags=all && search=""
        if(searchStructure.filter === "top-ranked"){
          return this.getRecentPrompts(page);
        }
        
        //filter=featured && tags=all && search=""
        if(searchStructure.filter === "featured"){
          return this.getFeatured(page,12);
        }

        //filter=all && tags=all && search=""
        const promptsResponse = await this.httpClient.get(`/store/prompts?page=${page}&size=12`)
        const prompts = await promptsResponse.json();
        console.log("prompts:");
        console.log(prompts);
        
        return prompts;
      }
      
      if(searchStructure.filter !== "all"){
        const promptResponse = await this.httpClient.get(`/store/prompts/filter?tagName=${searchStructure.tag}&filter=${searchStructure.filter}`)
        const prompts = await promptResponse.json();
        
        return prompts;
      }
      
      if(searchStructure.filter === "all"){
        return this.getByCategory(searchStructure.tag);
      }

      if(searchStructure.search ===""){  
        const promptsResponse = await this.httpClient.get(`/store/prompts`)
        const prompts = await promptsResponse.json();
        return prompts;
      }

    } catch (error) {
      console.error('Error fetching prompt from marketplace prompts:', error);
      throw error;
    }
  }

  async getTags() {
    try {
      const response = await this.httpClient.get('/store/prompts/tags');
      const tagsResponse = await response.json()
      const tags = await tagsResponse.map((tag:Tag)=>tag.name)
      return tags;
    } catch (error) {
        console.error(error);
        throw error;
    }
  }
  
  async getFeatured(page:number,size:number) {
    try {
      const promptResponse = await this.httpClient.get(`/store/prompts/featured?page=${page}&size=${size}`)
      return promptResponse.json();
      // return prompts;
    } catch (error) {
        console.error(error);
        throw error;
    }
  }
  
  async getPurchasedPrompts(page:number,size:number) {
    try {
      const promptResponse = await this.httpClient.get(`/prompts/purchased?page=${page}&size=${size}`)
      return promptResponse.json();
      // return prompts;
    } catch (error) {
        console.error(error);
        throw error;
    }
  }
  
  async fetchTags() {
    try {
      const response = await this.httpClient.get('/store/prompts/tags');
      return response.json();
    } 
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  async searchPrompts(query: string) {
    try {
      const response = await this.httpClient.get('/store/prompts/search?query=${query}');
      return response.json();
    } 
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getByCategory(category: string) {
    try {
      const response = await this.httpClient.get(`/store/prompts/filter/tag/${category}`);
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getRecentPrompts(page: number) {
      try {
        const promptResponse = await this.httpClient.get(`/store/prompts/filter/recent?page=${page}&size=12`)
        return promptResponse.json();

      } catch (error) {
          console.error(error);
          throw error;
      }
  }

  async getPopularPrompts() {
    try {
        const response = await this.httpClient.get('/store/prompts/filter/recent');
        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
  }


    async getPromptReviews(promptId: string): Promise<Review[]> {
    try {
      const response = await this.httpClient.get(
        `/store/prompts/${promptId}/reviews`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ReviewsApiResponse = await response.json();
      

      if (!data?.content) {
        console.warn('Unexpected response structure:', data);
        return [];
      }

      return data.content
      
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      return []; 
      
    }
  }

  async getAllTags(): Promise<Tag[]> {
    try {
      const response = await this.httpClient.get('/store/prompts/tags');
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    try {
      const response = await this.httpClient.get(`/store/prompts/tags/popular?limit=${limit}`);
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async postReview(promptId: string, reviewData: { rating: number; comment: string }) {
  try {
    const response = await this.httpClient.post(`/store/prompts/${promptId}/reviews`, {
      rating: reviewData.rating,
      comment: reviewData.comment,
    })

    if (!response.ok) {
      // ✅ Better error message extraction
      let errorMessage = `HTTP error! status: ${response.status}`
      
      try {
        const errorBody = await response.text()
        if (errorBody) {
          // Try to parse as JSON first
          try {
            const errorJson = JSON.parse(errorBody)
            errorMessage = errorJson.message || errorJson.error || errorBody
          } catch {
            // If not JSON, use the text directly
            errorMessage = errorBody
          }
        }
      } catch (e) {
        console.log('Could not read error response body')
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('PromptService.postReview error:', error)
    throw error
  }
}

async getPromptRatingSummary(promptId: string): Promise<{ averageRating?: number; reviewCount: number }> {
  // Simple cache to avoid repeated API calls
  const cacheKey = `rating_${promptId}`;
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const { rating, count, timestamp } = JSON.parse(cached);
      // Use cache for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return {
          averageRating: rating > 0 ? rating : undefined,
          reviewCount: count
        };
      }
    } catch (e) {
      // Invalid cache, continue to fetch
    }
  }

  try {
    const reviews = await this.getPromptReviews(promptId);
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    
    // Cache the result
    const cacheData = {
      rating: averageRating,
      count: reviews.length,
      timestamp: Date.now()
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    return {
      averageRating: averageRating > 0 ? averageRating : undefined,
      reviewCount: reviews.length
    };
  } catch (error) {
    console.warn(`Failed to fetch reviews for prompt ${promptId}:`, error);
    return {
      averageRating: undefined,
      reviewCount: 0
    };
  }
}
}

