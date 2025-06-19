import HttpClient from "./httpClient";

export class PromptService {
    private httpClient = HttpClient;

    async getPromptById(promptId: string) {
        try {
            const response = await this.httpClient.get(`/prompt/${promptId}`)
            return response.json()
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    async getMarketplacePrompts() {
        try {
            const mock_response = await fetch('/data/prompts.json');
            if (!mock_response.ok) {
                throw new Error('Failed to fetch data');
            }
            console.log();
            
            return await mock_response.json()
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getUserPrompts(username: string) {
        try {
            const response = await this.httpClient.get(`/prompt/${username}`)
            return response.json()
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

