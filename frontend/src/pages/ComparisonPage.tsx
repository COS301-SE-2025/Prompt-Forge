"use client"

import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Save, HelpCircle, Copy, RotateCcw, Play, Star, X, ArrowLeftRight, ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"

const defaultPrompt = `Write your prompt here...

Example:
When writing a prompt, always follow these guidelines:
1. [Clearly define the task or question you want answered.]
2. [Specify any format or structure you expect in the response (e.g., list, paragraph, code block).]
3. [Include relevant context, constraints, or examples to guide the output.]
4. [If your prompt involves a specific topic or style, mention it explicitly and 
explain how the response should be adapted to fit.]`

export default function ComparisonsPage() {
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

  const aiModels = [
    {
      name: "Deepseek",
      shortName: "Deepseek",
      description: "Advanced reasoning and code generation",
      icon: "🔮",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      cardBg: "bg-violet-500/10 border-violet-500/20",
      selectedBg: "bg-violet-500/20 border-violet-500/40",
      textColor: "text-violet-400",
      available: true,
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    },
    {
      name: "ChatGPT-4",
      shortName: "GPT-4",
      description: "Latest GPT model with advanced reasoning",
      icon: "🤖",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      cardBg: "bg-green-500/10 border-green-500/20",
      selectedBg: "bg-green-500/20 border-green-500/40",
      textColor: "text-green-400",
      available: true,
    },
    {
      name: "Claude 3.7",
      shortName: "Claude",
      description: "Advanced reasoning capabilities",
      icon: "🧠",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
      cardBg: "bg-orange-500/10 border-orange-500/20",
      selectedBg: "bg-orange-500/20 border-orange-500/40",
      textColor: "text-orange-400",
      available: true,
    },
    {
      name: "Gemini",
      shortName: "Gemini",
      description: "Multimodal AI processing",
      icon: "💎",
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
      cardBg: "bg-purple-500/10 border-purple-500/20",
      selectedBg: "bg-purple-500/20 border-purple-500/40",
      textColor: "text-purple-400",
      available: true,
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

  const testPrompt = async (side: "A" | "B") => {
    const promptText = side === "A" ? promptTextA : promptTextB
    const setIsLoading = side === "A" ? setIsLoadingA : setIsLoadingB
    const setAiResponse = side === "A" ? setAiResponseA : setAiResponseB

    setIsLoading(true)
    setAiResponse("Generating response...")

    try {
      const requestBody = {
        messages: [
          {
            role: "user",
            content: promptText,
          },
        ],
      }

      const response = await fetch("http://localhost:8080/api/test/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const aiResponseText = data.choices[0].message.content
        setAiResponse(decodeUnicode(aiResponseText))
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setAiResponse(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testBothPrompts = async () => {
    await Promise.all([testPrompt("A"), testPrompt("B")])
  }

  const getRating = async () => {
    setIsLoadingRating(true)
    setRatingResponse("Analyzing both responses...")

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
`

    try {
      const requestBody = {
        messages: [
          {
            role: "user",
            content: ratingPrompt,
          },
        ],
      }

      const response = await fetch("http://localhost:8080/api/test/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setRatingResponse(decodeUnicode(data.choices[0].message.content))
      }
    } catch (error) {
      setRatingResponse("Error generating rating: " + error)
    } finally {
      setIsLoadingRating(false)
    }
  }

  const handleReset = () => {
    setPromptTextA(defaultPrompt)
    setPromptTextB(defaultPrompt)
    setAiResponseA("AI response to prompt A will appear here...")
    setAiResponseB("AI response to prompt B will appear here...")
    setRatingResponse("")
    setShowRatingPanel(false)
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8">
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
                </div>
              </div>

              <div className={`min-h-0 flex flex-col transition-all duration-300 ${editorACollapsed ? "flex-none" : "flex-1"}`}>
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
                  <div className="bg-card rounded-lg p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <textarea
                      className="w-full h-full bg-transparent resize-none focus:outline-none text-xs lg:text-sm text-foreground placeholder:text-muted-foreground"
                      placeholder="Write your first prompt here..."
                      value={promptTextA}
                      onChange={(e) => setPromptTextA(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Response A */}
              <div
                className={`flex-1 min-h-0 flex flex-col transition-all duration-300 ${
                  responseACollapsed ? "flex-none" : "h-1/2"
                }`}
              >
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
                  <div className="bg-card rounded-lg p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <div className="h-full overflow-y-auto">
                      {isLoadingA ? (
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          <span>Generating response...</span>
                        </div>
                      ) : (
                        <pre className="text-xs lg:text-sm text-muted-foreground whitespace-pre-wrap">
                          {aiResponseA}
                        </pre>
                      )}
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8">
                    <Save className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8" onClick={handleReset}>
                    <RotateCcw className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8">
                    <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
              </div>

              <div className={`min-h-0 flex flex-col transition-all duration-300 ${editorBCollapsed ? "flex-none" : "flex-1"}`}>
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
                  <div className="bg-card rounded-lg p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <textarea
                      className="w-full h-full bg-transparent resize-none focus:outline-none text-xs lg:text-sm text-foreground placeholder:text-muted-foreground"
                      placeholder="Write your second prompt here..."
                      value={promptTextB}
                      onChange={(e) => setPromptTextB(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Response B */}
              <div
                className={`flex-1 min-h-0 flex flex-col transition-all duration-300 ${
                  responseBCollapsed ? "flex-none" : "h-1/2"
                }`}
              >
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
                  <div className="bg-card rounded-lg p-3 flex-1 min-h-0 relative overflow-hidden transition-all duration-300">
                    <div className="h-full overflow-y-auto">
                      {isLoadingB ? (
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          <span>Generating response...</span>
                        </div>
                      ) : (
                        <pre className="text-xs lg:text-sm text-muted-foreground whitespace-pre-wrap">
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

          {/* Update the bottom action bar */}
          <div className="h-12 border-t border-border px-3 bg-background flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground text-xs h-8" 
              onClick={handleReset}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>

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
              <div className="bg-muted rounded-lg p-4 h-full overflow-y-auto"> {/* Added h-full and overflow-y-auto */}
                {isLoadingRating ? (
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    <span>Analyzing responses...</span>
                  </div>
                ) : (
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {ratingResponse || "Click 'Rate' to compare both responses..."}
                  </pre>
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
                      className={`p-2 ${/* Reduced padding */
                        selectedModelA === index ? model.selectedBg : model.cardBg
                      } hover:bg-opacity-80 transition-all duration-200 cursor-pointer group hover:scale-[1.02]`}
                      onClick={() => setSelectedModelA(index)}
                    >
                      <div className="flex items-center space-x-2"> {/* Reduced spacing */}
                        <div
                          className={`w-6 h-6 rounded-lg ${model.iconBg} flex items-center justify-center text-white text-sm shadow-lg flex-shrink-0`} /* Smaller icon container */
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
                      className={`p-2 ${
                        selectedModelB === index ? model.selectedBg : model.cardBg
                      } hover:bg-opacity-80 transition-all duration-200 cursor-pointer group hover:scale-[1.02]`}
                      onClick={() => setSelectedModelB(index)}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded-lg ${model.iconBg} flex items-center justify-center text-white text-sm shadow-lg flex-shrink-0`}
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
      </div>
    </div>
  )
}
