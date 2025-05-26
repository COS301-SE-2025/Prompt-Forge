"use client"

import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { ChevronDown, Play, Plus, Save, Sparkles } from "lucide-react"

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [promptText, setPromptText] = useState(`You are a professional copywriter.
              
Write a compelling product description for a new smartphone that highlights its innovative features and benefits.

The description should be:
- Engaging and persuasive
- Highlight key features (camera, battery, design)
- Include a strong call to action
- Be approximately 150 words`)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="bg-muted border-r border-border p-4 flex flex-col">
          <div className="flex items-center mb-4 space-x-2">
            <div className="flex border-b border-border w-full">
              <button
                className={`px-4 py-2 text-xs font-medium ${
                  activeTab === "all" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                className={`px-4 py-2 text-xs font-medium ${
                  activeTab === "custom" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("custom")}
              >
                Custom
              </button>
              <div className="flex items-center ml-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-card rounded-md p-4">
            <textarea
              className="w-full h-full bg-transparent resize-none focus:outline-none text-sm text-foreground"
              placeholder="Enter your prompt here..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-between">
            <div className="text-xs text-muted-foreground">{promptText.length} Characters</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="h-8">
                <Save className="h-4 w-4 mr-1" />
                Save as Preset
              </Button>
              <Button size="sm" className="h-8 bg-[#3ebb9e] hover:bg-[#00674f]">
                <Play className="h-4 w-4 mr-1" />
                Test in ChatGPT
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-background p-4 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Test Your Prompt</h2>
            <p className="text-sm text-muted-foreground">Generate responses to evaluate your prompt</p>
          </div>

          <div className="flex-1 flex flex-col space-y-4">
            <Card className="p-4">
              <div className="flex items-start space-x-2">
                <div className="bg-[#3ebb9e]/20 rounded p-1">
                  <Sparkles className="h-4 w-4 text-[#3ebb9e]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">ChatGPT - 3.5</div>
                  <div className="text-sm">
                    Introducing the future of mobile technology in your hands – the revolutionary new XYZ Smartphone.
                    Capture life's most precious moments in stunning detail with our professional-grade camera system,
                    featuring an unprecedented 108MP main sensor and advanced AI enhancement.
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start space-x-2">
                <div className="bg-[#3ebb9e]/20 rounded p-1">
                  <Sparkles className="h-4 w-4 text-[#3ebb9e]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Claude - 3 Haiku</div>
                  <div className="text-sm">
                    Experience unparalleled performance with our lightning-fast processor and stay connected all day
                    with our industry-leading 48-hour battery life. The sleek, ergonomic design not only feels premium
                    in your hand but also turns heads wherever you go.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              Add Response
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
