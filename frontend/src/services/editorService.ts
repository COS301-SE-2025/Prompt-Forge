import HttpClient from "./httpClient"


export class Editor {
  async promptOpenRouter(requestBody: any): Promise<any> {
    try {
      const bodyWithModel = {
        ...requestBody,
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free"
      };
      
      console.log("🔍 Sending request to OpenRouter:", JSON.stringify(bodyWithModel, null, 2));
      
      const response = await fetch("http://localhost:8080/api/test/openrouter/chat", {
        method: "POST",
        // ✅ Removed credentials requirement
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyWithModel),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ OpenRouter response:", data);
      return data;
      
    } catch (error) {
      console.error("❌ OpenRouter API error:", error);
      throw error;
    }
  }

  // ✅ Simple connection test without credentials
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch("http://localhost:8080/api/test/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}