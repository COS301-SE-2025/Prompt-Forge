"use client"

import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Tag,
  FileText,
  User,
  Zap,
  AlertCircleIcon,
  WalletIcon,
  CreditCardIcon,
  BitcoinIcon,
  Landmark,
} from "lucide-react"
import { useState } from "react"

interface PromptSubmission {
  title: string
  description: string
  category: string
  tags: string[]
  promptText: string
  instructions: string
  expectedOutput: string
  // difficulty: string
  useCase: string
}

export default function SubmitPromptPage() {


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [bankingInfoNeeded, setBankingInfoNeeded] = useState(true);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [stripeAccount, setStripeAccount] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState('');


  const [formData, setFormData] = useState<PromptSubmission>({
    title: "",
    description: "",
    category: "",
    tags: [],
    promptText: "",
    instructions: "",
    expectedOutput: "",
    // difficulty: "beginner",
    useCase: "",
  })

  const [currentTag, setCurrentTag] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

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

  // const difficulties = [
  //   { value: "beginner", label: "Beginner", color: "bg-green-500" },
  //   { value: "intermediate", label: "Intermediate", color: "bg-yellow-500" },
  //   { value: "advanced", label: "Advanced", color: "bg-red-500" },
  // ]

  const handleInputChange = (field: keyof PromptSubmission, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
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


  type PaymentMethod = 'bank' | 'paypal' | 'stripe' | 'crypto';



  const renderPaymentMethodForm = () => {
    
    switch (paymentMethod) {
      case 'bank':
        return <div className="space-y-6">
          <div>
            <label htmlFor="accountName" className="block mb-2 text-sm font-medium">
              Account Holder Name
            </label>
            <input type="text" id="accountName" value={accountName} onChange={e => setAccountName(e.target.value)} className={`w-full bg-background border ${errors.accountName ? 'border-red-500' : 'border-border'} rounded p-3 focus:outline-none focus:border-blue-500`} placeholder="Full name on account" />
            {errors.accountName && <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircleIcon className="w-4 h-4 mr-1" />{' '}
              {errors.accountName}
            </p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="accountNumber" className="block mb-2 text-sm font-medium">
                Account Number
              </label>
              <input type="text" id="accountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className={`w-full bg-background border ${errors.accountNumber ? 'border-red-500' : 'border-border'} rounded p-3 focus:outline-none focus:border-blue-500`} placeholder="Your account number" />
              {errors.accountNumber && <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircleIcon className="w-4 h-4 mr-1" />{' '}
                {errors.accountNumber}
              </p>}
            </div>
            <div>
              <label htmlFor="routingNumber" className="block mb-2 text-sm font-medium">
                Routing Number
              </label>
              <input type="text" id="routingNumber" value={routingNumber} onChange={e => setRoutingNumber(e.target.value)} className={`w-full bg-background border ${errors.routingNumber ? 'border-red-500' : 'border-border'} rounded p-3 focus:outline-none focus:border-blue-500`} placeholder="Your bank's routing number" />
              {errors.routingNumber && <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircleIcon className="w-4 h-4 mr-1" />{' '}
                {errors.routingNumber}
              </p>}
            </div>
          </div>
          <div>
            <label htmlFor="bankName" className="block mb-2 text-sm font-medium">
              Bank Name
            </label>
            <input type="text" id="bankName" value={bankName} onChange={e => setBankName(e.target.value)} className={`w-full bg-background border ${errors.bankName ? 'border-red-500' : 'border-border'} rounded p-3 focus:outline-none focus:border-blue-500`} placeholder="Your bank's name" />
            {errors.bankName && <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircleIcon className="w-4 h-4 mr-1" /> {errors.bankName}
            </p>}
          </div>
        </div>;
      case 'paypal':
        return <div>
          <label htmlFor="paypalEmail" className="block mb-2 text-sm font-medium">
            PayPal Email Address
          </label>
          <input type="email" id="paypalEmail" value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} className={`w-full bg-background border ${errors.paypalEmail ? 'border-red-500' : 'border-border'} rounded p-3 focus:outline-none focus:border-blue-500`} placeholder="your-email@example.com" />
          {errors.paypalEmail && <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircleIcon className="w-4 h-4 mr-1" />{' '}
            {errors.paypalEmail}
          </p>}
        </div>;
      case 'stripe':
        return <div>
          <label htmlFor="stripeAccount" className="block mb-2 text-sm font-medium">
            Stripe Account ID
          </label>
          <input type="text" id="stripeAccount" value={stripeAccount} onChange={e => setStripeAccount(e.target.value)} className={`w-full bg-background border ${errors.stripeAccount ? 'border-red-500' : 'border-border'} rounded p-3 focus:outline-none focus:border-blue-500`} placeholder="acct_..." />
          {errors.stripeAccount && <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircleIcon className="w-4 h-4 mr-1" />{' '}
            {errors.stripeAccount}
          </p>}
        </div>;
      case 'crypto':
        return <div className="space-y-6">
          <div>
            <label htmlFor="cryptoNetwork" className="block mb-2 text-sm font-medium">
              Network
            </label>
            <select id="cryptoNetwork" value={cryptoNetwork} onChange={e => setCryptoNetwork(e.target.value)} className={`w-full bg-background border ${errors.cryptoNetwork ? 'border-red-500' : 'border-border'} rounded p-3 focus:outline-none focus:border-blue-500`}>
              <option value="">Select a network</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="usdc">USDC</option>
              <option value="usdt">USDT</option>
            </select>
            {errors.cryptoNetwork && <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircleIcon className="w-4 h-4 mr-1" />{' '}
              {errors.cryptoNetwork}
            </p>}
          </div>
          <div>
            <label htmlFor="cryptoAddress" className="block mb-2 text-sm font-medium">
              Wallet Address
            </label>
            <input type="text" id="cryptoAddress" value={cryptoAddress} onChange={e => setCryptoAddress(e.target.value)} className={`w-full bg-background border ${errors.cryptoAddress ? 'border-red-500' : 'border-border'} rounded p-3 focus:outline-none focus:border-blue-500`} placeholder="Your wallet address" />
            {errors.cryptoAddress && <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircleIcon className="w-4 h-4 mr-1" />{' '}
              {errors.cryptoAddress}
            </p>}
          </div>
        </div>;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.promptText.trim()) newErrors.promptText = "Prompt text is required"
    if (formData.tags.length === 0) newErrors.tags = "At least one tag is required"
    if (formData.title.length > 100) newErrors.title = "Title must be less than 100 characters"
    if (formData.description.length > 500) newErrors.description = "Description must be less than 500 characters"

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
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          category: "",
          tags: [],
          promptText: "",
          instructions: "",
          expectedOutput: "",
          // difficulty: "beginner",
          useCase: "",
        })
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveDraft = () => {
    localStorage.setItem("promptDraft", JSON.stringify(formData))
    // Show temporary success message
    const button = document.getElementById("save-draft-btn")
    if (button) {
      button.textContent = "Saved!"
      setTimeout(() => {
        button.textContent = "Save Draft"
      }, 2000)
    }
  }

  const loadDraft = () => {
    const draft = localStorage.getItem("promptDraft")
    if (draft) {
      setFormData(JSON.parse(draft))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/community">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Community
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Publish Prompt</h1>
                <p className="text-muted-foreground">Share your prompt with the community</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={loadDraft}>
                Load Draft
              </Button>
              <Button variant="outline" onClick={saveDraft} id="save-draft-btn">
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
          <Card className="p-4 mb-6 bg-green-500/10 border-green-500/20">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Prompt submitted successfully!</span>
            </div>
            <p className="text-sm text-green-600/80 mt-1">
              Your prompt is now under review and will be published soon.
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                      errors.title ? "border-red-500" : "border-border"
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
                  <p className="text-xs text-muted-foreground mt-1">{formData.title.length}/100 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none ${
                      errors.description ? "border-red-500" : "border-border"
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
                  <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm ${
                      errors.category ? "border-red-500" : "border-border"
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
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm"
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
                  <Button onClick={addTag} size="sm" disabled={!currentTag.trim() || formData.tags.length >= 10} className="bg-[#3ebb9e] hover:bg-[#00674f]">
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
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Landmark className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                Payment Details <span className="text-red-500">*</span>
              </h2>

              {bankingInfoNeeded && <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button type="button" onClick={() => setPaymentMethod('bank')} className={`p-4 rounded-lg border ${paymentMethod === 'bank' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'} flex flex-col items-center space-y-2 transition-colors`}>
                    <Landmark className="w-6 h-6" />
                    <span className="text-sm font-medium">Bank Account</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('paypal')} className={`p-4 rounded-lg border ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'} flex flex-col items-center space-y-2 transition-colors`}>
                    <WalletIcon className="w-6 h-6" />
                    <span className="text-sm font-medium">PayPal</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('stripe')} className={`p-4 rounded-lg border ${paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'} flex flex-col items-center space-y-2 transition-colors`}>
                    <CreditCardIcon className="w-6 h-6" />
                    <span className="text-sm font-medium">Stripe</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('crypto')} className={`p-4 rounded-lg border ${paymentMethod === 'crypto' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'} flex flex-col items-center space-y-2 transition-colors`}>
                    <BitcoinIcon className="w-6 h-6" />
                    <span className="text-sm font-medium">Crypto</span>
                  </button>
                </div>
                <div className="mt-6">{renderPaymentMethodForm()}</div>
              </>}
            </Card>

            
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preview */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Eye className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                Preview
              </h3>
              <Button id="preview"
                variant="outline"
                className="w-full"
                onClick={() => setShowPreview(!showPreview)}
                // disabled={!formData.title || !formData.description}
              >
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
                {/* <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-[#3ebb9e] rounded-full mt-2 flex-shrink-0"></div>
                  <p>Provide usage examples when helpful</p>
                </div> */}
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
        <div className="mt-8 flex items-center justify-between p-6 bg-muted/30 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground">
            <p>By submitting, you agree to our community guidelines and terms of service.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="#preview">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#3ebb9e] hover:bg-[#00674f] text-white px-6"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Prompt
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
