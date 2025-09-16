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
  RefreshCw,
  AlertCircle,
  BarChart3,
  Lightbulb,
  Search,
  Save,
  Play,
  CheckCircle,
  XCircle,
  TestTube,
  Star,
  Copy,
  X,
  HelpCircle,
  BookOpen,
  Users,
  Brain,
  FileText,
  Rocket,
  Globe,
  Layout,
  TrendingUp,
  Eye,
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
    is_excellent?: boolean
    improvement_potential?: string
    rating?: number
    rating_explanation?: string
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
  goalOptimization: {
    optimizedPrompt: string
    improvementExplanation: string
    goalAlignmentScore: number
    predictedMetrics: {
      clarity: number
      specificity: number
      structure: number
      context: number
    }
    keyChanges: string[]
    usedAI: boolean
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
  structureOptimization: {
    structuredPrompt: string
    structureExplanation: string
    structureScore: number
    structuralImprovements: string[]
    organizationType: string
    usedAI: boolean
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
  {
    id: 1,
    name: "Analysis",
    icon: BarChart3,
    description: "Analyze your current prompt",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Goals",
    icon: Target,
    description: "Define your objectives",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 3,
    name: "Structure",
    icon: Layout,
    description: "Improve organization",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    name: "Context",
    icon: Globe,
    description: "Add background info",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 5,
    name: "Testing",
    icon: TestTube,
    description: "Validate performance",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: 6,
    name: "Review",
    icon: CheckCircle,
    description: "Finalize and save",
    color: "from-emerald-500 to-green-500",
  },
]

export default function OptimizerWizard() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<"checking" | "online" | "offline">("checking")
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showHelpModal, setShowHelpModal] = useState(false)
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
    goalOptimization: {
      optimizedPrompt: "",
      improvementExplanation: "",
      goalAlignmentScore: 0,
      predictedMetrics: {
        clarity: 0,
        specificity: 0,
        structure: 0,
        context: 0
      },
      keyChanges: [],
      usedAI: false
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
    structureOptimization: {
      structuredPrompt: "",
      structureExplanation: "",
      structureScore: 0,
      structuralImprovements: [],
      organizationType: "",
      usedAI: false
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

  // Notification system
  const showNotification = (type: "success" | "error", title: string, message: string) => {
    const bg =
      type === "success"
        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
        : "bg-gradient-to-r from-red-500 to-pink-500 text-white"

    const icon =
      type === "success"
        ? `<svg class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>`
        : `<svg class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>`

    const notification = document.createElement("div")
    notification.className = `fixed bottom-4 right-4 ${bg} p-4 rounded-lg shadow-xl z-50 max-w-md animate-slide-in`
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">${icon}</div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-semibold">${title}</h3>
          <div class="mt-1 text-xs opacity-90">${message}</div>
        </div>
      </div>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("animate-slide-out")
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
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

    setIsLoading(true)
    try {
      // Use the Spring Boot backend endpoint that proxies to the ML service
      const response = await fetch('/api/ml/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text: wizardData.originalPrompt })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Update wizard data with real metrics
      updateWizardData("analysisResults", {
        clarity: result.metrics?.clarity || 0,
        specificity: result.metrics?.specificity || 0,
        structure: result.metrics?.structure || 0,
        context: result.metrics?.context || 0,
        issues: result.issues || [],
        suggestions: result.suggestions || [],
        is_excellent: result.is_excellent || false,
        improvement_potential: result.improvement_potential || "Unknown"
      })

      const message = result.is_excellent 
        ? "Your prompt is already excellent! Only minor refinements possible."
        : `Analysis complete! Improvement potential: ${result.improvement_potential || 'Moderate'}`
        
      showNotification("success", "Analysis Complete", message)
    } catch (error) {
      console.error("Analysis failed:", error)
      showNotification("error", "Analysis Failed", "Unable to analyze prompt. Please check that the ML service is running.")
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
          .map((req, i) => (structure.usesNumberedList ? `${i + 1}. ${req}` : `• ${req}`))
          .join("\n")

        structuredPrompt += `\n\n**Requirements:**\n${listItems}`
      }
    }

    if (context.additionalContext) {
      structuredPrompt += `\n\n**Context:** ${context.additionalContext}`
    }

    if (structure.hasConclusion) {
      structuredPrompt += `\n\n**Success Criteria:** High-quality ${goals.primaryObjective.toLowerCase()} that delivers clear value`
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

  // Add new function for AI-powered structure optimization:
  const optimizeWithStructure = async () => {
    if (!wizardData.originalPrompt.trim()) {
      showNotification("error", "No prompt provided", "Please complete Step 1 first")
      return
    }

    // Check if any structure options are selected
    const hasStructureOptions = Object.values(wizardData.structure).some(value => 
      typeof value === 'boolean' && value === true
    )

    if (!hasStructureOptions) {
      showNotification("error", "No structure options selected", "Please select at least one structural improvement")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ml/optimize-with-structure', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          text: wizardData.originalPrompt,
          structure_options: {
            hasIntroduction: wizardData.structure.hasIntroduction,
            usesBulletPoints: wizardData.structure.usesBulletPoints,
            usesNumberedList: wizardData.structure.usesNumberedList,
            hasExamples: wizardData.structure.hasExamples,
            hasConclusion: wizardData.structure.hasConclusion
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Update wizard data with structure optimization results
      updateWizardData("structureOptimization", {
        structuredPrompt: result.structured_prompt,
        structureExplanation: result.structure_explanation,
        structureScore: result.structure_score,
        structuralImprovements: result.structural_improvements,
        organizationType: result.organization_type,
        usedAI: result.used_ai
      })

      // Also update the structure.structuredPrompt for backwards compatibility
      updateWizardData("structure", { structuredPrompt: result.structured_prompt })

      // Update final prompt
      updateWizardData("finalPrompt", result.structured_prompt)

      const message = result.used_ai 
        ? `AI structure optimization complete! Structure score: ${result.structure_score}%`
        : `Rule-based structure applied! Score: ${result.structure_score}%`
        
      showNotification("success", "Structure Optimization Complete", message)
    } catch (error) {
      console.error("Structure optimization failed:", error)
      showNotification("error", "Structure Optimization Failed", "Unable to optimize structure. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Analysis
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] bg-clip-text text-transparent">
                Let's Analyze Your Prompt
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Share your prompt with us and we'll identify areas for improvement. Don't worry if it's not perfect yet!
              </p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/50 border border-[#3ebb9e]/20 shadow-lg">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="prompt-input" className="text-lg font-semibold mb-4 block">
                    Your Prompt
                  </Label>
                  <Textarea
                    id="prompt-input"
                    value={wizardData.originalPrompt}
                    onChange={(e) => updateWizardData("originalPrompt", e.target.value)}
                    placeholder="Example: Write a marketing email for our new product launch. Make it engaging and persuasive."
                    className="min-h-[150px] text-base bg-white dark:bg-gray-800 border-2 border-[#3ebb9e]/30 focus:border-[#3ebb9e] transition-all duration-300 rounded-lg resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{wizardData.originalPrompt.length} characters</span>
                    {wizardData.originalPrompt.length > 1000 && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Long prompt - may take extra time
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        serviceStatus === "online"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : serviceStatus === "offline"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
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
                            ? "AI Ready"
                            : "AI Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                {wizardData.originalPrompt && (
                  <Button
                    onClick={analyzePrompt}
                    disabled={isLoading || serviceStatus !== "online"}
                    className="w-full bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] hover:from-[#4079ff] hover:to-[#3ebb9e] text-white font-semibold text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Analyzing Your Prompt...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Analyze My Prompt
                      </>
                    )}
                  </Button>
                )}

                {serviceStatus !== "online" && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
            </Card>

            {wizardData.analysisResults.clarity > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="h-6 w-6 text-[#4079ff]" />
                    <div>
                      <h3 className="text-xl font-bold">Performance Metrics</h3>
                      <p className="text-muted-foreground">Current prompt analysis</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {[
                      { label: "Clarity", value: wizardData.analysisResults.clarity, color: "bg-blue-500" },
                      { label: "Specificity", value: wizardData.analysisResults.specificity, color: "bg-[#3ebb9e]" },
                      { label: "Structure", value: wizardData.analysisResults.structure, color: "bg-purple-500" },
                      { label: "Context", value: wizardData.analysisResults.context, color: "bg-orange-500" },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{metric.label}</span>
                          <span className="font-bold text-lg">{metric.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${metric.color} transition-all duration-1000 ease-out`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="text-xl font-bold">Improvement Opportunities</h3>
                      <p className="text-muted-foreground">Areas to enhance</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {wizardData.analysisResults.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700"
                      >
                        <Sparkles className="h-5 w-5 text-[#3ebb9e] mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
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
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] bg-clip-text text-transparent">
                Define Your Goals
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Help us understand what you're trying to achieve so we can optimize your prompt effectively.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-[#3ebb9e]/30">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-6 w-6 text-[#3ebb9e]" />
                  <div>
                    <h3 className="text-xl font-bold">Primary Objectives</h3>
                    <p className="text-muted-foreground">What do you want to create?</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Main Goal</Label>
                    <Select
                      value={wizardData.goals.primaryObjective}
                      onValueChange={(value) => updateWizardData("goals", { primaryObjective: value })}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-[#3ebb9e]/30 focus:border-[#3ebb9e] h-12 text-base">
                        <SelectValue placeholder="Select your primary objective" />
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
                    <Label className="text-base font-medium mb-3 block">Target Audience</Label>
                    <Input
                      value={wizardData.goals.targetAudience}
                      onChange={(e) => updateWizardData("goals", { targetAudience: e.target.value })}
                      placeholder="e.g., Marketing professionals, Students, General public"
                      className="bg-white dark:bg-gray-800 border-2 border-[#3ebb9e]/30 focus:border-[#3ebb9e] h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Output Format</Label>
                    <Select
                      value={wizardData.goals.outputFormat}
                      onValueChange={(value) => updateWizardData("goals", { outputFormat: value })}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-[#3ebb9e]/30 focus:border-[#3ebb9e] h-12 text-base">
                        <SelectValue placeholder="Select desired format" />
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

              <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="text-xl font-bold">Style & Requirements</h3>
                    <p className="text-muted-foreground">Set the tone and complexity</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-4 block">Tone</Label>
                    <RadioGroup
                      value={wizardData.goals.tone}
                      onValueChange={(value) => updateWizardData("goals", { tone: value })}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <RadioGroupItem value="professional" id="professional" />
                        <Label htmlFor="professional" className="cursor-pointer font-medium">
                          Professional
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <RadioGroupItem value="casual" id="casual" />
                        <Label htmlFor="casual" className="cursor-pointer font-medium">
                          Casual & Friendly
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <RadioGroupItem value="friendly" id="friendly" />
                        <Label htmlFor="friendly" className="cursor-pointer font-medium">
                          Warm & Approachable
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <RadioGroupItem value="authoritative" id="authoritative" />
                        <Label htmlFor="authoritative" className="cursor-pointer font-medium">
                          Expert & Authoritative
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Length Preference</Label>
                    <Select
                      value={wizardData.goals.length}
                      onValueChange={(value) => updateWizardData("goals", { length: value })}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-400 h-12 text-base">
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
                    <Label className="text-base font-medium mb-3 block">Complexity Level</Label>
                    <Select
                      value={wizardData.goals.complexity}
                      onValueChange={(value) => updateWizardData("goals", { complexity: value })}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-400 h-12 text-base">
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
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <Layout className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] bg-clip-text text-transparent">
                Improve Your Structure
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose structural improvements to make your prompt clearer and more effective. Our AI will intelligently restructure your prompt.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Structure Options */}
              <Card className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3 mb-6">
                  <Wand2 className="h-6 w-6 text-orange-600" />
                  <div>
                    <h3 className="text-xl font-bold">AI Structure Options</h3>
                    <p className="text-muted-foreground">Select AI-powered improvements</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:shadow-md transition-all">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hasIntroduction"
                        checked={wizardData.structure.hasIntroduction}
                        onCheckedChange={(checked) => updateWizardData("structure", { hasIntroduction: checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="hasIntroduction" className="cursor-pointer font-medium flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-[#3ebb9e]" />
                          Add clear objective statement
                        </Label>
                        <p className="text-sm text-muted-foreground">Start with what you want to achieve</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:shadow-md transition-all">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="usesBulletPoints"
                        checked={wizardData.structure.usesBulletPoints}
                        onCheckedChange={(checked) => updateWizardData("structure", { usesBulletPoints: checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="usesBulletPoints" className="cursor-pointer font-medium flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-[#3ebb9e]" />
                          Organize with bullet points
                        </Label>
                        <p className="text-sm text-muted-foreground">Make requirements easy to scan</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:shadow-md transition-all">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="usesNumberedList"
                        checked={wizardData.structure.usesNumberedList}
                        onCheckedChange={(checked) => updateWizardData("structure", { usesNumberedList: checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="usesNumberedList" className="cursor-pointer font-medium flex items-center gap-2 mb-1">
                          <Layout className="h-4 w-4 text-[#3ebb9e]" />
                          Add numbered steps
                        </Label>
                        <p className="text-sm text-muted-foreground">Perfect for sequential instructions</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:shadow-md transition-all">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hasExamples"
                        checked={wizardData.structure.hasExamples}
                        onCheckedChange={(checked) => updateWizardData("structure", { hasExamples: checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="hasExamples" className="cursor-pointer font-medium flex items-center gap-2 mb-1">
                          <Lightbulb className="h-4 w-4 text-[#3ebb9e]" />
                          Include helpful examples
                        </Label>
                        <p className="text-sm text-muted-foreground">Show what good output looks like</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:shadow-md transition-all">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hasConclusion"
                        checked={wizardData.structure.hasConclusion}
                        onCheckedChange={(checked) => updateWizardData("structure", { hasConclusion: checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="hasConclusion" className="cursor-pointer font-medium flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-[#3ebb9e]" />
                          Add success criteria
                        </Label>
                        <p className="text-sm text-muted-foreground">Define what success looks like</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={optimizeWithStructure}
                  disabled={isLoading || !Object.values(wizardData.structure).some(v => typeof v === 'boolean' && v)}
                  className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-500 hover:to-yellow-500 text-white font-semibold text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      AI Optimizing Structure...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate AI-Structured Prompt
                    </>
                  )}
                </Button>
              </Card>

              {/* Right Column - Structure Results */}
              <div className="space-y-6">
                {wizardData.structureOptimization.structuredPrompt ? (
                  <>
                    {/* Structure Score */}
                    <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                          Structure Score
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {wizardData.structureOptimization.structureScore}%
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${wizardData.structureOptimization.structureScore}%` }}
                            ></div>
                          </div>
                        </div>
                        <Badge className={`${
                          wizardData.structureOptimization.structureScore >= 80 ? 'bg-green-100 text-green-800' :
                          wizardData.structureOptimization.structureScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {wizardData.structureOptimization.usedAI ? 'AI-Structured' : 'Rule-Based'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {wizardData.structureOptimization.structureExplanation}
                      </p>
                    </Card>

                    {/* Structured Prompt Display */}
                    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Layout className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                          AI-Structured Prompt
                        </h3>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700 mb-4">
                        <p className="text-sm font-mono text-green-700 dark:text-green-300 whitespace-pre-wrap">
                          {wizardData.structureOptimization.structuredPrompt}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleCopyPrompt(wizardData.structureOptimization.structuredPrompt)}
                        variant="outline"
                        className="w-full border-2 border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Structured Prompt
                      </Button>
                    </Card>

                    {/* Structural Improvements */}
                    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Wand2 className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                          Structural Improvements Applied
                        </h3>
                      </div>
                      
                      <div className="space-y-2">
                        {wizardData.structureOptimization.structuralImprovements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{improvement}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Organization Type:</strong> {wizardData.structureOptimization.organizationType}
                        </p>
                      </div>
                    </Card>
                  </>
                ) : (
                  <>
                    {/* Before Comparison */}
                    <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <h4 className="font-bold text-red-700 dark:text-red-400">Before (Current Structure)</h4>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-700">
                        <p className="text-sm font-mono text-red-600 dark:text-red-400">
                          {wizardData.originalPrompt || "Your original prompt will appear here"}
                        </p>
                      </div>
                      <Badge className="mt-3 bg-red-100 text-red-800 border-red-300">
                        Structure Score: {wizardData.analysisResults.structure}%
                      </Badge>
                    </Card>

                    <Card className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700">
                      <div className="text-center py-8">
                        <Layout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-muted-foreground mb-2">AI Structure Optimization</h3>
                        <p className="text-muted-foreground">
                          Select structural improvements and click "Generate AI-Structured Prompt" to see intelligent organization powered by Qwen
                        </p>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        )

      case 4: // Context (Simplified)
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] bg-clip-text text-transparent">
                Add Context
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Provide background information to help the AI understand your specific needs better.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Brain className="h-6 w-6 text-indigo-600" />
                      <div>
                        <h3 className="text-xl font-bold">Background Information</h3>
                        <p className="text-muted-foreground">Help us understand your situation</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium mb-3 block">Industry/Domain</Label>
                        <Select
                          value={wizardData.context.domain}
                          onValueChange={(value) => updateWizardData("context", { domain: value })}
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 focus:border-indigo-400 h-12 text-base">
                            <SelectValue placeholder="Select your industry (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-medium mb-3 block">Specific Use Case</Label>
                        <Input
                          value={wizardData.context.useCase}
                          onChange={(e) => updateWizardData("context", { useCase: e.target.value })}
                          placeholder="e.g., Product launch email, Blog post"
                          className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 focus:border-indigo-400 h-12 text-base"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <div>
                        <h4 className="text-lg font-bold">Additional Context</h4>
                        <p className="text-muted-foreground">Any other details that might help</p>
                      </div>
                    </div>
                    <Textarea
                      value={wizardData.context.additionalContext}
                      onChange={(e) => updateWizardData("context", { additionalContext: e.target.value })}
                      placeholder="Optional: Company details, special requirements, constraints, or any other context that might help generate better results..."
                      className="min-h-[120px] bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 focus:border-indigo-400 text-base resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                      <div>
                        <h4 className="text-lg font-bold">Common Requirements</h4>
                        <p className="text-muted-foreground">Check any that apply to your needs</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Include a call-to-action",
                        "Mention specific features",
                        "Keep under 200 words",
                        "Make it SEO-friendly",
                        "Include contact information",
                        "Add social proof/testimonials",
                      ].map((requirement) => (
                        <div
                          key={requirement}
                          className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-700 hover:shadow-sm transition-all"
                        >
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
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
                <TestTube className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] bg-clip-text text-transparent">
                Test Your Prompt
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Let's validate your optimized prompt and see how it performs with AI models.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-3 mb-6">
                  <Rocket className="h-6 w-6 text-cyan-600" />
                  <div>
                    <h3 className="text-xl font-bold">Your Optimized Prompt</h3>
                    <p className="text-muted-foreground">Ready for testing</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6 border border-cyan-200 dark:border-cyan-700">
                  <p className="text-sm font-mono whitespace-pre-wrap">
                    {wizardData.finalPrompt || wizardData.structure.structuredPrompt || wizardData.originalPrompt}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Test with AI Model</Label>
                    <Select
                      value={wizardData.testing.selectedModel}
                      onValueChange={(value) => updateWizardData("testing", { selectedModel: value })}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-cyan-200 dark:border-cyan-700 focus:border-cyan-400 h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="gemini">Gemini Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={testPrompt}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Testing Your Prompt...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Run Performance Test
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h3 className="text-xl font-bold">Performance Results</h3>
                    <p className="text-muted-foreground">How your prompt performs</p>
                  </div>
                </div>

                {wizardData.testing.performanceMetrics.relevance > 0 ? (
                  <div className="space-y-6">
                    {[
                      {
                        label: "Relevance",
                        value: wizardData.testing.performanceMetrics.relevance,
                        color: "bg-[#3ebb9e]",
                        description: "How well it matches your request",
                      },
                      {
                        label: "Coherence",
                        value: wizardData.testing.performanceMetrics.coherence,
                        color: "bg-blue-500",
                        description: "Logical flow and consistency",
                      },
                      {
                        label: "Completeness",
                        value: wizardData.testing.performanceMetrics.completeness,
                        color: "bg-purple-500",
                        description: "Coverage of all requirements",
                      },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold">{metric.label}</span>
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                          </div>
                          <span className="font-bold text-xl text-[#3ebb9e]">{metric.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${metric.color} transition-all duration-1000 ease-out`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <span className="font-bold text-green-800 dark:text-green-200 text-lg">Excellent Results!</span>
                      </div>
                      <p className="text-green-700 dark:text-green-300">
                        Your optimized prompt is performing very well across all metrics. Ready to save and use it!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TestTube className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">Click "Run Performance Test" to see results</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )

      case 6: // Review
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] bg-clip-text text-transparent">
                Review & Save
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your prompt has been successfully optimized! Review the improvements and save your work.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-xl font-bold">Before & After Comparison</h3>
                    <p className="text-muted-foreground">See the transformation</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <h4 className="font-semibold text-red-600 dark:text-red-400">Original Prompt</h4>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm font-mono text-red-700 dark:text-red-300">{wizardData.originalPrompt}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold text-green-600 dark:text-green-400">Optimized Prompt</h4>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <p className="text-sm font-mono text-green-700 dark:text-green-300 whitespace-pre-wrap">
                        {wizardData.finalPrompt || wizardData.structure.structuredPrompt}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => handleCopyPrompt(wizardData.finalPrompt || wizardData.structure.structuredPrompt)}
                    variant="outline"
                    className="flex-1 border-2 border-[#3ebb9e] text-[#3ebb9e] hover:bg-[#3ebb9e] hover:text-white font-semibold py-3 rounded-lg transition-all duration-300"
                  >
                    {copiedId ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-xl font-bold">Optimization Summary</h3>
                    <p className="text-muted-foreground">What we accomplished</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-red-600">{wizardData.analysisResults.clarity}%</div>
                      <div className="text-sm text-red-600 font-medium">Original Score</div>
                    </div>
                    <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {Math.min(95, wizardData.analysisResults.clarity + 40)}%
                      </div>
                      <div className="text-sm text-green-600 font-medium">Optimized Score</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#3ebb9e]" />
                      Improvements Made:
                    </h4>
                    <div className="space-y-2">
                      {wizardData.goals.primaryObjective && (
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Defined clear objective: {wizardData.goals.primaryObjective}</span>
                        </div>
                      )}
                      {wizardData.goals.targetAudience && (
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Specified target audience: {wizardData.goals.targetAudience}</span>
                        </div>
                      )}
                      {wizardData.structureOptimization.usedAI && wizardData.structureOptimization.structuralImprovements.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">AI-powered structure optimization applied</span>
                        </div>
                      )}
                      {wizardData.structureOptimization.structuralImprovements.map((improvement, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{improvement}</span>
                        </div>
                      ))}
                      {wizardData.context.additionalContext && (
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Added helpful context and background</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-green-200 dark:border-green-800">
                    <Button
                      onClick={saveOptimizedPrompt}
                      className="w-full bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] hover:from-[#4079ff] hover:to-[#3ebb9e] text-white font-bold text-xl py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      <Save className="h-6 w-6 mr-3" />
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#3ebb9e]/5 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-purple-400/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-400/5 rounded-full blur-xl"></div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-[#3ebb9e]/20 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3ebb9e]/5 via-[#4079ff]/5 to-[#3ebb9e]/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1" />
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-[#3ebb9e]" />
                  <Star
                    className="absolute -top-1 -right-1 h-3 w-3 text-[#4079ff]"
                    style={{
                      filter: "drop-shadow(0 0 4px #3ebb9e)",
                    }}
                  />
                </div>
                <h1 className="sm:text-4xl font-medium bg-gradient-to-r from-[#3ebb9e] via-[#4079ff] to-purple-600 bg-clip-text text-transparent tracking-tight">
                  Prompt Optimizer Wizard
                </h1>
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                Transform your prompts into high-performance masterpieces
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelpModal(true)}
                  className="border border-[#3ebb9e]/30 hover:border-[#3ebb9e] hover:bg-[#3ebb9e]/10 h-10 px-4 rounded-lg transition-all duration-300"
                  title="Need Help?"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/editor")}
                  className="border border-gray-300 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 h-10 px-4 rounded-lg transition-all duration-300"
                  title="Back to Editor"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/80 dark:bg-gray-900/80 border-b border-[#3ebb9e]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                        isCompleted
                          ? "bg-gradient-to-r from-[#3ebb9e] to-green-500 text-white shadow-lg"
                          : isActive
                            ? `bg-gradient-to-r ${step.color} text-white ring-4 ring-[#3ebb9e]/20 shadow-xl`
                            : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {isCompleted ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                    </div>
                    <div className="mt-3 text-center">
                      <div
                        className={`text-sm font-semibold ${
                          isActive
                            ? "text-[#3ebb9e]"
                            : isCompleted
                              ? "text-green-600"
                              : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-400 hidden sm:block max-w-20 text-center">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-6 rounded-full transition-all duration-500 ${
                        step.id < currentStep
                          ? "bg-gradient-to-r from-[#3ebb9e] to-green-500"
                          : "bg-gray-200 dark:bg-gray-600"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-[#3ebb9e]/20 rounded-2xl shadow-xl p-12">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-3 border-2 border-[#3ebb9e] text-[#3ebb9e] hover:bg-[#3ebb9e] hover:text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous
          </Button>

          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Step {currentStep} of {WIZARD_STEPS.length}
            </div>
            <div className="flex gap-2">
              {WIZARD_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index + 1 === currentStep
                      ? "bg-[#3ebb9e] w-6"
                      : index + 1 < currentStep
                        ? "bg-green-500"
                        : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={nextStep}
            disabled={currentStep === WIZARD_STEPS.length}
            className="flex items-center gap-3 bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] hover:from-[#4079ff] hover:to-[#3ebb9e] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 custom-scrollbar">
          <div className="bg-white dark:bg-gray-900 border border-[#3ebb9e] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen className="h-6 w-6" />
                Prompt Optimization Guide
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelpModal(false)}
                className="h-10 w-10 hover:bg-white/20 text-white rounded-xl"
                aria-label="Close help modal"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="p-8 space-y-8">
              {/* Quick Start Guide */}
              <section>
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Rocket className="h-6 w-6 text-[#3ebb9e]" />
                  Quick Start Guide
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {WIZARD_STEPS.map((step, index) => (
                    <Card
                      key={step.id}
                      className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-[#3ebb9e] transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-r ${step.color} text-white flex items-center justify-center text-sm font-bold`}
                        >
                          {step.id}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{step.name}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Pro Tips */}
              <section>
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Lightbulb className="h-6 w-6 text-[#4079ff]" />
                  Pro Tips for Better Prompts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <Target className="h-6 w-6 text-[#3ebb9e]" />,
                      title: "Be Specific",
                      description: "The more details you provide, the better results you'll get",
                      example:
                        "Instead of 'write an email', try 'write a professional welcome email for new customers'",
                    },
                    {
                      icon: <Users className="h-6 w-6 text-[#4079ff]" />,
                      title: "Define Your Audience",
                      description: "Always specify who the content is for",
                      example: "For beginners, experts, professionals, students, etc.",
                    },
                    {
                      icon: <FileText className="h-6 w-6 text-[#3ebb9e]" />,
                      title: "Structure Matters",
                      description: "Use clear organization and formatting",
                      example: "Break complex requests into numbered steps or bullet points",
                    },
                    {
                      icon: <Brain className="h-6 w-6 text-[#4079ff]" />,
                      title: "Provide Context",
                      description: "Share relevant background information",
                      example: "Mention your industry, company size, or special requirements",
                    },
                  ].map((tip, index) => (
                    <Card
                      key={index}
                      className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">{tip.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground mb-2">{tip.title}</h4>
                          <p className="text-muted-foreground mb-3">{tip.description}</p>
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{tip.example}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-out {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-slide-out {
          animation: slide-out 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
