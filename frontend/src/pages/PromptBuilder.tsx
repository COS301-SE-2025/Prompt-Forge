"use client"

import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import {
  Wand2,
  Save,
  Copy,
  Sparkles,
  User,
  Lightbulb,
  X,
  Check,
  Star,
  Zap,
  RotateCcw,
  Download,
  BookOpen,
  Plus,
} from "lucide-react"
import { useState } from "react"

interface Persona {
  id: string
  name: string
  icon: string
  description: string
  useCase: string
  recommendedModels: string[]
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  template: string
  persona?: string
}

const personas: Persona[] = [
  {
    id: "developer",
    name: "Developer",
    icon: "🔧",
    description: "Software Engineers, AI Engineers, Backend/Frontend Devs",
    useCase: "Use prompts for code generation, debugging, documentation",
    recommendedModels: ["deepseek", "kimi-dev", "llama-4"],
  },
  {
    id: "creative",
    name: "Creative",
    icon: "🎨",
    description: "Writers, Designers, Artists, Storytellers",
    useCase: "Use prompts for storytelling, design ideas, poetry, etc.",
    recommendedModels: ["gemini-2", "llama-4", "deepseek"],
  },
  {
    id: "researcher",
    name: "Researcher",
    icon: "🧠",
    description: "Academics, Data Scientists, Analysts",
    useCase: "Use prompts for literature reviews, data insights, summarization",
    recommendedModels: ["deepseek", "llama-4", "gemini-2"],
  },
  {
    id: "educator",
    name: "Educator",
    icon: "🧑‍🏫",
    description: "Teachers, Tutors, Curriculum Designers",
    useCase: "Use prompts to create learning material, quizzes, lesson plans",
    recommendedModels: ["llama-4", "gemini-2", "deepseek"],
  },
  {
    id: "business",
    name: "Business Professional",
    icon: "💼",
    description: "Product Managers, Consultants, Marketers",
    useCase: "Use prompts for reports, meeting notes, SWOT analysis, pitches",
    recommendedModels: ["llama-4", "deepseek", "gemini-2"],
  },
  {
    id: "marketer",
    name: "Marketer",
    icon: "📈",
    description: "SEO Experts, Content Strategists, Copywriters",
    useCase: "Use prompts for social media posts, ad copy, landing pages",
    recommendedModels: ["llama-4", "gemini-2", "deepseek"],
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    icon: "🧑‍⚖️",
    description: "Lawyers, Paralegals, Policy Writers",
    useCase: "Use prompts for contract drafts, case summaries, compliance checklists",
    recommendedModels: ["deepseek", "llama-4", "gemini-2"],
  },
  {
    id: "healthcare",
    name: "Healthcare Professional",
    icon: "🧑‍⚕️",
    description: "Doctors, Medical Students, Health Coaches",
    useCase: "Use prompts for patient communication, summaries, training material",
    recommendedModels: ["llama-4", "deepseek", "gemini-2"],
  },
  {
    id: "support",
    name: "Customer Support",
    icon: "🤝",
    description: "Support Agents, Chatbot Trainers",
    useCase: "Use prompts to handle queries, write response templates, sentiment analysis",
    recommendedModels: ["llama-4", "gemini-2", "deepseek"],
  },
  {
    id: "ecommerce",
    name: "eCommerce / Seller",
    icon: "🛍️",
    description: "Online store owners, Amazon/Etsy Sellers",
    useCase: "Use prompts for product descriptions, reviews, SEO tags",
    recommendedModels: ["llama-4", "gemini-2", "deepseek"],
  },
  {
    id: "prompt-engineer",
    name: "Prompt Engineer",
    icon: "👨‍💻",
    description: "Technical users creating reusable prompt templates",
    useCase: "Use the builder to optimize instructions, define variables, test prompts",
    recommendedModels: ["deepseek", "llama-4", "gemini-2"],
  },
]

const aiModels = [
  {
    id: "deepseek",
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
    id: "llama-4",
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
    id: "gemini-2",
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
    id: "kimi-dev",
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

const templates: Template[] = [
  {
    id: "fantasy-story",
    name: "Fantasy Story Prompt",
    description: "Generate a story prompt for a fantasy setting",
    category: "Story",
    template:
      "Create a compelling fantasy story that includes: [SETTING], [MAIN_CHARACTER], [CONFLICT], and [MAGICAL_ELEMENT]. The story should be engaging and include vivid descriptions.",
    persona: "creative",
  },
  {
    id: "code-review",
    name: "Code Review Assistant",
    description: "Comprehensive code review and improvement suggestions",
    category: "Development",
    template:
      "Review the following code for: 1) Bugs and errors, 2) Performance optimizations, 3) Best practices, 4) Security vulnerabilities, 5) Code readability. Provide specific suggestions with examples.",
    persona: "developer",
  },
  {
    id: "research-summary",
    name: "Research Paper Summary",
    description: "Summarize academic papers and research findings",
    category: "Research",
    template:
      "Summarize this research paper focusing on: 1) Main hypothesis, 2) Methodology, 3) Key findings, 4) Implications, 5) Limitations. Make it accessible for [TARGET_AUDIENCE].",
    persona: "researcher",
  },
  {
    id: "lesson-plan",
    name: "Interactive Lesson Plan",
    description: "Create engaging educational content and activities",
    category: "Education",
    template:
      "Create a lesson plan for [SUBJECT] targeting [GRADE_LEVEL] that includes: 1) Learning objectives, 2) Interactive activities, 3) Assessment methods, 4) Materials needed, 5) Differentiation strategies.",
    persona: "educator",
  },
  {
    id: "marketing-copy",
    name: "Marketing Copy Generator",
    description: "Create compelling marketing content and campaigns",
    category: "Marketing",
    template:
      "Write marketing copy for [PRODUCT/SERVICE] that: 1) Identifies the target audience, 2) Highlights key benefits, 3) Addresses pain points, 4) Includes a strong call-to-action, 5) Matches [BRAND_TONE].",
    persona: "marketer",
  },
  {
    id: "business-analysis",
    name: "Business Analysis Framework",
    description: "Analyze business problems and opportunities",
    category: "Business",
    template:
      "Analyze [BUSINESS_SITUATION] using: 1) SWOT analysis, 2) Market assessment, 3) Risk evaluation, 4) Opportunity identification, 5) Actionable recommendations with timelines.",
    persona: "business",
  },
]

export default function PromptBuilderPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [promptIdea, setPromptIdea] = useState("")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showModelRecommendations, setShowModelRecommendations] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [promptName, setPromptName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const generatePrompt = async () => {
    if (!promptIdea.trim() || !selectedPersona) return

    setIsGenerating(true)

    try {
      const personaContext = `You are helping a ${selectedPersona.name} (${selectedPersona.description}) who ${selectedPersona.useCase.toLowerCase()}.`

      const requestBody = {
        messages: [
          {
            role: "system",
            content: `You are an expert prompt engineer. Your job is to take a user's basic idea and transform it into a well-structured, effective prompt that will get the best results from an AI model.

${personaContext}

When creating prompts, follow these principles:
1. Be specific and clear about the desired output
2. Provide context and background information
3. Include examples when helpful
4. Specify format, tone, and style requirements
5. Add constraints or guidelines as needed
6. Consider the persona's specific needs and use cases

Transform the user's idea into a professional, effective prompt that maximizes AI performance.`,
          },
          {
            role: "user",
            content: `Please transform this basic idea into a well-structured, effective prompt:

"${promptIdea}"

Make it optimized for a ${selectedPersona.name} who needs to ${selectedPersona.useCase.toLowerCase()}. The prompt should be clear, specific, and designed to get the best possible results from an AI model.`,
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
        const prompt = data.choices[0].message.content
          .replace(/\\u[\dA-F]{4}/gi, (match: string) => String.fromCharCode(Number.parseInt(match.replace(/\\u/g, ""), 16)))
          .replace(/\\n/g, "\n")
          .replace(/\\/g, "")
          .replace(/\*\*/g, "")
          .replace(/\*([^*]+)\*/g, "$1")

        setGeneratedPrompt(prompt)
      }
    } catch (error) {
      console.error("Error generating prompt:", error)
      setGeneratedPrompt("Error generating prompt. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const useTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setGeneratedPrompt(template.template)
    setPromptIdea(`Using template: ${template.name}`)
    setShowTemplates(false)

    // Auto-select persona if template has one
    if (template.persona) {
      const persona = personas.find((p) => p.id === template.persona)
      if (persona) setSelectedPersona(persona)
    }
  }

  const getRecommendedModels = () => {
    if (!selectedPersona) return []
    return aiModels.filter((model) => selectedPersona.recommendedModels.includes(model.id))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const savePrompt = async () => {
    if (!promptName.trim() || !generatedPrompt.trim()) return

    setIsSaving(true)
    try {
      // Simulate save operation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In real app, this would save to your backend
      console.log("Saving prompt:", { name: promptName, prompt: generatedPrompt, persona: selectedPersona?.id })
    } catch (error) {
      console.error("Error saving prompt:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background">
      {/* Header */}
      <div className="border-b border-border p-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setShowTemplates(true)} className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Templates</span>
              </Button>
              {selectedPersona && (
                <Button
                  variant="outline"
                  onClick={() => setShowModelRecommendations(true)}
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI Models</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input */}
            <div className="lg:col-span-1 space-y-6">
              {/* Persona Selection */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                  Choose Your Profile
                </h2>Fprom
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {personas.map((persona) => (
                    <Card
                      key={persona.id}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                        selectedPersona?.id === persona.id
                          ? "bg-[#3ebb9e]/10 border-[#3ebb9e]/40 shadow-[0_0_15px_rgba(62,187,158,0.3)]"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedPersona(persona)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{persona.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-foreground mb-1">{persona.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{persona.description}</p>
                          <p className="text-xs text-muted-foreground italic">{persona.useCase}</p>
                        </div>
                        {selectedPersona?.id === persona.id && (
                          <Check className="h-4 w-4 text-[#3ebb9e] flex-shrink-0" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Prompt Idea Input */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                  Your Prompt Idea
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="prompt-idea" className="text-sm font-medium text-foreground">
                      Describe what you want your prompt to do
                    </Label>
                    <textarea
                      id="prompt-idea"
                      className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none"
                      rows={4}
                      placeholder="e.g., 'Help me write better product descriptions for my online store' or 'Create a prompt that helps debug Python code'"
                      value={promptIdea}
                      onChange={(e) => setPromptIdea(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={generatePrompt}
                    disabled={!promptIdea.trim() || !selectedPersona || isGenerating}
                    className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                  >
                    {isGenerating ? (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Prompt
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column - Output */}
            <div className="lg:col-span-2 space-y-6">
              {/* Generated Prompt */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                    Generated Prompt
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedPrompt)}
                      disabled={!generatedPrompt}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const element = document.createElement("a")
                        const file = new Blob([generatedPrompt], { type: "text/plain" })
                        element.href = URL.createObjectURL(file)
                        element.download = `${promptName || "prompt"}.txt`
                        document.body.appendChild(element)
                        element.click()
                        document.body.removeChild(element)
                      }}
                      disabled={!generatedPrompt}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 min-h-[300px]">
                  {generatedPrompt ? (
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                      {generatedPrompt}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Your optimized prompt will appear here</p>
                        <p className="text-sm mt-2">Select a profile and describe your idea to get started</p>
                      </div>
                    </div>
                  )}
                </div>

                {generatedPrompt && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="prompt-name" className="text-sm font-medium text-foreground">
                          Save as:
                        </Label>
                        <Input
                          id="prompt-name"
                          placeholder="Enter prompt name"
                          value={promptName}
                          onChange={(e) => setPromptName(e.target.value)}
                          className="mt-1 bg-muted"
                        />
                      </div>
                      <Button
                        onClick={savePrompt}
                        disabled={!promptName.trim() || isSaving}
                        className="bg-[#3ebb9e] hover:bg-[#00674f] text-white mt-6"
                      >
                        {isSaving ? (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Prompt
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Tips */}
              <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-500" />
                  Pro Tips
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Be specific about your desired output format and style</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Include examples in your idea to get better results</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Test your generated prompts and iterate based on results</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use templates as starting points for common use cases</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-[#3ebb9e]" />
                Prompt Templates
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTemplates(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <span className="inline-block px-2 py-1 bg-muted text-xs rounded-md">{template.category}</span>
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-3 mb-3">
                      <p className="text-xs text-muted-foreground">{template.template}</p>
                    </div>
                    <Button
                      onClick={() => useTemplate(template)}
                      size="sm"
                      className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Model Recommendations Modal */}
      {showModelRecommendations && selectedPersona && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-[#3ebb9e]" />
                Recommended AI Models
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModelRecommendations(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Based on your profile as a <strong>{selectedPersona.name}</strong>, here are the best AI models for your
                use case:
              </p>

              <div className="space-y-3">
                {getRecommendedModels().map((model, index) => (
                  <Card
                    key={model.id}
                    className={`p-4 ${model.cardBg} ${model.glowColor} transition-all duration-200 hover:scale-[1.02]`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${model.iconBg} flex items-center justify-center text-xl`}>
                        {model.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-semibold ${model.textColor}`}>{model.name}</h3>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 text-xs rounded-full">
                              Best Match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                        {model.supportsImages && (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded-full">
                            Supports Images
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-600">
                  💡 <strong>Tip:</strong> Try your generated prompts with different models to see which gives the best
                  results for your specific use case.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
