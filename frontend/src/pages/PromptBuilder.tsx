"use client"

import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { useTypingEffect } from "@/hooks/useTypingEffect"
import { StreamingDisplay } from "@/components/StreamingDisplay";
import { StreamingService } from "@/services/streamingService";
import { jsPDF } from 'jspdf';
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
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

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
  const [selectedModel, setSelectedModel] = useState(aiModels[0])
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [typingSpeed, setTypingSpeed] = useState(75);
  const streamingService = new StreamingService();
  const navigate = useNavigate();
  
  const typingEffect = useTypingEffect({ 
    speed: typingSpeed, 
    batchSize: typingSpeed < 20 ? 3 : typingSpeed < 50 ? 2 : 1 
  });

  const generatePrompt = async () => {
    if (!promptIdea.trim() || !selectedPersona) return

    setIsGenerating(true)
    
    typingEffect.clear();
    
    if (streamingEnabled) {
      setGeneratedPrompt(""); // Clear for streaming
    } else {
      setGeneratedPrompt("Generating prompt...");
    }

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
        model: selectedModel.model,
        stream: streamingEnabled
      }

      await streamingService.streamRequest(
        requestBody,
        streamingEnabled,
        {
          onContent: (content: string) => {
            if (streamingEnabled) {
              typingEffect.addText(content);
            } else {
              setGeneratedPrompt(streamingService.decodeUnicode(content));
            }
          },
          onComplete: () => {
            setIsGenerating(false);
            if (streamingEnabled && typingEffect.displayText) {
              setGeneratedPrompt(typingEffect.displayText);
            }
            console.log("✅ Prompt generation completed");
          },
          onError: (error: string) => {
            setIsGenerating(false);
            setGeneratedPrompt(`Error: ${error}`);
          }
        }
      );
    } catch (error) {
      console.error("Error generating prompt:", error)
      setGeneratedPrompt("Error generating prompt. Please try again.")
      setIsGenerating(false)
    }
  }
  
  const useTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setGeneratedPrompt(template.template)
    setPromptIdea(`Using template: ${template.name}`)
    setShowTemplates(false)

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
    if (!promptName.trim() || !generatedPrompt.trim() || !selectedPersona) return

    const username = localStorage.getItem('username')
    if (!username || username === 'Guest') {
      alert("Please log in to save prompts")
      return
    }

    setIsSaving(true)
    try {
      const autoTitle = promptName.length > 50 
        ? promptName.substring(0, 50).trim() + "..."
        : promptName.trim()

      navigate('/submit', {
        state: {
          prefilled: {
            title: autoTitle,
            description: `Generated prompt for ${selectedPersona.name} - ${new Date().toLocaleString()}`,
            content: generatedPrompt.trim(),
            tags: [],
            visibility: "private",
            price: 0,
            featured: false
          }
        }
      })
    } catch (error) {
      console.error("Error saving prompt:", error)
      alert("Failed to save prompt. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTemplateClick = (template: Template) => {
    // Directly implement the template logic here instead of calling useTemplate
    setSelectedTemplate(template)
    setGeneratedPrompt(template.template)
    setPromptIdea(`Using template: ${template.name}`)
    setShowTemplates(false)

    if (template.persona) {
      const persona = personas.find((p) => p.id === template.persona)
      if (persona) setSelectedPersona(persona)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Persona Selection */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center">
                    <User className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                    Choose Profile
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplates(true)}
                    className="flex items-center"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    <span className="text-xs">Templates</span>
                  </Button>
                </div>
                <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar pr-1">
                  {personas.map((persona) => (
                    <Card
                      key={persona.id}
                      className={`p-3 cursor-pointer transition-all duration-200 hover:scale-[1.003] ${
                        selectedPersona?.id === persona.id
                          ? "bg-[#3ebb9e]/10 border-[#3ebb9e]/40 shadow-[0_0_15px_rgba(62,187,158,0.3)]"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedPersona(persona)}
                    >
                      <div className="flex items-start">
                        <div className="text-lg mr-2 flex-shrink-0">{persona.icon}</div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-xs text-foreground mb-1 truncate">{persona.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{persona.description}</p>
                          {selectedPersona?.id === persona.id && (
                            <Check className="h-3 w-3 text-[#3ebb9e] float-right" />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>

            {/* Middle Column - Generated Prompt */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                    Generated Prompt
                  </h2>
                  <div className="flex items-center space-x-2">
                    {selectedPersona && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowModelRecommendations(true)}
                        className="flex items-center space-x-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span className="text-xs">AI Models</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedPrompt)}
                      disabled={!generatedPrompt}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      <span className="text-xs">Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Create PDF using jsPDF
                        const doc = new jsPDF();
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const margin = 20;
                        const lineHeight = 7;

                        // Add title and metadata
                        doc.setFontSize(16);
                        doc.text('Prompt Forge - Generated Prompt', margin, margin);

                        // Add timestamp and persona info
                        doc.setFontSize(10);
                        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + lineHeight);
                        doc.text(`Persona: ${selectedPersona?.name || "None"}`, margin, margin + (lineHeight * 2));
                        doc.text(`Model: ${selectedModel.name}`, margin, margin + (lineHeight * 3));

                        // Add prompt idea section
                        doc.setFontSize(12);
                        doc.text('Prompt Idea:', margin, margin + (lineHeight * 5));
                        doc.setFontSize(10);
                        const promptIdeasLines = doc.splitTextToSize(promptIdea, pageWidth - (margin * 2));
                        doc.text(promptIdeasLines, margin, margin + (lineHeight * 6));

                        // Add generated prompt section
                        const responseStartY = margin + (lineHeight * (7 + promptIdeasLines.length));
                        doc.setFontSize(12);
                        doc.text('Generated Prompt:', margin, responseStartY);
                        doc.setFontSize(10);
                        const generatedPromptLines = doc.splitTextToSize(generatedPrompt, pageWidth - (margin * 2));
                        doc.text(generatedPromptLines, margin, responseStartY + lineHeight);

                        // Save the PDF
                        doc.save(`prompt-builder-${new Date().toISOString().slice(0,10)}.pdf`);
                      }}
                      disabled={!generatedPrompt}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      <span className="text-xs">Export</span>
                    </Button>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 flex-1 min-h-0 max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
                  {isGenerating || generatedPrompt ? (
                    <StreamingDisplay
                      content={streamingEnabled ? typingEffect.displayText : generatedPrompt}
                      isLoading={isGenerating}
                      streamingEnabled={streamingEnabled}
                      placeholder="Generating your prompt..."
                      className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed"
                    />
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
                        <Label htmlFor="prompt-name" className="text-sm font-medium text-foreground pb-1 block">
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
            </div>

            {/* Right Column - Prompt Idea Input */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                  Your Idea
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="prompt-idea" className="text-sm font-medium text-foreground">
                      Describe what you want your prompt to do
                    </Label>
                    <textarea
                      id="prompt-idea"
                      className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none"
                      rows={6}
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

              {/* Tips */}
              <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-blue-500" />
                  Pro Tips
                </h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p>Be specific about your desired output format</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p>Include examples in your idea</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p>Test and iterate based on results</p>
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
                  <Card
                    key={template.id}
                    className="p-4 hover:shadow-md transition-shadow"
                    onClick={() => handleTemplateClick(template)}
                  >
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
                Select AI Model
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModelRecommendations(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Based on your profile as a <strong>{selectedPersona.name}</strong>, here are the best AI models for your
                use case. Click to select a model for prompt generation:
              </p>

              <div className="space-y-3">
                {getRecommendedModels().map((model, index) => (
                  <Card
                    key={model.id}
                    className={`p-4 ${model.cardBg} ${
                      selectedModel.id === model.id ? model.selectedGlow : model.glowColor
                    } transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
                    onClick={() => setSelectedModel(model)}
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
                          {selectedModel.id === model.id && (
                            <Check className={`h-4 w-4 ${model.textColor} ml-auto`} />
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

              <div className="mt-6 flex justify-between">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex-1">
                  <p className="text-sm text-blue-600">
                    💡 <strong>Selected:</strong> {selectedModel.name}
                  </p>
                </div>
                <Button
                  className="ml-4 bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                  onClick={() => setShowModelRecommendations(false)}
                >
                  Confirm Selection
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Streaming Controls - Add this section for streaming toggle */}
      <div className="absolute bottom-2 right-2 flex items-center space-x-2 text-xs text-muted-foreground">
        <span>Streaming:</span>
        <button 
          onClick={() => setStreamingEnabled(!streamingEnabled)}
          className={`w-8 h-4 rounded-full transition-colors ${
            streamingEnabled ? "bg-[#3ebb9e]" : "bg-gray-300 dark:bg-gray-700"
          } relative`}
        >
          <span className={`absolute w-3 h-3 rounded-full bg-white top-0.5 transition-all ${
            streamingEnabled ? "left-4.5" : "left-0.5"
          }`} />
        </button>
      </div>
    </div>
  )
}
