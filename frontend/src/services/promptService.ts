import { Query } from "@/models/Query";
import HttpClient from "./httpClient";
import { Prompt, Tag, PromptWithTags,  MarketplacePrompt } from "@/Models/Prompt";
import { Review,ReviewsApiResponse } from '@/models/Reviews';

export class PromptService {
    private httpClient = HttpClient;

    
    async getPromptById(promptId: string) {
    try {
      
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

  async getMarketplacePrompts(page: number): Promise<{ prompts: any, tagNames: any, promptCount:number, featuredPrompts:any }> {
    try {
      const [promptsResponse, tagsResponse, promptCountResponse, featuredResponse] = await Promise.all([
        this.httpClient.get(`/store/prompts/page?page=${page}&pageSize=12`),
        this.httpClient.get('/store/prompts/tags'),
        this.httpClient.get('/store/prompts/count?pageSize=12'),
        this.httpClient.get('/store/prompts/featured'),
      ]);

      const prompts = await promptsResponse.json();
      var tags = await tagsResponse.json();
      const promptCount = await promptCountResponse.json();
      const tagNames = await tags.map((tag:Tag)=>
        tag.name
      )

      const featuredPrompts = await featuredResponse.json().then(res=>res.content);


      return { prompts, tagNames, promptCount, featuredPrompts };
    } catch (error) {
      console.error('Error fetching prompt from marketplace prompts:', error);
      throw error;
    }
  }
 
  async fetchMarketplacePrompts(searchStructure:Query,page: number): Promise<any> {
    try {

      //filter=new && tags=all && search!=""
      if(searchStructure.search!==""){
        const promptResponse = await this.httpClient.get(`/api/store/prompts/search?query=${encodeURIComponent(searchStructure.search)}`)
        const prompts = await promptResponse.json();
        console.log(`prompts for ${searchStructure.filter} & ${searchStructure.tag} & search=${searchStructure.search}`);
        console.log(prompts);

        return prompts;
      }

      if(searchStructure.tag === "all"){
        //filter=new && tags=all && search=""
        if(searchStructure.filter === "new"){
          const promptResponse = await this.httpClient.get(`/store/prompts/new?page=${page}&size=12`)
          const prompts = await promptResponse.json();
          return prompts;
        }
        
        //filter=top-ranked && tags=all && search=""
        if(searchStructure.filter === "top-ranked"){
          const promptResponse = await this.httpClient.get(`/store/prompts/new?page=${page}&size=12`)
          const prompts = await promptResponse.json();
          return prompts;
        }
        
        //filter=featured && tags=all && search=""
        if(searchStructure.filter === "featured"){
          const promptResponse = await this.httpClient.get(`/store/prompts/featured?page=${page}&size=12`)
          const prompts = await promptResponse.json();
          return prompts;
        }

        //filter=all && tags=all && search=""
        const promptsResponse = await this.httpClient.get(`/store/prompts?page=${page}&size=12`)
        const prompts = await promptsResponse.json();
        console.log(`prompts for ${searchStructure.filter} & ${searchStructure.tag} & search=${searchStructure.search}`);
        console.log(prompts);
        return prompts;
      }
      
      if(searchStructure.filter !== "all"){
        const promptResponse = await this.httpClient.get(`/store/prompts/filter?tagName=${searchStructure.tag}&filter=${searchStructure.filter}`)
        const prompts = await promptResponse.json();
        console.log(`prompts for ${searchStructure.filter} & ${searchStructure.tag}`);
        console.log(prompts);
        
        return prompts;
      }
      
      if(searchStructure.filter === "all"){
        const promptResponse = await this.httpClient.get(`/store/prompts/filter/tag/tag/${searchStructure.tag}`)
        const prompts = await promptResponse.json();
        console.log(`prompts for ${searchStructure.filter} & ${searchStructure.tag}`);
        console.log(prompts);
        
        return prompts;
      }

      if(searchStructure.search ===""){  
        const promptsResponse = await this.httpClient.get(`/store/prompts`)
        const prompts = await promptsResponse.json();
        console.log(`prompts for ${searchStructure.filter} & ${searchStructure.tag} & search=${searchStructure.search}`);
        console.log(prompts);
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
      return await promptResponse.json();
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
      } catch (error) {
          console.error(error);
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

    async getPromptReviews(promptId: string): Promise<Review[]> {
    try {
      const response = await this.httpClient.get(
        `/store/prompts/${promptId}/reviews`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${contentType}`);
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

  async postReview(promptId: string, reviewData: { rating: number; comment: string }): Promise<Review> {
  try {
    const response = await this.httpClient.post(
      `/store/prompts/${promptId}/reviews`,
      reviewData
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to post review:', error);
    throw error;
  }
}
}

