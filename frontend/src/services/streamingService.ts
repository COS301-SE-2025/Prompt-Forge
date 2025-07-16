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
            callbacks.onContent,
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
            callbacks.onContent(responseText);
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
   * Improved image handling with better validation and logging
   */
  public createImageRequestBody(
    prompt: string, 
    image: string | null, 
    modelId: string,
    supportsImages: boolean // Add this parameter
  ): StreamingRequest {
    let content: any;
    
    // Only include image if model supports it
    if (image && image !== "loading" && supportsImages) {
      console.log(`Creating image request for model ${modelId} that supports images`);
      
      try {
        // Check if image format is valid
        if (!image.startsWith('data:image/')) {
          console.error("Invalid image format - doesn't start with data:image/");
          throw new Error("Invalid image format");
        }
        
        // For Llama models - OpenRouter endpoint seems to have issues with Llama 4 images
        if (modelId.includes("llama")) {
          // Extract media type and base64 data
          const mediaType = image.split(';')[0].split(':')[1] || "image/jpeg";
          const base64Data = image.split(',')[1];
          
          if (!base64Data || base64Data.length < 1000) {
            console.error("Image data appears corrupted or too small");
            throw new Error("Invalid image data");
          }
          
          console.log(`Using Llama 4 image format with media type: ${mediaType}`);
          
          // This is the format Llama 4 is supposed to use, but may still fail due to API issues
          content = [
            { type: "text", text: prompt },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data
              }
            }
          ];
          
          // For debugging - log a sample of the image data
          console.log(`Image data sample: ${base64Data.substring(0, 20)}...`);
        } 
        // For Gemini models
        else if (modelId.includes("gemini")) {
          console.log("Using Gemini image format");
          
          // Check if image is too large for Gemini (typically has ~10MB limit)
          if (image.length > 10 * 1024 * 1024) {
            console.warn("Image may be too large for Gemini - expect possible errors");
          }
          
          content = [
            { type: "text", text: prompt },
            {
              type: "image",
              image_url: { url: image }
            }
          ];
        }
        // Generic fallback for other models
        else {
          console.log("Using generic image format");
          content = [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: image }
            }
          ];
        }
      } catch (error) {
        console.error("Error processing image:", error);
        content = prompt;
      }
    } else {
      console.log(`Creating text-only request for model ${modelId}`);
      content = prompt;
    }
    
    return {
      model: modelId,
      messages: [{
        role: "user",
        content: content
      }]
    };
  }
  
  /**
   * Helper function to decode Unicode escape sequences
   */
  public decodeUnicode(str: string): string {
    return str
      .replace(/\\u[\dA-F]{4}/gi, match =>
        String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
      )
      .replace(/\\n/g, '\n')
      .replace(/\\/g, '')
      .replace(/\*\*/g, '')  // Remove markdown bold
      .replace(/\*([^*]+)\*/g, '$1')  // Remove markdown italic
  }

  /**
   * Validate and optimize an image before processing
   */
  public validateAndOptimizeImage(imageDataUrl: string, modelId: string): string | null {
    try {
      console.log(`Validating image for ${modelId}`);
      
      // Check for valid image format
      if (!imageDataUrl.startsWith('data:image/')) {
        console.error("Invalid image format");
        return null;
      }
      
      // Check image size - different limits for different models
      const sizeKB = Math.round(imageDataUrl.length / 1024);
      console.log(`Image size: ${sizeKB}KB`);
      
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
}