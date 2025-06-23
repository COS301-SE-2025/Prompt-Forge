import HttpClient from "./httpClient"


export class Editor{
    private httpClient = HttpClient
    promptOpenRouter = async (body:Object) => {
        try {
            const response = await this.httpClient.post(`/api/test/openrouter/chat`, body)
            return response.json()
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}