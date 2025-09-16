"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
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
    contextEnhancedPrompt?: string
    contextExplanation?: string
    contextScore?: number
    contextImprovements?: string[]
    enhancementType?: string
    usedAI?: boolean
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
    name: "Review",
    icon: CheckCircle,
    description: "Finalize and save",
    color: "from-emerald-500 to-green-500",
  },
]

export default function OptimizerWizard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

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

  // Add new function for AI-powered goal optimization:
  const optimizeWithGoals = async () => {
    if (!wizardData.originalPrompt.trim()) {
      showNotification("error", "No prompt provided", "Please complete Step 1 first")
      return
    }

    // Check if goals are defined
    const hasGoals = Object.values(wizardData.goals).some(value => 
      typeof value === 'string' && value.trim() !== ''
    )

    if (!hasGoals) {
      showNotification("error", "No goals defined", "Please specify at least one goal in Step 2")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ml/optimize-with-goals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          text: wizardData.originalPrompt,
          goals: {
            primaryObjective: wizardData.goals.primaryObjective,
            targetAudience: wizardData.goals.targetAudience,
            outputFormat: wizardData.goals.outputFormat,
            tone: wizardData.goals.tone,
            length: wizardData.goals.length,
            complexity: wizardData.goals.complexity
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Update wizard data with goal optimization results
      updateWizardData("goalOptimization", {
        optimizedPrompt: result.optimized_prompt,
        improvementExplanation: result.improvement_explanation,
        goalAlignmentScore: result.goal_alignment_score,
        predictedMetrics: result.predicted_metrics,
        keyChanges: result.key_changes,
        usedAI: result.used_ai
      })

      // Update final prompt
      updateWizardData("finalPrompt", result.optimized_prompt)

      const message = result.used_ai 
        ? `AI goal optimization complete! Alignment score: ${result.goal_alignment_score}%`
        : `Rule-based goal optimization applied! Score: ${result.goal_alignment_score}%`
        
      showNotification("success", "Goal Optimization Complete", message)
    } catch (error) {
      console.error("Goal optimization failed:", error)
      showNotification("error", "Goal Optimization Failed", "Unable to optimize with goals. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add new function for AI-powered context optimization:
  const optimizeWithContext = async () => {
    if (!wizardData.originalPrompt.trim()) {
      showNotification("error", "No prompt provided", "Please complete Step 1 first")
      return
    }

    // Check if any context information is provided
    const hasContext = wizardData.context.domain || 
                      wizardData.context.useCase || 
                      wizardData.context.additionalContext ||
                      wizardData.context.requirements.length > 0

    if (!hasContext) {
      showNotification("error", "No context provided", "Please add some context information in Step 4")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ml/optimize-with-context', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          text: wizardData.finalPrompt || wizardData.structureOptimization.structuredPrompt || wizardData.goalOptimization.optimizedPrompt || wizardData.originalPrompt,
          context_options: {
            domain: wizardData.context.domain,
            useCase: wizardData.context.useCase,
            additionalContext: wizardData.context.additionalContext,
            requirements: wizardData.context.requirements
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Update wizard data with context optimization results
      updateWizardData("context", {
        ...wizardData.context,
        contextEnhancedPrompt: result.context_enhanced_prompt,
        contextExplanation: result.context_explanation,
        contextScore: result.context_score,
        contextImprovements: result.context_improvements,
        enhancementType: result.enhancement_type,
        usedAI: result.used_ai
      })

      // Update final prompt
      updateWizardData("finalPrompt", result.context_enhanced_prompt)

      const message = result.used_ai 
        ? `AI context optimization complete! Context score: ${result.context_score}%`
        : `Rule-based context applied! Score: ${result.context_score}%`
        
      showNotification("success", "Context Optimization Complete", message)
    } catch (error) {
      console.error("Context optimization failed:", error)
      showNotification("error", "Context Optimization Failed", "Unable to optimize context. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add comprehensive optimization function that combines all steps:
  const generateComprehensiveOptimization = async () => {
    if (!wizardData.originalPrompt.trim()) {
      showNotification("error", "No prompt provided", "Please enter a prompt in Step 1")
      return
    }

    setIsLoading(true)
    let currentPrompt = wizardData.originalPrompt

    try {
      // Step 1: Goals optimization (if goals are provided)
      const hasGoals = Object.values(wizardData.goals).some(value => 
        typeof value === 'string' && value.trim() !== ''
      )

      if (hasGoals) {
        showNotification("success", "Processing", "Applying goal-based optimization...")
        
        const goalResponse = await fetch('/api/ml/optimize-with-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: currentPrompt,
            goals: wizardData.goals
          })
        })

        if (goalResponse.ok) {
          const goalResult = await goalResponse.json()
          currentPrompt = goalResult.optimized_prompt
          updateWizardData("goalOptimization", {
            optimizedPrompt: goalResult.optimized_prompt,
            improvementExplanation: goalResult.improvement_explanation,
            goalAlignmentScore: goalResult.goal_alignment_score,
            predictedMetrics: goalResult.predicted_metrics,
            keyChanges: goalResult.key_changes,
            usedAI: goalResult.used_ai
          })
        }
      }

      // Step 2: Structure optimization (if structure options are selected)
      const hasStructureOptions = Object.values(wizardData.structure).some(value => 
        typeof value === 'boolean' && value === true
      )

      if (hasStructureOptions) {
        showNotification("success", "Processing", "Applying structure optimization...")
        
        const structureResponse = await fetch('/api/ml/optimize-with-structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: currentPrompt,
            structure_options: {
              hasIntroduction: wizardData.structure.hasIntroduction,
              usesBulletPoints: wizardData.structure.usesBulletPoints,
              usesNumberedList: wizardData.structure.usesNumberedList,
              hasExamples: wizardData.structure.hasExamples,
              hasConclusion: wizardData.structure.hasConclusion
            }
          })
        })

        if (structureResponse.ok) {
          const structureResult = await structureResponse.json()
          currentPrompt = structureResult.structured_prompt
          updateWizardData("structureOptimization", {
            structuredPrompt: structureResult.structured_prompt,
            structureExplanation: structureResult.structure_explanation,
            structureScore: structureResult.structure_score,
            structuralImprovements: structureResult.structural_improvements,
            organizationType: structureResult.organization_type,
            usedAI: structureResult.used_ai
          })
        }
      }

      // Step 3: Context optimization (if context is provided)
      const hasContext = wizardData.context.domain || 
                        wizardData.context.useCase || 
                        wizardData.context.additionalContext ||
                        wizardData.context.requirements.length > 0

      if (hasContext) {
        showNotification("success", "Processing", "Applying context enhancement...")
        
        const contextResponse = await fetch('/api/ml/optimize-with-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: currentPrompt,
            context_options: {
              domain: wizardData.context.domain,
              useCase: wizardData.context.useCase,
              additionalContext: wizardData.context.additionalContext,
              requirements: wizardData.context.requirements
            }
          })
        })

        if (contextResponse.ok) {
          const contextResult = await contextResponse.json()
          currentPrompt = contextResult.context_enhanced_prompt
        }
      }

      // Update final prompt
      updateWizardData("finalPrompt", currentPrompt)
      
      showNotification("success", "Optimization Complete", "Your prompt has been fully optimized with AI!")
      
      // Auto-advance to review step
      setCurrentStep(5)

    } catch (error) {
      console.error("Comprehensive optimization failed:", error)
      showNotification("error", "Optimization Failed", "Unable to complete full optimization. Please try individual steps.")
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

            <Card className="p-8 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/50 border border-[#3ebb9e]/20 shadow-lg custom-scrollbar">
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
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <input
                          type="radio"
                          id="professional"
                          value="professional"
                          checked={wizardData.goals.tone === "professional"}
                          onChange={() => updateWizardData("goals", { tone: "professional" })}
                          className="custom-radio"
                        />
                        <Label htmlFor="professional" className="cursor-pointer font-medium">
                          Professional
                        </Label>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <input
                          type="radio"
                          id="casual"
                          value="casual"
                          checked={wizardData.goals.tone === "casual"}
                          onChange={() => updateWizardData("goals", { tone: "casual" })}
                          className="custom-radio"
                        />
                        <Label htmlFor="casual" className="cursor-pointer font-medium">
                          Casual & Friendly
                        </Label>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <input
                          type="radio"
                          id="friendly"
                          value="friendly"
                          checked={wizardData.goals.tone === "friendly"}
                          onChange={() => updateWizardData("goals", { tone: "friendly" })}
                          className="custom-radio"
                        />
                        <Label htmlFor="friendly" className="cursor-pointer font-medium">
                          Warm & Approachable
                        </Label>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <input
                          type="radio"
                          id="authoritative"
                          value="authoritative"
                          checked={wizardData.goals.tone === "authoritative"}
                          onChange={() => updateWizardData("goals", { tone: "authoritative" })}
                          className="custom-radio"
                        />
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

            {/* Add AI Goal Optimization Section */}
            {Object.values(wizardData.goals).some(value => typeof value === 'string' && value.trim() !== '') && (
              <div className="mt-8">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold">AI Goal Optimization</h3>
                      <p className="text-muted-foreground">Let AI optimize your prompt based on your goals</p>
                    </div>
                  </div>

                  <Button
                    onClick={optimizeWithGoals}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-semibold text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        AI Optimizing with Goals...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate Goal-Optimized Prompt
                      </>
                    )}
                  </Button>

                  {/* Show Goal Optimization Results */}
                  {wizardData.goalOptimization.optimizedPrompt && (
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <h4 className="font-semibold text-green-800 dark:text-green-200">
                            Goal-Optimized Prompt (Score: {wizardData.goalOptimization.goalAlignmentScore}%)
                          </h4>
                        </div>
                        <p className="text-sm font-mono text-green-700 dark:text-green-300 whitespace-pre-wrap">
                          {wizardData.goalOptimization.optimizedPrompt}
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Key Improvements:</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          {wizardData.goalOptimization.keyChanges.map((change, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
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
                    <input
                      type="checkbox"
                      id="hasIntroduction"
                      checked={wizardData.structure.hasIntroduction}
                      onChange={(e) => updateWizardData("structure", { hasIntroduction: e.target.checked })}
                      className="custom-checkbox mt-1"
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
                    <input
                      type="checkbox"
                      id="usesBulletPoints"
                      checked={wizardData.structure.usesBulletPoints}
                      onChange={(e) => updateWizardData("structure", { usesBulletPoints: e.target.checked })}
                      className="custom-checkbox mt-1"
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
                    <input
                      type="checkbox"
                      id="usesNumberedList"
                      checked={wizardData.structure.usesNumberedList}
                      onChange={(e) => updateWizardData("structure", { usesNumberedList: e.target.checked })}
                      className="custom-checkbox mt-1"
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
                    <input
                      type="checkbox"
                      id="hasExamples"
                      checked={wizardData.structure.hasExamples}
                      onChange={(e) => updateWizardData("structure", { hasExamples: e.target.checked })}
                      className="custom-checkbox mt-1"
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
                    <input
                      type="checkbox"
                      id="hasConclusion"
                      checked={wizardData.structure.hasConclusion}
                      onChange={(e) => updateWizardData("structure", { hasConclusion: e.target.checked })}
                      className="custom-checkbox mt-1"
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

                {/* AI Structure Optimization Button */}
                {Object.values(wizardData.structure).some(value => typeof value === 'boolean' && value === true) && (
                  <div className="mt-6">
                    <Button
                      onClick={optimizeWithStructure}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
                  </div>
                )}
              </Card>

              {/* Right Column - Structure Results */}
              <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-6">
                  <Layout className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="text-xl font-bold">Structure Preview</h3>
                    <p className="text-muted-foreground">Your optimized structure</p>
                  </div>
                </div>

                {wizardData.structureOptimization.structuredPrompt ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 max-h-96 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                          AI-Structured Prompt (Score: {wizardData.structureOptimization.structureScore}%)
                        </h4>
                      </div>
                      <pre className="text-sm font-mono text-purple-700 dark:text-purple-300 whitespace-pre-wrap">
                        {wizardData.structureOptimization.structuredPrompt}
                      </pre>
                    </div>

                    {wizardData.structureOptimization.structuralImprovements.length > 0 && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Structural Improvements:</h4>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          {wizardData.structureOptimization.structuralImprovements.map((improvement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={() => handleCopyPrompt(wizardData.structureOptimization.structuredPrompt)}
                      variant="outline"
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      {copiedId ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Structured Prompt
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Layout className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-purple-600 dark:text-purple-400 mb-2">
                      Select Structure Options
                    </h4>
                    <p className="text-purple-500 dark:text-purple-400">
                      Choose structural improvements from the left panel to see your optimized prompt here.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )

      case 4: // Context
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] bg-clip-text text-transparent">
                Add Context & Background
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Provide context to help AI understand your specific situation and requirements better.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Context Input */}
              <Card className="p-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="h-6 w-6 text-orange-600" />
                  <div>
                    <h3 className="text-xl font-bold">Context Information</h3>
                    <p className="text-muted-foreground">Help AI understand your situation</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Industry/Domain</Label>
                    <Select
                      value={wizardData.context.domain}
                      onValueChange={(value) => updateWizardData("context", { domain: value })}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-700 focus:border-orange-400 h-12 text-base">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Specific Use Case</Label>
                    <Input
                      value={wizardData.context.useCase}
                      onChange={(e) => updateWizardData("context", { useCase: e.target.value })}
                      placeholder="e.g., Product launch email, Technical documentation, Training material"
                      className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-700 focus:border-orange-400 h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Additional Context</Label>
                    <Textarea
                      value={wizardData.context.additionalContext}
                      onChange={(e) => updateWizardData("context", { additionalContext: e.target.value })}
                      placeholder="Provide any additional background information, constraints, or specific requirements..."
                      className="min-h-[120px] bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-700 focus:border-orange-400 resize-none"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Special Requirements</Label>
                    <div className="space-y-2">
                      {wizardData.context.requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={req}
                            onChange={(e) => {
                              const newReqs = [...wizardData.context.requirements]
                              newReqs[index] = e.target.value
                              updateWizardData("context", { requirements: newReqs })
                            }}
                            placeholder="Enter a requirement"
                            className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newReqs = wizardData.context.requirements.filter((_, i) => i !== index)
                              updateWizardData("context", { requirements: newReqs })
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newReqs = [...wizardData.context.requirements, ""]
                          updateWizardData("context", { requirements: newReqs })
                        }}
                        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        + Add Requirement
                      </Button>
                    </div>
                  </div>

                  {/* AI Context Optimization Button */}
                  {(wizardData.context.domain || wizardData.context.useCase || wizardData.context.additionalContext || wizardData.context.requirements.length > 0) && (
                    <div className="mt-6">
                      <Button
                        onClick={optimizeWithContext}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white font-semibold text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            AI Enhancing Context...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Generate Context-Enhanced Prompt
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Right Column - Context Preview */}
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-xl font-bold">Context Preview</h3>
                    <p className="text-muted-foreground">Your enhanced prompt</p>
                  </div>
                </div>

                {wizardData.context.contextEnhancedPrompt ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 max-h-96 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                          Context-Enhanced Prompt (Score: {wizardData.context.contextScore || 0}%)
                        </h4>
                      </div>
                      <pre className="text-sm font-mono text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                        {wizardData.context.contextEnhancedPrompt}
                      </pre>
                    </div>

                    {wizardData.context.contextImprovements && wizardData.context.contextImprovements.length > 0 && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Context Improvements:</h4>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          {wizardData.context.contextImprovements.map((improvement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={() => handleCopyPrompt(wizardData.context.contextEnhancedPrompt || "")}
                      variant="outline"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      {copiedId ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Enhanced Prompt
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Globe className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2">
                      Add Context Information
                    </h4>
                    <p className="text-blue-500 dark:text-blue-400">
                      Fill in context details on the left to see your enhanced prompt here.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )

      case 5: // Review
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] bg-clip-text text-transparent">
                Review & Finalize
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Review your optimized prompt and save it to your editor when you're satisfied with the results.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border border-emerald-200 dark:border-emerald-800 custom-scrollbar">
                <div className="flex items-center gap-3 mb-6">
                  <Rocket className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h3 className="text-xl font-bold">Your Optimized Prompt</h3>
                    <p className="text-muted-foreground">Final result ready to use</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700 max-h-96 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-emerald-500" />
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">Final Optimized Prompt</h4>
                    </div>
                    <pre className="text-sm font-mono text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap leading-relaxed">
                      {wizardData.finalPrompt || wizardData.originalPrompt}
                    </pre>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleCopyPrompt(wizardData.finalPrompt || wizardData.originalPrompt)}
                      variant="outline"
                      className="flex-1 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
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

                    <Button
                      onClick={generateComprehensiveOptimization}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Full AI Optimization
                        </>
                      )}
                    </Button>
                  </div>
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

      {/* Help Modal - Updated to match EditorPage styling */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 custom-scrollbar">
          <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Prompt Optimizer Guide</h2>
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
                    <p>Enter your prompt in Step 1 (Analysis) and click "Analyze My Prompt"</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">2.</span>
                    <p>Define your goals and audience in Step 2 (Goals)</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">3.</span>
                    <p>Choose structural improvements in Step 3 (Structure)</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">4.</span>
                    <p>Add context and background in Step 4 (Context)</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0 font-medium text-[#3ebb9e]">5.</span>
                    <p>Review and save your optimized prompt in Step 5 (Review)</p>
                  </div>
                </div>
              </section>

              {/* Five Optimization Steps */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  Five Optimization Steps
                </h3>
                <div className="space-y-4">
                  {WIZARD_STEPS.map((step, index) => (
                    <div key={step.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 bg-gradient-to-r ${step.color} text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3`}>
                          {step.id}
                        </div>
                        <h4 className="text-base font-bold text-foreground">{step.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {step.id === 1 && "Analyze your current prompt with AI-powered metrics for clarity, specificity, structure, and context."}
                        {step.id === 2 && "Define your primary objective, target audience, output format, tone, and complexity level."}
                        {step.id === 3 && "Choose from AI-powered structural improvements like introductions, bullet points, examples, and conclusions."}
                        {step.id === 4 && "Add industry context, use cases, background information, and specific requirements."}
                        {step.id === 5 && "Review your optimized prompt, see improvement summary, and save to your editor."}
                      </p>
                      <div className="bg-muted/30 p-2 rounded text-xs font-medium text-muted-foreground">
                        {step.id === 1 && "Perfect for: Understanding prompt quality, identifying weaknesses"}
                        {step.id === 2 && "Perfect for: Clarifying purpose, defining audience, setting tone"}
                        {step.id === 3 && "Perfect for: Organization, readability, logical flow"}
                        {step.id === 4 && "Perfect for: Domain expertise, situational awareness, constraints"}
                        {step.id === 5 && "Perfect for: Final review, comparison, implementation"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* AI-Powered Features */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  <span className="text-xl mr-3">🤖</span>
                  AI-Powered Features
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">📊</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Real-time Analysis</h4>
                      <p className="text-xs text-muted-foreground">
                        Get instant feedback on clarity, specificity, structure, and context scores.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">🎯</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Goal-Based Optimization</h4>
                      <p className="text-xs text-muted-foreground">
                        AI aligns your prompt with specific objectives and target audiences.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">🏗️</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Structure Enhancement</h4>
                      <p className="text-xs text-muted-foreground">
                        Intelligent restructuring with introductions, examples, and conclusions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">🌐</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Context Integration</h4>
                      <p className="text-xs text-muted-foreground">
                        Add domain-specific knowledge and situational background automatically.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                    <span className="text-xl flex-shrink-0">🔄</span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Comprehensive Optimization</h4>
                      <p className="text-xs text-muted-foreground">
                        "Full AI Optimization" button applies all improvements in sequence.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Optimization Techniques */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  <span className="text-xl mr-3">✨</span>
                  Optimization Techniques
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-foreground">Structure Options</h4>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Add clear objective statements</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Organize with bullet points</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Add numbered steps</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Include helpful examples</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-green-500/10 rounded text-xs">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <p className="text-muted-foreground">Add success criteria</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-foreground">Context Enhancement</h4>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Industry/domain specification</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Specific use case details</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Background information</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Special requirements</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-blue-500/10 rounded text-xs">
                      <span className="text-blue-500 flex-shrink-0">💡</span>
                      <p className="text-muted-foreground">Constraints and limitations</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Best Practices */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  <span className="text-xl mr-3">🎯</span>
                  Best Practices
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-green-800 dark:text-green-200 mb-3 flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Do This
                    </h4>
                    <div className="space-y-2 text-xs text-green-700 dark:text-green-300">
                      <p>• Start with Step 1 analysis to understand current quality</p>
                      <p>• Use specific goals and clear target audiences</p>
                      <p>• Select multiple structure improvements for better organization</p>
                      <p>• Add industry context and background information</p>
                      <p>• Review improvements summary before saving</p>
                      <p>• Test optimized prompts in the Testing Ground</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-red-800 dark:text-red-200 mb-3 flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      Avoid This
                    </h4>
                    <div className="space-y-2 text-xs text-red-700 dark:text-red-300">
                      <p>• Skipping the initial analysis step</p>
                      <p>• Using vague or generic goal definitions</p>
                      <p>• Ignoring structural improvement suggestions</p>
                      <p>• Leaving context information empty</p>
                      <p>• Not reviewing the final optimized prompt</p>
                      <p>• Applying optimization without testing results</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Tips */}
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center border-b border-border pb-2">
                  <span className="text-xl mr-3">⚡</span>
                  Quick Tips & Shortcuts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 p-2 bg-yellow-500/10 rounded text-xs">
                      <span className="text-yellow-600 flex-shrink-0">⚡</span>
                      <p className="text-muted-foreground">Use "Full AI Optimization" for comprehensive improvement</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-yellow-500/10 rounded text-xs">
                      <span className="text-yellow-600 flex-shrink-0">⚡</span>
                      <p className="text-muted-foreground">Copy optimized prompts at any step</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-yellow-500/10 rounded text-xs">
                      <span className="text-yellow-600 flex-shrink-0">⚡</span>
                      <p className="text-muted-foreground">Navigation arrows move between steps</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-yellow-500/10 rounded text-xs">
                      <span className="text-yellow-600 flex-shrink-0">⚡</span>
                      <p className="text-muted-foreground">Progress dots show completion status</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 p-2 bg-purple-500/10 rounded text-xs">
                      <span className="text-purple-600 flex-shrink-0">🔧</span>
                      <p className="text-muted-foreground">Each step builds on the previous one</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-purple-500/10 rounded text-xs">
                      <span className="text-purple-600 flex-shrink-0">🔧</span>
                      <p className="text-muted-foreground">AI provides real-time improvement scores</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-purple-500/10 rounded text-xs">
                      <span className="text-purple-600 flex-shrink-0">🔧</span>
                      <p className="text-muted-foreground">Final prompt combines all optimizations</p>
                    </div>
                    <div className="flex items-start space-x-2 p-2 bg-purple-500/10 rounded text-xs">
                      <span className="text-purple-600 flex-shrink-0">🔧</span>
                      <p className="text-muted-foreground">Save button applies prompt to editor</p>
                    </div>
                  </div>
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
