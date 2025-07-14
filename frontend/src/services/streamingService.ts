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
  
  public async streamRequest(
    requestBody: StreamingRequest, 
    streamingEnabled: boolean,
    callbacks: StreamingCallbacks
  ) {
    // Ensure stream is set correctly
    requestBody.stream = streamingEnabled;
    
    try {
      if (streamingEnabled) {
        await this.editorService.promptOpenRouterStream(
          requestBody,
          callbacks.onContent,
          callbacks.onComplete,
          callbacks.onError
        );
      } else {
        const data = await this.editorService.promptOpenRouter(requestBody);
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const responseText = data.choices[0].message.content;
          callbacks.onContent(responseText);
          callbacks.onComplete();
        } else if (data.error) {
          callbacks.onError(data.error.message || JSON.stringify(data.error));
        } else {
          callbacks.onError("Received unexpected response format");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      callbacks.onError(errorMessage);
    }
  }
  
  public createImageRequestBody(
    prompt: string, 
    image: string | null, 
    modelId: string
  ): StreamingRequest {
    let content: any;
    
    if (image) {
      // For Llama models
      if (modelId.includes("llama")) {
        content = [
          { type: "text", text: prompt },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: image.split(';')[0].split(':')[1], // e.g. "image/jpeg"
              data: image.split(',')[1] // Get the base64 data part
            }
          }
        ];
      } 
      // For Gemini models
      else if (modelId.includes("gemini")) {
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
        content = [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: image }
          }
        ];
      }
    } else {
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
}