"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/Accordion"
import {
  BrainCircuit,
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  ShoppingCart,
  TestTube,
  BarChart3,
  Users,
  CreditCard,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Video,
  FileText,
  Star,
  Edit,
  Share2,
  Download,
  Bot,
  X,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function HelpPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)
  const [showRobotHelper, setShowRobotHelper] = useState(false)
  const [robotMessage, setRobotMessage] = useState("")

  const categories = [
    { id: "all", name: "All Topics", icon: BookOpen },
    { id: "getting-started", name: "Getting Started", icon: Zap },
    { id: "marketplace", name: "Marketplace", icon: ShoppingCart },
    { id: "testing", name: "Testing Ground", icon: TestTube },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
    { id: "account", name: "Account & Billing", icon: CreditCard },
    { id: "troubleshooting", name: "Troubleshooting", icon: HelpCircle },
  ]

  const quickStartGuides = [
    {
      id: "first-steps",
      title: "Your First 5 Minutes",
      description: "Get up and running with Prompt Forge in minutes",
      icon: Zap,
      time: "5 min read",
      category: "getting-started",
    },
    {
      id: "finding-prompts",
      title: "Finding the Perfect Prompt",
      description: "Learn how to search and filter prompts effectively",
      icon: Search,
      time: "3 min read",
      category: "marketplace",
    },
    {
      id: "testing-guide",
      title: "Testing Your First Prompt",
      description: "Step-by-step guide to using the testing ground",
      icon: TestTube,
      time: "7 min read",
      category: "testing",
    },
    {
      id: "analytics-guide",
      title: "Understanding Reviews & Ratings",
      description: "Make sense of community feedback and ratings",
      icon: BarChart3,
      time: "4 min read",
      category: "analytics",
    },
  ]

  const guides = {
    "first-steps": {
      title: "Your First 5 Minutes with Prompt Forge",
      content: (
        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold mb-4">Welcome to Prompt Forge!</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-2">Step 1: Create Your Account</h4>
              <p className="text-muted-foreground mb-2">
                Sign up using email or Google OAuth. No credit card required to get started!
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm">💡 <strong>Tip:</strong> Use Google OAuth for faster access to all features.</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Step 2: Explore the Marketplace</h4>
              <p className="text-muted-foreground mb-2">
                Browse thousands of high-quality prompts created by expert prompt engineers.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Filter by category, price, and ratings</li>
                <li>Read reviews from other users</li>
                <li>Preview prompt descriptions and use cases</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Step 3: Try a Free Prompt</h4>
              <p className="text-muted-foreground mb-2">
                Many prompts are free! Find a free prompt that interests you and add it to your collection.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm">🎉 <strong>Free prompts</strong> appear in your "My Prompts" section after claiming them.</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Step 4: Visit the Testing Ground</h4>
              <p className="text-muted-foreground mb-2">
                Test prompts across different AI models to see how they perform.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Compare results from multiple AI models</li>
                <li>Test with your own input variations</li>
                <li>See real-time performance metrics</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Step 5: Leave Your First Review</h4>
              <p className="text-muted-foreground">
                After testing a prompt, share your experience with the community by leaving a rating and review.
              </p>
            </div>
          </div>
        </div>
      )
    },
    "finding-prompts": {
      title: "Finding the Perfect Prompt",
      content: (
        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold mb-4">Master the Marketplace</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-2">Search Strategies</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Keywords:</strong> Use specific terms related to your use case</li>
                <li><strong>Categories:</strong> Browse by industry or application type</li>
                <li><strong>Price filters:</strong> Find free prompts or set budget limits</li>
                <li><strong>Ratings:</strong> Sort by highest-rated prompts first</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Evaluating Prompts</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">✅ Good Signs</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• High ratings (4+ stars)</li>
                    <li>• Multiple positive reviews</li>
                    <li>• Clear description</li>
                    <li>• Recent updates</li>
                    <li>• Verified seller</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">⚠️ Red Flags</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• No reviews or ratings</li>
                    <li>• Vague descriptions</li>
                    <li>• Overpriced for complexity</li>
                    <li>• No usage examples</li>
                    <li>• Poor grammar/spelling</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Reading Reviews</h4>
              <p className="text-muted-foreground mb-2">
                User reviews are your best insight into prompt quality:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Look for specific use case examples</li>
                <li>Check if reviewers mention similar needs to yours</li>
                <li>Pay attention to performance feedback</li>
                <li>Note any mentioned limitations or issues</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    "testing-guide": {
      title: "Testing Your First Prompt",
      content: (
        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold mb-4">Master the Testing Ground</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-2">Getting Started</h4>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                <li>Navigate to the Testing Ground from the main menu</li>
                <li>Select a prompt from your collection or enter a custom prompt</li>
                <li>Choose an your AI model</li>
                <li>Enter your test input and click "Run Test"</li>
              </ol>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Available Models</h4>
              <div className="border rounded-lg p-4">
                
                <h5 className="font-medium mb-2">DeepSeek AI</h5>
                <ul className="text-sm text-muted-foreground space-y-1 p-2">
                  <li>• High-performance reasoning model</li>
                  <li>• Excellent for complex problem solving</li>
                  <li>• Cost-effective and efficient</li>
                  <li>• Strong performance across various tasks</li>
                </ul>
                <h5 className="font-medium mb-2">Meta Llama 4</h5>
                <ul className="text-sm text-muted-foreground space-y-1 p-2">
                  <li>• Advanced multilingual capabilities</li>
                  <li>• Strong code and reasoning skills</li>
                  <li>• Optimized for performance and scalability</li>
                  <li>• Excels at both general and domain-specific tasks</li>
                </ul>
                <h5 className="font-medium mb-2">Google Gemini 2</h5>
                <ul className="text-sm text-muted-foreground space-y-1 p-2">
                  <li>• Natively multimodal with powerful vision and language integration</li>
                  <li>• Exceptional benchmark results in reasoning and math</li>
                  <li>• Strong integration with Google ecosystem</li>
                  <li>• Fast and reliable performance</li>
                </ul>
                <h5 className="font-medium mb-2">Kimi Dev 72B</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Chinese-focused large language model</li>
                  <li>• High-quality generation and instruction following</li>
                  <li>• Competitive with top-tier global models</li>
                  <li>• Optimized for developer tools and applications</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                <p className="text-sm">💡 <strong>Note:</strong> We currently support DeepSeek AI, Meta Llama 4, Google Gemini 2, and Kimi Dev 72B.</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Testing Best Practices</h4>
              <p className="text-muted-foreground mb-2">
                Get the most out of your DeepSeek testing sessions:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Test with realistic, varied input data</li>
                <li>Try edge cases and corner scenarios</li>
                <li>Compare different prompt variations</li>
                <li>Document successful configurations</li>
                <li>Note optimal prompt length and structure</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Best Practices</h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <ul className="text-sm space-y-2">
                  <li>🎯 <strong>Test with realistic inputs:</strong> Use actual data you'll work with</li>
                  <li>🔄 <strong>Try multiple variations:</strong> Test edge cases and different scenarios</li>
                  <li>📊 <strong>Document results:</strong> Keep notes on what works and what doesn't</li>
                  <li>⚡ <strong>Iterate quickly:</strong> Make small adjustments and test again</li>
                  <li>🚀 <strong>Leverage DeepSeek's strengths:</strong> Complex reasoning and problem-solving tasks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    "analytics-guide": {
      title: "Understanding Reviews & Ratings",
      content: (
        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold mb-4">Community Feedback System</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-2">Rating System</h4>
              <p className="text-muted-foreground mb-3">
                Our 5-star rating system helps you quickly identify quality prompts:
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm">Exceptional - Outstanding quality and performance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex">
                    {[1,2,3,4].map(i => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                  <span className="text-sm">Very Good - Reliable with minor improvements possible</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex">
                    {[1,2,3].map(i => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                    {[4,5].map(i => (
                      <Star key={i} className="h-4 w-4 text-gray-300" />
                    ))}
                  </div>
                  <span className="text-sm">Good - Meets expectations with room for improvement</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Writing Helpful Reviews</h4>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                <h5 className="font-medium mb-2">✍️ Review Guidelines</h5>
                <ul className="text-sm space-y-1">
                  <li>• Be specific about your use case</li>
                  <li>• Mention which AI models you tested with</li>
                  <li>• Include examples of successful outputs</li>
                  <li>• Note any limitations or edge cases</li>
                  <li>• Be constructive and helpful to other users</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-muted-foreground italic">
                  "I used this prompt for generating product descriptions for my e-commerce store. 
                  Works great with GPT-4 - generated 50+ descriptions that needed minimal editing. 
                  The formatting is consistent and captures key features well. 
                  Recommend testing with your specific product categories first."
                </p>
                <p className="text-xs text-muted-foreground mt-2">- Example of a helpful review</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Interpreting Community Feedback</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Look for Patterns</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multiple users mentioning similar benefits</li>
                    <li>• Consistent performance across different use cases</li>
                    <li>• Positive feedback from verified purchasers</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Red Flags</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Generic or very short reviews</li>
                    <li>• All reviews from the same time period</li>
                    <li>• Complaints about misleading descriptions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2">Your Review History</h4>
              <p className="text-muted-foreground mb-2">
                You can manage your reviews from your profile:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Edit existing reviews as you gain more experience with prompts</li>
                <li>View all prompts you've reviewed</li>
                <li>Track which reviews other users found helpful</li>
                <li>Build your reputation as a trusted reviewer</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  }

  const faqs = [
    {
      category: "getting-started",
      question: "How do I create my first account?",
      answer:
        "Creating an account is simple! Click 'Get Started' on our homepage, choose between email signup or Google OAuth, and you'll be ready to explore our marketplace in seconds. No credit card required for basic features.",
    },
    {
      category: "marketplace",
      question: "How do I purchase a prompt?",
      answer:
        "Browse our marketplace, click on any prompt that interests you, review its ratings and user reviews, then click 'Purchase' or 'Add to Cart'. Free prompts can be claimed instantly and will appear in your 'My Prompts' section.",
    },
    {
      category: "marketplace",
      question: "Can I sell my own prompts?",
      answer:
        "Yes! Once you've created and tested your prompts, you can publish them to the marketplace. Navigate to 'My Prompts', create a new prompt, test it thoroughly, then publish it for others to discover.",
    },
    {
      category: "marketplace",
      question: "What's the difference between free and paid prompts?",
      answer:
        "Free prompts are available to all users and can be claimed instantly. Paid prompts typically offer more specialized functionality, have been extensively tested, or include additional resources like examples and documentation.",
    },
    {
      category: "testing",
      question: "Which AI models can I test with?",
      answer:
        "We currently support DeepSeek AI, Meta Llama 4, Google Gemini 2, and Kimi Dev 72B.",
    },
    {
      category: "testing",
      question: "How do I compare prompts effectively?",
      answer:
        "Use our side-by-side comparison feature in the Testing Ground. Run the same input through different prompts or models, then evaluate based on accuracy, creativity, formatting, and relevance to your specific needs.",
    },
    {
      category: "testing",
      question: "Are there limits on testing?",
      answer:
        "Free accounts include 10 prompt tests per month. Premium accounts have higher limits and access to advanced testing features. You can also purchase additional testing credits if needed.",
    },
    {
      category: "analytics",
      question: "How does the rating system work?",
      answer:
        "Users rate prompts on a 5-star scale based on quality, performance, and usefulness. The average rating is displayed on each prompt, along with the total number of reviews. Only users who have purchased or claimed a prompt can leave reviews.",
    },
    {
      category: "analytics",
      question: "Can I edit my reviews?",
      answer:
        "Yes! You can edit your reviews at any time from the prompt details page. This is helpful as you gain more experience with a prompt or if your use case changes.",
    },
    {
      category: "account",
      question: "What's included in the free plan?",
      answer:
        "The free plan includes access to browse the marketplace, claim free prompts, 10 prompt tests per month, basic testing features, and the ability to leave reviews. Perfect for getting started!",
    },
    {
      category: "account",
      question: "How do I manage my purchased prompts?",
      answer:
        "All your prompts (both created and purchased) appear in the 'My Prompts' section. You can filter between 'Created by Me' and 'Purchased' prompts, organize by categories, and search through your collection.",
    },
    {
      category: "account",
      question: "Can I share prompts with my team?",
      answer:
        "Currently, prompts are tied to individual accounts. We're working on team features that will allow sharing within organizations. Stay tuned for updates!",
    },
    {
      category: "troubleshooting",
      question: "My prompt test failed. What should I do?",
      answer:
        "Test failures can happen due to API limits, network issues, or prompt formatting problems. Check your prompt syntax, ensure you're within testing limits, and try again in a few minutes. Contact support if the issue persists.",
    },
    {
      category: "troubleshooting",
      question: "Why can't I see my purchased prompts?",
      answer:
        "Purchased prompts should appear in your 'My Prompts' section under the 'Purchased' filter. If they're missing, try refreshing the page or check your purchase history. Contact support if you still can't find them.",
    },
    {
      category: "troubleshooting",
      question: "I can't leave a review. Why?",
      answer:
        "You can only review prompts that you've purchased or claimed. Also, you can only leave one review per prompt. If you've already reviewed a prompt, you can edit your existing review instead of creating a new one.",
    },
  ]

  const filteredFaqs = selectedCategory === "all" ? faqs : faqs.filter((faq) => faq.category === selectedCategory)
  const filteredGuides = selectedCategory === "all" ? quickStartGuides : quickStartGuides.filter((guide) => guide.category === selectedCategory)

  // Welcome message on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setRobotMessage("👋 Welcome to our Help Center! I can guide you to the right resources. What would you like to learn about today?")
      setShowRobotHelper(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Search helper when user starts typing
  useEffect(() => {
    if (searchQuery.length > 2 && !showRobotHelper) {
      setRobotMessage("💡 Try searching for specific topics like 'testing', 'marketplace', or 'reviews' to find relevant help articles quickly!")
      setShowRobotHelper(true)
    }
  }, [searchQuery, showRobotHelper])

  // Contextual robot messages based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      
      if (showRobotHelper) return
      
      if (scrollPosition > windowHeight * 1.5 && scrollPosition < windowHeight * 2.5) {
        setRobotMessage("❓ Can't find what you're looking for? Try browsing different categories or use the search bar above. I'm here to help!")
        setShowRobotHelper(true)
      } else if (scrollPosition > windowHeight * 3 && scrollPosition < windowHeight * 4) {
        setRobotMessage("📚 These comprehensive guides cover advanced features. Perfect when you want to become a power user! Need help choosing one?")
        setShowRobotHelper(true)
      }
    }

    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll)
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [showRobotHelper])

  // Guide view logic
  if (selectedGuide && guides[selectedGuide as keyof typeof guides]) {
    const guide = guides[selectedGuide as keyof typeof guides]
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex items-center space-x-3">
                <div className="bg-[#00876e]/10 p-2 rounded-xl">
                  <BrainCircuit className="w-8 h-8 text-[#3ebb9e]" />
                </div>
                <span className="text-2xl font-bold">Prompt Forge</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedGuide(null)}
                  className="text-sm font-medium"
                >
                  ← Back to Help
                </Button>
                <Button 
                  onClick={() => navigate(-1)}
                  className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                >
                  ← Back
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Guide Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setSelectedGuide(null)}
              className="mb-6"
            >
              ← Back to Help Center
            </Button>
            
            <Card className="p-8">
              <h1 className="text-3xl font-bold mb-6">{guide.title}</h1>
              {guide.content}
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-[#00876e]/10 p-2 rounded-xl">
                <BrainCircuit className="w-8 h-8 text-[#3ebb9e]" />
              </div>
              <span className="text-2xl font-bold">Prompt Forge</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate(-1)}
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#3ebb9e]/5 to-[#00674f]/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <h1 className="text-4xl lg:text-5xl font-bold">How can we help you?</h1>
                <button
                  onClick={() => {
                    setRobotMessage("👋 Hi! I'm here to help you navigate our help center. What would you like to learn about today?")
                    setShowRobotHelper(true)
                  }}
                  className="bg-[#3ebb9e]/10 p-3 rounded-full hover:bg-[#3ebb9e]/20 transition-colors"
                  title="Get help from our AI assistant"
                >
                  <Bot className="h-6 w-6 text-[#3ebb9e]" />
                </button>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                Find answers, learn best practices, and get the most out of Prompt Forge
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto lg:mx-0 relative">
                {!searchQuery && (
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10 pointer-events-none" />
                )}
                <Input
                  placeholder="            Search for help articles, guides, and FAQs..."
                  className={`pr-4 py-6 text-lg border-2 border-[#3ebb9e]/20 focus:border-[#3ebb9e] rounded-xl transition-all duration-200 ${
                    searchQuery ? 'pl-4' : 'pl-12'
                  }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right side - Robot Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-64 h-64 lg:w-80 lg:h-80 relative">
                <img 
                  src="/Forgi-help.png" 
                  alt="AI Help Assistant" 
                  className="object-contain w-full h-full drop-shadow-lg"
                />
                {/* Floating help bubble - FIXED */}
                <div className="absolute -top-12 -right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs hover:scale-105 transition-transform cursor-pointer"
                     onClick={() => {
                       setRobotMessage("👋 Hi! I'm here to help you navigate our help center. What would you like to learn about today?")
                       setShowRobotHelper(true)
                     }}>
                  <div className="flex items-start gap-2">
                    <div className="bg-[#3ebb9e]/10 p-1 rounded-full flex-shrink-0">
                      <Bot className="h-3 w-3 text-[#3ebb9e]" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Need help? I can guide you to the right resources!
                    </p>
                  </div>
                  {/* Speech bubble tail - IMPROVED */}
                  <div className="absolute bottom-0 left-6 transform translate-y-full">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Guides */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="text-lg text-muted-foreground">Essential guides to help you master Prompt Forge quickly</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGuides.map((guide, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer group p-6"
                onClick={() => setSelectedGuide(guide.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[#3ebb9e]/10 p-2 rounded-lg">
                    <guide.icon className="h-6 w-6 text-[#3ebb9e]" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {guide.time}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#3ebb9e] transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                <div className="flex items-center text-[#3ebb9e] text-sm font-medium">
                  Read Guide
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Help Content */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 p-6">
                <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? "bg-[#3ebb9e]/10 text-[#00674f] font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">
                  {selectedCategory === "all"
                    ? "Browse all frequently asked questions"
                    : `Questions about ${categories.find((c) => c.id === selectedCategory)?.name.toLowerCase()}`}
                </p>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline hover:text-[#3ebb9e]">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFaqs.length === 0 && (
                <Card className="text-center py-12 px-6">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No questions found</h3>
                  <p className="text-muted-foreground">
                    Try selecting a different category or contact our support team.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dives */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Feature Deep Dives</h2>
            <p className="text-lg text-muted-foreground">Comprehensive guides for mastering each feature</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow p-6 flex flex-col">
              <div className="bg-[#3ebb9e]/10 p-3 rounded-lg w-fit mb-4">
                <ShoppingCart className="h-6 w-6 text-[#3ebb9e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Marketplace Mastery</h3>
              <p className="text-muted-foreground mb-4">
                Learn how to find, evaluate, and purchase the best prompts for your needs
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Advanced search and filtering
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Reading performance metrics
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Understanding ratings and reviews
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-auto"
                onClick={() => setSelectedGuide("finding-prompts")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Read Full Guide
              </Button>
            </Card>

            <Card className="hover:shadow-lg transition-shadow p-6 flex flex-col">
              <div className="bg-[#3ebb9e]/10 p-3 rounded-lg w-fit mb-4">
                <TestTube className="h-6 w-6 text-[#3ebb9e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Testing Ground Pro</h3>
              <p className="text-muted-foreground mb-4">Master the art of prompt testing and optimization</p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  DeepSeek testing strategies
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Comparing prompt performance
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Interpreting test results
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-auto"
                onClick={() => setSelectedGuide("testing-guide")}
              >
                <Video className="mr-2 h-4 w-4" />
                Watch Tutorial
              </Button>
            </Card>

            <Card className="hover:shadow-lg transition-shadow p-6 flex flex-col">
              <div className="bg-[#3ebb9e]/10 p-3 rounded-lg w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-[#3ebb9e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reviews & Community</h3>
              <p className="text-muted-foreground mb-4">Understand community feedback and improve your prompts</p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Understanding the rating system
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Writing helpful reviews
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                  Building community reputation
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-auto"
                onClick={() => setSelectedGuide("analytics-guide")}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Examples
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16">
                <img 
                  src="/Forgi-help.png" 
                  alt="Support Robot" 
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Still Need Help?</h2>
                <button
                  onClick={() => {
                    setRobotMessage("🤝 Our support team is amazing! Live chat is fastest for urgent issues, while email works great for detailed questions. I can help you choose the best option!")
                    setShowRobotHelper(true)
                  }}
                  className="bg-[#3ebb9e]/10 px-3 py-1 rounded-full hover:bg-[#3ebb9e]/20 transition-colors text-sm"
                >
                  <Bot className="h-3 w-3 text-[#3ebb9e] inline mr-1" />
                  Get personalized help
                </button>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">Our support team is here to help you succeed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow p-6 flex flex-col">
              <div className="bg-[#3ebb9e]/10 p-4 rounded-full w-fit mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-[#3ebb9e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-4">Get instant help from our support team</p>
              <p className="text-sm text-muted-foreground mb-6 flex-1">Available 24/7 for urgent issues</p>
              <Button className="w-full bg-[#3ebb9e] hover:bg-[#00674f] mt-auto">
                Start Chat
              </Button>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow p-6 flex flex-col">
              <div className="bg-[#3ebb9e]/10 p-4 rounded-full w-fit mx-auto mb-4">
                <Mail className="h-8 w-8 text-[#3ebb9e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-4">Send us a detailed message</p>
              <p className="text-sm text-muted-foreground mb-6 flex-1">Response within 24 hours</p>
              <Button variant="outline" className="w-full mt-auto">
                Send Email
              </Button>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow p-6 flex flex-col">
              <div className="bg-[#3ebb9e]/10 p-4 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-[#3ebb9e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Forum</h3>
              <p className="text-muted-foreground mb-4">Connect with other users</p>
              <p className="text-sm text-muted-foreground mb-6 flex-1">Share tips and get advice</p>
              <Button variant="outline" className="w-full mt-auto">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Forum
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0C201B] text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BrainCircuit className="w-6 h-6 text-[#3ebb9e]" />
                <span className="text-lg font-bold">PROMPT FORGE</span>
              </div>
              <p className="text-gray-400 text-sm">Empowering the future of AI through better prompts.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Help Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://drive.google.com/file/d/1lekgm25uiSeLMxurxhPEMP1yBw_nFJR-/view" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Video Tutorial
                  </a>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Best Practices
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    API Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://github.com/COS301-SE-2025/Prompt-Forge" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    System Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white">
                    Discord
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://github.com/COS301-SE-2025/Prompt-Forge" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Github
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Prompt Forge. All rights reserved. Built with ❤️ for the AI community.</p>
          </div>
        </div>
      </footer>

      {/* Robot Helper */}
      {showRobotHelper && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 flex-shrink-0">
                <img 
                  src="/Forgi-help.png" 
                  alt="Help Robot" 
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex-1">
                <div className="bg-[#3ebb9e]/10 rounded-lg p-3 mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{robotMessage}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedGuide("first-steps")}
                    className="text-xs bg-[#3ebb9e]/10 text-[#3ebb9e] px-2 py-1 rounded hover:bg-[#3ebb9e]/20 transition-colors"
                  >
                    Getting Started
                  </button>
                  <button
                    onClick={() => setSelectedGuide("testing-guide")}
                    className="text-xs bg-[#3ebb9e]/10 text-[#3ebb9e] px-2 py-1 rounded hover:bg-[#3ebb9e]/20 transition-colors"
                  >
                    Testing Help
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowRobotHelper(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
