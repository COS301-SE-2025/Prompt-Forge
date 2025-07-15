import HttpClient from "./httpClient"


export class Editor {
  async promptOpenRouter(requestBody: any): Promise<any> {
    console.log("🔍 Sending request to OpenRouter:", requestBody);
    
    try {
      // Validate the request has a model
      if (!requestBody.model) {
        console.error("Missing model in request");
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
      console.error("OpenRouter API error:", error);
      return {
        error: {
          message: error instanceof Error ? error.message : "Network or parsing error"
        }
      };
    }
  }

  //NEW: Add streaming method
  async promptOpenRouterStream(
    requestBody: any, 
    onContent: (content: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    console.log("🔍 Sending streaming request to OpenRouter:", requestBody);
    
    try {
      // Validate the request has a model
      if (!requestBody.model) {
        console.error("❌ Missing model in request");
        onError("No model specified in request");
        return;
      }

      // Ensure streaming is enabled
      requestBody.stream = true;
      
      const response = await fetch("http://localhost:8080/api/test/openrouter/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Error response: ${errorText}`);
        onError(`Error: ${response.status} ${response.statusText}\n${errorText}`);
        return;
      }

      // Process streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      console.log('Starting to process stream...');

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('Stream complete');
            onComplete();
            break;
          }

          // Decode chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete lines from buffer
          while (true) {
            const lineEnd = buffer.indexOf('\n');
            if (lineEnd === -1) break;

            const line = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 1);

            if (line === '') continue;

            // Skip processing comments
            if (line.startsWith(':')) {
              continue;
            }

            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                console.log('End of stream marker received');
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                // Check for error
                if (parsed.error) {
                  const errorMsg = parsed.error.message || "Unknown error";
                  console.log(`Error in stream: ${errorMsg}`);
                  onError(`Error: ${errorMsg}`);
                  continue;
                }

                // Extract content from delta format
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                  const content = parsed.choices[0].delta.content;
                  if (content) {
                    console.log(`Content: "${content}"`);
                    onContent(content);
                  }
                }
              } catch (e) {
                console.log(`Error parsing JSON: ${e instanceof Error ? e.message : 'Unknown parsing error'}, Line: ${line}`);
              }
            }
          }
        }
      } catch (streamError: unknown) {
        const errorMessage = streamError instanceof Error ? streamError.message : "Unknown stream error";
        console.log(`Stream processing error: ${errorMessage}`);
        onError(`Stream processing error: ${errorMessage}`);
      } finally {
        reader.cancel();
      }
    } catch (error) {
      console.error("OpenRouter streaming error:", error);
      onError(error instanceof Error ? error.message : "Network or parsing error");
    }
  }
}