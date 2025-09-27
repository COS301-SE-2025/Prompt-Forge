"use client"

import { API_BASE_URL } from '../config/api';
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Save, HelpCircle, Copy, RotateCcw, Play, Star, X, ArrowLeftRight, ChevronUp, ChevronDown, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTypingEffect } from "@/hooks/useTypingEffect";
import { StreamingDisplay } from "@/components/StreamingDisplay";
import { StreamingControls } from "@/components/StreamingControls";
import { StreamingService } from "@/services/streamingService";

const defaultPrompt = `Write your prompt here...

Example:
When writing a prompt, always follow these guidelines:
1. [Clearly define the task or question you want answered.]
2. [Specify any format or structure you expect in the response (e.g., list, paragraph, code block).]
3. [Include relevant context, constraints, or examples to guide the output.]
4. [If your prompt involves a specific topic or style, mention it explicitly and 
explain how the response should be adapted to fit.]`

export default function ComparisonPage() {
  const navigate = useNavigate()
  const [promptTextA, setPromptTextA] = useState("")
  const [promptTextB, setPromptTextB] = useState("")
  const [aiResponseA, setAiResponseA] = useState("AI response to prompt A will appear here...")
  const [aiResponseB, setAiResponseB] = useState("AI response to prompt B will appear here...")
  const [selectedModelA, setSelectedModelA] = useState(0)
  const [selectedModelB, setSelectedModelB] = useState(1)
  const [isLoadingA, setIsLoadingA] = useState(false)
  const [isLoadingB, setIsLoadingB] = useState(false)
  const [showRatingPanel, setShowRatingPanel] = useState(false)
  const [ratingResponse, setRatingResponse] = useState("")
  const [isLoadingRating, setIsLoadingRating] = useState(false)
  const [showModelPanel, setShowModelPanel] = useState(false)
  const [responseACollapsed, setResponseACollapsed] = useState(false)
  const [responseBCollapsed, setResponseBCollapsed] = useState(false)
  const [editorACollapsed, setEditorACollapsed] = useState(false)
  const [editorBCollapsed, setEditorBCollapsed] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

  // Add streaming related state
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [typingSpeed, setTypingSpeed] = useState(75);
  const [showStreamingControls, setShowStreamingControls] = useState(false);

  // Initialize typing effects for both responses
  const typingEffectA = useTypingEffect({ 
    speed: typingSpeed, 
    batchSize: typingSpeed < 20 ? 3 : typingSpeed < 50 ? 2 : 1 
  });
  const typingEffectB = useTypingEffect({ 
    speed: typingSpeed, 
    batchSize: typingSpeed < 20 ? 3 : typingSpeed < 50 ? 2 : 1 
  });
  const typingEffectRating = useTypingEffect({ 
    speed: typingSpeed, 
    batchSize: typingSpeed < 20 ? 3 : typingSpeed < 50 ? 2 : 1 
  });

  // Create streaming service
  const streamingService = new StreamingService();

  // Update typing effects when speed changes
  useEffect(() => {
    typingEffectA.setSpeed(typingSpeed);
    typingEffectA.setBatchSize(typingSpeed < 20 ? 3 : typingSpeed < 50 ? 2 : 1);
    
    typingEffectB.setSpeed(typingSpeed);
    typingEffectB.setBatchSize(typingSpeed < 20 ? 3 : typingSpeed < 50 ? 2 : 1);
    
    typingEffectRating.setSpeed(typingSpeed);
    typingEffectRating.setBatchSize(typingSpeed < 20 ? 3 : typingSpeed < 50 ? 2 : 1);
  }, [typingSpeed]);

  // Update the model definitions to match EditorPage
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
      name: "Meta Llama 4 Scout",
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
      model: "meta-llama/llama-4-scout",
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

  // Use streamingService for response formatting
  const formatResponse = (content: string) => streamingService.keepMarkdownFormatting(content);

  // Update the testPrompt function to support streaming
  const testPrompt = async (side: "A" | "B") => {
    const promptText = side === "A" ? promptTextA : promptTextB;
    const setIsLoading = side === "A" ? setIsLoadingA : setIsLoadingB;
    const setAiResponse = side === "A" ? setAiResponseA : setAiResponseB;
    const modelIndex = side === "A" ? selectedModelA : selectedModelB;
    const typingEffect = side === "A" ? typingEffectA : typingEffectB;

    setIsLoading(true);
    
    if (streamingEnabled) {
      setAiResponse(""); // Clear for streaming
      typingEffect.clear();
    } else {
      setAiResponse("Generating response...");
    }

    try {
      // Create request body
      const requestBody = streamingService.createImageRequestBody(
        promptText,
        null, // No image support in comparison mode yet
        aiModels[modelIndex].model,
        aiModels[modelIndex].supportsImages // Add the missing parameter
      );

      // console.log(` Test request for side ${side}:`, requestBody);
      
      // Use streamingService to handle the request
      await streamingService.streamRequest(
        requestBody,
        streamingEnabled,
        {
          onContent: (content: string) => {
            if (streamingEnabled) {
              typingEffect.addText(content);
            } else {
              setAiResponse(formatResponse(content));
            }
          },
          onComplete: () => {
            setIsLoading(false);
            // Save the response if it was streaming
            if (streamingEnabled && typingEffect.displayText) {
              setAiResponse(typingEffect.displayText);
            }
          },
          onError: (error: string) => {
            setIsLoading(false);
            setAiResponse(`Error: ${error}`);
          }
        }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setAiResponse(`Error: ${errorMessage}`);
      setIsLoading(false);
    }
  }

  // Update the testBothPrompts function to include a delay between requests
  const testBothPrompts = async () => {
    // Test prompt A first
    await testPrompt("A");
    
    // Add a 1-second delay before testing prompt B to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Then test prompt B
    await testPrompt("B");
  }

  // Update the getRating function to match EditorPage's approach
  const getRating = async () => {
    setIsLoadingRating(true)
    setRatingResponse("Analyzing both responses...")

    // Create rating prompt
    const ratingPrompt = `
Compare these two AI responses to similar prompts:

Prompt A:
---
${promptTextA}
---

Response A (${aiModels[selectedModelA].name}):
---
${aiResponseA}
---

Prompt B:
---
${promptTextB}
---

Response B (${aiModels[selectedModelB].name}):
---
${aiResponseB}
---

Please provide:
1. A detailed comparison of both responses
2. Rate each response (1-10) and explain your ratings
3. Identify which response better addresses the prompt and why
4. Suggest improvements for both prompts
5. Highlight any significant differences in approach or quality
`;

    try {
      // Use a reliable model for comparison (Deepseek or Kimi)
      const reliableModelIndex = aiModels.findIndex(model => 
        model.name.includes("Deepseek") || model.name.includes("Kimi")
      );
      
      // Default to the first model if no "reliable" one is found
      const modelToUse = reliableModelIndex !== -1 ? reliableModelIndex : 0;
      
      const requestBody = {
        model: aiModels[modelToUse].model,
        messages: [{
          role: "user",
          content: ratingPrompt,
        }]
      };

      // console.log("Comparison rating request:", requestBody);
      
      const response = await fetch(`${API_BASE_URL}/test/openrouter/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setRatingResponse(formatResponse(data.choices[0].message.content));
      } else if (data.error) {
        let errorMessage = data.error.userMessage || data.error.message;
        
        // If rate limited, try a different model
        if (data.error.status === 429) {
          // Try a different model
          const alternativeIndex = aiModels.findIndex((_, i) => i !== modelToUse);
          if (alternativeIndex !== -1) {
            setRatingResponse("Rate limit exceeded. Trying with " + aiModels[alternativeIndex].name + "...");
            
            const fallbackRequestBody = {
              model: aiModels[alternativeIndex].model,
              messages: [{
                role: "user",
                content: ratingPrompt,
              }]
            };
            
            const fallbackResponse = await fetch(`${API_BASE_URL}/test/openrouter/chat`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(fallbackRequestBody),
            });
            
            const fallbackData = await fallbackResponse.json();
            
            if (fallbackData.choices && fallbackData.choices[0] && fallbackData.choices[0].message) {
              setRatingResponse(formatResponse(fallbackData.choices[0].message.content) + 
                "\n\n(Rating provided by " + aiModels[alternativeIndex].name + ")");
            } else {
              setRatingResponse(`Error: Could not generate comparison with any model. ${errorMessage}`);
            }
          } else {
            setRatingResponse(`Error: ${errorMessage}`);
          }
        } else {
          setRatingResponse(`Error: ${errorMessage}`);
        }
      } else {
        setRatingResponse("Could not generate comparison - unexpected response format");
      }
    } catch (error) {
      console.error("Comparison error:", error);
      setRatingResponse("Error generating comparison: " + error);
    } finally {
      setIsLoadingRating(false);
    }
  }

  const handleReset = () => {
    setPromptTextA("")
    setPromptTextB("")
    setAiResponseA("AI response to prompt A will appear here...")
    setAiResponseB("AI response to prompt B will appear here...")
    setRatingResponse("")
    setShowRatingPanel(false)
    
    // Clear typing effects
    typingEffectA.clear();
    typingEffectB.clear();
    typingEffectRating.clear();
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const swapPrompts = () => {
    const tempPrompt = promptTextA
    const tempResponse = aiResponseA
    const tempModel = selectedModelA

    setPromptTextA(promptTextB)
    setAiResponseA(aiResponseB)
    setSelectedModelA(selectedModelB)

    setPromptTextB(tempPrompt)
    setAiResponseB(tempResponse)
    setSelectedModelB(tempModel)
  }

  const handleSavePrompt = (side: "A" | "B") => {
    const promptText = side === "A" ? promptTextA : promptTextB
    
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
          title: `${autoTitle} (Prompt ${side})`,
          description: `Auto-saved prompt ${side} from Comparison Page - ${new Date().toLocaleString()}`,
          content: promptText.trim(),
          tags: [],
          visibility: "private",
          price: 0,
          featured: false
        }
      }
    })
  }

  // Page transition effects
  const [pageLoaded, setPageLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Compute the style for animation
  const animationStyle = pageLoaded
    ? { opacity: 1, transform: "scale(1)" }
    : { opacity: 0, transform: "scale(0.95)" }

  return (
    <div
      className="flex-1 flex flex-col w-full h-[calc(100vh-64px)] bg-background transition-all duration-700"
      style={{
        ...animationStyle,
        willChange: "opacity, transform",
      }}
    >
      <div className="flex-1 flex min-h-0">
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          showRatingPanel || showModelPanel ? "mr-0 sm:mr-96" : ""
        }`}>
          {/* Grid container - stack on mobile, side-by-side on large screens */}
          <div className="h-[calc(100%-48px)] grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
            
            {/* Left Panel - Prompt A */}
            <div className="bg-background border-r border-border p-2 sm:p-3 lg:p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">Prompt A</h2>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                    onClick={() => handleSavePrompt("A")}
                    title="Save Prompt A"
                  >
                    <Save className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" onClick={handleReset}>
                    <RotateCcw className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                    onClick={() => setShowHelpModal(true)}
                    title="Help & Tips"
                  >
                    <HelpCircle className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
              </div>

              {/* Prompt A Editor Section */}
              <div className={`min-h-0 flex flex-col transition-all duration-300 ${
                editorACollapsed ? "flex-none h-auto" : "flex-none h-48 sm:h-56 lg:h-64"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-xs lg:text-sm font-medium text-muted-foreground">Prompt A</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    onClick={() => setEditorACollapsed(!editorACollapsed)}
                  >
                    {editorACollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                  </Button>
                </div>
                {!editorACollapsed && (
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-2 sm:p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <textarea
                      className="w-full h-full bg-transparent resize-none focus:outline-none text-xs sm:text-xs lg:text-sm text-gray-800 dark:text-foreground placeholder:text-white-400/50 custom-scrollbar"
                      placeholder="Write your first prompt here...

Example:
When writing a prompt, always follow these guidelines:
1. [Clearly define the task or question you want answered.]
2. [Specify any format or structure you expect in the response (e.g., list, paragraph, code block).]
3. [Include relevant context, constraints, or examples to guide the output.]
4. [If your prompt involves a specific topic or style, mention it explicitly and 
explain how the response should be adapted to fit.]"
                      value={promptTextA}
                      onChange={(e) => setPromptTextA(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Response A */}
              <div className={`flex-1 min-h-0 flex flex-col transition-all duration-300 ${responseACollapsed ? "flex-none h-auto" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-xs lg:text-sm font-medium text-muted-foreground">Response A</h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      onClick={() => setResponseACollapsed(!responseACollapsed)}
                    >
                      {responseACollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      onClick={() => copyToClipboard(aiResponseA)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {!responseACollapsed && (
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-2 sm:p-3 flex-1 min-h-0 max-h-[550px] relative overflow-hidden transition-all duration-300">
                    <div className="h-full overflow-y-auto custom-scrollbar">
                      <StreamingDisplay
                        content={streamingEnabled ? typingEffectA.displayText : aiResponseA}
                        isLoading={isLoadingA}
                        streamingEnabled={streamingEnabled}
                        placeholder="AI response to prompt A will appear here..."
                        className="text-xs sm:text-xs lg:text-sm text-gray-700 dark:text-muted-foreground whitespace-pre-wrap"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 sm:mt-3">
                <div className="text-xs text-muted-foreground">{promptTextA.length} chars</div>
              </div>
            </div>

            {/* Right Panel - Prompt B - Apply similar responsive classes */}
            <div className="bg-background p-2 sm:p-3 lg:p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">Prompt B</h2>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                    onClick={() => handleSavePrompt("B")}
                    title="Save Prompt B"
                  >
                    <Save className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" onClick={handleReset}>
                    <RotateCcw className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                    onClick={() => setShowHelpModal(true)}
                    title="Help & Tips"
                  >
                    <HelpCircle className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
              </div>

              {/* Prompt B Editor Section */}
              <div className={`min-h-0 flex flex-col transition-all duration-300 ${
                editorBCollapsed ? "flex-none h-auto" : "flex-none h-48 sm:h-56 lg:h-64"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-xs lg:text-sm font-medium text-muted-foreground">Prompt B</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    onClick={() => setEditorBCollapsed(!editorBCollapsed)}
                  >
                    {editorBCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                  </Button>
                </div>
                {!editorBCollapsed && (
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-2 sm:p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <textarea
                      className="w-full h-full bg-transparent resize-none focus:outline-none text-xs sm:text-xs lg:text-sm text-gray-800 dark:text-foreground placeholder:text-white-400/50 custom-scrollbar"
                      placeholder="Write your second prompt here...

Example:
When writing a prompt, always follow these guidelines:
1. [Clearly define the task or question you want answered.]
2. [Specify any format or structure you expect in the response (e.g., list, paragraph, code block).]
3. [Include relevant context, constraints, or examples to guide the output.]
4. [If your prompt involves a specific topic or style, mention it explicitly and 
explain how the response should be adapted to fit.]"
                      value={promptTextB}
                      onChange={(e) => setPromptTextB(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Response B */}
              <div className={`flex-1 min-h-0 flex flex-col transition-all duration-300 ${responseBCollapsed ? "flex-none h-auto" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-xs lg:text-sm font-medium text-muted-foreground">Response B</h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      onClick={() => setResponseBCollapsed(!responseBCollapsed)}
                    >
                      {responseBCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      onClick={() => copyToClipboard(aiResponseB)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {!responseBCollapsed && (
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-2 sm:p-3 flex-1 min-h-0 max-h-[550px] relative overflow-hidden transition-all duration-300">
                    <div className="h-full overflow-y-auto custom-scrollbar">
                      <StreamingDisplay
                        content={streamingEnabled ? typingEffectB.displayText : aiResponseB}
                        isLoading={isLoadingB}
                        streamingEnabled={streamingEnabled}
                        placeholder="AI response to prompt B will appear here..."
                        className="text-xs sm:text-xs lg:text-sm text-gray-700 dark:text-muted-foreground whitespace-pre-wrap"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 sm:mt-3">
                <div className="text-xs text-muted-foreground">{promptTextB.length} chars</div>
              </div>
            </div>
          </div>

          {/* Bottom action bar - make it wrap on mobile */}
          <div className="h-auto min-h-[48px] border-t border-border px-2 sm:px-3 bg-background flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground text-xs h-7 sm:h-8" 
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Button
                size="sm"
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-7 sm:h-8"
                onClick={testBothPrompts}
                disabled={isLoadingA || isLoadingB}
              >
                <Play className="h-3 w-3 mr-1" />
                Test Both
              </Button>
              <Button
                size="sm"
                className="bg-violet-500 hover:bg-violet-600 text-white text-xs h-7 sm:h-8"
                onClick={() => setShowModelPanel(true)}
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Models
              </Button>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 sm:h-8"
                onClick={() => {
                  setShowRatingPanel(true)
                  getRating()
                }}
              >
                <Star className="h-3 w-3 mr-1" />
                Rate
              </Button>
            </div>
          </div>
        </div>

        {/* Rating Side Panel - Full screen on mobile */}
        {showRatingPanel && (
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Comparison Rating</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setShowRatingPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 p-3 sm:p-4 overflow-hidden">
              <div className="bg-gray-100 dark:bg-muted rounded-lg p-3 sm:p-4 h-full overflow-y-auto custom-scrollbar">
                {isLoadingRating ? (
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing responses...</span>
                  </div>
                ) : (
                  <StreamingDisplay
                    content={streamingEnabled ? typingEffectRating.displayText : ratingResponse}
                    isLoading={isLoadingRating}
                    streamingEnabled={streamingEnabled}
                    placeholder="Click 'Rate' to compare both responses..."
                    className="text-sm text-gray-700 dark:text-muted-foreground whitespace-pre-wrap"
                  />
                )}
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Model A: {aiModels[selectedModelA].shortName}</span>
                <span>Model B: {aiModels[selectedModelB].shortName}</span>
              </div>
              <Button
                size="sm"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 sm:h-8"
                onClick={getRating}
                disabled={isLoadingRating}
              >
                <Star className="h-3 w-3 mr-1" />
                Refresh Rating
              </Button>
            </div>
          </div>
        )}

        {/* Model Selection Side Panel - Full screen on mobile */}
        {showModelPanel && (
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Select Models</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setShowModelPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 p-2 sm:p-3 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar">
              {/* Model A Selection */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Model for Prompt A
                </h4>
                <div className="space-y-1.5">
                  {aiModels.map((model, index) => (
                    <Card
                      key={index}
                      className={`p-2 sm:p-2 transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${
                        selectedModelA === index 
                          ? `${model.selectedBg} ${model.selectedGlow}`
                          : `${model.cardBg} ${model.glowColor}`
                      }`}
                      onClick={() => setSelectedModelA(index)}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg ${model.iconBg} flex items-center justify-center text-white text-sm shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`}
                        >
                          {model.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-semibold ${model.textColor} mb-0.5`}>
                            {model.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                            {model.description}
                          </p>
                        </div>
                        {selectedModelA === index && (
                          <div className="w-3 h-3 rounded-full bg-[#3ebb9e] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Model B Selection - Similar responsive updates */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Model for Prompt B
                </h4>
                <div className="space-y-1.5">
                  {aiModels.map((model, index) => (
                    <Card
                      key={index}
                      className={`p-2 sm:p-2 transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${
                        selectedModelB === index 
                          ? `${model.selectedBg} ${model.selectedGlow}`
                          : `${model.cardBg} ${model.glowColor}`
                      }`}
                      onClick={() => setSelectedModelB(index)}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg ${model.iconBg} flex items-center justify-center text-white text-sm shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`}
                        >
                          {model.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-semibold ${model.textColor} mb-0.5`}>
                            {model.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                            {model.description}
                          </p>
                        </div>
                        {selectedModelB === index && (
                          <div className="w-3 h-3 rounded-full bg-[#3ebb9e] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>A: {aiModels[selectedModelA].shortName}</span>
                <span>B: {aiModels[selectedModelB].shortName}</span>
              </div>
              <Button
                size="sm"
                className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-7 sm:h-8"
                onClick={() => setShowModelPanel(false)}
              >
                Apply Selection
              </Button>
            </div>
          </div>
        )}

        {/* Streaming Controls Panel - already responsive */}
        {showStreamingControls && (
          <StreamingControls
            streamingEnabled={streamingEnabled}
            setStreamingEnabled={setStreamingEnabled}
            typingSpeed={typingSpeed}
            setTypingSpeed={setTypingSpeed}
            isLoading={isLoadingA || isLoadingB || isLoadingRating}
            isTyping={typingEffectA.isTyping || typingEffectB.isTyping || typingEffectRating.isTyping}
            onSkipAnimation={() => {
              if (typingEffectA.isTyping) typingEffectA.complete();
              if (typingEffectB.isTyping) typingEffectB.complete();
              if (typingEffectRating.isTyping) typingEffectRating.complete();
            }}
          />
        )}
      </div>

      {/* Help Modal - Comparison Guide */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 custom-scrollbar">
          <div className="bg-background border border-border rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Comparison Mode Guide</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelpModal(false)}
                className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Close help modal"
              >
                <span className="text-lg">✕</span>
              </Button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Getting Started */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  Getting Started
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">1.</span>
                    <p>Write your first prompt in the left panel (Prompt A)</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">2.</span>
                    <p>Write your second prompt in the right panel (Prompt B)</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">3.</span>
                      <p>Click Test Both to see AI responses:</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">4.</span>
                    <p>Use the Models button to select different AI models for each prompt</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">5.</span>
                      <p>Click Rate to compare both responses:</p>
                  </div>
                </div>
              </section>

              {/* Available AI Models */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  AI Models
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🔮</span>
                      <span className="font-semibold text-violet-400 text-sm">Deepseek R1</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Best for reasoning and code generation</p>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🦙</span>
                      <div>
                        <span className="font-semibold text-green-400 text-sm">Meta Llama 4</span>
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded ml-2">📷</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Advanced coding, reasoning, and image understanding</p>
                  </div>
                  
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">💎</span>
                      <div>
                        <span className="font-semibold text-purple-400 text-sm">Google Gemini 2.0</span>
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded ml-2">📷</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Multimodal AI with excellent image capabilities</p>
                  </div>
                  
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🧠</span>
                      <span className="font-semibold text-orange-400 text-sm">Kimi Dev 72B</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Specialized for software engineering tasks</p>
                  </div>
                </div>
              </section>

              {/* Comparison Features */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  Comparison Features
                </h3>
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-[#3ebb9e] text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                        A
                      </div>
                      <div className="w-8 h-8 bg-[#3ebb9e] text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                        B
                      </div>
                      <h4 className="text-base font-bold text-foreground">Side-by-Side Testing</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Test two different prompts simultaneously and compare their results. Perfect for A/B testing prompt variations.
                    </p>
                    <div className="bg-muted/30 p-2 rounded text-xs font-medium text-muted-foreground">
                      Perfect for: Testing variations, prompt optimization, finding the best approach
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                        ★
                      </div>
                      <h4 className="text-base font-bold text-foreground">AI-Powered Rating</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get detailed comparison analysis including ratings, explanations, and suggestions for improvement.
                    </p>
                    <div className="bg-muted/30 p-2 rounded text-xs font-medium text-muted-foreground">
                      Perfect for: Objective analysis, understanding differences, making decisions
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-violet-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                        🔄
                      </div>
                      <h4 className="text-base font-bold text-foreground">Model Flexibility</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use different AI models for each prompt to see how various models handle the same task.
                    </p>
                    <div className="bg-muted/30 p-2 rounded text-xs font-medium text-muted-foreground">
                      Perfect for: Model comparison, finding the best model for specific tasks
                    </div>
                  </div>
                </div>
              </section>

              {/* Advanced Features */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  Advanced Features
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">📊</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Collapse Panels</h4>
                      <p className="text-xs text-muted-foreground">
                        Collapse editor or response panels to focus on specific content areas.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">💾</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Save Individual Prompts</h4>
                      <p className="text-xs text-muted-foreground">
                        Save Prompt A or Prompt B separately using the Save A and Save B buttons.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">📁</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Export Options</h4>
                      <p className="text-xs text-muted-foreground">
                        Copy responses to clipboard using the copy buttons on each response panel.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">⚙️</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Streaming Controls</h4>
                      <p className="text-xs text-muted-foreground">
                        Adjust response typing speed and streaming settings for both panels.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Best Practices */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  Best Practices
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Test small variations to find optimal wording</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Use different models to see varied perspectives</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Compare context vs. no context versions</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Test different instruction formats</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Use the rating feature for objective analysis</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Save successful prompts for future use</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Test with same model for fair comparison</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Use Reset to start fresh comparisons</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Common Use Cases */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  Common Use Cases
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">A/B Testing Prompts</h4>
                    <p className="text-xs text-muted-foreground">
                      Compare two versions of the same prompt to see which produces better results. Test different approaches, wording, or structures.
                    </p>
                  </div>
                  
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Model Performance Testing</h4>
                    <p className="text-xs text-muted-foreground">
                      Use the same prompt with different AI models to see which one handles your specific task better.
                    </p>
                  </div>
                  
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Context vs. No Context</h4>
                    <p className="text-xs text-muted-foreground">
                      Compare responses with detailed context against minimal prompts to find the optimal balance.
                    </p>
                  </div>
                  
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Format Comparison</h4>
                    <p className="text-xs text-muted-foreground">
                      Test different instruction formats like bullet points vs. paragraphs, or questions vs. statements.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}