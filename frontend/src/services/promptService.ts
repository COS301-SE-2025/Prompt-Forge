import HttpClient from "./httpClient";
import { Prompt, Tag, PromptWithTags, Review } from "@/models/Prompt";

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

  // async getMarketplacePrompts(): Promise<Prompt[]> {
  //   try {
  //     const response = await this.httpClient.get('/store/prompts');
  //   const data = await response.json();
  //   // Ensure the API returns proper Prompt objects with tagIds
  //   // return data.map((item: any) => ({
  //   //   ...item,
  //   //   tagIds: item.tagIds || [] // Ensure tagIds exists
  //   // }));
  //   // } catch (error) {
  //   //   console.error(error);
  //   //   throw error;
  //   // }
  //   if (!Array.isArray(data)) {
  //           console.warn('Expected array but got:', data);
  //           return [];
  //       }
        
  //       return data as Prompt[];
  //   } catch (error) {
  //       console.error('Fetch error:', error);
  //       return []; // Return empty array as fallback
  //   }
  // }

async getMarketplacePrompts(): Promise<PromptWithTags[]> {
  try {
    const [promptsResponse, tagsResponse] = await Promise.all([
      this.httpClient.get('/store/prompts'),
      this.httpClient.get('/store/prompts/tags')
    ]);

    const prompts: Prompt[] = await promptsResponse.json();
    const allTags: Tag[] = await tagsResponse.json();

    // Create a lookup map for O(1) tag access
    const tagMap = new Map<string, Tag>();
    allTags.forEach(tag => tagMap.set(tag.id, tag));

    return prompts.map(prompt => {
      // Ensure tagIds exists and is an array
      const tagIds = prompt.tagIds || [];
      
      // Map each tagId to its corresponding Tag object
      const tags = tagIds.map(tagId => {
        const foundTag = tagMap.get(tagId);
        return foundTag || {
          id: tagId,
          name: 'Unknown',
          slug: 'unknown',
          usageCount: 0
        };
      });

      return {
        ...prompt,
        tags
      };
    });
  } catch (error) {
    console.error('Error fetching marketplace prompts:', error);
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

