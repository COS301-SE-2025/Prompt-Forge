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
  ChevronUp,
  ChevronDown,
  Filter,
  HelpCircle
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
    model: "meta-llama/llama-4-scout",
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
  const [showProfiles, setShowProfiles] = useState(false); // For mobile profile panel
  const [profilesCollapsed, setProfilesCollapsed] = useState(false); // For collapsible profiles
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [showHelpModal, setShowHelpModal] = useState(false)
  const streamingService = new StreamingService();
  const navigate = useNavigate();
  
  const typingEffect = useTypingEffect({ 
    speed: typingSpeed, 
    batchSize: typingSpeed < 20 ? 3 : typingSpeed < 50 ? 2 : 1 
  });

  const showNotification = (type: "success" | "error", title: string, message: string) => {
    const color = type === "success" ? "green" : "red"
    const bg = type === "success" ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
                                  : "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200"
    const icon = type === "success"
      ? `<svg class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`
      : `<svg class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`
    const notification = document.createElement('div')
    notification.className = `fixed bottom-4 right-4 ${bg} border p-4 rounded-lg shadow-lg z-50 max-w-md animate-fade-in`
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">${icon}</div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium">${title}</h3>
          <div class="mt-1 text-xs">${message}</div>
        </div>
      </div>
    `
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.classList.add('animate-fade-out')
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 500)
    }, 4000)
  }

  const generatePrompt = async () => {
    if (!selectedPersona) {
      showNotification("error", "Profile Required", "Please select a profile before generating a prompt.");
      return;
    }
    
    if (!promptIdea.trim()) {
      showNotification("error", "Idea Required", "Please describe your prompt idea before generating.");
      return;
    }

    setIsGenerating(true)
    setGeneratedPrompt("")
    typingEffect.clear()
    
    let accumulatedContent = ""

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
            content: `Please transform this basic idea into a well-structured, effective prompt, ONLY give me the prompt text without any additional explanation or context:

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
            accumulatedContent += content
            
            if (streamingEnabled) {
              typingEffect.addText(content)
            } else {
              const decodedContent = streamingService.decodeUnicode(content)
              setGeneratedPrompt(decodedContent)
              accumulatedContent = decodedContent
            }
          },
          onComplete: () => {
            setIsGenerating(false)
            setGeneratedPrompt(accumulatedContent)
            showNotification("success", "Prompt Generated", "Your optimized prompt has been generated successfully!");
            console.log("✅ Prompt generation completed")
          },
          onError: (error: string) => {
            setIsGenerating(false)
            setGeneratedPrompt(`Error: ${error}`)
            showNotification("error", "Generation Failed", `Failed to generate prompt: ${error}`);
          }
        }
      );
    } catch (error) {
      console.error("Error generating prompt:", error)
      setGeneratedPrompt("Error generating prompt. Please try again.")
      setIsGenerating(false)
      showNotification("error", "Generation Error", "An unexpected error occurred while generating your prompt.");
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

  const copyToClipboard = async (text: string, buttonId = 'default') => {
    if (!text) {
      showNotification("error", "Copy Failed", "No content to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text)
      
      // Set copied state for this specific button
      setCopiedStates(prev => ({ ...prev, [buttonId]: true }));
      
      // Show success notification
      showNotification("success", "Copied Successfully", "Content copied to clipboard!");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [buttonId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err)
      showNotification("error", "Copy Failed", "Failed to copy to clipboard. Please try again.");
    }
  }

  const savePrompt = async () => {
    if (!promptName.trim() || !generatedPrompt.trim() || !selectedPersona) {
      showNotification("error", "Save Failed", "Please ensure you have a prompt name, generated content, and selected profile.");
      return;
    }

    const username = localStorage.getItem('username')
    if (!username || username === 'Guest') {
      showNotification("error", "Login Required", "Please log in to save prompts");
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
      
      showNotification("success", "Redirecting", "Taking you to the submit page to save your prompt...");
    } catch (error) {
      console.error("Error saving prompt:", error)
      showNotification("error", "Save Failed", "Failed to save prompt. Please try again.");
    } finally {
      setIsSaving(false)
    }
  }

  const handleTemplateClick = (template: Template) => {
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
      <div className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-4">
            {/* Mobile Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-bold">Prompt Builder</h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  <span className="text-xs">Templates</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProfiles(!showProfiles)}
                  className="flex items-center"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  <span className="text-xs">Profiles</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowHelpModal(true)}
                  className="flex items-center"
                  title="Help & Tips"
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  <span className="text-xs">Help</span>
                </Button>
              </div>
            </div>

            {/* Selected Profile Display */}
            {selectedPersona && (
              <Card className="p-3 bg-[#3ebb9e]/10 border-[#3ebb9e]/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{selectedPersona.icon}</span>
                    <div>
                      <h3 className="text-sm font-medium">{selectedPersona.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedPersona.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfiles(true)}
                    className="text-[#3ebb9e]"
                  >
                    Change
                  </Button>
                </div>
              </Card>
            )}

            {/* Mobile Prompt Input */}
            <Card className="p-3 sm:p-4">
              <h2 className="text-base font-semibold text-foreground mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                Your Idea
              </h2>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="prompt-idea-mobile" className="text-sm font-medium text-foreground">
                    Describe what you want your prompt to do
                  </Label>
                  <textarea
                    id="prompt-idea-mobile"
                    className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none custom-scrollbar"
                    rows={4}
                    placeholder="e.g., 'Help me write better product descriptions for my online store'"
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

            {/* Mobile Generated Prompt */}
            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Generated Prompt
                </h2>
                <div className="flex items-center space-x-1">
                  {selectedPersona && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModelRecommendations(true)}
                      className="px-2"
                    >
                      <Sparkles className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedPrompt, 'mobile-copy')}
                    disabled={!generatedPrompt}
                    className="px-2"
                  >
                    {copiedStates['mobile-copy'] ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    <span className="text-xs">{copiedStates['mobile-copy'] ? 'Copied' : 'Copy'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const doc = new jsPDF();
                      const pageWidth = doc.internal.pageSize.getWidth();
                      const margin = 20;
                      const lineHeight = 7;

                      doc.setFontSize(16);
                      doc.text('Prompt Forge - Generated Prompt', margin, margin);

                      doc.setFontSize(10);
                      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + lineHeight);
                      doc.text(`Persona: ${selectedPersona?.name || "None"}`, margin, margin + (lineHeight * 2));
                      doc.text(`Model: ${selectedModel.name}`, margin, margin + (lineHeight * 3));

                      doc.setFontSize(12);
                      doc.text('Prompt Idea:', margin, margin + (lineHeight * 5));
                      doc.setFontSize(10);
                      const promptIdeasLines = doc.splitTextToSize(promptIdea, pageWidth - (margin * 2));
                      doc.text(promptIdeasLines, margin, margin + (lineHeight * 6));

                      const responseStartY = margin + (lineHeight * (7 + promptIdeasLines.length));
                      doc.setFontSize(12);
                      doc.text('Generated Prompt:', margin, responseStartY);
                      doc.setFontSize(10);
                      const generatedPromptLines = doc.splitTextToSize(generatedPrompt, pageWidth - (margin * 2));
                      doc.text(generatedPromptLines, margin, responseStartY + lineHeight);

                      doc.save(`prompt-builder-${new Date().toISOString().slice(0,10)}.pdf`);
                    }}
                    disabled={!generatedPrompt}
                    className="px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
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
                      <Wand2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Your optimized prompt will appear here</p>
                      <p className="text-xs mt-1">Select a profile and describe your idea to get started</p>
                    </div>
                  </div>
                )}
              </div>

              {generatedPrompt && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="prompt-name-mobile" className="text-sm font-medium text-foreground">
                        Save as:
                      </Label>
                      <Input
                        id="prompt-name-mobile"
                        placeholder="Enter prompt name"
                        value={promptName}
                        onChange={(e) => setPromptName(e.target.value)}
                        className="mt-1 bg-muted"
                      />
                    </div>
                    <Button
                      onClick={savePrompt}
                      disabled={!promptName.trim() || isSaving}
                      className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white"
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

            {/* Mobile Tips */}
            <Card className="p-3 bg-blue-500/5 border-blue-500/20">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                <Star className="h-3 w-3 mr-2 text-blue-500" />
                Pro Tips
              </h3>
              <div className="space-y-1 text-xs text-muted-foreground">
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

          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-8rem)]">
            {/* Left Column - Persona Selection */}
            <div className="lg:col-span-1 flex flex-col min-h-0">
              <Card className="p-4 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <h2 className="text-base font-semibold text-foreground flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                    Choose Profile
                  </h2>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplates(true)}
                      className="flex items-center px-2 h-7"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      <span className="text-xs">Templates</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setProfilesCollapsed(!profilesCollapsed)}
                      className="h-7 w-7"
                    >
                      {profilesCollapsed ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronUp className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {!profilesCollapsed && (
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                    <div className="space-y-2">
                      {personas.map((persona) => (
                        <Card
                          key={persona.id}
                          className={`p-2 cursor-pointer transition-all duration-200 hover:scale-[1.003] ${
                            selectedPersona?.id === persona.id
                              ? "bg-[#3ebb9e]/10 border-[#3ebb9e]/40 shadow-[0_0_15px_rgba(62,187,158,0.3)]"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedPersona(persona)}
                        >
                          <div className="flex items-start">
                            <div className="text-base mr-2 flex-shrink-0">{persona.icon}</div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-xs text-foreground mb-1 truncate">{persona.name}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">{persona.description}</p>
                              {selectedPersona?.id === persona.id && (
                                <Check className="h-3 w-3 text-[#3ebb9e] float-right mt-1" />
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {profilesCollapsed && selectedPersona && (
                  <div className="mt-2 flex-shrink-0">
                    <Card className="p-3 bg-[#3ebb9e]/10 border-[#3ebb9e]/40">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{selectedPersona.icon}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium truncate">{selectedPersona.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{selectedPersona.description}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>
            </div>

            {/* Middle Column - Generated Prompt */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <Card className="p-4 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <h2 className="text-base font-semibold text-foreground flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                    Generated Prompt
                  </h2>
                  <div className="flex items-center space-x-1">
                    {selectedPersona && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowModelRecommendations(true)}
                        className="flex items-center space-x-1 px-2 h-7"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span className="text-xs">AI Models</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedPrompt, 'desktop-copy')}
                      disabled={!generatedPrompt}
                      className="px-2 h-7"
                    >
                      {copiedStates['desktop-copy'] ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      <span className="text-xs">{copiedStates['desktop-copy'] ? 'Copied' : 'Copy'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const doc = new jsPDF();
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const margin = 20;
                        const lineHeight = 7;

                        doc.setFontSize(16);
                        doc.text('Prompt Forge - Generated Prompt', margin, margin);

                        doc.setFontSize(10);
                        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + lineHeight);
                        doc.text(`Persona: ${selectedPersona?.name || "None"}`, margin, margin + (lineHeight * 2));
                        doc.text(`Model: ${selectedModel.name}`, margin, margin + (lineHeight * 3));

                        doc.setFontSize(12);
                        doc.text('Prompt Idea:', margin, margin + (lineHeight * 5));
                        doc.setFontSize(10);
                        const promptIdeasLines = doc.splitTextToSize(promptIdea, pageWidth - (margin * 2));
                        doc.text(promptIdeasLines, margin, margin + (lineHeight * 6));

                        const responseStartY = margin + (lineHeight * (7 + promptIdeasLines.length));
                        doc.setFontSize(12);
                        doc.text('Generated Prompt:', margin, responseStartY);
                        doc.setFontSize(10);
                        const generatedPromptLines = doc.splitTextToSize(generatedPrompt, pageWidth - (margin * 2));
                        doc.text(generatedPromptLines, margin, responseStartY + lineHeight);

                        doc.save(`prompt-builder-${new Date().toISOString().slice(0,10)}.pdf`);
                      }}
                      disabled={!generatedPrompt}
                      className="px-2 h-7"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      <span className="text-xs">Export</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowHelpModal(true)}
                      className="flex items-center"
                      title="Help & Tips"
                    >
                      <HelpCircle className="h-3 w-3 mr-1" />
                      <span className="text-xs">Help</span>
                    </Button>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
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
                        <Wand2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Your optimized prompt will appear here</p>
                        <p className="text-xs mt-1">Select a profile and describe your idea to get started</p>
                      </div>
                    </div>
                  )}
                </div>

                {generatedPrompt && (
                  <div className="mt-3 pt-3 border-t border-border flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <Label htmlFor="prompt-name" className="text-xs font-medium text-foreground pb-1 block">
                          Save as:
                        </Label>
                        <Input
                          id="prompt-name"
                          placeholder="Enter prompt name"
                          value={promptName}
                          onChange={(e) => setPromptName(e.target.value)}
                          className="mt-1 bg-muted h-8 text-sm"
                        />
                      </div>
                      <Button
                        onClick={savePrompt}
                        disabled={!promptName.trim() || isSaving}
                        className="bg-[#3ebb9e] hover:bg-[#00674f] text-white mt-4 h-8 px-3 text-sm"
                      >
                        {isSaving ? (
                          <>
                            <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
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
            <div className="lg:col-span-1 flex flex-col space-y-3">
              <Card className="p-4 flex flex-col flex-1 min-h-0">
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center flex-shrink-0">
                  <Lightbulb className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Your Idea
                </h2>
                <div className="flex flex-col flex-1 min-h-0 space-y-3">
                  <div className="flex-1 min-h-0 flex flex-col">
                    <Label htmlFor="prompt-idea" className="text-xs font-medium text-foreground mb-2">
                      Describe what you want your prompt to do
                    </Label>
                    <textarea
                      id="prompt-idea"
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none custom-scrollbar flex-1 min-h-[100px] max-h-[200px]"
                      placeholder="e.g., 'Help me write better product descriptions for my online store' or 'Create a prompt that helps debug Python code'"
                      value={promptIdea}
                      onChange={(e) => setPromptIdea(e.target.value)}
                    />
                  </div>
                  <div className="flex-shrink-0 pt-2">
                    <Button
                      onClick={generatePrompt}
                      disabled={!promptIdea.trim() || !selectedPersona || isGenerating}
                      className="w-full bg-[#3ebb9e] hover:bg-[#00674f] text-white h-10 flex-shrink-0"
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
                </div>
              </Card>

              {/* Compact Tips */}
              <Card className="p-3 bg-blue-500/5 border-blue-500/20 flex-shrink-0">
                <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center">
                  <Star className="h-3 w-3 mr-1 text-blue-500" />
                  Pro Tips
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
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

      {/* Mobile Profiles Overlay */}
      {showProfiles && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowProfiles(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full sm:w-96 bg-card border-r border-border z-50 lg:hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                Choose Profile
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfiles(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {personas.map((persona) => (
                <Card
                  key={persona.id}
                  className={`p-3 cursor-pointer transition-all duration-200 ${
                    selectedPersona?.id === persona.id
                      ? "bg-[#3ebb9e]/10 border-[#3ebb9e]/40 shadow-[0_0_15px_rgba(62,187,158,0.3)]"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    setSelectedPersona(persona)
                    setShowProfiles(false)
                  }}
                >
                  <div className="flex items-start">
                    <div className="text-lg mr-3 flex-shrink-0">{persona.icon}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm text-foreground mb-1">{persona.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{persona.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">{persona.useCase}</p>
                      {selectedPersona?.id === persona.id && (
                        <Check className="h-4 w-4 text-[#3ebb9e] float-right mt-2" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-[#3ebb9e]" />
                Prompt Templates
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTemplates(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 h-full overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className="p-3 sm:p-4 hover:shadow-md hover:shadow-[#3ebb9e]/20 dark:hover:shadow-[#3ebb9e]/10 transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 hover:border-[#3ebb9e]/30"
                      onClick={() => handleTemplateClick(template)}
                    >
                      <div className="flex flex-col h-full">
                        <div className="mb-3">
                          <h3 className="font-medium text-sm sm:text-base text-foreground mb-2">{template.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3">{template.description}</p>
                          <span className="inline-block px-2 sm:px-3 py-1 sm:py-1.5 bg-[#3ebb9e]/10 dark:bg-[#3ebb9e]/20 text-[#3ebb9e] dark:text-[#3ebb9e] border border-[#3ebb9e]/30 dark:border-[#3ebb9e]/50 text-xs rounded-full font-medium">
                            {template.category}
                          </span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-2 sm:p-3 flex-1">
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-mono leading-relaxed line-clamp-4">
                            {template.template}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Model Recommendations Modal */}
      {showModelRecommendations && selectedPersona && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-[#3ebb9e]" />
                Select AI Model
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModelRecommendations(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Based on your profile as a <strong>{selectedPersona.name}</strong>, here are the best AI models for your
                use case. Click to select a model for prompt generation:
              </p>

              <div className="space-y-2 sm:space-y-3">
                {getRecommendedModels().map((model, index) => (
                  <Card
                    key={model.id}
                    className={`p-3 sm:p-4 ${model.cardBg} ${
                      selectedModel.id === model.id ? model.selectedGlow : model.glowColor
                    } border-2 transition-all duration-200 hover:scale-[1.01] cursor-pointer`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">{model.icon}</div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm text-foreground truncate">{model.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{model.description}</p>
                        </div>
                      </div>
                      {selectedModel.id === model.id && (
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-[#3ebb9e]" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Help Modal - Prompt Builder Guide */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 custom-scrollbar">
          <div className="bg-background border border-border rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Prompt Builder Guide</h2>
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
                    <p>Choose a profile that matches your role (Developer, Marketer, etc.)</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">2.</span>
                    <p>Describe what you want your prompt to do in simple terms</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e] mt-0.5">3.</span>
                    <div className="flex items-center space-x-3">
                      <p>Click Generate Prompt to create your optimized prompt:</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">4.</span>
                    <p>Review the generated prompt and save it for use</p>
                  </div>
                </div>
              </section>

              {/* Builder Features */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  Builder Features
                </h3>
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-[#3ebb9e] text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                        AI
                      </div>
                      <h4 className="text-base font-bold text-foreground">Smart Profile Matching</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Each profile comes with specialized knowledge about your field and generates prompts tailored to your specific use cases.
                    </p>
                    <div className="bg-muted/30 p-2 rounded text-xs font-medium text-muted-foreground">
                      Perfect for: Role-specific optimization, industry terminology, relevant examples
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-violet-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                        📋
                      </div>
                      <h4 className="text-base font-bold text-foreground">Template Library</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Access pre-built templates for common tasks like code reviews, story generation, and business analysis.
                    </p>
                    <div className="bg-muted/30 p-2 rounded text-xs font-medium text-muted-foreground">
                      Perfect for: Quick starts, learning examples, standard formats
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                        🎯
                      </div>
                      <h4 className="text-base font-bold text-foreground">Model Recommendations</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get AI model suggestions based on your profile and prompt type for optimal results.
                    </p>
                    <div className="bg-muted/30 p-2 rounded text-xs font-medium text-muted-foreground">
                      Perfect for: Choosing the right AI, maximizing performance, task-specific models
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
                    <span className="text-xl flex-shrink-0">✨</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Streaming Generation</h4>
                      <p className="text-xs text-muted-foreground">
                        Watch your prompts being generated in real-time with adjustable typing speed.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">📄</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Export Options</h4>
                      <p className="text-xs text-muted-foreground">
                        Copy to clipboard or export as PDF with metadata and generation details.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">💾</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Direct Save</h4>
                      <p className="text-xs text-muted-foreground">
                        Save generated prompts directly to your collection with automatic metadata.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">🔄</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Template Integration</h4>
                      <p className="text-xs text-muted-foreground">
                        Templates automatically select matching profiles and fill in your idea field.
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
                      <p className="text-muted-foreground">Be specific about your desired output format</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Include examples in your idea description</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Choose the profile that best matches your role</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Test generated prompts in the Testing Ground</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Start with templates for common use cases</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Use model recommendations for best results</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Save successful prompts to your collection</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Iterate and refine based on testing results</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Example Workflows */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  Example Workflows
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Developer Workflow</h4>
                    <p className="text-xs text-muted-foreground">
                      1. Choose Developer profile → 2. Describe "Debug my React component errors" → 3. Generate → 4. Test in Testing Ground → 5. Save working prompt
                    </p>
                  </div>
                  
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Marketer Workflow</h4>
                    <p className="text-xs text-muted-foreground">
                      1. Select Marketer profile → 2. Use "Marketing Copy" template → 3. Customize for your product → 4. Generate variations → 5. Export as PDF
                    </p>
                  </div>
                  
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Creative Workflow</h4>
                    <p className="text-xs text-muted-foreground">
                      1. Pick Creative profile → 2. Browse story templates → 3. Describe your story concept → 4. Generate with recommended model → 5. Refine and save
                    </p>
                  </div>
                </div>
              </section>

              {/* Profile Details */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  What Each Profile Includes
                </h3>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start space-x-3">
                      <span className="text-[#3ebb9e] flex-shrink-0">•</span>
                      <p><strong>Specialized Knowledge:</strong> Industry-specific terminology and best practices</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#3ebb9e] flex-shrink-0">•</span>
                      <p><strong>Use Case Optimization:</strong> Prompts tailored to your specific work scenarios</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#3ebb9e] flex-shrink-0">•</span>
                      <p><strong>Model Recommendations:</strong> AI models that work best for your profile type</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#3ebb9e] flex-shrink-0">•</span>
                      <p><strong>Template Access:</strong> Pre-built prompts designed for your role and tasks</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#3ebb9e] flex-shrink-0">•</span>
                      <p><strong>Context Awareness:</strong> Understanding of your professional challenges and goals</p>
                    </div>
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