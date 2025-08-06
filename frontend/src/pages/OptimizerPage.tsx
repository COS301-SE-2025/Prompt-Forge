"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  Star,
} from "lucide-react"

// Mock suggestion data - easily replaceable with API endpoint
const mockSuggestions = [
  {
    id: 1,
    title: "Enhanced Clarity & Structure",
    prompt:
      "Act as a professional content writer with 10+ years of experience. Create a comprehensive blog post about sustainable living practices. Include: 1) An engaging introduction that hooks the reader, 2) 5 practical tips with real-world examples, 3) Statistical data to support each point, 4) A compelling call-to-action. Target audience: environmentally conscious millennials. Tone: informative yet conversational. Word count: 1200-1500 words.",
    improvements: [
      "Added specific role context",
      "Structured with numbered requirements",
      "Defined target audience",
      "Specified tone and length",
    ],
    score: 95,
    category: "Structure",
  },
  {
    id: 2,
    title: "Context-Rich Optimization",
    prompt:
      "You are an expert sustainability consultant who has helped 500+ companies reduce their carbon footprint. Write a detailed blog post about sustainable living practices for millennials aged 25-35 who are interested in environmental issues but may be overwhelmed by where to start. Focus on actionable, budget-friendly tips that can be implemented immediately. Include personal anecdotes, cite recent studies from 2023-2024, and end with a 30-day challenge. Use a friendly, encouraging tone that avoids being preachy.",
    improvements: [
      "Added expert credentials",
      "Specific demographic targeting",
      "Included timeline constraints",
      "Added engagement elements",
    ],
    score: 98,
    category: "Context",
  },
  {
    id: 3,
    title: "Output Format Specification",
    prompt:
      "Create a blog post about sustainable living practices. Format the response as follows:\n\n**Title:** [Catchy, SEO-optimized title]\n**Meta Description:** [150-160 characters]\n**Introduction:** [Hook + preview of content]\n**Main Content:** [5 sections with H2 headers, each containing 2-3 practical tips with examples]\n**Conclusion:** [Summary + call-to-action]\n**SEO Keywords:** [List 10 relevant keywords]\n\nTarget: millennials interested in eco-friendly lifestyle changes. Tone: conversational and inspiring.",
    improvements: [
      "Structured output format",
      "SEO optimization focus",
      "Clear section requirements",
      "Keyword targeting",
    ],
    score: 92,
    category: "Format",
  },
]

export default function OptimizerPage() {
  const navigate = useNavigate();
  const location = useLocation();
   const searchParams = new window.URLSearchParams(location.search);

  const [originalPrompt, setOriginalPrompt] = useState("")
  const [suggestions, setSuggestions] = useState<typeof mockSuggestions>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

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

  const handleGenerateSuggestions = async () => {
    if (!originalPrompt.trim()) {
      showNotification("error", "No prompt provided", "Please enter a prompt to optimize")
      return
    }

    setIsGenerating(true)
    setShowSuggestions(false)
    setSuggestions([])

    // Simulate API call with realistic delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSuggestions(mockSuggestions)
    setIsGenerating(false)

    // Trigger animation
    setTimeout(() => setShowSuggestions(true), 100)
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

  const handleApplySuggestion = (suggestion: (typeof mockSuggestions)[0]) => {
    // Store the optimized prompt and navigate back to editor
    localStorage.setItem("optimizedPrompt", suggestion.prompt)
    navigate("/editor?optimized=true")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - More responsive */}
      <div className="relative overflow-hidden bg-card/80 dark:bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-[#40ffaa]/10 via-[#4079ff]/10 to-[#40ffaa]/10"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="relative">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-[#40ffaa] dark:text-[#4079ff] animate-pulse" />
                <Star
                  className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-[#40ffaa] dark:text-[#4079ff] animate-pulse"
                  style={{
                    filter: "drop-shadow(0 0 6px #40ffaa)",
                  }}
                />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium bg-gradient-to-r from-[#40ffaa] via-[#4079ff] to-[#40ffaa] bg-clip-text text-transparent mb-3 sm:mb-4">
              AI Prompt Optimizer
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Transform your prompts into powerful, optimized instructions that deliver exceptional results
            </p>
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
                <h2 className="text-lg sm:text-xl font-semibold text-foreground dark:text-foreground">Your Original Prompt</h2>
              </div>

              <Textarea
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                placeholder="Enter your prompt here to get AI-powered optimization suggestions..."
                className="min-h-[150px] sm:min-h-[200px] resize-none border-border dark:border-border focus:border-[#40ffaa] dark:focus:border-[#4079ff] transition-colors bg-muted dark:bg-muted placeholder:text-white-400/50 text-sm sm:text-base"
                />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 sm:mt-4 gap-2">
                <div className="text-xs sm:text-sm text-muted-foreground">{originalPrompt.length} characters</div>
                <Button
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating || !originalPrompt.trim()}
                  className="bg-gradient-to-r from-[#40ffaa] to-[#4079ff] hover:from-[#4079ff] hover:to-[#40ffaa] text-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base"
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
            </Card>

            {/* Stats Cards - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-center">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">3.2x</div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Avg Improvement</div>
              </Card>
              <Card className="p-3 sm:p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">95%</div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
              </Card>
              <Card className="p-3 sm:p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-center">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">4.9</div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">User Rating</div>
              </Card>
            </div>
          </div>

          {/* Suggestions Section */}
          <div className="space-y-4 sm:space-y-6 order-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#4079ff]/20 to-[#40ffaa]/20 dark:from-[#4079ff]/30 dark:to-[#40ffaa]/30 rounded-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#4079ff] dark:text-[#40ffaa]" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground dark:text-foreground">Optimized Suggestions</h2>
            </div>

            {/* Loading State */}
            {isGenerating && (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="p-4 sm:p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border"
                  >
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

            {/* Suggestions */}
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
                        <h3 className="font-semibold text-foreground dark:text-foreground text-sm sm:text-base truncate">{suggestion.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <Badge className="bg-gradient-to-r from-[#40ffaa] to-[#4079ff] text-background text-xs">
                          {suggestion.score}%
                        </Badge>
                        <ChevronRight
                          className={`h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground transition-transform duration-300 ${
                            selectedSuggestion === suggestion.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Improvements Preview */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {suggestion.improvements.slice(0, 2).map((improvement, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] sm:text-xs border-[#40ffaa] dark:border-[#4079ff] text-[#4079ff] dark:text-[#40ffaa]">
                          {improvement}
                        </Badge>
                      ))}
                      {suggestion.improvements.length > 2 && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs border-[#40ffaa] dark:border-[#4079ff] text-[#4079ff] dark:text-[#40ffaa]">
                          +{suggestion.improvements.length - 2} more
                        </Badge>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {selectedSuggestion === suggestion.id && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <div className="bg-muted dark:bg-muted/50 rounded-lg p-3 sm:p-4">
                          <h4 className="font-medium text-foreground dark:text-foreground mb-2 text-sm sm:text-base">Optimized Prompt:</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {suggestion.prompt}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground dark:text-foreground mb-2 text-sm sm:text-base">Key Improvements:</h4>
                          <div className="grid grid-cols-1 gap-1 sm:gap-2">
                            {suggestion.improvements.map((improvement, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
                              >
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#40ffaa] shrink-0" />
                                <span className="line-clamp-2">{improvement}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApplySuggestion(suggestion)
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
                            {copiedId === suggestion.id ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isGenerating && suggestions.length === 0 && originalPrompt && (
              <Card className="p-6 sm:p-8 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border text-center">
                <Wand2 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-[#4079ff] dark:text-[#40ffaa] mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-foreground dark:text-foreground mb-2">Ready to Optimize</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Click "Optimize Prompt" to get AI-powered suggestions for your prompt
                </p>
              </Card>
            )}

            {/* Stats Cards - Shown on mobile under suggestions */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:hidden">
              <Card className="p-2 sm:p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-center">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mx-auto mb-1 sm:mb-2" />
                <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">3.2x</div>
                <div className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">Avg Improvement</div>
              </Card>
              <Card className="p-2 sm:p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mx-auto mb-1 sm:mb-2" />
                <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">95%</div>
                <div className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">Success Rate</div>
              </Card>
              <Card className="p-2 sm:p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-center">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mx-auto mb-1 sm:mb-2" />
                <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">4.9</div>
                <div className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">User Rating</div>
              </Card>
            </div>
          </div>
        </div>
      </div>

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
