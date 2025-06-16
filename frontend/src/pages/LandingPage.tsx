"use client"

import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import {
  BrainCircuit,
  Search,
  Users,
  ShoppingCart,
  TestTube,
  BarChart3,
  Target,
  ArrowRight,
  CheckCircle,
  Moon,
  Sun,
} from "lucide-react"
import { Link } from 'react-router-dom'
import { Image } from "../components/ui/Image"
import { useTheme } from "../components/theme-provider"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-[#00876e] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-[#00876e]/10 p-1 rounded-lg">
                <BrainCircuit className="w-3 h-3 text-[#3ebb9e]" />
              </div>
              <span className="text-lg font-bold text-[#0C201B] dark:text-white">PROMPT FORGE</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="#features" className="text-sm font-medium hover:text-[#3ebb9e] transition-colors">
                Features
              </Link>
              <Link to="#how-it-works" className="text-sm font-medium hover:text-[#3ebb9e] transition-colors">
                How It Works
              </Link>
              <Link to="#pricing" className="text-sm font-medium hover:text-[#3ebb9e] transition-colors">
                Pricing
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link to="/login">
                <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            backgroundImage: `linear-gradient(-45deg, #3ebb9e, #45c1a4, #174037, #000000
            )`,
            backgroundSize: "400% 400%",
          }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-[FFFFFF]/10 text-[#FFFFFF] hover:bg-[#00876e]/20">
              🚀 The Future of AI Prompt Engineering
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FFFFFF] mb-6 leading-tight">
              Forge the Future of
              <br />
              <span className="text-[#00674f]">AI Interactions</span>
            </h1>
            <p className="text-xl text-[#FFFFFF]/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              The world's first comprehensive marketplace for AI prompts. Discover, test, compare, and master
              high-quality prompts to unlock your AI's full potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login">
                <Button size="lg" className="bg-[#00674f] hover:bg-[#004d3a] text-white px-8 py-3 text-lg">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-[#FFFFFF] hover:bg-[#00674f]/10 px-8 py-3 text-lg"
              >
                Watch Demo
              </Button>
            </div>
            <div className="mt-12 flex justify-center items-center space-x-8 text-sm text-[#FFFFFF]/60">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-[#FFFFFF]" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-[#FFFFFF]" />
                Free Testing Environment
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-[#FFFFFF]" />
                Community Driven
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">The Challenge Every AI User Faces</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Creating effective AI prompts is an art and science. Poor prompts lead to mediocre results, while great
              prompts unlock extraordinary AI capabilities.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center border-l-4 border-l-red-500">
              <div className="text-red-500 mb-4">
                <Target className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Inconsistent Results</h3>
              <p className="text-muted-foreground">
                Without proper prompt engineering, AI outputs vary wildly in quality and relevance.
              </p>
            </Card>
            <Card className="p-6 text-center border-l-4 border-l-yellow-500">
              <div className="text-yellow-500 mb-4">
                <Search className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Testing Framework</h3>
              <p className="text-muted-foreground">
                Users lack proper tools to test, compare, and optimize their prompts systematically.
              </p>
            </Card>
            <Card className="p-6 text-center border-l-4 border-l-blue-500">
              <div className="text-blue-500 mb-4">
                <Users className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Isolated Learning</h3>
              <p className="text-muted-foreground">
                Prompt engineering knowledge is scattered, making it hard to learn from the community.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Overview */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#3ebb9e]/10 text-[#00674f]">Our Solution</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Everything You Need for Prompt Excellence</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Prompt Forge provides a comprehensive ecosystem for prompt engineering, from discovery to optimization.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-4">
                  <ShoppingCart className="h-4 w-4 text-[#3ebb9e]" />
                </div>
                <h3 className="text-2xl font-bold">Prompt Marketplace</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Discover and purchase high-quality, tested prompts from expert prompt engineers. Filter by industry, use
                case, and performance ratings.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#3ebb9e] mr-3" />
                  <span>Curated by experts</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#3ebb9e] mr-3" />
                  <span>Performance guaranteed</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#3ebb9e] mr-3" />
                  <span>Industry-specific categories</span>
                </li>
              </ul>
            </div>
            <div className="w-[400px] mx-auto">
              <Image
                src="/placeholder.svg?height=100&width=100"
                alt="Prompt Marketplace Interface"
                width={100}
                height={100}
                className="w-[400px] h-[400px] mx-auto"
                style={{ maxWidth: '400px', maxHeight: '400px' }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="w-[400px] mx-auto">
              <Image
                src="/placeholder.svg?height=100&width=100"
                alt="Testing Ground Interface"
                width={100}
                height={100}
                className="w-[400px] h-[400px] mx-auto"
                style={{ maxWidth: '400px', maxHeight: '400px' }}
              />
            </div>
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-4">
                  <TestTube className="h-4 w-4 text-[#3ebb9e]" />
                </div>
                <h3 className="text-2xl font-bold">Testing Ground</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Test your prompts in a controlled environment across multiple AI models. Get real-time performance
                metrics and optimization suggestions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#3ebb9e] mr-3" />
                  <span>Multi-model testing</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#3ebb9e] mr-3" />
                  <span>Real-time analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#3ebb9e] mr-3" />
                  <span>A/B comparison tools</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-4">
                  <BarChart3 className="h-4 w-4 text-[#3ebb9e]" />
                </div>
                <h3 className="text-2xl font-bold">Analytics & Ranking</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Community-driven ranking system with comprehensive analytics. Understand what makes prompts successful
                and improve continuously.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#3ebb9e] mr-3" />
                  <span>Performance tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#3ebb9e] mr-3" />
                  <span>Community ratings</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#3ebb9e] mr-3" />
                  <span>AI-powered insights</span>
                </li>
              </ul>
            </div>
            <div className="w-[400px] mx-auto">
              <Image
                src="/placeholder.svg?height=100&width=100"
                alt="Analytics Dashboard"
                width={100}
                height={100}
                className="w-[400px] h-[400px] mx-auto"
                style={{ maxWidth: '400px', maxHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">How Prompt Forge Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A simple, powerful workflow that transforms how you work with AI prompts
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover</h3>
              <p className="text-muted-foreground">
                Browse our marketplace of tested, high-quality prompts across various categories and industries.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Test</h3>
              <p className="text-muted-foreground">
                Use our testing ground to evaluate prompts with different AI models and compare performance.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Optimize</h3>
              <p className="text-muted-foreground">
                Get AI-powered suggestions and community feedback to continuously improve your prompts.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Master</h3>
              <p className="text-muted-foreground">
                Deploy optimized prompts in your applications and share successful ones with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            backgroundImage: `linear-gradient(-45deg, 
              #3ebb9e, #45c1a4, #00674f, #174037
            )`,
            backgroundSize: "400% 400%",
          }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Transform Your AI Experience?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of prompt engineers, creators, and AI enthusiasts who are already forging the future of AI
            interactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-white text-[#00674f] hover:bg-gray-100 px-8 py-3 text-lg">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0C201B] text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BrainCircuit className="w-4 h-4 text-[#3ebb9e]" />
                <span className="text-base font-bold">PROMPT FORGE</span>
              </div>
              <p className="text-gray-400 text-sm">Empowering the future of AI through better prompts.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Testing Ground
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Prompt Forge. All rights reserved. Built with ❤️ for the AI community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
