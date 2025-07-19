import { Query } from "@/models/Query";
import HttpClient from "./httpClient";
import { Prompt, Tag } from "@/models/Prompt";
import { Review, ReviewsApiResponse } from '@/models/Reviews';

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

  async fetchMarketplacePrompts(searchStructure: Query, page: number): Promise<any> {
    try {

      //filter=... && tags=... && search!=""
      if (searchStructure.search !== "") {
        const promptResponse = await this.httpClient.get(`/store/prompts/search?query=${encodeURIComponent(searchStructure.search)}`)
        const prompts = await promptResponse.json();
        return prompts;
      }

      if (searchStructure.tag === "all") {
        //filter=new && tags=all && search=""
        if (searchStructure.filter === "new") {
          return this.getRecentPrompts(page);
        }

        //filter=top-ranked && tags=all && search=""
        if (searchStructure.filter === "top-ranked") {
          return this.getRecentPrompts(page);
        }

        //filter=featured && tags=all && search=""
        if (searchStructure.filter === "featured") {
          return this.getFeatured(page, 12);
        }

        //filter=all && tags=all && search=""
        const promptsResponse = await this.httpClient.get(`/store/prompts?page=${page}&size=12`)
        const prompts = await promptsResponse.json();
        console.log("prompts:");
        console.log(prompts);

        return prompts;
      }

      if (searchStructure.filter !== "all") {
        const promptResponse = await this.httpClient.get(`/store/prompts/filter?tagName=${searchStructure.tag}&filter=${searchStructure.filter}`)
        const prompts = await promptResponse.json();

        return prompts;
      }

      if (searchStructure.filter === "all") {
        this.getByCategory(searchStructure.tag, page)
          .then(console.log)
        // console.log("thi.getbycat", log);

        return this.getByCategory(searchStructure.tag, page);
      }

      if (searchStructure.search === "") {
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
      const tags = await tagsResponse.map((tag: Tag) => tag.name)
      return tags;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getFeatured(page: number, size: number) {
    try {
      const promptResponse = await this.httpClient.get(`/store/prompts/featured?page=${page}&size=${size}`)
      return promptResponse.json();
      // return prompts;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPurchasedPrompts(page: number, size: number) {
    try {
      const promptResponse = await this.httpClient.get(`/prompts/purchased?page=${page}&size=${size}&offset=0`)
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
      const response = await this.httpClient.get(`/store/prompts/search?query=${query}`);
      return response.json();
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }
 
  async getPromptsByAuthor(authorId: string,page:number,size:number) {
    try {
      const response = await this.httpClient.get(`/prompts/author/${authorId}?page=${page}&size=${size}`);
      return response.json();
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async getAuthoredAndPurchasedPrompts(authorId: string,page:number,size:number) {
    try {
      const response = await this.httpClient.get(`/prompts/myprompts/${authorId}?page=${page}&size=${size}`);
      return response.json();
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getByCategory(category: string, page: number) {
    try {      
      const response = await this.httpClient.get(`/store/prompts/filter/tag/${encodeURIComponent(category) }?page=${page}&size=12`);
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

      // Clear cache after successful review creation
      this.clearRatingsCache(promptId);
      return await response.json()
    } catch (error) {
      console.error('PromptService.postReview error:', error)
      throw error
    }
  }

  async updateReview(promptId: string, reviewId: string, reviewData: { rating: number; comment: string }) {
    try {
      const response = await this.httpClient.put(`/store/prompts/${promptId}/reviews/${reviewId}`, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`

        try {
          const errorBody = await response.text()
          if (errorBody) {
            try {
              const errorJson = JSON.parse(errorBody)
              errorMessage = errorJson.message || errorJson.error || errorBody
            } catch {
              errorMessage = errorBody
            }
          }
        } catch (e) {
          console.log('Could not read error response body')
        }

        throw new Error(errorMessage)
      }

      // Clear cache after successful review update
      this.clearRatingsCache(promptId);
      return await response.json()
    } catch (error) {
      console.error('PromptService.updateReview error:', error)
      throw error
    }
  }

  async deleteReview(promptId: string, reviewId: string): Promise<void> {
    try {
      const response = await this.httpClient.delete(`/store/prompts/${promptId}/reviews/${reviewId}`)

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`

        try {
          const errorBody = await response.text()
          if (errorBody) {
            try {
              const errorJson = JSON.parse(errorBody)
              errorMessage = errorJson.message || errorJson.error || errorBody
            } catch {
              errorMessage = errorBody
            }
          }
        } catch (e) {
          console.log('Could not read error response body')
        }

        throw new Error(errorMessage)
      }

      // Clear cache after successful review deletion
      this.clearRatingsCache(promptId);

    } catch (error) {
      console.error('PromptService.deleteReview error:', error)
      throw error
    }
  }

  /**
   * Helper method to clear ratings cache for a specific prompt
   */
  private clearRatingsCache(promptId: string): void {
    const cacheKey = `rating_${promptId}`;
    sessionStorage.removeItem(cacheKey);
    this.ratingsCache.delete(cacheKey);
  }

  /**
   * Helper method to clear all ratings cache
   */
  public clearAllRatingsCache(): void {
    // Clear sessionStorage cache
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('rating_')) {
        sessionStorage.removeItem(key);
      }
    }

    // Clear in-memory cache
    this.ratingsCache.clear();
  }

  async getPromptRatingSummary(promptId: string): Promise<{ averageRating?: number; reviewCount: number }> {
    // Simple cache to avoid repeated API calls
    const cacheKey = `rating_${promptId}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const { rating, count, timestamp } = JSON.parse(cached);
        // Use cache for 5 minutes
        if (Date.now() - timestamp < this.CACHE_DURATION) {
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

