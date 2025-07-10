"use client"

import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Save, History, HelpCircle, Copy, Download, RotateCcw, Play, Check, Star, Image, ImagePlus } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { ChevronUp, ChevronDown } from "lucide-react"
import { jsPDF } from 'jspdf';
import { Editor } from "@/services/editorService"

type ViewType = "test" | "rate" | "suggest";

const defaultPrompt = `Write your prompt here...

Example:
When writing a prompt, always follow these guidelines:
1. [Clearly define the task or question you want answered.]
2. [Specify any format or structure you expect in the response (e.g., list, paragraph, code block).]
3. [Include relevant context, constraints, or examples to guide the output.]
4. [If your prompt involves a specific topic or style, mention it explicitly and 
explain how the response should be adapted to fit.]`

export default function EditorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const editorService = new Editor();

  const [promptText, setPromptText] = useState(defaultPrompt)
  const [aiResponse, setAiResponse] = useState("AI response to your prompt here...")
  const [selectedModel, setSelectedModel] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>("test")
  const [currentPage, setCurrentPage] = useState(1)
  const [ratingResponse, setRatingResponse] = useState("")
  const [isLoadingRating, setIsLoadingRating] = useState(false)
  const [lastTestedPrompt, setLastTestedPrompt] = useState("")
  const [suggestionResponse, setSuggestionResponse] = useState("")
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const [lastSuggestedPrompt, setLastSuggestedPrompt] = useState("")
  const [modelsCollapsed, setModelsCollapsed] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill prompt if coming from a card
  useEffect(() => {
    if (location.state?.promptText) {
      setPromptText(location.state.promptText)
    }
  }, [location.state])

  // Define available models with their capabilities
  const aiModels = [
    {
      name: "Deepseek R1",
      shortName: "Deepseek",
      description: "Advanced reasoning and code generation",
      icon: "🔮",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      cardBg: "bg-violet-500/10 border-violet-500/20",
      selectedBg: "bg-violet-500/20 border-violet-500/40",
      textColor: "text-violet-400",
      glowColor: "hover:shadow-[0_0_15px_rgba(139,69,255,0.3)] hover:border-violet-500/50",
      selectedGlow: "shadow-[0_0_15px_rgba(139,69,255,0.4)] border-violet-500/60",
      available: true,
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      supportsImages: false,
    },
    {
      name: "Meta Llama 4 Maverick",
      shortName: "Llama-4",
      description: "Advanced coding, reasoning, long context, and image understanding",
      icon: "🦙",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      cardBg: "bg-green-500/10 border-green-500/20",
      selectedBg: "bg-green-500/20 border-green-500/40",
      textColor: "text-green-400",
      glowColor: "hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:border-green-500/50",
      selectedGlow: "shadow-[0_0_15px_rgba(34,197,94,0.4)] border-green-500/60",
      available: true,
      model: "meta-llama/llama-4-maverick:free",
      supportsImages: true,
    },
    {
      name: "Google Gemini 2.0 Flash",
      shortName: "Gemini-2",
      description: "Multimodal AI with image and text understanding capabilities",
      icon: "💎",
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
      cardBg: "bg-purple-500/10 border-purple-500/20",
      selectedBg: "bg-purple-500/20 border-purple-500/40",
      textColor: "text-purple-400",
      glowColor: "hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:border-purple-500/50",
      selectedGlow: "shadow-[0_0_15px_rgba(168,85,247,0.4)] border-purple-500/60",
      available: true,
      model: "google/gemini-2.0-flash-exp:free",
      supportsImages: true,
    },
    {
      name: "Kimi Dev 72B",
      shortName: "Kimi Dev",
      description: "Specialized for software engineering tasks and code generation",
      icon: "🧠",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
      cardBg: "bg-orange-500/10 border-orange-500/20",
      selectedBg: "bg-orange-500/20 border-orange-500/40",
      textColor: "text-orange-400",
      glowColor: "hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:border-orange-500/50",
      selectedGlow: "shadow-[0_0_15px_rgba(249,115,22,0.4)] border-orange-500/60",
      available: true,
      model: "moonshotai/kimi-dev-72b:free",
      supportsImages: false,
    },
    
  ]

  // Function to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to remove uploaded image
  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModelSelect = (index: number) => {
    setSelectedModel(index)
    setAiResponse(`Testing with ${aiModels[index].name}...`)
  }

  const decodeUnicode = (str: string) => {
    return str
      .replace(/\\u[\dA-F]{4}/gi, match =>
        String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
      )
      .replace(/\\n/g, '\n')
      .replace(/\\/g, '')
      .replace(/\*\*/g, '')  // Remove markdown bold
      .replace(/\*([^*]+)\*/g, '$1')  // Remove markdown italic
  }

  // Update the getRating function to handle different model capabilities
  const getRating = async (prompt: string, response: string) => {
    setIsLoadingRating(true)
    setRatingResponse("Rating your prompt...")

    // Create a simplified rating prompt for models that struggle with complex instructions
    const simpleRatingPrompt = `
      I need to rate this prompt on a scale of 1-10 and explain why:
      "${prompt}"
      
      The AI responded with:
      "${response}"
      
      Rating (1-10): 
      Explanation: 
      Improvement suggestions:
    `;

    // Create a detailed rating prompt for models that can handle complex instructions
    const detailedRatingPrompt = `
      Given this prompt:
      ---
      ${prompt}
      ---

      And this AI response:
      ---
      ${response}
      ---

      Please:
      1. Rate the effectiveness of the prompt (1-10)
      2. Explain why you gave this rating
      3. Provide specific suggestions to improve the prompt
      4. Point out any potential issues or ambiguities
    `;

    try {
      // Choose the appropriate prompt based on the model
      const useSimplePrompt = 
        aiModels[selectedModel].name.includes("Gemini") || 
        aiModels[selectedModel].name.includes("Llama");
      
      const ratingPrompt = useSimplePrompt ? simpleRatingPrompt : detailedRatingPrompt;

      const requestBody = {
        model: aiModels[selectedModel].model,
        messages: [{
          role: "user",
          content: ratingPrompt,
        }]
      };

      console.log("🚀 Rating request:", requestBody);
      const data = await editorService.promptOpenRouter(requestBody);
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        // Display rating immediately when ready
        setRatingResponse(decodeUnicode(data.choices[0].message.content))
      } else if (data.error) {
        // If the model has an error, try with a simpler prompt as fallback
        if (!useSimplePrompt) {
          // Try again with simpler prompt
          const fallbackRequestBody = {
            model: aiModels[selectedModel].model,
            messages: [{
              role: "user",
              content: simpleRatingPrompt,
            }]
          };
          
          console.log("🚀 Fallback rating request:", fallbackRequestBody);
          const fallbackData = await editorService.promptOpenRouter(fallbackRequestBody);
          
          if (fallbackData.choices && fallbackData.choices[0] && fallbackData.choices[0].message) {
            setRatingResponse(decodeUnicode(fallbackData.choices[0].message.content));
          } else {
            setRatingResponse(`Error: ${data.error.message || JSON.stringify(data.error)}`);
          }
        } else {
          setRatingResponse(`Error: ${data.error.message || JSON.stringify(data.error)}`);
        }
      } else {
        setRatingResponse("Could not generate rating - unexpected response format")
      }
    } catch (error) {
      console.error("❌ Rating error:", error);
      setIsLoadingRating(false); // Ensure loading state is reset
      
      // If error occurred, try a different model automatically
      try {
        // Find a model that's more reliable for ratings (like Deepseek or Kimi)
        const fallbackModelIndex = aiModels.findIndex(model => 
          model.name.includes("Deepseek") || model.name.includes("Kimi")
        );
        
        if (fallbackModelIndex !== -1 && fallbackModelIndex !== selectedModel) {
          setRatingResponse("Rating with original model failed. Trying with " + aiModels[fallbackModelIndex].name + "...");
          
          const fallbackRequestBody = {
            model: aiModels[fallbackModelIndex].model,
            messages: [{
              role: "user",
              content: detailedRatingPrompt,
            }]
          };
          
          const fallbackData = await editorService.promptOpenRouter(fallbackRequestBody);
          
          if (fallbackData.choices && fallbackData.choices[0] && fallbackData.choices[0].message) {
            setRatingResponse(decodeUnicode(fallbackData.choices[0].message.content) + 
              "\n\n(Rating provided by " + aiModels[fallbackModelIndex].name + ")");
          } else {
            throw new Error("Fallback model also failed");
          }
        } else {
          throw error; // Re-throw if no suitable fallback found
        }
      } catch (fallbackError) {
        setRatingResponse("Error generating rating. Please try another model: " + error);
      }
    } finally {
      setIsLoadingRating(false); // Double ensure loading state is reset
    }
  }

  const getSuggested = async (prompt: string, response: string) => {
    // Check if prompt has changed
    if (prompt === lastSuggestedPrompt) {
      setCurrentView("suggest")
      setCurrentPage(3)
      return
    }

    setIsLoadingSuggestion(true)
    setSuggestionResponse("Analyzing your prompt...")

    const suggestionPrompt = `
      Given this prompt:
      ---
      ${prompt}
      ---

      Please:
      1. Rewrite the prompt to improve its effectiveness
      2. Explain what improvements were made and why
      3. Provide alternative versions if applicable
      `
  
  try {
    // Fix: Add model field to the request
    const requestBody = {
      model: aiModels[selectedModel].model, // Added missing model field
      messages: [{
        role: "user",
        content: suggestionPrompt,
      }]
    }

    console.log("🚀 Suggestion request:", requestBody);
    const data = await editorService.promptOpenRouter(requestBody);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      setSuggestionResponse(decodeUnicode(data.choices[0].message.content))
      setLastSuggestedPrompt(prompt)
    } else if (data.error) {
      // Handle error in response
      setSuggestionResponse(`Error: ${data.error.message || JSON.stringify(data.error)}`)
    } else {
      setSuggestionResponse("Could not generate suggestions - unexpected response format")
    }
  } catch (error) {
    console.error("❌ Suggestion error:", error);
    setSuggestionResponse("Error analyzing prompt: " + error)
  } finally {
    setIsLoadingSuggestion(false)
  }
}

// Add this function after the getRating and getSuggested functions
const fallbackToWorkingModel = async () => {
  // Try models in order until one works
  const originalModel = selectedModel;
  let foundWorkingModel = false;
  
  setAiResponse("The selected model is unavailable. Trying alternative models...");
  
  for (let i = 0; i < aiModels.length; i++) {
    if (i === originalModel) continue; // Skip the one that failed
    
    try {
      console.log(`Trying model ${aiModels[i].name}...`);
      
      const testRequest = {
        model: aiModels[i].model,
        messages: [{
          role: "user",
          content: "Hello" // Simple test message
        }]
      };
      
      const response = await editorService.promptOpenRouter(testRequest);
      
      if (response.choices && response.choices[0] && !response.error) {
        // Found working model
        foundWorkingModel = true;
        setSelectedModel(i);
        setAiResponse(`Switched to ${aiModels[i].name} because the original model was unavailable. Try your prompt again.`);
        break;
      }
    } catch (error) {
      console.log(`Model ${aiModels[i].name} also failed`, error);
    }
  }
  
  if (!foundWorkingModel) {
    setSelectedModel(originalModel); // Revert to original model
    setAiResponse("All models are currently unavailable. Please try again later.");
  }
  
  setIsLoading(false);
};

  // Modify the testPrompt function to not automatically trigger rating and suggestion:
  const testPrompt = async () => {
  if (promptText === lastTestedPrompt && !uploadedImage) {
    setCurrentView("test")
    setCurrentPage(1)
    return
  }

  setIsLoading(true)
  setAiResponse("Generating response...")
  setCurrentView("test")
  setCurrentPage(1)

  try {
    let content: any;
    
    // Create content based on whether there's an image or not
    if (uploadedImage && aiModels[selectedModel].supportsImages) {
      content = [
        {
          type: "text",
          text: promptText
        },
        {
          type: "image_url",
          image_url: {
            url: uploadedImage
          }
        }
      ];
    } else {
      content = promptText;
    }

    // Create request body with the appropriate content format
    const requestBody = {
      model: aiModels[selectedModel].model,
      messages: [{
        role: "user",
        content: content
      }]
    };

    console.log("🚀 Test request:", requestBody);
    const data = await editorService.promptOpenRouter(requestBody);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiResponseText = data.choices[0].message.content
      setAiResponse(decodeUnicode(aiResponseText))
      setLastTestedPrompt(promptText)
      
      // REMOVE THESE LINES to prevent automatic rating and suggestion
      // getRating(promptText, decodeUnicode(aiResponseText))
      // getSuggested(promptText, decodeUnicode(aiResponseText))
    } else if (data.error) {
      // Format user-friendly error message
      let errorMessage = data.error.userMessage || data.error.message;
      
      // Special handling for common errors
      if (data.error.status === 503) {
        // Service unavailable - model not available
        errorMessage = `The selected model (${aiModels[selectedModel].name}) is currently unavailable.`;
        setAiResponse(`Error: ${errorMessage}\n\nAttempting to find a working model...`);
        
        // Try to find a working model
        fallbackToWorkingModel();
        return;
      } else if (data.error.status === 429) {
        // Rate limit
        errorMessage = "Rate limit exceeded. You've made too many requests to this model. Please try another model or wait a few minutes.";
      }
      
      setAiResponse(`Error: ${errorMessage}`);
    } else {
      setAiResponse("Received unexpected response format. Please try again.");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    setAiResponse(`Error: ${errorMessage}`)
  } finally {
    setIsLoading(false)
  }
}

  const handleReset = () => {
    setPromptText(defaultPrompt)
    setAiResponse("AI response to your prompt here...")
    setRatingResponse("")
    setLastTestedPrompt("")
    setLastSuggestedPrompt("")  // Clear last suggested prompt
    setSuggestionResponse("")
    handleRemoveImage(); // Clear uploaded image
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Optional: You can update the copy button temporarily to show success
      const copyButton = document.activeElement as HTMLButtonElement
      const originalContent = copyButton.innerHTML
      copyButton.innerHTML = '<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
      setTimeout(() => {
        copyButton.innerHTML = originalContent
      }, 1000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const downloadAsPDF = (promptText: string, aiResponse: string, modelName: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;

    // Add title and metadata
    doc.setFontSize(16);
    doc.text('Prompt Forge - Generated Response', margin, margin);

    // Add timestamp and model info
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + lineHeight);
    doc.text(`Model: ${modelName}`, margin, margin + (lineHeight * 2));

    // Add prompt section
    doc.setFontSize(12);
    doc.text('Prompt', margin, margin + (lineHeight * 4));
    doc.setFontSize(10);
    const promptLines = doc.splitTextToSize(promptText, pageWidth - (margin * 2));
    doc.text(promptLines, margin, margin + (lineHeight * 5));

    // Add response section
    const responseStartY = margin + (lineHeight * (6 + promptLines.length));
    doc.setFontSize(12);
    doc.text('Response:', margin, responseStartY);
    doc.setFontSize(10);
    const responseLines = doc.splitTextToSize(aiResponse, pageWidth - (margin * 2));
    doc.text(responseLines, margin, responseStartY + lineHeight);

    // Save the PDF
    doc.save(`prompt-response-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const selectedModelData = aiModels[selectedModel]

  // First, create a viewTitles mapping object
  const viewTitles: Record<ViewType, string> = {
    "test": "AI Models",
    "rate": "Rating Models",
    "suggest": "Suggestion Models"
  };

  // Replace the handleSavePrompt function with this simpler redirect:
  const handleSavePrompt = () => {
    // Check if user is authenticated
    const username = localStorage.getItem('username')
    if (!username || username === 'Guest') {
      alert("Please log in to save prompts")
      return
    }

    // Validate prompt content
    if (!promptText.trim() || promptText.trim() === defaultPrompt.trim()) {
      alert("Please write a valid prompt before saving")
      return
    }

    // Generate a title from the prompt (first 50 characters)
    const autoTitle = promptText.length > 50 
      ? promptText.substring(0, 50).trim() + "..."
      : promptText.trim()

    // Redirect to SubmitPromptPage with pre-filled data
    navigate('/submit', {
      state: {
        prefilled: {
          title: autoTitle,
          description: `Auto-saved prompt from Editor - ${new Date().toLocaleString()}`,
          content: promptText.trim(),
          tags: [],
          visibility: "private",
          price: 0,
          featured: false
        }
      }
    })
  }

  // Component for rendering model cards with glow effects
  const ModelCard = ({ model, index }: { model: any, index: number }) => (
    <Card
      key={index}
      className={`p-2 lg:p-3 transition-all duration-300 cursor-pointer group hover:scale-[1.02] relative ${
        selectedModel === index 
          ? `${model.selectedBg} shadow-lg ${model.glowColor.replace('hover:', '')}`
          : `${model.cardBg} ${model.glowColor}`
      }`}
      onClick={() => handleModelSelect(index)}
    >
      {selectedModel === index && (
        <div className="absolute top-1 right-1 lg:top-2 lg:right-2">
          <div
            className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full ${model.iconBg} flex items-center justify-center`}
          >
            <Check className="h-2 w-2 lg:h-3 lg:w-3 text-white" />
          </div>
        </div>
      )}
      <div className="flex items-start space-x-2">
        <div
          className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg ${model.iconBg} flex items-center justify-center text-white text-sm lg:text-base shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`}
        >
          {model.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs lg:text-sm font-semibold ${model.textColor} mb-1 truncate`}>
            {model.name}
          </h4>
          <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
            {model.description}
          </p>
          {model.supportsImages && (
            <div className="mt-1">
              <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded">
                📷 Supports Images
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )

  // Update the Save button (remove the complex state management):
  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
        {/* Left Panel - Prompt Editor */}
        <div className="bg-background border-r border-border p-3 lg:p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-foreground">Prompt Editor</h2>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 lg:h-8 lg:w-8"
                onClick={handleSavePrompt}
                title="Save prompt"
              >
                <Save className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8">
                <History className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
              {/*Link HelpCircle to help page */}
              <Link to="/help">
                <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8">
                  <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 bg-gray-100 dark:bg-card rounded-lg p-3 mb-3 min-h-0">
            <textarea
              className="w-full h-full bg-transparent resize-none focus:outline-none text-xs lg:text-sm text-gray-800 dark:text-foreground placeholder:text-gray-500 dark:placeholder:text-muted-foreground"
              placeholder="Write your prompt here..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>

          {/* Image upload section - only show for models that support images */}
          {aiModels[selectedModel].supportsImages && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">Image Input</h3>
                {uploadedImage && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs text-red-500"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              {!uploadedImage ? (
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    Click to upload an image or drag and drop
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="w-full h-auto max-h-40 object-contain rounded-lg" 
                  />
                </div>
              )}
            </div>
          )}

          {/* Bottom action bar */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{promptText.length} chars</div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-8" 
                onClick={testPrompt}
              >
                <Play className="h-3 w-3 mr-1" />
                Test Prompt
              </Button>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8"
                onClick={() => {
                  // If previous attempt failed, ensure loading state is reset
                  setIsLoadingRating(false);
                  
                  // Retry logic for rating
                  if (lastTestedPrompt) {
                    setCurrentView("rate");
                    setCurrentPage(2);
                    
                    // Add a small delay before making the API call
                    setRatingResponse("Preparing to rate your prompt...");
                    setTimeout(() => {
                      getRating(lastTestedPrompt, aiResponse);
                    }, 1000); // 1 second delay
                  } else if (promptText) {
                    // If no test has been run but there's prompt text, let user know
                    setCurrentView("rate");
                    setCurrentPage(2);
                    setRatingResponse("Please test your prompt first before rating.");
                  } else {
                    setCurrentView("rate");
                    setCurrentPage(2);
                  }
                }}
              >
                <Star className="h-3 w-3 mr-1" />
                Rate
              </Button>
              <Button
                size="sm"
                className="bg-violet-500 hover:bg-violet-600 text-white text-xs h-8"
                onClick={() => {
                  setCurrentView("suggest");
                  setCurrentPage(3);
                  
                  // Only make API call if we have a tested prompt
                  if (lastTestedPrompt) {
                    setSuggestionResponse("Preparing suggestions...");
                    // Add a small delay before making the API call
                    setTimeout(() => {
                      getSuggested(lastTestedPrompt, aiResponse);
                    }, 1000); // 1 second delay
                  } else {
                    setSuggestionResponse("Please test your prompt first before requesting suggestions.");
                  }
                }}
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Suggest
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Content remains mostly the same but update AI model section */}
        <div className="bg-background p-3 lg:p-4 flex flex-col min-h-0 overflow-hidden">
          <h2 className="text-lg lg:text-xl font-semibold text-foreground mb-3 lg:mb-4">
            {currentView === "test" ? "Test Your Prompt" : currentView === "rate" ? "Rate Prompt" : "Suggested Improvements"}
          </h2>

          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {currentView === "test" ? (
              <>
                {/* AI Response */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">AI Response</h3>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(aiResponse)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => downloadAsPDF(promptText, aiResponse, aiModels[selectedModel].name)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-3 flex-1 min-h-0 relative" 
                    style={{ 
                      height: modelsCollapsed ? 'calc(100vh - 140px)' : 'calc(100vh - 220px)'
                    }}
                  >
                    <div className="absolute inset-0 p-3 overflow-y-auto">
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          <span>Generating response...</span>
                        </div>
                      ) : (
                        <pre className="text-xs lg:text-sm text-muted-foreground whitespace-pre-wrap">
                          {aiResponse}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Models */}
                <div className="flex-shrink-0 mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">
                      {viewTitles[currentView]}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setModelsCollapsed(!modelsCollapsed)}
                    >
                      <div className="transform transition-transform duration-300">
                        {modelsCollapsed ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronUp className="h-3 w-3" />
                        )}
                      </div>
                    </Button>
                  </div>

                  <div 
                    className={`
                      grid grid-cols-2 gap-2
                      transform-gpu transition-all duration-300 ease-in-out
                      origin-top
                      ${modelsCollapsed 
                        ? 'opacity-0 max-h-0 scale-y-95 overflow-hidden' 
                        : 'opacity-100 max-h-[500px] scale-y-100'
                      }
                    `}
                  >
                    {aiModels.map((model, index) => (
                      <ModelCard key={index} model={model} index={index} />
                    ))}
                  </div>
                </div>

                {/* Pagination for Test View */}
                <div className="flex items-center justify-center space-x-2 flex-shrink-0">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page)
                        if (page === 2) setCurrentView("rate")
                        else if (page === 3) setCurrentView("suggest")
                        else setCurrentView("test")
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-[#3ebb9e] text-white shadow-md"
                          : "bg-[#3ebb9e]/20 text-[#3ebb9e] hover:bg-[#3ebb9e]/30"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </>
            ) : currentView === "rate" ? (
              <>
                {/* Rating Response Area */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-3 flex-1 min-h-0 relative" 
                    style={{ 
                      height: modelsCollapsed ? 'calc(100vh - 140px)' : 'calc(100vh - 220px)'
                    }}
                  >
                    <div className="absolute inset-0 p-3 overflow-y-auto">
                      {isLoadingRating ? (
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4 animate-spin text-amber-500" />
                          <span className="text-amber-500">Rating your prompt...</span>
                        </div>
                      ) : (
                        <pre className="text-xs lg:text-sm text-gray-800 dark:text-foreground whitespace-pre-wrap">
                          {ratingResponse || "Click 'Rate' button to analyze your prompt..."}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating Models */}
                <div className="flex-shrink-0 mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">
                      {viewTitles[currentView]}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setModelsCollapsed(!modelsCollapsed)}
                    >
                      <div className="transform transition-transform duration-300">
                        {modelsCollapsed ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronUp className="h-3 w-3" />
                        )}
                      </div>
                    </Button>
                  </div>

                  <div 
                    className={`
                      grid grid-cols-2 gap-2
                      transform-gpu transition-all duration-300 ease-in-out
                      origin-top
                      ${modelsCollapsed 
                        ? 'opacity-0 max-h-0 scale-y-95 overflow-hidden' 
                        : 'opacity-100 max-h-[500px] scale-y-100'
                      }
                    `}
                  >
                    {aiModels.map((model, index) => (
                      <ModelCard key={index} model={model} index={index} />
                    ))}
                  </div>
                </div>

                {/* Pagination for Rate View */}
                <div className="flex items-center justify-center space-x-2 flex-shrink-0">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page)
                        if (page === 1) setCurrentView("test")
                        else if (page === 3) setCurrentView("suggest")
                        else setCurrentView("rate")
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-[#3ebb9e] text-white shadow-md"
                          : "bg-[#3ebb9e]/20 text-[#3ebb9e] hover:bg-[#3ebb9e]/30"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Suggestion Response Area */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-3 flex-1 min-h-0 relative" 
                    style={{ 
                      height: modelsCollapsed ? 'calc(100vh - 140px)' : 'calc(100vh - 220px)'
                    }}
                  >
                    <div className="absolute inset-0 p-3 overflow-y-auto">
                      {isLoadingSuggestion ? (
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4 animate-spin text-violet-500" />
                          <span className="text-violet-500">Generating suggestions...</span>
                        </div>
                      ) : (
                        <pre className="text-xs lg:text-sm text-gray-800 dark:text-foreground whitespace-pre-wrap">
                          {suggestionResponse || "Click 'Suggest' button to get prompt improvements..."}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestion Models */}
                <div className="flex-shrink-0 mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">
                      {viewTitles[currentView]}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setModelsCollapsed(!modelsCollapsed)}
                    >
                      <div className="transform transition-transform duration-300">
                        {modelsCollapsed ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronUp className="h-3 w-3" />
                        )}
                      </div>
                    </Button>
                  </div>

                  <div 
                    className={`
                      grid grid-cols-2 gap-2
                      transform-gpu transition-all duration-300 ease-in-out
                      origin-top
                      ${modelsCollapsed 
                        ? 'opacity-0 max-h-0 scale-y-95 overflow-hidden' 
                        : 'opacity-100 max-h-[500px] scale-y-100'
                      }
                    `}
                  >
                    {aiModels.map((model, index) => (
                      <ModelCard key={index} model={model} index={index} />
                    ))}
                  </div>
                </div>

                {/* Pagination for Suggest View */}
                <div className="flex items-center justify-center space-x-2 flex-shrink-0">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page)
                        if (page === 1) setCurrentView("test")
                        else if (page === 2) setCurrentView("rate")
                        else if (page === 3) setCurrentView("suggest")
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-[#3ebb9e] text-white shadow-md"
                          : "bg-[#3ebb9e]/20 text-[#3ebb9e] hover:bg-[#3ebb9e]/30"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between flex-shrink-0">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-8" onClick={handleReset}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

