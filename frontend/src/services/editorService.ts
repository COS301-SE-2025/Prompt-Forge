import HttpClient from "./httpClient"


export class Editor {
  async promptOpenRouter(requestBody: any): Promise<any> {
    console.log("🔍 Sending request to OpenRouter:", requestBody);
    
    try {
      // ✅ Send the prompt text directly like test.html does
      const promptText = requestBody.messages[0].content;
      
      const response = await fetch("http://localhost:8080/api/test/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promptText), // ✅ Send just the string, not the object
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Response error:", errorData);
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("✅ Response data:", data);
      return data;
    } catch (error) {
      console.error("❌ OpenRouter API error:", error);
      throw error;
    }
  }
}