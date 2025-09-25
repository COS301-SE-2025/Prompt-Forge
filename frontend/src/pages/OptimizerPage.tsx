"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import promptOptimizerService from "@/services/promptOptimizerService"
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  ArrowRight,
  Target,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  Star,
  AlertCircle,
  BarChart3,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Users,
  Clock,
  Award,
  Rocket,
  Brain,
  FileText,
  ChevronDown,
  X,
} from "lucide-react"

interface OptimizationResult {
  prompt: string
  suggestions: Array<{
    suggestion: string
    before: string
    after: string
    impact: string
  }>
  source: string
}

export default function OptimizerPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new window.URLSearchParams(location.search)

  const [originalPrompt, setOriginalPrompt] = useState("")
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<"checking" | "online" | "offline">("checking")
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [expandedTip, setExpandedTip] = useState<number | null>(null)
  const [showAllExamples, setShowAllExamples] = useState(false)

  const showNotification = (type: "success" | "error", title: string, message: string) => {
    const bg =
      type === "success"
        ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
        : "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200"

    const icon =
      type === "success"
        ? `<svg class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>`
        : `<svg class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>`

    const notification = document.createElement("div")
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
      notification.classList.add("animate-fade-out")
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 500)
    }, 4000)
  }

  // Check service health on component mount
  useEffect(() => {
    checkServiceHealth()
  }, [])

  // Get prompt from URL params or localStorage
  useEffect(() => {
    const promptFromUrl = searchParams.get("prompt")
    const promptFromStorage = localStorage.getItem("currentPrompt")

    if (promptFromUrl) {
      setOriginalPrompt(decodeURIComponent(promptFromUrl))
    } else if (promptFromStorage) {
      setOriginalPrompt(promptFromStorage)
    }
  }, [location.search])

  const checkServiceHealth = async () => {
    try {
      await promptOptimizerService.healthCheck()
      setServiceStatus("online")
    } catch (error) {
      setServiceStatus("offline")
      console.error("ML service is offline:", error)
    }
  }

  const handleGenerateSuggestions = async () => {
    if (!originalPrompt.trim()) {
      showNotification("error", "No prompt provided", "Please enter a prompt to optimize")
      return
    }

    if (serviceStatus !== "online") {
      showNotification("error", "Service Unavailable", "ML optimization service is currently offline")
      return
    }

    setIsGenerating(true)
    setShowSuggestions(false)
    setOptimizationResult(null)

    try {
      // Use the simple optimization endpoint
      const result = await promptOptimizerService.optimizeSimple({
        text: originalPrompt,
      })

      // Filter out empty or invalid suggestions
      const filteredSuggestions = Array.isArray(result.suggestions)
        ? result.suggestions.filter(
            (s: any) =>
              s &&
              typeof s.suggestion === "string" &&
              typeof s.before === "string" &&
              typeof s.after === "string" &&
              typeof s.impact === "string",
          )
        : []

      // Map to your local type
      const mapped: OptimizationResult = {
        prompt: result.prompt ?? "",
        suggestions: filteredSuggestions.map((s: any) => ({
          suggestion: s.suggestion,
          before: s.before,
          after: s.after,
          impact: s.impact,
        })),
        source: result.source ?? "",
      }

      setOptimizationResult(mapped)
      setTimeout(() => setShowSuggestions(true), 100)
      showNotification("success", "Optimization Complete", "Your prompt has been optimized with AI suggestions!")
    } catch (error) {
      console.error("Optimization failed:", error)
      showNotification("error", "Optimization Failed", "Unable to optimize prompt. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyPrompt = async (prompt: string, id: number) => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedId(id)
      showNotification("success", "Copied!", "Prompt copied to clipboard!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      showNotification("error", "Failed to copy", "Please try again")
    }
  }

  const handleApplySuggestion = (optimizedPrompt: string) => {
    // Save the optimized prompt to localStorage
    localStorage.setItem("promptText", optimizedPrompt)
    // Navigate to the editor page, passing state for immediate use as well
    navigate("/editor", { state: { promptText: optimizedPrompt } })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await checkServiceHealth()
    setIsRefreshing(false)
  }

  // Convert ML service response to display format
  const formatSuggestions = () => {
    if (!optimizationResult || !optimizationResult.suggestions) return []

    return optimizationResult.suggestions.map((suggestion, index) => ({
      id: index + 1,
      title: suggestion.suggestion,
      prompt: suggestion.after || optimizationResult.prompt,
      improvements: [suggestion.suggestion, `Impact: ${suggestion.impact}`],
      score: 85 + index * 5, // Mock scoring
      category: suggestion.impact?.includes("clarity")
        ? "Clarity"
        : suggestion.impact?.includes("structure")
          ? "Structure"
          : "Enhancement",
      before: suggestion.before,
      after: suggestion.after,
      impact: suggestion.impact,
    }))
  }

  const suggestions = formatSuggestions()

  // Compact optimization tips for the main page
  const quickTips = [
    {
      icon: <Target className="h-4 w-4 text-[#40ffaa]" />,
      title: "Be Specific",
      description: "Replace vague terms with precise requirements",
    },
    {
      icon: <Users className="h-4 w-4 text-[#4079ff]" />,
      title: "Define Audience",
      description: "Always specify who the content is for",
    },
    {
      icon: <FileText className="h-4 w-4 text-[#40ffaa]" />,
      title: "Structure Request",
      description: "Use numbered lists or clear sections",
    },
    {
      icon: <Brain className="h-4 w-4 text-[#4079ff]" />,
      title: "Provide Context",
      description: "Give background information when relevant",
    },
  ]

  // Detailed content for help modal
  const detailedTips = [
    {
      icon: <Target className="h-5 w-5 text-[#40ffaa]" />,
      title: "Be Specific",
      description: "Replace vague terms with precise requirements",
      details:
        "Instead of 'write something good', specify format, length, tone, and target audience. The more specific you are, the better the AI can understand and fulfill your request.",
    },
    {
      icon: <Users className="h-5 w-5 text-[#4079ff]" />,
      title: "Define Your Audience",
      description: "Always specify who the content is for",
      details:
        "Mentioning your target audience (beginners, experts, children, professionals) helps the AI adjust complexity, tone, and examples appropriately.",
    },
    {
      icon: <FileText className="h-5 w-5 text-[#40ffaa]" />,
      title: "Structure Your Request",
      description: "Use numbered lists or clear sections",
      details:
        "Break complex requests into numbered points or sections. This helps the AI understand priorities and ensures all requirements are addressed.",
    },
    {
      icon: <Brain className="h-5 w-5 text-[#4079ff]" />,
      title: "Provide Context",
      description: "Give background information when relevant",
      details:
        "Share relevant context about your project, constraints, or goals. This helps the AI provide more tailored and useful responses.",
    },
  ]

  const promptExamples = [
    {
      category: "Creative Writing",
      before: "Write a story about a robot.",
      after:
        "Write a compelling 500-word science fiction short story about a sentient robot who discovers emotions for the first time. Include vivid descriptions, dialogue, and a surprising twist ending.",
      improvement: "Added specificity, word count, genre, emotional arc, and structural requirements",
    },
    {
      category: "Business",
      before: "Create a marketing plan.",
      after:
        "Develop a comprehensive 90-day digital marketing strategy for a B2B SaaS startup targeting small businesses. Include budget allocation, channel selection, KPIs, and monthly milestones.",
      improvement: "Specified timeline, target audience, business type, deliverables, and success metrics",
    },
    {
      category: "Education",
      before: "Explain quantum physics.",
      after:
        "Create a beginner-friendly explanation of quantum physics fundamentals for high school students. Use analogies, avoid complex equations, include 3 real-world applications, and end with discussion questions.",
      improvement: "Defined audience, complexity level, teaching methods, practical examples, and engagement elements",
    },
    {
      category: "Technical",
      before: "Write code for a website.",
      after:
        "Create a responsive React.js component for a user dashboard with authentication, data visualization using Chart.js, and mobile-first design. Include TypeScript types and error handling.",
      improvement: "Specified technology stack, features, design approach, type safety, and error management",
    },
  ]

  // Page load animation state
  const [pageLoaded, setPageLoaded] = useState(false)

  useEffect(() => {
    // Trigger page load animation
    setTimeout(() => setPageLoaded(true), 10)
  }, [])

  return (
    <div
      className={`min-h-screen bg-background transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Header - Larger and with Help button */}
      <div className="relative bg-card/80 dark:bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-7">
          {/* Remove separate back button, add X next to Help button below */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-[#40ffaa] dark:text-[#4079ff] animate-pulse" />
                <Star
                  className="absolute -top-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#40ffaa] dark:text-[#4079ff] animate-pulse"
                  style={{
                    filter: "drop-shadow(0 0 6px #40ffaa)",
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium bg-gradient-to-r from-[#40ffaa] via-[#4079ff] to-[#40ffaa] bg-clip-text text-transparent tracking-tight">
                  AI Recommendations
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                  Transform your prompts with AI-powered optimization
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  serviceStatus === "online"
                    ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                    : serviceStatus === "offline"
                      ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                      : "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    serviceStatus === "online"
                      ? "bg-green-500"
                      : serviceStatus === "offline"
                        ? "bg-red-500"
                        : "bg-gray-400"
                  }`}
                />
                <span className="hidden sm:inline">
                  {serviceStatus === "checking" ? "Connecting..." : serviceStatus === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={serviceStatus === "checking" || isRefreshing}
                className="h-8"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelpModal(true)}
                className="border-gray-300 dark:border-gray-600 h-8"
                title="Help & Tips"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/editor")}
                className="h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-300"
                title="Back to Testing Ground"
              >
                <X className="h-10 w-10" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Original Prompt Section */}
          <div className="space-y-4 sm:space-y-6 order-1 custom-scrollbar">
            <Card className="p-4 sm:p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-muted dark:bg-muted rounded-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-foreground dark:text-foreground" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground dark:text-foreground">
                  Your Original Prompt
                </h2>
              </div>

              <Textarea
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                placeholder="Enter your prompt here to get AI-powered optimization suggestions..."
                className="min-h-[150px] sm:min-h-[200px] resize-none border-border dark:border-border focus:border-[#40ffaa] dark:focus:border-[#4079ff] transition-colors bg-muted dark:bg-muted placeholder:text-white-400/50 text-sm sm:text-base"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 sm:mt-4 gap-2">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {originalPrompt.length} characters
                  {originalPrompt.length > 1000 && (
                    <span className="ml-2 text-yellow-600 dark:text-yellow-400">• Long prompts may take more time</span>
                  )}
                </div>
                <Button
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating || !originalPrompt.trim() || serviceStatus !== "online"}
                  className="bg-gradient-to-r from-[#40ffaa] to-[#4079ff] hover:from-[#4079ff] hover:to-[#40ffaa] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Optimizing...</span>
                      <span className="sm:hidden">Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Optimize Prompt</span>
                      <span className="sm:hidden">Optimize</span>
                    </>
                  )}
                </Button>
              </div>

              {serviceStatus !== "online" && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">ML Service Unavailable</p>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Please ensure the optimization service is running to use this feature.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Suggestions Section */}
          <div className="space-y-4 sm:space-y-6 order-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#4079ff]/20 to-[#40ffaa]/20 dark:from-[#4079ff]/30 dark:to-[#40ffaa]/30 rounded-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#4079ff] dark:text-[#40ffaa]" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground dark:text-foreground">
                AI Optimization Results
              </h2>
            </div>

            {/* Loading State */}
            {isGenerating && (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 sm:p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                    <div className="animate-pulse">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="h-3 w-3 sm:h-4 sm:w-4 bg-muted dark:bg-muted rounded"></div>
                        <div className="h-3 sm:h-4 bg-muted dark:bg-muted rounded flex-1"></div>
                        <div className="h-5 w-10 sm:h-6 sm:w-12 bg-muted dark:bg-muted rounded-full"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 sm:h-3 bg-muted dark:bg-muted rounded w-full"></div>
                        <div className="h-2 sm:h-3 bg-muted dark:bg-muted rounded w-3/4"></div>
                        <div className="h-2 sm:h-3 bg-muted dark:bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Suggestions from ML Service */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={suggestion.id}
                    className={`p-4 sm:p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer ${
                      selectedSuggestion === suggestion.id ? "ring-2 ring-[#4079ff] dark:ring-[#40ffaa]" : ""
                    }`}
                    style={{
                      animationDelay: `${index * 200}ms`,
                      animation: "slideInUp 0.6s ease-out forwards",
                    }}
                    onClick={() => setSelectedSuggestion(selectedSuggestion === suggestion.id ? null : suggestion.id)}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-[#40ffaa]/20 to-[#4079ff]/20 dark:from-[#40ffaa]/30 dark:to-[#4079ff]/30 text-[#4079ff] dark:text-[#40ffaa] text-xs shrink-0"
                        >
                          {suggestion.category}
                        </Badge>
                        <h3
                          className="font-semibold text-foreground dark:text-foreground text-sm sm:text-base line-clamp-2"
                          title={suggestion.title}
                        >
                          {suggestion.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <Badge className="bg-gradient-to-r from-[#40ffaa] to-[#4079ff] text-background text-xs">
                          AI Enhanced
                        </Badge>
                        <ChevronRight
                          className={`h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground transition-transform duration-300 ${
                            selectedSuggestion === suggestion.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Show the optimized prompt title when collapsed */}
                    {selectedSuggestion !== suggestion.id && (
                      <div className="mb-2">
                        <span className="block text-xs text-muted-foreground font-medium truncate">
                          {suggestion.prompt}
                        </span>
                      </div>
                    )}

                    {/* Expanded Content */}
                    {selectedSuggestion === suggestion.id && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        {/* Before/After Comparison */}
                        {suggestion.before && suggestion.after && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 sm:p-4 border border-red-200 dark:border-red-800">
                              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2 text-sm flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Before
                              </h4>
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-300">{suggestion.before}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
                              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 text-sm flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                After
                              </h4>
                              <p className="text-xs sm:text-sm text-green-600 dark:text-green-300">
                                {suggestion.after}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Optimized Full Prompt */}
                        <div className="bg-muted dark:bg-muted/50 rounded-lg p-3 sm:p-4">
                          <h4 className="font-medium text-foreground dark:text-foreground mb-2 text-sm sm:text-base flex items-center">
                            <Lightbulb className="h-4 w-4 mr-2 text-[#40ffaa]" />
                            Optimized Prompt
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {suggestion.prompt}
                          </p>
                        </div>

                        {/* Impact Description */}
                        {suggestion.impact && (
                          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2 text-sm flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Impact Analysis
                            </h4>
                            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">{suggestion.impact}</p>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApplySuggestion(suggestion.prompt)
                            }}
                            className="flex-1 bg-gradient-to-r from-[#40ffaa] to-[#4079ff] hover:from-[#4079ff] hover:to-[#40ffaa] text-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                          >
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Apply to Editor</span>
                            <span className="sm:hidden">Apply</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyPrompt(suggestion.prompt, suggestion.id)
                            }}
                            className="border-[#40ffaa] dark:border-[#4079ff] hover:bg-muted dark:hover:bg-muted/50 text-sm"
                          >
                            {copiedId === suggestion.id ? (
                              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isGenerating && (!optimizationResult || suggestions.length === 0) && (
              <Card className="p-6 sm:p-8 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border text-center">
                <Wand2 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-[#4079ff] dark:text-[#40ffaa] mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-foreground dark:text-foreground mb-2">
                  Ready to Optimize
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {serviceStatus === "online"
                    ? "Enter your prompt above and click 'Optimize Prompt' to get AI-powered suggestions"
                    : "Waiting for ML service to come online..."}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Compact Optimization Tips Section */}
      <div className="bg-gradient-to-br from-muted/20 to-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#40ffaa]" />
              Quick Optimization Tips
            </h3>
            <p className="text-sm text-muted-foreground">
              Essential tips for better prompts •{" "}
              <button
                onClick={() => setShowHelpModal(true)}
                className="text-[#4079ff] dark:text-[#40ffaa] hover:underline font-medium"
              >
                View detailed guide
              </button>
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickTips.map((tip, index) => (
              <Card key={index} className="p-3 sm:p-4 bg-card/60 hover:bg-card/80 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  {tip.icon}
                  <h4 className="font-semibold text-foreground text-sm">{tip.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 custom-scrollbar">
          <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">AI Optimizer Complete Guide</h2>
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
              {/* How to Use Section */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  <BookOpen className="h-5 w-5 mr-2 text-[#40ffaa]" />
                  How to Use the AI Prompt Optimizer
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Enter your prompt in the text area on the left side.</li>
                  <li>
                    Click <span className="font-semibold text-[#4079ff]">Optimize Prompt</span> to get AI-powered
                    suggestions.
                  </li>
                  <li>Review the suggestions and click on any card to see detailed improvements.</li>
                  <li>Use "Apply to Editor" to send the optimized prompt back to the editor.</li>
                  <li>Copy any optimized prompt to your clipboard for use elsewhere.</li>
                </ol>
              </section>

              {/* Detailed Optimization Tips */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  <Lightbulb className="h-5 w-5 mr-2 text-[#4079ff]" />
                  Detailed Optimization Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailedTips.map((tip, index) => (
                    <Card
                      key={index}
                      className="p-4 bg-card/60 hover:bg-card/80 transition-all duration-300 cursor-pointer"
                      onClick={() => setExpandedTip(expandedTip === index ? null : index)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {tip.icon}
                        <h4 className="font-semibold text-foreground">{tip.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>

                      {expandedTip === index && (
                        <div className="mt-3 pt-3 border-t border-border animate-fadeIn">
                          <p className="text-xs text-muted-foreground leading-relaxed">{tip.details}</p>
                        </div>
                      )}

                      <div className="flex justify-end mt-2">
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                            expandedTip === index ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Before/After Examples */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  <BarChart3 className="h-5 w-5 mr-2 text-[#40ffaa]" />
                  Before & After Examples
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {promptExamples.slice(0, showAllExamples ? promptExamples.length : 2).map((example, index) => {
                    // Assign a flat transparent color for each tag
                    const tagColors = [
                      "bg-blue-400/15 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700",
                      "bg-pink-400/15 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-700",
                      "bg-orange-400/15 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700",
                      "bg-purple-400/15 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700"
                    ];
                    const colorClass = tagColors[index % tagColors.length];
                    return (
                      <Card key={index} className="p-6 bg-card/60">
                        <div className="mb-4">
                          <Badge className={`${colorClass} font-semibold rounded-full px-3 py-1 text-xs shadow-none`}>
                            {example.category}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
                            <h4 className="font-medium text-red-700 dark:text-red-400 mb-2 text-sm flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Before Optimization
                            </h4>
                            <p className="text-sm text-red-600 dark:text-red-300 italic">"{example.before}"</p>
                          </div>

                          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
                            <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 text-sm flex items-center">
                              <Check className="h-4 w-4 mr-2" />
                              After Optimization
                            </h4>
                            <p className="text-sm text-green-600 dark:text-green-300">"{example.after}"</p>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              <strong>Key Improvement:</strong> {example.improvement}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {promptExamples.length > 2 && (
                  <div className="text-center mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllExamples(!showAllExamples)}
                      className="border-[#40ffaa] dark:border-[#4079ff] text-[#4079ff] dark:text-[#40ffaa] hover:bg-[#40ffaa]/10 dark:hover:bg-[#4079ff]/10"
                    >
                      {showAllExamples ? "Show Less" : `Show ${promptExamples.length - 2} More Examples`}
                      <ChevronDown
                        className={`h-4 w-4 ml-2 transition-transform ${showAllExamples ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </div>
                )}
              </section>

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}