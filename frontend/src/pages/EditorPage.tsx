"use client"

import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Save, History, HelpCircle, Copy, Download, RotateCcw, Play, Check } from "lucide-react"
import { useState } from "react"

const defaultPrompt = `Write your prompt here...

Example:
When writing a prompt, always follow these guidelines:
1. [Clearly define the task or question you want answered.]
2. [Specify any format or structure you expect in the response (e.g., list, paragraph, code block).]
3. [Include relevant context, constraints, or examples to guide the output.]
4. [If your prompt involves a specific topic or style, mention it explicitly and 
explain how the response should be adapted to fit.]`

export default function EditorPage() {
  const [promptText, setPromptText] = useState(defaultPrompt)
  const [aiResponse, setAiResponse] = useState("AI response to your prompt here...")
  const [selectedModel, setSelectedModel] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState<"test" | "rate" | "suggest">("test")
  const [currentPage, setCurrentPage] = useState(1)
  const [ratingResponse, setRatingResponse] = useState("")
  const [isLoadingRating, setIsLoadingRating] = useState(false)
  const [lastTestedPrompt, setLastTestedPrompt] = useState("")
  const [suggestionResponse, setSuggestionResponse] = useState("")
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const [lastSuggestedPrompt, setLastSuggestedPrompt] = useState("")

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

  const getRating = async (prompt: string, response: string) => {
    setIsLoadingRating(true)
    setRatingResponse("Rating your prompt...")

    const ratingPrompt = `
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
`
    try {
      const requestBody = {
        messages: [
          {
            role: "user",
            content: suggestionPrompt,
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
        setSuggestionResponse(decodeUnicode(data.choices[0].message.content))
        setLastSuggestedPrompt(prompt)  // Store the suggested prompt
      }
    } catch (error) {
      setSuggestionResponse("Error analyzing rating: " + error)
    } finally {
      setIsLoadingSuggestion(false)
    }
  }

  const testPrompt = async () => {
  if (promptText === lastTestedPrompt) {
    setCurrentView("test")
    setCurrentPage(1)
    return
  }

  setIsLoading(true)
  setAiResponse("Generating response...")
  setCurrentView("test")
  setCurrentPage(1)

  try {
    const requestBody = {
      messages: [{
        role: "user",
        content: promptText
      }]
    }

    const response = await fetch("http://localhost:8080/api/test/openrouter/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiResponseText = data.choices[0].message.content
      setAiResponse(decodeUnicode(aiResponseText))
      setLastTestedPrompt(promptText)
      
      await Promise.all([
        getRating(promptText, decodeUnicode(aiResponseText)),
        getSuggested(promptText, decodeUnicode(aiResponseText))
      ])
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

  const selectedModelData = aiModels[selectedModel]

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
        {/* Left Panel - Prompt Editor */}
        <div className="bg-muted border-r border-border p-3 lg:p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-foreground">Prompt Editor</h2>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8">
                <Save className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8">
                <History className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-8 lg:w-8">
                <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 bg-card rounded-lg p-3 mb-3 min-h-0">
            <textarea
              className="w-full h-full bg-transparent resize-none focus:outline-none text-xs lg:text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="Write your prompt here..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{promptText.length} chars</div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-8" 
                onClick={() => {
                  testPrompt();
                  setCurrentView("test");
                  setCurrentPage(1);
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                Test Prompt
              </Button>
              <Button
                size="sm"
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-8"
                onClick={() => {
                  setCurrentView("rate");
                  setCurrentPage(2);
                }}
              >
                Rate
              </Button>
              <Button
                size="sm"
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-8"
                onClick={() => {
                  getSuggested(promptText, aiResponse);
                  setCurrentView("suggest");
                  setCurrentPage(3);
                }}
              >
                Suggest
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Dynamic Content */}
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
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 flex-1 min-h-0 relative h-[calc(100vh-220px)]">
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
                  <h3 className="text-xs lg:text-sm font-medium text-muted-foreground mb-2">AI Models</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {aiModels.map((model, index) => (
                      <Card
                        key={index}
                        className={`p-2 lg:p-3 ${
                          selectedModel === index ? model.selectedBg : model.cardBg
                        } hover:bg-opacity-80 transition-all duration-200 cursor-pointer group hover:scale-[1.02] relative`}
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
                          </div>
                        </div>
                      </Card>
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
                  <div className="bg-muted rounded-lg p-3 flex-1 min-h-0 relative h-[calc(100vh-220px)]">
                    <div className="absolute inset-0 p-3 overflow-y-auto">
                      {isLoadingRating ? (
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          <span>Rating your prompt...</span>
                        </div>
                      ) : (
                        <pre className="text-xs lg:text-sm text-muted-foreground whitespace-pre-wrap">
                          {ratingResponse || "Rating will appear here..."}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating Models (same as AI Models) */}
                <div className="flex-shrink-0 mt-auto">
                  <h3 className="text-xs lg:text-sm font-medium text-muted-foreground mb-2">Rating Models</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {aiModels.map((model, index) => (
                      <Card
                        key={index}
                        className={`p-2 lg:p-3 ${
                          selectedModel === index ? model.selectedBg : model.cardBg
                        } hover:bg-opacity-80 transition-all duration-200 cursor-pointer group hover:scale-[1.02] relative`}
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
                          </div>
                        </div>
                      </Card>
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
                  <div className="bg-muted rounded-lg p-3 flex-1 min-h-0 relative h-[calc(100vh-220px)]">
                    <div className="absolute inset-0 p-3 overflow-y-auto">
                      {isLoadingSuggestion ? (
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          <span>Generating suggestions...</span>
                        </div>
                      ) : (
                        <pre className="text-xs lg:text-sm text-muted-foreground whitespace-pre-wrap">
                          {suggestionResponse || "Suggestions will appear here..."}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestion Models */}
                <div className="flex-shrink-0 mt-auto">
                  <h3 className="text-xs lg:text-sm font-medium text-muted-foreground mb-2">Suggestion Models</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {aiModels.map((model, index) => (
                      <Card
                        key={index}
                        className={`p-2 lg:p-3 ${
                          selectedModel === index ? model.selectedBg : model.cardBg
                        } hover:bg-opacity-80 transition-all duration-200 cursor-pointer group hover:scale-[1.02] relative`}
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
                          </div>
                        </div>
                      </Card>
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
