"use client"

import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Save, History, HelpCircle, Copy, Download, RotateCcw, Play, Check } from "lucide-react"

export default function EditorPage() {
  const [promptText, setPromptText] = useState(`Write your prompt here...
Example:
You are an AI assistant specialized in [specific domain].
When responding to queries always follow these guidelines:
1. [First Guideline]
2. [Second Guideline]
3. [Third Guideline]
If the user asks about [specific topic], respond with [specific format].`)

  const [sampleInput, setSampleInput] = useState("")
  const [aiResponse, setAiResponse] = useState("AI response to your prompt here...")
  const [selectedModel, setSelectedModel] = useState(0) // Default to first model (ChatGPT-4)

  const aiModels = [
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
      name: "ChatGPT-3.5",
      shortName: "GPT-3.5",
      description: "Fast and efficient for most tasks",
      icon: "⚡",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      cardBg: "bg-blue-500/10 border-blue-500/20",
      selectedBg: "bg-blue-500/20 border-blue-500/40",
      textColor: "text-blue-400",
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
    // You could also trigger a test here if desired
    setAiResponse(`Testing with ${aiModels[index].name}...`)
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
            <Button size="sm" className="bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-8">
              <Play className="h-3 w-3 mr-1" />
              Publish
            </Button>
          </div>
        </div>

        {/* Right Panel - Test Your Prompt */}
        <div className="bg-background p-3 lg:p-4 flex flex-col min-h-0 overflow-hidden">
          <h2 className="text-lg lg:text-xl font-semibold text-foreground mb-3 lg:mb-4">Test Your Prompt</h2>

          <div className="flex-1 flex flex-col min-h-0 space-y-3 lg:space-y-4">
            {/* Sample Input */}
            <div className="flex-shrink-0">
              <h3 className="text-xs lg:text-sm font-medium text-muted-foreground mb-2">Sample Input</h3>
              <div className="bg-muted rounded-lg p-2 lg:p-3">
                <textarea
                  className="w-full bg-transparent resize-none focus:outline-none text-xs lg:text-sm text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter sample input..."
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* AI Models */}
            <div className="flex-shrink-0">
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
                        <p className="text-xs text-muted-foreground leading-tight line-clamp-2">{model.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* AI Response */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs lg:text-sm font-medium text-muted-foreground">AI Response</h3>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3 flex-1 min-h-0 overflow-auto">
                <div className="text-xs lg:text-sm text-muted-foreground">{aiResponse}</div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between flex-shrink-0">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-8">
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <Button size="sm" className="bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs h-8">
                <Play className="h-3 w-3 mr-1" />
                Test with {selectedModelData.shortName}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
