import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" // Add this import
import { 
  Save, Eye, Send, Plus, X, AlertCircle, CheckCircle, Lightbulb, 
  Tag, FileText, User, AlertCircleIcon, WalletIcon, CreditCardIcon, 
  BitcoinIcon, Landmark 
} from "lucide-react"

// Mock components - replace with your actual UI components
interface ButtonProps {
  children: React.ReactNode;
  variant?: string;
  size?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  id?: string;
}

const Button = ({ children, variant = "default", size = "default", disabled = false, className = "", onClick, id }: ButtonProps) => (
  <button
    id={id}
    onClick={onClick}
    disabled={disabled}
    className={`
      inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] focus:ring-offset-2
      ${variant === "outline" 
        ? "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300" 
        : "bg-[#3ebb9e] hover:bg-[#00674f] text-white border border-transparent"
      } 
      ${size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm"} 
      ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"} 
      ${className}
    `}
  >
    {children}
  </button>
)

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-card border border-border rounded-lg ${className}`}>
    {children}
  </div>
)

// Mock Link component - replace with your actual router Link
interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const Link = ({ to, children, className = "" }: LinkProps) => (
  <a href={to} className={className}>
    {children}
  </a>
)

interface PromptSubmission {
  title: string
  description: string
  category: string
  tags: string[]
  promptText: string
  instructions: string
  expectedOutput: string
  useCase: string
  isPrivate?: boolean
}

interface EditPromptData {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  promptText: string
  instructions: string
  expectedOutput: string
  useCase: string
  isPrivate: boolean
}

type PaymentMethod = "bank" | "paypal" | "stripe" | "crypto"

export default function SubmitPromptPage() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState<PromptSubmission>({
    title: "",
    description: "",
    category: "",
    tags: [],
    promptText: "",
    instructions: "",
    expectedOutput: "",
    useCase: "",
    isPrivate: false,
  })

  const [currentTag, setCurrentTag] = useState("")
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
          tags: parsedData.tags,
          promptText: parsedData.promptText,
          instructions: parsedData.instructions,
          expectedOutput: parsedData.expectedOutput,
          useCase: parsedData.useCase,
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

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
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
    if (formData.tags.length === 0) newErrors.tags = "At least one tag is required"
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setShowSuccess(true)
      
      setTimeout(() => {
        // Only clear form and navigate if it's a new submission, not an edit
        if (!isEditMode) {
          setFormData({
            title: "",
            description: "",
            category: "",
            tags: [],
            promptText: "",
            instructions: "",
            expectedOutput: "",
            useCase: "",
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
        } else {
          // For edits, just navigate back to my prompts page after showing success
          setTimeout(() => {
            navigate('/my-prompts')
          }, 1000)
        }
        
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Submission error:", error)
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
        button.innerHTML = '<svg class="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Saved!'
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
      tags: [],
      promptText: "",
      instructions: "",
      expectedOutput: "",
      useCase: "",
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
      navigate('/my-prompts')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
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
              <Button 
                variant="outline" 
                onClick={loadDraft} 
                className="flex items-center px-4 py-2 text-sm font-medium"
              >
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
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
                : "Your prompt is now under review and will be published soon."
              }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                Basic Information
              </h2>

              <div className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Instructions
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none"
                    rows={3}
                    placeholder="Additional instructions for using this prompt..."
                    value={formData.instructions}
                    onChange={(e) => handleInputChange("instructions", e.target.value)}
                  />
                </div>

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

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Use Case
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none"
                    rows={3}
                    placeholder="Explain when and how this prompt would be useful..."
                    value={formData.useCase}
                    onChange={(e) => handleInputChange("useCase", e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate || false}
                    onChange={(e) => handleInputChange("isPrivate", e.target.checked)}
                    className="rounded border-gray-300 focus:ring-2 focus:ring-[#3ebb9e]"
                  />
                  <label htmlFor="isPrivate" className="text-sm font-medium text-gray-900 dark:text-white">
                    Make this prompt private
                  </label>
                </div>
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                Tags <span className="text-red-500">*</span>
              </h2>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm"
                    placeholder="Add a tag and press Enter"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />

                  <Button
                    onClick={addTag}
                    size="sm"
                    disabled={!currentTag.trim() || formData.tags.length >= 10}
                    className="bg-[#3ebb9e] hover:bg-[#00674f]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {errors.tags && (
                  <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.tags}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 text-xs px-3 py-1 bg-[#3ebb9e]/10 text-[#3ebb9e] rounded-full border border-[#3ebb9e]/20"
                    >
                      <span>#{tag}</span>
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  {formData.tags.length}/10 tags. Tags help users discover your prompt.
                </p>
              </div>
            </Card>

            {/* Payment Details Card - Make it hideable */}
            {!isEditMode && ( // Only show for new prompts, not edits
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center">
                    <Landmark className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                    Payment Details {showPaymentDetails && <span className="text-red-500 ml-1">*</span>}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                    className="flex items-center"
                  >
                    {showPaymentDetails ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Payment Info
                      </>
                    )}
                  </Button>
                </div>

                {!showPaymentDetails && (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border border-dashed">
                    <p className="mb-2">💡 Payment details are optional but recommended</p>
                    <p>Add your payment information to receive earnings from prompt sales. You can always add this later in your account settings.</p>
                  </div>
                )}

                {showPaymentDetails && bankingInfoNeeded && (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        This information is securely stored and used only for payment processing.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={`p-4 rounded-lg border ${paymentMethod === "bank" ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"} flex flex-col items-center space-y-2 transition-colors`}
                      >
                        <Landmark className="w-6 h-6" />
                        <span className="text-sm font-medium">Bank Account</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className={`p-4 rounded-lg border ${paymentMethod === "paypal" ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"} flex flex-col items-center space-y-2 transition-colors`}
                      >
                        <WalletIcon className="w-6 h-6" />
                        <span className="text-sm font-medium">PayPal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("stripe")}
                        className={`p-4 rounded-lg border ${paymentMethod === "stripe" ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"} flex flex-col items-center space-y-2 transition-colors`}
                      >
                        <CreditCardIcon className="w-6 h-6" />
                        <span className="text-sm font-medium">Stripe</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("crypto")}
                        className={`p-4 rounded-lg border ${paymentMethod === "crypto" ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"} flex flex-col items-center space-y-2 transition-colors`}
                      >
                        <BitcoinIcon className="w-6 h-6" />
                        <span className="text-sm font-medium">Crypto</span>
                      </button>
                    </div>
                    <div>{renderPaymentMethodForm()}</div>
                  </>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preview */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Eye className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                Preview
              </h3>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center py-2" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>

              {showPreview && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                  <h4 className="font-medium text-sm text-foreground mb-2">{formData.title || "Untitled Prompt"}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {formData.description || "No description provided"}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-1 bg-muted rounded text-muted-foreground">
                      {formData.category || "No category"}
                    </span>
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
                  <p>Make your title clear and descriptive</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#3ebb9e] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include specific instructions in your prompt</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#3ebb9e] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Add relevant tags for better discoverability</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#3ebb9e] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Test your prompt before submitting</p>
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
          </div>
        </div>

        {/* Submit Actions */}
        <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-sm text-muted-foreground flex-1">
              <p>By submitting, you agree to our community guidelines and terms of service.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center justify-center px-6 py-2 text-sm font-medium"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
              <Button
                variant="outline"
                onClick={saveDraft}
                id="save-draft-btn-bottom"
                className="flex items-center justify-center px-6 py-2 text-sm font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white px-8 py-2 text-sm font-medium flex items-center justify-center min-w-[140px]"
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
    </div>
  )
}
