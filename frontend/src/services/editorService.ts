import HttpClient from "./httpClient"


export class Editor {
  async promptOpenRouter(requestBody: any): Promise<any> {
    console.log("🔍 Sending request to OpenRouter:", requestBody);
    
    try {
      // Validate the request has a model
      if (!requestBody.model) {
        console.error("❌ Missing model in request");
        return {
          error: {
            message: "No model specified in request",
            code: 400
          }
        };
      }
      
      const response = await fetch("http://localhost:8080/api/test/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Response status:", response.status, "data:", data);

      if (!response.ok) {
        let errorMessage = "Unknown error";
        let userMessage = "";
        
        // Try to extract useful error information
        if (data.error) {
          if (typeof data.error === 'string') {
            try {
              // Try to parse JSON if it's a string
              const parsedError = JSON.parse(data.error);
              if (parsedError.error) {
                errorMessage = parsedError.error.message || "Provider error";
                
                // Check for specific error types
                if (errorMessage.includes("No instances available")) {
                  userMessage = `The model ${requestBody.model} is currently unavailable. Please try another model.`;
                } else if (response.status === 429) {
                  userMessage = "Rate limit exceeded. Please wait a moment and try again.";
                }
              }
            } catch (e) {
              errorMessage = data.error;
            }
          } else {
            errorMessage = data.error.message || JSON.stringify(data.error);
            userMessage = data.userMessage || "";
          }
        }
        
        return {
          error: {
            message: errorMessage,
            userMessage: userMessage || errorMessage,
            status: response.status
          }
        };
      }

      return data;
    } catch (error) {
      console.error("❌ OpenRouter API error:", error);
      return {
        error: {
          message: error instanceof Error ? error.message : "Network or parsing error"
        }
      };
    }
  }
}