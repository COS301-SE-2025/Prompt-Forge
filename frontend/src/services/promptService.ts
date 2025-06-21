import HttpClient from "./httpClient";
import { Prompt, Tag, PromptWithTags, Review, MarketplacePrompt } from "@/models/Prompt";

export class PromptService {
    private httpClient = HttpClient;

    // async getPromptById(promptId: string) {
    //     try {
    //         const response = await this.httpClient.get(`/prompts/${promptId}`)
    //         return response.json()
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // }
    
    // async getMarketplacePrompts() {
    //     try {
    //         const response = await this.httpClient.get('/store/prompts')
    //         return response.json()
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // }
    async getPromptById(promptId: string) {
    try {
      // const [promptResponse, tagsResponse] = await Promise.all([
      //   this.httpClient.get(`/store/prompts/${promptId}`),
      //   this.httpClient.get('/store/prompts/tags')
      // ]);
      
      // const prompt: Prompt = await promptResponse.json();
      // const allTags: Tag[] = await tagsResponse.json();
      
      // // Map tagIds to full tag objects
      // const tags = prompt.tagIds.map(tagId => 
      //   allTags.find(tag => tag.id === tagId) || 
      //   { id: tagId, name: 'Unknown', slug: 'unknown' }
      // );
      const promptResponse = await this.httpClient.get(`/prompts/${promptId}`);
      const prompt: Prompt = await promptResponse.json();
    
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
        return { ...prompt, tags };
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

  async getMarketplacePrompts(page: number): Promise<{ prompts: any, tagNames: any, promptCount:number }> {
    try {
      const [promptsResponse, tagsResponse, promptCountResponse] = await Promise.all([
        this.httpClient.get(`/store/prompts/page?page=${page}&pageSize=12`),
        this.httpClient.get('/store/prompts/tags'),
        this.httpClient.get('/store/prompts/count?pageSize=12'),
      ]);

      const prompts = await promptsResponse.json();
      var tags = await tagsResponse.json();
      const promptCount = await promptCountResponse.json();
      const tagNames = await tags.map((tag:Tag)=>
        tag.name
      )

      return { prompts, tagNames, promptCount };
    } catch (error) {
      console.error('Error fetching prompt from marketplace prompts:', error);
      throw error;
    }
  }


    async searchPrompts(query: string) {
        try {
            const response = await this.httpClient.get('/store/prompts/search?query=${query}');
            return response.json();
        } catch (error) {
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

    async getRecentPrompts() {
        try {
            const response = await this.httpClient.get('/store/prompts/filter/recent');
            return response.json();
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

    async getPromptReviews(promptId: string): Promise<Review[]>  {
    try {
        const response = await fetch(`/prompts/${promptId}/reviews`);
        
        // if (!response.ok) {
        //     throw new Error(`HTTP error! Status: ${response.status}`);
        // }
        
        // const data = await response.json();
        // return Array.isArray(data) ? data : [];
        // Check for successful response
        if (!response.ok) {
            throw new Error(`Failed to fetch reviews: ${response.status}`);
        }
        
        // Verify JSON content type
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Expected JSON but got: ${contentType}`);
        }
        
        const reviews: Review[] = await response.json();
        
        // Validate the response structure
        if (!Array.isArray(reviews)) {
            console.warn('Expected array but got:', reviews);
            return [];
        }
        
        return reviews;
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return []; // Return empty array as fallback
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

  
    

}

