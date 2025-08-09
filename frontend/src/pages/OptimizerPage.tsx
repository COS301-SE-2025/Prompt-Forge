"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import promptOptimizerService from '@/services/promptOptimizerService'

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
  AlertCircle,
  BarChart3,
  Lightbulb
} from "lucide-react"

interface OptimizationResult {
  prompt: string;
  suggestions: Array<{
    suggestion: string;
    before: string;
    after: string;
    impact: string;
  }>;
  source: string;
}

export default function OptimizerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new window.URLSearchParams(location.search);

  const [originalPrompt, setOriginalPrompt] = useState("")
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showNotification = (type: "success" | "error", title: string, message: string) => {
    const bg = type === "success"
      ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
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

  // Check service health on component mount
  useEffect(() => {
    checkServiceHealth();
  }, []);

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
      await promptOptimizerService.healthCheck();
      setServiceStatus('online');
    } catch (error) {
      setServiceStatus('offline');
      console.error('ML service is offline:', error);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!originalPrompt.trim()) {
      showNotification("error", "No prompt provided", "Please enter a prompt to optimize")
      return
    }

    if (serviceStatus !== 'online') {
      showNotification("error", "Service Unavailable", "ML optimization service is currently offline")
      return
    }

    setIsGenerating(true)
    setShowSuggestions(false)
    setOptimizationResult(null)

    try {
      const result = await promptOptimizerService.optimizePrompt({
        prompt: originalPrompt
      });

      // Filter out empty or invalid suggestions
      const filteredSuggestions = Array.isArray(result.suggestions)
        ? result.suggestions.filter(
            (s: any) =>
              s &&
              typeof s.suggestion === "string" &&
              typeof s.before === "string" &&
              typeof s.after === "string" &&
              typeof s.impact === "string"
          )
        : [];

      // Map to your local type
      const mapped: OptimizationResult = {
        prompt: result.prompt ?? "",
        suggestions: filteredSuggestions.map((s: any) => ({
          suggestion: s.suggestion,
          before: s.before,
          after: s.after,
          impact: s.impact
        })),
        source: result.source ?? ""
      };

      setOptimizationResult(mapped);
      setTimeout(() => setShowSuggestions(true), 100);
      showNotification("success", "Optimization Complete", "Your prompt has been optimized with AI suggestions!")
    } catch (error) {
      console.error('Optimization failed:', error);
      showNotification("error", "Optimization Failed", "Unable to optimize prompt. Please try again.")
    } finally {
      setIsGenerating(false);
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
    localStorage.setItem("optimizedPrompt", optimizedPrompt)
    navigate("/editor?optimized=true")
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkServiceHealth();
    setIsRefreshing(false);
  };

  // Convert ML service response to display format
  const formatSuggestions = () => {
    if (!optimizationResult || !optimizationResult.suggestions) return [];
    return optimizationResult.suggestions.map((suggestion, index) => ({
      id: index + 1,
      title: suggestion.suggestion,
      prompt: suggestion.after || optimizationResult.prompt,
      improvements: [suggestion.suggestion, `Impact: ${suggestion.impact}`],
      score: 85 + (index * 5), // Mock scoring
      category: suggestion.impact?.includes('clarity') ? 'Clarity' : 
               suggestion.impact?.includes('structure') ? 'Structure' : 'Enhancement',
      before: suggestion.before,
      after: suggestion.after,
      impact: suggestion.impact
    }));
  };

  const suggestions = formatSuggestions();

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Smaller and compact */}
      <div className="relative overflow-hidden bg-card/80 dark:bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-[#40ffaa]/10 via-[#4079ff]/10 to-[#40ffaa]/10"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-[#40ffaa] dark:text-[#4079ff] animate-pulse" />
                <Star
                  className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#40ffaa] dark:text-[#4079ff] animate-pulse"
                  style={{
                    filter: "drop-shadow(0 0 6px #40ffaa)",
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-medium bg-gradient-to-r from-[#40ffaa] via-[#4079ff] to-[#40ffaa] bg-clip-text text-transparent">
                  AI Prompt Optimizer
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                  Transform your prompts with AI-powered optimization
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                serviceStatus === 'online' 
                  ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                  : serviceStatus === 'offline'
                  ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  serviceStatus === 'online' ? 'bg-green-500' : 
                  serviceStatus === 'offline' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <span className="hidden sm:inline">
                  {serviceStatus === 'checking' ? 'Connecting...' : 
                   serviceStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={serviceStatus === 'checking' || isRefreshing}
                className="border-gray-300 dark:border-gray-600 h-8"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                <h2 className="text-lg sm:text-xl font-semibold text-foreground dark:text-foreground">Your Original Prompt</h2>
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
                    <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                      • Long prompts may take more time
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating || !originalPrompt.trim() || serviceStatus !== 'online'}
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

              {serviceStatus !== 'online' && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      ML Service Unavailable
                    </p>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Please ensure the optimization service is running to use this feature.
                  </p>
                </div>
              )}
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
              <h2 className="text-lg sm:text-xl font-semibold text-foreground dark:text-foreground">AI Optimization Results</h2>
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
                        <h3 className="font-semibold text-foreground dark:text-foreground text-sm sm:text-base truncate">{suggestion.title}</h3>
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

                    {/* Improvements Preview */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {suggestion.improvements.slice(0, 2).map((improvement, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] sm:text-xs border-[#40ffaa] dark:border-[#4079ff] text-[#4079ff] dark:text-[#40ffaa]">
                          {improvement.length > 30 ? improvement.substring(0, 30) + '...' : improvement}
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
                        {/* Before/After Comparison */}
                        {suggestion.before && suggestion.after && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 sm:p-4 border border-red-200 dark:border-red-800">
                              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2 text-sm flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Before
                              </h4>
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-300">
                                {suggestion.before}
                              </p>
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
                            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">
                              {suggestion.impact}
                            </p>
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
            {!isGenerating && (!optimizationResult || suggestions.length === 0) && (
              <Card className="p-6 sm:p-8 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border text-center">
                <Wand2 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-[#4079ff] dark:text-[#40ffaa] mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-foreground dark:text-foreground mb-2">Ready to Optimize</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {serviceStatus === 'online' 
                    ? "Enter your prompt above and click 'Optimize Prompt' to get AI-powered suggestions"
                    : "Waiting for ML service to come online..."
                  }
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
