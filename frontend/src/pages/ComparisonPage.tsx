"use client"

import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Save, HelpCircle, Copy, RotateCcw, Play, Star, X, ArrowLeftRight, ChevronUp, ChevronDown, Settings } from "lucide-react"
import { useState, useEffect } from "react"
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

export default function ComparisonsPage() {
  const navigate = useNavigate()
  const [promptTextA, setPromptTextA] = useState(defaultPrompt)
  const [promptTextB, setPromptTextB] = useState(defaultPrompt)
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
      model: "meta-llama/llama-4-scout:free",
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

  const decodeUnicode = (str: string) => {
    return str
      .replace(/\\u[\dA-F]{4}/gi, (match) => String.fromCharCode(Number.parseInt(match.replace(/\\u/g, ""), 16)))
      .replace(/\\n/g, "\n")
      .replace(/\\/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*([^*]+)\*/g, "$1")
  }

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

      console.log(`🚀 Test request for side ${side}:`, requestBody);
      
      // Use streamingService to handle the request
      await streamingService.streamRequest(
        requestBody,
        streamingEnabled,
        {
          onContent: (content: string) => {
            if (streamingEnabled) {
              typingEffect.addText(content);
            } else {
              setAiResponse(streamingService.decodeUnicode(content));
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

      console.log("🚀 Comparison rating request:", requestBody);
      
      const response = await fetch("http://localhost:8080/api/test/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setRatingResponse(decodeUnicode(data.choices[0].message.content));
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
            
            const fallbackResponse = await fetch("http://localhost:8080/api/test/openrouter/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(fallbackRequestBody),
            });
            
            const fallbackData = await fallbackResponse.json();
            
            if (fallbackData.choices && fallbackData.choices[0] && fallbackData.choices[0].message) {
              setRatingResponse(decodeUnicode(fallbackData.choices[0].message.content) + 
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
    setPromptTextA(defaultPrompt)
    setPromptTextB(defaultPrompt)
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

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-64px)] bg-background">
      <div className="flex-1 flex min-h-0">
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${showRatingPanel || showModelPanel ? "mr-96" : ""}`}>
          {/* Adjust the height of the grid container to account for the bottom bar */}
          <div className="h-[calc(100%-48px)] grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
            {/* Left Panel - Prompt A */}
            <div className="bg-background border-r border-border p-3 lg:p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-foreground">Prompt A</h2>
                <div className="flex items-center space-x-1">
                  {/*Add Save button for Prompt A */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 lg:h-8 lg:w-8"
                    onClick={() => handleSavePrompt("A")}
                    title="Save Prompt A"
                  >
                    <Save className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8" onClick={handleReset}>
                    <RotateCcw className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 lg:h-8 lg:w-8"
                    onClick={swapPrompts}
                    title="Swap prompts"
                  >
                    <ArrowLeftRight className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                  {/*Add Help button */}
                  <Link to="/help">
                    <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8" title="Help">
                      <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Prompt A Editor Section */}
              <div className={`min-h-0 flex flex-col transition-all duration-300 ${editorACollapsed ? "flex-none h-auto" : "flex-none h-64"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">Prompt A</h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditorACollapsed(!editorACollapsed)}
                    >
                      {editorACollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                {!editorACollapsed && (
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <textarea
                      className="w-full h-full bg-transparent resize-none focus:outline-none text-xs lg:text-sm text-gray-800 dark:text-foreground placeholder:text-gray-500 dark:placeholder:text-muted-foreground"
                      placeholder="Write your first prompt here..."
                      value={promptTextA}
                      onChange={(e) => setPromptTextA(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Response A */}
              <div className={`flex-1 min-h-0 flex flex-col transition-all duration-300 ${responseACollapsed ? "flex-none h-auto" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">Response A</h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setResponseACollapsed(!responseACollapsed)}
                    >
                      {responseACollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(aiResponseA)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {!responseACollapsed && (
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <div className="h-full overflow-y-auto">
                      <StreamingDisplay
                        content={streamingEnabled ? typingEffectA.displayText : aiResponseA}
                        isLoading={isLoadingA}
                        streamingEnabled={streamingEnabled}
                        placeholder="AI response to prompt A will appear here..."
                        className="text-xs lg:text-sm text-gray-700 dark:text-muted-foreground whitespace-pre-wrap"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-muted-foreground">{promptTextA.length} chars</div>
              </div>
            </div>

            {/* Right Panel - Prompt B */}
            <div className="bg-background p-3 lg:p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-foreground">Prompt B</h2>
                <div className="flex items-center space-x-1">
                  {/*Add Save button for Prompt B */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 lg:h-8 lg:w-8"
                    onClick={() => handleSavePrompt("B")}
                    title="Save Prompt B"
                  >
                    <Save className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8" onClick={handleReset}>
                    <RotateCcw className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                  {/*Replace the existing HelpCircle with linked Help button */}
                  <Link to="/help">
                    <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8" title="Help">
                      <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Prompt B Editor Section */}
              <div className={`min-h-0 flex flex-col transition-all duration-300 ${editorBCollapsed ? "flex-none h-auto" : "flex-none h-64"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">Prompt B</h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditorBCollapsed(!editorBCollapsed)}
                    >
                      {editorBCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                {!editorBCollapsed && (
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <textarea
                      className="w-full h-full bg-transparent resize-none focus:outline-none text-xs lg:text-sm text-gray-800 dark:text-foreground placeholder:text-gray-500 dark:placeholder:text-muted-foreground"
                      placeholder="Write your second prompt here..."
                      value={promptTextB}
                      onChange={(e) => setPromptTextB(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Response B */}
              <div className={`flex-1 min-h-0 flex flex-col transition-all duration-300 ${responseBCollapsed ? "flex-none h-auto" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">Response B</h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setResponseBCollapsed(!responseBCollapsed)}
                    >
                      {responseBCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(aiResponseB)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {!responseBCollapsed && (
                  <div className="bg-gray-100 dark:bg-card rounded-lg p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <div className="h-full overflow-y-auto">
                      {isLoadingB ? (
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          <span>Generating response...</span>
                        </div>
                      ) : (
                        <pre className="text-xs lg:text-sm text-gray-700 dark:text-muted-foreground whitespace-pre-wrap">
                          {aiResponseB}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-muted-foreground">{promptTextB.length} chars</div>
              </div>
            </div>
          </div>

          {/*Update the bottom action bar to include save options */}
          <div className="h-12 border-t border-border px-3 bg-background flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground text-xs h-8" 
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              
              {/*Add quick save buttons in bottom bar */}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs h-8"
                onClick={() => handleSavePrompt("A")}
                title="Save Prompt A"
              >
                <Save className="h-3 w-3 mr-1" />
                Save A
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs h-8"
                onClick={() => handleSavePrompt("B")}
                title="Save Prompt B"
              >
                <Save className="h-3 w-3 mr-1" />
                Save B
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-8"
                onClick={testBothPrompts}
                disabled={isLoadingA || isLoadingB}
              >
                <Play className="h-3 w-3 mr-1" />
                Test Both
              </Button>
              <Button
                size="sm"
                className="bg-violet-500 hover:bg-violet-600 text-white text-xs h-8"
                onClick={() => setShowModelPanel(true)}
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Models
              </Button>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8"
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

        {/* Rating Side Panel */}
        {showRatingPanel && (
          <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Comparison Rating</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowRatingPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 p-4 overflow-hidden"> {/* Changed from overflow-y-auto */}
              <div className="bg-gray-100 dark:bg-muted rounded-lg p-4 h-full overflow-y-auto"> {/* Added h-full and overflow-y-auto */}
                {isLoadingRating ? (
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    <span>Analyzing responses...</span>
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

            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Model A: {aiModels[selectedModelA].shortName}</span>
                <span>Model B: {aiModels[selectedModelB].shortName}</span>
              </div>
              <Button
                size="sm"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs h-8"
                onClick={getRating}
                disabled={isLoadingRating}
              >
                <Star className="h-3 w-3 mr-1" />
                Refresh Rating
              </Button>
            </div>
          </div>
        )}

        {/* Model Selection Side Panel */}
        {showModelPanel && (
          <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Select Models</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModelPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 p-3 space-y-4"> {/* Reduced padding and spacing */}
              {/* Model A Selection */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2"> {/* Reduced margin */}
                  Model for Prompt A
                </h4>
                <div className="space-y-1.5"> {/* Reduced spacing between cards */}
                  {aiModels.map((model, index) => (
                    <Card
                      key={index}
                      className={`p-2 transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${
                        selectedModelA === index 
                          ? `${model.selectedBg} ${model.selectedGlow}`
                          : `${model.cardBg} ${model.glowColor}`
                      }`}
                      onClick={() => setSelectedModelA(index)}
                    >
                      <div className="flex items-center space-x-2"> {/* Reduced spacing */}
                        <div
                          className={`w-6 h-6 rounded-lg ${model.iconBg} flex items-center justify-center text-white text-sm shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`} /* Smaller icon container */
                        >
                          {model.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-semibold ${model.textColor} mb-0.5`}> {/* Smaller text and margin */}
                            {model.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground leading-tight"> {/* Smaller description text */}
                            {model.description}
                          </p>
                        </div>
                        {selectedModelA === index && (
                          <div className="w-3 h-3 rounded-full bg-[#3ebb9e] flex items-center justify-center"> {/* Smaller radio button */}
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Model B Selection - Apply the same changes */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Model for Prompt B
                </h4>
                <div className="space-y-1.5">
                  {aiModels.map((model, index) => (
                    <Card
                      key={index}
                      className={`p-2 transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${
                        selectedModelB === index 
                          ? `${model.selectedBg} ${model.selectedGlow}`
                          : `${model.cardBg} ${model.glowColor}`
                      }`}
                      onClick={() => setSelectedModelB(index)}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded-lg ${model.iconBg} flex items-center justify-center text-white text-sm shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`}
                        >
                          {model.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-semibold ${model.textColor} mb-0.5`}>
                            {model.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground leading-tight">
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

            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>A: {aiModels[selectedModelA].shortName}</span>
                <span>B: {aiModels[selectedModelB].shortName}</span>
              </div>
              <Button
                size="sm"
                className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-8"
                onClick={() => setShowModelPanel(false)}
              >
                Apply Selection
              </Button>
            </div>
          </div>
        )}

        {/* Add Streaming Controls Panel */}
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
    </div>
  )
}