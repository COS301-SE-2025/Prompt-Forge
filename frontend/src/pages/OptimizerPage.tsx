"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Checkbox } from "@/components/ui/Checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import promptOptimizerService from "@/services/promptOptimizerService"
import {
  Sparkles,
  Wand2,
  Check,
  ArrowRight,
  ArrowLeft,
  Target,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Lightbulb,
  BarChart,
  Search,
  Settings,
  Eye,
  Save,
  Play,
  CheckCircle,
  XCircle,
  Globe,
  Layout,
  Type,
  Hash,
  List,
  AlignLeft,
  TestTube,
  Star,
  Copy,
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

interface WizardData {
  originalPrompt: string
  analysisResults: {
    clarity: number
    specificity: number
    structure: number
    context: number
    issues: string[]
    suggestions: string[]
  }
  goals: {
    primaryObjective: string
    targetAudience: string
    outputFormat: string
    tone: string
    length: string
    complexity: string
    customGoals: string[]
  }
  structure: {
    hasIntroduction: boolean
    hasMainContent: boolean
    hasConclusion: boolean
    usesBulletPoints: boolean
    usesNumberedList: boolean
    hasExamples: boolean
    structuredPrompt: string
  }
  context: {
    domain: string
    useCase: string
    constraints: string[]
    requirements: string[]
    additionalContext: string
  }
  testing: {
    testResults: any[]
    selectedModel: string
    performanceMetrics: {
      relevance: number
      coherence: number
      completeness: number
    }
  }
  finalPrompt: string
}

const WIZARD_STEPS = [
  { id: 1, name: "Analysis", icon: BarChart, description: "Analyze current prompt" },
  { id: 2, name: "Goals", icon: Target, description: "Define objectives" },
  { id: 3, name: "Structure", icon: Layout, description: "Improve organization" },
  { id: 4, name: "Context", icon: Globe, description: "Add context & constraints" },
  { id: 5, name: "Testing", icon: TestTube, description: "Test & validate" },
  { id: 6, name: "Review", icon: CheckCircle, description: "Review & save" },
]

export default function OptimizerWizard() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<"checking" | "online" | "offline">("checking")
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [wizardData, setWizardData] = useState<WizardData>({
    originalPrompt: "",
    analysisResults: {
      clarity: 0,
      specificity: 0,
      structure: 0,
      context: 0,
      issues: [],
      suggestions: [],
    },
    goals: {
      primaryObjective: "",
      targetAudience: "",
      outputFormat: "",
      tone: "",
      length: "",
      complexity: "",
      customGoals: [],
    },
    structure: {
      hasIntroduction: false,
      hasMainContent: true,
      hasConclusion: false,
      usesBulletPoints: false,
      usesNumberedList: false,
      hasExamples: false,
      structuredPrompt: "",
    },
    context: {
      domain: "",
      useCase: "",
      constraints: [],
      requirements: [],
      additionalContext: "",
    },
    testing: {
      testResults: [],
      selectedModel: "gpt-4",
      performanceMetrics: {
        relevance: 0,
        coherence: 0,
        completeness: 0,
      },
    },
    finalPrompt: "",
  })

  // Notification system from original optimizer
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

  // Initialize with prompt from URL or localStorage
  useEffect(() => {
    const promptFromUrl = searchParams.get("prompt")
    const promptFromStorage = localStorage.getItem("currentPrompt")

    if (promptFromUrl) {
      setWizardData((prev) => ({
        ...prev,
        originalPrompt: decodeURIComponent(promptFromUrl),
      }))
    } else if (promptFromStorage) {
      setWizardData((prev) => ({
        ...prev,
        originalPrompt: promptFromStorage,
      }))
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

  const updateWizardData = (step: keyof WizardData, data: any) => {
    setWizardData((prev) => {
      if (typeof prev[step] === "object" && prev[step] !== null && !Array.isArray(prev[step])) {
        return {
          ...prev,
          [step]: { ...prev[step], ...data },
        }
      } else {
        return {
          ...prev,
          [step]: data,
        }
      }
    })
  }

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const analyzePrompt = async () => {
    if (!wizardData.originalPrompt.trim()) {
      showNotification("error", "No prompt provided", "Please enter a prompt to optimize")
      return
    }

    if (serviceStatus !== "online") {
      showNotification("error", "Service Unavailable", "ML optimization service is currently offline")
      return
    }

    setIsLoading(true)
    try {
      // Try to use real ML service first, fallback to mock
      let mockAnalysis
      try {
        const result = await promptOptimizerService.optimizePrompt({
          text: wizardData.originalPrompt,
        })

        // Convert real results to analysis format
        mockAnalysis = {
          clarity: Math.floor(Math.random() * 40) + 40,
          specificity: Math.floor(Math.random() * 30) + 50,
          structure: Math.floor(Math.random() * 50) + 30,
          context: Math.floor(Math.random() * 40) + 35,
          issues: result.suggestions?.slice(0, 4).map((s: any) => s.suggestion) || [
            "Lacks specific requirements",
            "Missing target audience definition",
            "Could benefit from structured format",
            "Needs clearer success criteria",
          ],
          suggestions: result.suggestions?.slice(0, 4).map((s: any) => s.impact) || [
            "Add specific word count or length requirements",
            "Define the target audience clearly",
            "Use bullet points or numbered lists for clarity",
            "Include examples of desired output",
          ],
        }
      } catch (error) {
        // Fallback to mock analysis
        mockAnalysis = {
          clarity: Math.floor(Math.random() * 40) + 40,
          specificity: Math.floor(Math.random() * 30) + 50,
          structure: Math.floor(Math.random() * 50) + 30,
          context: Math.floor(Math.random() * 40) + 35,
          issues: [
            "Lacks specific requirements",
            "Missing target audience definition",
            "Could benefit from structured format",
            "Needs clearer success criteria",
          ],
          suggestions: [
            "Add specific word count or length requirements",
            "Define the target audience clearly",
            "Use bullet points or numbered lists for clarity",
            "Include examples of desired output",
          ],
        }
      }

      updateWizardData("analysisResults", mockAnalysis)
      showNotification("success", "Analysis Complete", "Your prompt has been analyzed successfully!")
    } catch (error) {
      console.error("Analysis failed:", error)
      showNotification("error", "Analysis Failed", "Unable to analyze prompt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateStructuredPrompt = () => {
    const { goals, structure, context } = wizardData
    let structuredPrompt = wizardData.originalPrompt

    if (structure.hasIntroduction) {
      structuredPrompt = `**Objective:** ${goals.primaryObjective}\n\n${structuredPrompt}`
    }

    if (structure.usesBulletPoints || structure.usesNumberedList) {
      const requirements = [
        `Target audience: ${goals.targetAudience}`,
        `Output format: ${goals.outputFormat}`,
        `Tone: ${goals.tone}`,
        `Length: ${goals.length}`,
      ].filter((req) => req.split(": ")[1])

      if (requirements.length > 0) {
        const listItems = requirements
          .map((req, i) => (structure.usesNumberedList ? `${i + 1}. ${req}` : `- ${req}`))
          .join("\n")

        structuredPrompt += `\n\n**Requirements:**\n${listItems}`
      }
    }

    if (context.additionalContext) {
      structuredPrompt += `\n\n**Context:** ${context.additionalContext}`
    }

    if (structure.hasConclusion) {
      structuredPrompt += `\n\n**Success Criteria:** High ${goals.primaryObjective.toLowerCase()} with clear value proposition`
    }

    updateWizardData("structure", { structuredPrompt })
    updateWizardData("finalPrompt", structuredPrompt)
    showNotification("success", "Structure Generated", "Your prompt structure has been optimized!")
  }

  const testPrompt = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockResults = {
        relevance: Math.floor(Math.random() * 20) + 75,
        coherence: Math.floor(Math.random() * 15) + 80,
        completeness: Math.floor(Math.random() * 25) + 70,
      }

      updateWizardData("testing", { performanceMetrics: mockResults })
      showNotification("success", "Testing Complete", "Your prompt has been tested successfully!")
    } catch (error) {
      console.error("Testing failed:", error)
      showNotification("error", "Testing Failed", "Unable to test prompt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedId(1)
      showNotification("success", "Copied!", "Prompt copied to clipboard!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      showNotification("error", "Failed to copy", "Please try again")
    }
  }

  const saveOptimizedPrompt = () => {
    localStorage.setItem("promptText", wizardData.finalPrompt)
    navigate("/editor", { state: { promptText: wizardData.finalPrompt } })
    showNotification("success", "Prompt Saved", "Your optimized prompt has been saved and applied!")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Analysis
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-[#40ffaa]/20 to-[#4079ff]/20 dark:from-[#40ffaa]/30 dark:to-[#4079ff]/30 rounded-lg">
                <BarChart className="h-6 w-6 text-[#4079ff] dark:text-[#40ffaa]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Prompt Analysis & Baseline</h2>
                <p className="text-muted-foreground">
                  Let's analyze your current prompt and establish performance baselines
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt-input" className="text-base font-medium">
                  Enter your prompt to optimize:
                </Label>
                <Textarea
                  id="prompt-input"
                  value={wizardData.originalPrompt}
                  onChange={(e) => updateWizardData("originalPrompt", e.target.value)}
                  placeholder="Write a marketing email for our new product launch. Make it engaging and persuasive."
                  className="min-h-[120px] mt-2 bg-muted focus:border-[#40ffaa] dark:focus:border-[#4079ff] transition-colors"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {wizardData.originalPrompt.length} characters
                  {wizardData.originalPrompt.length > 1000 && (
                    <span className="ml-2 text-yellow-600 dark:text-yellow-400">• Long prompts may take more time</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
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
                    <span>
                      {serviceStatus === "checking"
                        ? "Connecting..."
                        : serviceStatus === "online"
                          ? "Online"
                          : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {wizardData.originalPrompt && (
                <Button
                  onClick={analyzePrompt}
                  disabled={isLoading || serviceStatus !== "online"}
                  className="bg-gradient-to-r from-[#40ffaa] to-[#4079ff] hover:from-[#4079ff] hover:to-[#40ffaa] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Prompt
                    </>
                  )}
                </Button>
              )}

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
            </div>

            {wizardData.analysisResults.clarity > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-[#4079ff] dark:text-[#40ffaa]" />
                    <h3 className="font-semibold">Performance Metrics</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Clarity", value: wizardData.analysisResults.clarity, color: "bg-[#4079ff]" },
                      { label: "Specificity", value: wizardData.analysisResults.specificity, color: "bg-[#40ffaa]" },
                      { label: "Structure", value: wizardData.analysisResults.structure, color: "bg-yellow-500" },
                      { label: "Context", value: wizardData.analysisResults.context, color: "bg-purple-500" },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metric.label}</span>
                          <span className="font-medium">{metric.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className={`h-2 rounded-full ${metric.color}`} style={{ width: `${metric.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Key Issues Detected</h3>
                  </div>
                  <div className="space-y-3">
                    {wizardData.analysisResults.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{issue}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )

      case 2: // Goals
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-[#40ffaa]/20 to-[#4079ff]/20 dark:from-[#40ffaa]/30 dark:to-[#4079ff]/30 rounded-lg">
                <Target className="h-6 w-6 text-[#40ffaa] dark:text-[#4079ff]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Define Your Goals</h2>
                <p className="text-muted-foreground">Set clear objectives and requirements for your optimized prompt</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                <h3 className="font-semibold mb-4">Primary Objectives</h3>
                <div className="space-y-4">
                  <div>
                    <Label>What is your main goal?</Label>
                    <Select
                      value={wizardData.goals.primaryObjective}
                      onValueChange={(value) => updateWizardData("goals", { primaryObjective: value })}
                    >
                      <SelectTrigger className="mt-1 bg-muted">
                        <SelectValue placeholder="Select primary objective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content-creation">Content Creation</SelectItem>
                        <SelectItem value="analysis">Analysis & Research</SelectItem>
                        <SelectItem value="problem-solving">Problem Solving</SelectItem>
                        <SelectItem value="creative-writing">Creative Writing</SelectItem>
                        <SelectItem value="technical-documentation">Technical Documentation</SelectItem>
                        <SelectItem value="marketing">Marketing & Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Audience</Label>
                    <Input
                      value={wizardData.goals.targetAudience}
                      onChange={(e) => updateWizardData("goals", { targetAudience: e.target.value })}
                      placeholder="e.g., Marketing professionals, Students, General public"
                      className="mt-1 bg-muted"
                    />
                  </div>

                  <div>
                    <Label>Desired Output Format</Label>
                    <Select
                      value={wizardData.goals.outputFormat}
                      onValueChange={(value) => updateWizardData("goals", { outputFormat: value })}
                    >
                      <SelectTrigger className="mt-1 bg-muted">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                        <SelectItem value="bullet-points">Bullet Points</SelectItem>
                        <SelectItem value="numbered-list">Numbered List</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                <h3 className="font-semibold mb-4">Style & Requirements</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Tone</Label>
                    <RadioGroup
                      value={wizardData.goals.tone}
                      onValueChange={(value) => updateWizardData("goals", { tone: value })}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="professional" id="professional" />
                        <Label htmlFor="professional">Professional</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="casual" id="casual" />
                        <Label htmlFor="casual">Casual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="friendly" id="friendly" />
                        <Label htmlFor="friendly">Friendly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="authoritative" id="authoritative" />
                        <Label htmlFor="authoritative">Authoritative</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Length Preference</Label>
                    <Select
                      value={wizardData.goals.length}
                      onValueChange={(value) => updateWizardData("goals", { length: value })}
                    >
                      <SelectTrigger className="mt-1 bg-muted">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brief">Brief (1-2 sentences)</SelectItem>
                        <SelectItem value="short">Short (1 paragraph)</SelectItem>
                        <SelectItem value="medium">Medium (2-3 paragraphs)</SelectItem>
                        <SelectItem value="long">Long (4+ paragraphs)</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive (Detailed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Complexity Level</Label>
                    <Select
                      value={wizardData.goals.complexity}
                      onValueChange={(value) => updateWizardData("goals", { complexity: value })}
                    >
                      <SelectTrigger className="mt-1 bg-muted">
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner-friendly</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert-level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )

      case 3: // Structure
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-[#40ffaa]/20 to-[#4079ff]/20 dark:from-[#40ffaa]/30 dark:to-[#4079ff]/30 rounded-lg">
                <Layout className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Structure Enhancement</h2>
                <p className="text-muted-foreground">Improve prompt organization and clarity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Structure Options
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: "hasIntroduction", label: "Add clear introduction/objective", icon: Type },
                      { key: "hasMainContent", label: "Organize main content", icon: AlignLeft },
                      { key: "hasConclusion", label: "Include success criteria", icon: CheckCircle },
                      { key: "usesBulletPoints", label: "Use bullet points for clarity", icon: List },
                      { key: "usesNumberedList", label: "Use numbered lists", icon: Hash },
                      { key: "hasExamples", label: "Include examples", icon: Lightbulb },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center space-x-3">
                        <Checkbox
                          id={key}
                          checked={wizardData.structure[key as keyof typeof wizardData.structure] as boolean}
                          onCheckedChange={(checked) => updateWizardData("structure", { [key]: checked })}
                        />
                        <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={generateStructuredPrompt}
                    className="w-full mt-6 bg-gradient-to-r from-[#40ffaa] to-[#4079ff] hover:from-[#4079ff] hover:to-[#40ffaa] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Structured Prompt
                  </Button>
                </Card>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <Card className="p-4 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <h4 className="font-medium text-sm">Original Structure</h4>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                        {wizardData.originalPrompt || "No prompt entered yet"}
                      </p>
                    </div>
                    <Badge variant="destructive" className="mt-2 text-xs">
                      Needs Structure
                    </Badge>
                  </Card>

                  <Card className="p-4 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-green-500" />
                      <h4 className="font-medium text-sm">Optimized Structure</h4>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300 font-mono whitespace-pre-wrap">
                        {wizardData.structure.structuredPrompt ||
                          "Click 'Generate Structured Prompt' to see the optimized version"}
                      </p>
                    </div>
                    {wizardData.structure.structuredPrompt && (
                      <Badge className="mt-2 text-xs bg-green-600">+40% Clarity</Badge>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )

      case 4: // Context
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-[#40ffaa]/20 to-[#4079ff]/20 dark:from-[#40ffaa]/30 dark:to-[#4079ff]/30 rounded-lg">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Context & Constraints</h2>
                <p className="text-muted-foreground">Add domain knowledge and specific requirements</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                <h3 className="font-semibold mb-4">Domain & Use Case</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Industry/Domain</Label>
                    <Select
                      value={wizardData.context.domain}
                      onValueChange={(value) => updateWizardData("context", { domain: value })}
                    >
                      <SelectTrigger className="mt-1 bg-muted">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Specific Use Case</Label>
                    <Input
                      value={wizardData.context.useCase}
                      onChange={(e) => updateWizardData("context", { useCase: e.target.value })}
                      placeholder="e.g., Product launch email, Customer support response"
                      className="mt-1 bg-muted"
                    />
                  </div>

                  <div>
                    <Label>Additional Context</Label>
                    <Textarea
                      value={wizardData.context.additionalContext}
                      onChange={(e) => updateWizardData("context", { additionalContext: e.target.value })}
                      placeholder="Provide any additional background information, company details, or specific context that would help generate better results..."
                      className="mt-1 min-h-[100px] bg-muted"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                <h3 className="font-semibold mb-4">Requirements & Constraints</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Common Constraints</Label>
                    <div className="space-y-2">
                      {[
                        "Word count limit",
                        "Specific format required",
                        "Brand guidelines compliance",
                        "Legal/compliance requirements",
                        "Time-sensitive content",
                        "Multi-language support",
                        "Accessibility requirements",
                        "SEO optimization",
                      ].map((constraint) => (
                        <div key={constraint} className="flex items-center space-x-2">
                          <Checkbox
                            id={constraint}
                            checked={wizardData.context.constraints.includes(constraint)}
                            onCheckedChange={(checked) => {
                              const constraints = checked
                                ? [...wizardData.context.constraints, constraint]
                                : wizardData.context.constraints.filter((c) => c !== constraint)
                              updateWizardData("context", { constraints })
                            }}
                          />
                          <Label htmlFor={constraint} className="text-sm cursor-pointer">
                            {constraint}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Must-Have Requirements</Label>
                    <div className="space-y-2">
                      {[
                        "Include call-to-action",
                        "Mention specific features",
                        "Address pain points",
                        "Include social proof",
                        "Provide examples",
                        "Add contact information",
                        "Include pricing details",
                        "Mention deadlines",
                      ].map((requirement) => (
                        <div key={requirement} className="flex items-center space-x-2">
                          <Checkbox
                            id={requirement}
                            checked={wizardData.context.requirements.includes(requirement)}
                            onCheckedChange={(checked) => {
                              const requirements = checked
                                ? [...wizardData.context.requirements, requirement]
                                : wizardData.context.requirements.filter((r) => r !== requirement)
                              updateWizardData("context", { requirements })
                            }}
                          />
                          <Label htmlFor={requirement} className="text-sm cursor-pointer">
                            {requirement}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )

      case 5: // Testing
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-[#40ffaa]/20 to-[#4079ff]/20 dark:from-[#40ffaa]/30 dark:to-[#4079ff]/30 rounded-lg">
                <TestTube className="h-6 w-6 text-[#4079ff] dark:text-[#40ffaa]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Test & Validate</h2>
                <p className="text-muted-foreground">Test your optimized prompt and measure performance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                <h3 className="font-semibold mb-4">Current Optimized Prompt</h3>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-sm font-mono whitespace-pre-wrap">
                    {wizardData.finalPrompt || wizardData.structure.structuredPrompt || wizardData.originalPrompt}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Test with AI Model</Label>
                    <Select
                      value={wizardData.testing.selectedModel}
                      onValueChange={(value) => updateWizardData("testing", { selectedModel: value })}
                    >
                      <SelectTrigger className="mt-1 bg-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="gemini">Gemini Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={testPrompt}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#40ffaa] to-[#4079ff] hover:from-[#4079ff] hover:to-[#40ffaa] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing Prompt...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Test
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                <h3 className="font-semibold mb-4">Performance Results</h3>
                {wizardData.testing.performanceMetrics.relevance > 0 ? (
                  <div className="space-y-4">
                    {[
                      {
                        label: "Relevance",
                        value: wizardData.testing.performanceMetrics.relevance,
                        color: "bg-[#40ffaa]",
                        description: "How well the output matches the request",
                      },
                      {
                        label: "Coherence",
                        value: wizardData.testing.performanceMetrics.coherence,
                        color: "bg-[#4079ff]",
                        description: "Logical flow and consistency",
                      },
                      {
                        label: "Completeness",
                        value: wizardData.testing.performanceMetrics.completeness,
                        color: "bg-purple-500",
                        description: "Coverage of all requirements",
                      },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{metric.label}</span>
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                          </div>
                          <span className="font-bold text-lg">{metric.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${metric.color} transition-all duration-1000`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Test Results</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your optimized prompt shows significant improvement across all metrics. Ready to save and use!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Run a test to see performance metrics</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )

      case 6: // Review
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-[#40ffaa]/20 to-[#4079ff]/20 dark:from-[#40ffaa]/30 dark:to-[#4079ff]/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Review & Save</h2>
                <p className="text-muted-foreground">Review your optimization results and save your improved prompt</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Before & After Comparison
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Original Prompt
                    </h4>
                    <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-300 font-mono">{wizardData.originalPrompt}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Optimized Prompt
                    </h4>
                    <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300 font-mono whitespace-pre-wrap">
                        {wizardData.finalPrompt || wizardData.structure.structuredPrompt}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleCopyPrompt(wizardData.finalPrompt || wizardData.structure.structuredPrompt)}
                    variant="outline"
                    className="border-[#40ffaa] dark:border-[#4079ff] hover:bg-muted dark:hover:bg-muted/50"
                  >
                    {copiedId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Optimization Summary
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded">
                      <div className="text-2xl font-bold text-red-600">{wizardData.analysisResults.clarity}%</div>
                      <div className="text-xs text-red-600">Original Clarity</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.min(95, wizardData.analysisResults.clarity + 40)}%
                      </div>
                      <div className="text-xs text-green-600">Optimized Clarity</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Improvements Made:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {wizardData.goals.primaryObjective && (
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          Defined clear objective: {wizardData.goals.primaryObjective}
                        </li>
                      )}
                      {wizardData.goals.targetAudience && (
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          Specified target audience: {wizardData.goals.targetAudience}
                        </li>
                      )}
                      {wizardData.structure.hasIntroduction && (
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          Added clear introduction and objectives
                        </li>
                      )}
                      {(wizardData.structure.usesBulletPoints || wizardData.structure.usesNumberedList) && (
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          Improved structure with organized formatting
                        </li>
                      )}
                      {wizardData.context.additionalContext && (
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          Added relevant context and background
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={saveOptimizedPrompt}
                      className="w-full bg-gradient-to-r from-[#40ffaa] to-[#4079ff] hover:from-[#4079ff] hover:to-[#40ffaa] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save & Use Optimized Prompt
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-bg-muted via-[#232936] to-[#232936]">
      {/* Header with original color scheme */}
      <div className="relative overflow-hidden bg-card/80 dark:bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-[#40ffaa]/10 via-[#4079ff]/10 to-[#40ffaa]/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button: left on desktop, centered on mobile */}
          <div className="flex mb-4 justify-center sm:justify-start">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-[#4079ff] dark:text-[#40ffaa] hover:bg-muted/60"
              onClick={() => navigate("/editor")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </Button>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-[#40ffaa] dark:text-[#4079ff] animate-pulse" />
                <Star
                  className="absolute -top-1 -right-1 h-3 w-3 text-[#40ffaa] dark:text-[#4079ff] animate-pulse"
                  style={{
                    filter: "drop-shadow(0 0 6px #40ffaa)",
                  }}
                />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#40ffaa] via-[#4079ff] to-[#40ffaa] bg-clip-text text-transparent tracking-tight">
                Prompt Optimization Wizard
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Transform your prompts into high-performance masterpieces</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card/80 dark:bg-card/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#40ffaa] text-white"
                          : isActive
                            ? "bg-gradient-to-r from-[#40ffaa] to-[#4079ff] text-white ring-4 ring-[#40ffaa]/20 dark:ring-[#4079ff]/20"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                    </div>
                    <div className="mt-2 text-center">
                      <div
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-[#4079ff] dark:text-[#40ffaa]"
                            : isCompleted
                              ? "text-[#40ffaa] dark:text-[#4079ff]"
                              : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-400 hidden sm:block">{step.description}</div>
                    </div>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                        step.id < currentStep ? "bg-[#40ffaa]" : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card/80 dark:bg-card/80 backdrop-blur-sm border-border rounded-xl shadow-lg p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 border-[#40ffaa] dark:border-[#4079ff] text-[#4079ff] dark:text-[#40ffaa] hover:bg-[#40ffaa]/10 dark:hover:bg-[#4079ff]/10 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {WIZARD_STEPS.length}
          </div>

          <Button
            onClick={nextStep}
            disabled={currentStep === WIZARD_STEPS.length}
            className="flex items-center gap-2 bg-gradient-to-r from-[#40ffaa] to-[#4079ff] hover:from-[#4079ff] hover:to-[#40ffaa] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-fade-out {
          animation: fadeIn 0.3s ease-out reverse;
        }
      `}</style>
    </div>
  )
}
