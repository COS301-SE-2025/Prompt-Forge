import { Editor } from './editorService';

export interface StreamingRequest {
  model: string;
  messages: Array<{
    role: string;
    content: any;
  }>;
  stream?: boolean;
}

export interface StreamingCallbacks {
  onContent: (content: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
  formatAsMarkdown?: boolean; // New option to control formatting (defaults to true)
}

export class StreamingService {
  private editorService: Editor;
  
  constructor() {
    this.editorService = new Editor();
  }
  
  /**
   * Handle streaming and non-streaming requests with comprehensive error handling
   */
  public async streamRequest(
    requestBody: StreamingRequest, 
    streamingEnabled: boolean,
    callbacks: StreamingCallbacks
  ) {
    // Ensure stream is set correctly
    requestBody.stream = streamingEnabled;
    
    try {
      if (streamingEnabled) {
        try {
          await this.editorService.promptOpenRouterStream(
            requestBody,
            (content: string) => {
              // Format the content based on the callback preference
              const formattedContent = this.formatResponse(content, callbacks.formatAsMarkdown ?? true);
              callbacks.onContent(formattedContent);
            },
            callbacks.onComplete,
            callbacks.onError
          );
        } catch (error) {
          console.error("Streaming error:", error);
          
          // Special handling for Llama models' 404 errors
          if (error instanceof Error && 
              (error.message.includes('404') || error.message.includes('not found')) && 
              requestBody.model.includes('llama')) {
            callbacks.onError(
              `The Meta Llama 4 model is currently unavailable (404 error). ` +
              `Meta occasionally takes this model offline for maintenance or updates. ` + 
              `Please try another model.`
            );
          } 
          // Handle rate limiting for Google models
          else if (error instanceof Error && 
                  error.message.includes('429') && 
                  requestBody.model.includes('google/gemini')) {
            callbacks.onError(
              `Google Gemini has reached its rate limit (429 error). ` +
              `This might be due to high usage or image processing limits. ` +
              `Please try again in a few minutes or try a different model.`
            );
          }
          // Generic error handler
          else {
            callbacks.onError(error instanceof Error ? error.message : "An unknown streaming error occurred");
          }
        }
      } else {
        try {
          const data = await this.editorService.promptOpenRouter(requestBody);
          
          if (data.choices && data.choices[0] && data.choices[0].message) {
            const responseText = data.choices[0].message.content;
            const formattedText = this.formatResponse(responseText, callbacks.formatAsMarkdown ?? true);
            callbacks.onContent(formattedText);
            callbacks.onComplete();
          } else if (data.error) {
            // Handle specific error codes
            if (data.error.status === 404 && requestBody.model.includes('llama')) {
              callbacks.onError(
                `The Meta Llama 4 model is currently unavailable (404 error). ` +
                `Meta occasionally takes this model offline for maintenance. ` +
                `Please try another model.`
              );
            } else if (data.error.status === 429 && requestBody.model.includes('google/gemini')) {
              callbacks.onError(
                `Google Gemini has reached its rate limit (429 error). ` +
                `This might be due to high usage or image processing limits. ` +
                `Please try again in a few minutes or try a different model.`
              );
            } else {
              callbacks.onError(data.error.message || JSON.stringify(data.error));
            }
          } else {
            callbacks.onError("Received unexpected response format");
          }
        } catch (error) {
          console.error("Non-streaming error:", error);
          
          // Special handling for different model-specific errors
          if (error instanceof Error) {
            if ((error.message.includes('404') || error.message.includes('not found')) && 
                requestBody.model.includes('llama')) {
              callbacks.onError(
                `The Meta Llama 4 model is currently unavailable (404 error). ` +
                `Meta occasionally takes this model offline for maintenance. ` +
                `Please try another model.`
              );
            } else if (error.message.includes('429') && requestBody.model.includes('google/gemini')) {
              callbacks.onError(
                `Google Gemini has reached its rate limit (429 error). ` +
                `This might be due to high usage or image processing limits. ` +
                `Please try again in a few minutes or try a different model.`
              );
            } else {
              callbacks.onError(error.message);
            }
          } else {
            callbacks.onError("An unknown error occurred");
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      callbacks.onError(errorMessage);
    }
  }
  
  /**
   * Improved image handling with OpenRouter-specific format
   */
  public createImageRequestBody(
    prompt: string, 
    image: string | null, 
    modelId: string,
    supportsImages: boolean
  ): StreamingRequest {
    // Clean the prompt text
    const defaultPlaceholder = "Write your prompt here...";
    let cleanPrompt = prompt.trim();
    
    if (cleanPrompt.includes(defaultPlaceholder) || !cleanPrompt) {
      cleanPrompt = "";
    }
    
    const minimalPrompt = "What is in this image?";
    
    // Case 1: Only image, no text - use minimal prompt
    if (!cleanPrompt && image && image !== "loading" && supportsImages) {
      // console.log(`Creating image-only request for model ${modelId} - OpenRouter format`);
      
      try {
        // Validate image
        if (!image.startsWith('data:image/')) {
          console.error("Invalid image format - doesn't start with data:image/");
          throw new Error("Invalid image format");
        }
        
        // For all models, use OpenRouter's standardized format
        // console.log("Using OpenRouter standard image format");
        
        return {
          model: modelId,
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: minimalPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }],
          stream: true
        };
      } catch (error) {
        console.error("Error processing image:", error);
        return {
          model: modelId,
          messages: [{
            role: "user",
            content: minimalPrompt
          }],
          stream: true
        };
      }
    } 
    // Case 2: Both text and image
    else if (cleanPrompt && image && image !== "loading" && supportsImages) {
      // console.log(`Creating text+image request for model ${modelId} - OpenRouter format`);
      
      try {
        // Check if image format is valid
        if (!image.startsWith('data:image/')) {
          console.error("Invalid image format - doesn't start with data:image/");
          throw new Error("Invalid image format");
        }
        
        // For all models, use OpenRouter's standardized format
        // console.log("Using OpenRouter standard image format");
        
        return {
          model: modelId,
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: cleanPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }],
          stream: true
        };
      } catch (error) {
        console.error("Error processing image:", error);
        return {
          model: modelId,
          messages: [{
            role: "user",
            content: cleanPrompt
          }],
          stream: true
        };
      }
    }
    // Case 3: Text only (no image or image not supported)
    else {
      // console.log(`Creating text-only request for model ${modelId}`);
      
      const finalPrompt = cleanPrompt || "Hello";
      
      return {
        model: modelId,
        messages: [{
          role: "user",
          content: finalPrompt
        }],
        stream: true
      };
    }
  }
  
  /**
   * Helper function to decode Unicode escape sequences
   */
  public decodeUnicode(str: string): string {
    if (!str) return str;

    return str
      // Handle newlines
      .replace(/\\n/g, '\n')
      // Decode Unicode escape sequences
      .replace(/\\u[\dA-F]{4}/gi, match =>
        String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
      )
      // Remove backslashes that are clearly escapes (but be very conservative)
      .replace(/\\(?!["\\/bfnrtu])/g, '');
  }

  /**
   * Format LLM response with options for markdown or plain text
   */
  public formatResponse(content: string, formatAsMarkdown: boolean = true): string {
    if (!content) return content;

    // First decode Unicode escape sequences
    let formatted = this.decodeUnicode(content);

    // Always remove ** bold markers and ## headers but keep the content
    // Handle both complete and potentially split markers
    const before = formatted;
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1');
    // Also handle any remaining single ** that might be split across chunks
    formatted = formatted.replace(/\*\*/g, '');
    // Remove markdown headers but keep the text
    formatted = formatted.replace(/^(#{1,6}\s+)(.+)$/gm, '$2');
    
    if (before !== formatted) {
      console.log('Removed ** markers and headers:', { before, after: formatted });
    }

    if (formatAsMarkdown) {
      // Keep other markdown formatting intact
      return formatted;
    } else {
      // Remove additional markdown formatting if requested
      return formatted
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')  // Remove links but keep text
        .replace(/`([^`]+)`/g, '$1')  // Remove inline code but keep content
        .trim();
    }
  }

  public validateAndOptimizeImage(imageDataUrl: string, modelId: string): string | null {
    try {
      // console.log(`Validating image for ${modelId}`);
      
      // Check for valid image format
      if (!imageDataUrl.startsWith('data:image/')) {
        console.error("Invalid image format");
        return null;
      }
      
      // Check image size - different limits for different models
      const sizeKB = Math.round(imageDataUrl.length / 1024);
      // console.log(`Image size: ${sizeKB}KB`);
      
      const maxSizeKB = modelId.includes("gemini") ? 10240 : 4096;
      
      if (sizeKB > maxSizeKB) {
        console.warn(`Image too large (${sizeKB}KB > ${maxSizeKB}KB), may cause errors`);
        // We could implement compression here if needed
      }
      
      return imageDataUrl;
    } catch (error) {
      console.error("Image validation error:", error);
      return null;
    }
  }

  /**
   * Convenience method to format LLM response content
   */
  public formatLLMResponse(content: string, keepMarkdown: boolean = true): string {
    return this.formatResponse(content, keepMarkdown);
  }

  /**
   * Strip all markdown formatting from LLM response
   */
  public stripMarkdownFormatting(content: string): string {
    return this.formatResponse(content, false);
  }

  /**
   * Keep markdown formatting in LLM response
   */
  public keepMarkdownFormatting(content: string): string {
    return this.formatResponse(content, true);
  }
}