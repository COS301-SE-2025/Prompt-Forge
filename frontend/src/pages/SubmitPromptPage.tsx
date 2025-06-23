"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" // Add this import
import {
  Save,
  Eye,
  Send,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  FileText,
  User,
  AlertCircleIcon,
  WalletIcon,
  CreditCardIcon,
  BitcoinIcon,
  Landmark,
  Star,
  Edit,
  Trash2,
  Copy,
  Play,
} from "lucide-react"
import promptSubmissionService, { PromptSubmissionData } from '../services/promptSubmissionService'

// Mock components - replace with your actual UI components
// Update the ButtonProps interface to include title
interface ButtonProps {
  children: React.ReactNode
  variant?: string
  size?: string
  disabled?: boolean
  className?: string
  onClick?: () => void
  id?: string
  title?: string // Add this line
}

const Button = ({
  children,
  variant = "default",
  size = "default",
  disabled = false,
  className = "",
  onClick,
  id,
  title,
}: ButtonProps) => (
  <button
    id={id}
    onClick={onClick}
    disabled={disabled}
    title={title} // Add this line
    className={`
      inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] focus:ring-offset-2
      ${
        variant === "outline"
          ? "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          : variant === "ghost"
            ? "border-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            : "bg-[#3ebb9e] hover:bg-[#00674f] text-white border border-transparent"
      } 
      ${size === "sm" ? "px-3 py-1.5 text-sm" : size === "icon" ? "p-2" : "px-4 py-2 text-sm"} 
      ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"} 
      ${className}
    `}
  >
    {children}
  </button>
)

interface CardProps {
  children: React.ReactNode
  className?: string
}

const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-card border border-border rounded-lg ${className}`}>{children}</div>
)

// Mock Link component - replace with your actual router Link
interface LinkProps {
  to: string
  children: React.ReactNode
  className?: string
}

const Link = ({ to, children, className = "" }: LinkProps) => (
  <a href={to} className={className}>
    {children}
  </a>
)

// Update the interfaces at the top of the file

interface PromptSubmission {
  title: string
  description: string
  category: string
  promptText: string
  expectedOutput: string
  isPrivate: boolean
  tags?: string[] // Add tags support
}

interface EditPromptData extends PromptSubmission {
  id: string
}

type PaymentMethod = "bank" | "paypal" | "stripe" | "crypto"

export default function SubmitPromptPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<PromptSubmission>({
    title: "",
    description: "",
    category: "",
    promptText: "",
    expectedOutput: "",
    isPrivate: false,
  })

  // Remove currentTag state since we're removing tags
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)

  // Payment-related state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank")
  const [bankingInfoNeeded, setBankingInfoNeeded] = useState(true)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false) // Add this state
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [bankName, setBankName] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [stripeAccount, setStripeAccount] = useState("")
  const [cryptoAddress, setCryptoAddress] = useState("")
  const [cryptoNetwork, setCryptoNetwork] = useState("")

  const categories = [
    "Development",
    "Creative Writing",
    "Business",
    "Education",
    "Marketing",
    "Research",
    "Data Analysis",
    "Content Creation",
    "Problem Solving",
    "Other",
  ]

  // Load edit data on component mount
  useEffect(() => {
    // In a real app, you might get this from URL params or props
    // For now, we'll simulate loading from memory/state
    const editData = sessionStorage.getItem("editPromptData")
    if (editData) {
      try {
        const parsedData: EditPromptData = JSON.parse(editData)
        setFormData({
          title: parsedData.title,
          description: parsedData.description,
          category: parsedData.category,
          promptText: parsedData.promptText,
          expectedOutput: parsedData.expectedOutput,
          isPrivate: parsedData.isPrivate,
        })
        setIsEditMode(true)
        setEditingPromptId(parsedData.id)

        // Clear the storage after loading
        sessionStorage.removeItem("editPromptData")
      } catch (error) {
        console.error("Error parsing edit data:", error)
      }
    }
  }, [])

  const handleInputChange = (field: keyof PromptSubmission, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const renderPaymentMethodForm = () => {
    switch (paymentMethod) {
      case "bank":
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="accountName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Account Holder Name
              </label>
              <input
                type="text"
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                  errors.accountName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Full name on account"
              />
              {errors.accountName && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircleIcon className="h-3 w-3 mr-1" />
                  {errors.accountName}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="accountNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                    errors.accountNumber ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Your account number"
                />
                {errors.accountNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                    {errors.accountNumber}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="routingNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Routing Number
                </label>
                <input
                  type="text"
                  id="routingNumber"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                    errors.routingNumber ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Your bank's routing number"
                />
                {errors.routingNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                    {errors.routingNumber}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="bankName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                  errors.bankName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Your bank's name"
              />
              {errors.bankName && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircleIcon className="h-3 w-3 mr-1" />
                  {errors.bankName}
                </p>
              )}
            </div>
          </div>
        )
      case "paypal":
        return (
          <div>
            <label htmlFor="paypalEmail" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              PayPal Email Address
            </label>
            <input
              type="email"
              id="paypalEmail"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                errors.paypalEmail ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="your-email@example.com"
            />
            {errors.paypalEmail && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircleIcon className="h-3 w-3 mr-1" />
                {errors.paypalEmail}
              </p>
            )}
          </div>
        )
      case "stripe":
        return (
          <div>
            <label htmlFor="stripeAccount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Stripe Account ID
            </label>
            <input
              type="text"
              id="stripeAccount"
              value={stripeAccount}
              onChange={(e) => setStripeAccount(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                errors.stripeAccount ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="acct_..."
            />
            {errors.stripeAccount && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircleIcon className="h-3 w-3 mr-1" />
                {errors.stripeAccount}
              </p>
            )}
          </div>
        )
      case "crypto":
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="cryptoNetwork" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Network
              </label>
              <select
                id="cryptoNetwork"
                value={cryptoNetwork}
                onChange={(e) => setCryptoNetwork(e.target.value)}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                  errors.cryptoNetwork ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select a network</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="usdc">USDC</option>
                <option value="usdt">USDT</option>
              </select>
              {errors.cryptoNetwork && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircleIcon className="h-3 w-3 mr-1" />
                  {errors.cryptoNetwork}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="cryptoAddress" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Wallet Address
              </label>
              <input
                type="text"
                id="cryptoAddress"
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                  errors.cryptoAddress ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Your wallet address"
              />
              {errors.cryptoAddress && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircleIcon className="h-3 w-3 mr-1" />
                  {errors.cryptoAddress}
                </p>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.promptText.trim()) newErrors.promptText = "Prompt text is required"
    // Remove tags validation
    if (formData.title.length > 100) newErrors.title = "Title must be less than 100 characters"
    if (formData.description.length > 500) newErrors.description = "Description must be less than 500 characters"

    // Payment validation (only for new prompts, not edits, and only if payment details are shown)
    if (!isEditMode && bankingInfoNeeded && showPaymentDetails) {
      switch (paymentMethod) {
        case "bank":
          if (!accountName.trim()) newErrors.accountName = "Account name is required"
          if (!accountNumber.trim()) newErrors.accountNumber = "Account number is required"
          if (!routingNumber.trim()) newErrors.routingNumber = "Routing number is required"
          if (!bankName.trim()) newErrors.bankName = "Bank name is required"
          break
        case "paypal":
          if (!paypalEmail.trim()) newErrors.paypalEmail = "PayPal email is required"
          break
        case "stripe":
          if (!stripeAccount.trim()) newErrors.stripeAccount = "Stripe account ID is required"
          break
        case "crypto":
          if (!cryptoNetwork) newErrors.cryptoNetwork = "Network selection is required"
          if (!cryptoAddress.trim()) newErrors.cryptoAddress = "Wallet address is required"
          break
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Get user info for authorId
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setErrors({ submit: 'You must be logged in to submit a prompt' })
        setIsSubmitting(false)
        return
      }

      // Prepare submission data for backend
      const submissionData: PromptSubmissionData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        content: formData.promptText, // Backend expects 'content'
        price: 0, // Default price for now
        visibility: formData.isPrivate ? 'private' : 'private', // Start as private, publish later if needed
        tagNames: formData.category ? [formData.category] : [] // Use category as tag for now
      }

      let result
      if (isEditMode && editingPromptId) {
        // Update existing prompt
        result = await promptSubmissionService.updatePrompt(editingPromptId, submissionData)
        
        // If the original was public, republish it
        if (!formData.isPrivate) {
          await promptSubmissionService.publishPrompt(editingPromptId)
        }
      } else {
        // Create new prompt
        result = await promptSubmissionService.submitPrompt(submissionData)
        
        // If user wants it public, publish it immediately
        if (!formData.isPrivate && result.id) {
          await promptSubmissionService.publishPrompt(result.id)
        }
      }

      // Show success message
      setShowSuccess(true)
      
      // Clear any existing errors
      setErrors({})

      setTimeout(() => {
        if (!isEditMode) {
          // Clear form for new submissions
          setFormData({
            title: "",
            description: "",
            category: "",
            promptText: "",
            expectedOutput: "",
            isPrivate: false,
          })

          // Reset payment fields for new submissions
          setAccountName("")
          setAccountNumber("")
          setBankName("")
          setRoutingNumber("")
          setPaypalEmail("")
          setStripeAccount("")
          setCryptoAddress("")
          setCryptoNetwork("")
        }

        setShowSuccess(false)
        
        // Navigate to My Prompts page
        navigate("/my-prompts")
      }, 2000)

    } catch (error: any) {
      console.error('❌ Submission error:', error)
      setErrors({ 
        submit: error.message || 'Failed to submit prompt. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveDraft = () => {
    // Use a temporary variable to store draft data instead of localStorage
    const draftData = JSON.stringify(formData)
    console.log("Draft saved:", draftData) // In a real app, you'd save this to your backend

    // Update both save draft buttons
    const updateButton = (buttonId: string) => {
      const button = document.getElementById(buttonId)
      if (button) {
        const originalText = button.innerHTML
        button.innerHTML =
          '<svg class="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Saved!'
        setTimeout(() => {
          if (button) {
            button.innerHTML = originalText
          }
        }, 2000)
      }
    }

    updateButton("save-draft-btn")
    updateButton("save-draft-btn-bottom")
  }

  const loadDraft = () => {
    // In a real app, you'd load this from your backend
    console.log("Load draft functionality would go here")
  }

  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      promptText: "",
      expectedOutput: "",
      isPrivate: false,
    })
    setIsEditMode(false)
    setEditingPromptId(null)
    setErrors({})

    // Reset payment fields
    setAccountName("")
    setAccountNumber("")
    setBankName("")
    setRoutingNumber("")
    setPaypalEmail("")
    setStripeAccount("")
    setCryptoAddress("")
    setCryptoNetwork("")

    // Navigate back to my prompts page if we were editing
    if (isEditMode) {
      navigate("/my-prompts")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? "Edit Prompt" : "Publish Prompt"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isEditMode ? "Update your existing prompt" : "Share or Save your prompt"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isEditMode && (
                <Button
                  variant="outline"
                  onClick={clearForm}
                  className="flex items-center px-4 py-2 text-sm font-medium"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Edit
                </Button>
              )}
              <Button variant="outline" onClick={loadDraft} className="flex items-center px-4 py-2 text-sm font-medium">
                <FileText className="h-4 w-4 mr-2" />
                Load Draft
              </Button>
              <Button
                variant="outline"
                onClick={saveDraft}
                id="save-draft-btn"
                className="flex items-center px-4 py-2 text-sm font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white px-6 py-2 text-sm font-medium flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditMode ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update Prompt" : "Submit Prompt"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Success Message */}
        {showSuccess && (
          <Card className="p-4 mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                {isEditMode ? "Prompt updated successfully!" : "Prompt submitted successfully!"}
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {isEditMode
                ? "Your prompt changes have been saved."
                : "Your prompt is now under review and will be published soon."}
            </p>
          </Card>
        )}

        {/* Submission Error Message */}
        {errors.submit && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Submission Failed</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.submit}
            </p>
          </Card>
        )}

        {/* Edit Mode Indicator */}
        {isEditMode && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Editing Mode</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              You are currently editing an existing prompt. Make your changes and click "Update Prompt" to save.
            </p>
          </Card>
        )}

        {/* Main Layout: Form on left, Sidebar on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Information Form (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                Basic Information
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                      errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter a descriptive title for your prompt"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.title}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none ${
                      errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    rows={3}
                    placeholder="Briefly describe what your prompt does and its purpose"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    maxLength={500}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                      errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Prompt Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Prompt Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none ${
                      errors.promptText ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    rows={6}
                    placeholder="Enter your prompt text here..."
                    value={formData.promptText}
                    onChange={(e) => handleInputChange("promptText", e.target.value)}
                  />
                  {errors.promptText && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.promptText}
                    </p>
                  )}
                </div>

                {/* Expected Output */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Expected Output
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none"
                    rows={3}
                    placeholder="Describe what kind of output this prompt should generate..."
                    value={formData.expectedOutput}
                    onChange={(e) => handleInputChange("expectedOutput", e.target.value)}
                  />
                </div>

                {/* Private checkbox - Convert to toggle */}
                <div className="flex items-center justify-between">
                  <label htmlFor="isPrivate" className="text-sm font-medium text-gray-900 dark:text-white">
                    Visibility
                  </label>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm ${!formData.isPrivate ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      Public
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInputChange("isPrivate", !formData.isPrivate)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] focus:ring-offset-2 ${
                        formData.isPrivate ? 'bg-red-500' : 'bg-[#3ebb9e]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formData.isPrivate ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-sm ${formData.isPrivate ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      Private
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Terms of Service */}
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                By submitting, you agree to our{" "}
                <a href="#" className="text-[#3ebb9e] hover:text-[#00674f] underline">
                  community guidelines
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#3ebb9e] hover:text-[#00674f] underline">
                  terms of service
                </a>
                .
              </p>
            </div>
          </div>

          {/* Right Column - All Sidebar Components (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preview */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Eye className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                Preview
              </h3>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center py-2 mb-4"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>

              {showPreview && (
                <div className="mt-4">
                  {/* Preview container - adjusted for sidebar */}
                  <div className="w-full">
                    {/* Simulate StandardPromptCard appearance */}
                    <div className="overflow-hidden hover:shadow-lg transition-shadow hover:scale-[1.01] h-full flex flex-col border border-border rounded-lg bg-card min-h-[350px]">
                      <div className="p-4 flex-1">
                        {/* Header with category tag and rating */}
                        <div className="flex justify-between items-start mb-2">
                          {/* Category tag */}
                          {formData.category && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
                                {formData.category}
                              </span>
                            </div>
                          )}

                          {/* Rating and favorite button */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs ml-1">0.0</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              disabled
                              title="Add to favorites"
                            >
                              <Star className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                        </div>

                        {/* Title and description */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm leading-tight">{formData.title || "Untitled Prompt"}</h3>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                          {formData.description || "No description provided"}
                        </p>

                        {/* Content preview if available */}
                        {formData.promptText && (
                          <div className="mb-3 p-2 bg-muted/50 rounded-lg border">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {formData.promptText.length > 100
                                ? `${formData.promptText.substring(0, 100)}...`
                                : formData.promptText}
                            </p>
                          </div>
                        )}

                        {/* Expected Output preview */}
                        {formData.expectedOutput && (
                          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                              Expected Output:
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                              {formData.expectedOutput.length > 80
                                ? `${formData.expectedOutput.substring(0, 80)}...`
                                : formData.expectedOutput}
                            </p>
                          </div>
                        )}

                        {/* Author info */}
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-3 w-3" />
                            </div>
                            <span className="text-xs ml-2 text-muted-foreground font-medium">@you</span>
                          </div>

                          {/* Private indicator */}
                          {formData.isPrivate && (
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                              Private
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer with action buttons */}
                      <div className="border-t border-border flex">
                        <div className="flex-1 flex items-center justify-between p-3">
                          <div className="flex items-center space-x-1">
                            {/* Copy button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled
                              title="Copy prompt content"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>

                            {/* Test button - green play button next to copy */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                              disabled
                              title="Test this prompt"
                            >
                              <Play className="h-3 w-3" />
                            </Button>

                            {/* Edit button */}
                            <Button variant="ghost" size="icon" className="h-7 w-7" disabled title="Edit prompt">
                              <Edit className="h-3 w-3" />
                            </Button>

                            {/* Delete button - red bin icon */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                              disabled
                              title="Delete prompt"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Right side - now empty since test button moved */}
                          <div className="flex items-center space-x-2">
                            {/* Empty - test button moved to left side */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Guidelines */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                Submission Guidelines
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#3ebb9e] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="flex-1">Make your title clear and descriptive</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#3ebb9e] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="flex-1">Include specific instructions in your prompt text</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#3ebb9e] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="flex-1">Describe the expected output format</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#3ebb9e] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="flex-1">Test your prompt before submitting</p>
                </div>
              </div>
            </Card>

            {/* Author Info */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <User className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                Author Information
              </h3>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  Submitting as: <span className="text-foreground font-medium">Anonymous User</span>
                </p>
                <p className="text-xs">
                  <Link to="/login" className="text-[#3ebb9e] hover:underline">
                    Sign in
                  </Link>{" "}
                  to get credit for your submissions and build your reputation in the community.
                </p>
              </div>
            </Card>

            {/* Payment Details Card - existing code remains the same */}
            {!isEditMode && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground flex items-center">
                    <Landmark className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                    Payment Details {showPaymentDetails && <span className="text-red-500 ml-1">*</span>}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                    className="flex items-center text-xs"
                  >
                    {showPaymentDetails ? (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Payment Info
                      </>
                    )}
                  </Button>
                </div>

                {!showPaymentDetails && (
                  <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg border border-dashed">
                    <p className="mb-2">💡 Payment details are optional but recommended</p>
                    <p>
                      Add your payment information to receive earnings from prompt sales. You can always add this later
                      in your account settings.
                    </p>
                  </div>
                )}

                {showPaymentDetails && bankingInfoNeeded && (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        This information is securely stored and used only for payment processing.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={`p-3 rounded-lg border ${paymentMethod === "bank" ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"} flex flex-col items-center space-y-1 transition-colors`}
                      >
                        <Landmark className="w-4 h-4" />
                        <span className="text-xs font-medium">Bank</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className={`p-3 rounded-lg border ${paymentMethod === "paypal" ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"} flex flex-col items-center space-y-1 transition-colors`}
                      >
                        <WalletIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">PayPal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("stripe")}
                        className={`p-3 rounded-lg border ${paymentMethod === "stripe" ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"} flex flex-col items-center space-y-1 transition-colors`}
                      >
                        <CreditCardIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Stripe</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("crypto")}
                        className={`p-3 rounded-lg border ${paymentMethod === "crypto" ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"} flex flex-col items-center space-y-1 transition-colors`}
                      >
                        <BitcoinIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Crypto</span>
                      </button>
                    </div>
                    <div className="text-sm">{renderPaymentMethodForm()}</div>
                  </>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
