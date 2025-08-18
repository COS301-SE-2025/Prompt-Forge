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
import { useState, useEffect } from "react"
import { useTheme } from "../components/theme-provider"
import { Link } from "react-router-dom"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [typedText, setTypedText] = useState("")
  const fullText = "Forge the Future of"

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 150)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-[#00876e] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 animate-slideDown">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2">
              <div className="bg-[#00876e]/10 p-1 rounded-lg">
                <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 text-[#3ebb9e]" />
              </div>
              <span className="text-lg sm:text-2xl font-bold text-[#0C201B] dark:text-white">PROMPT FORGE</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-md font-medium hover:text-[#3ebb9e] transition-all duration-300 hover:scale-105"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-md font-medium hover:text-[#3ebb9e] transition-all duration-300 hover:scale-105"
              >
                How It Works
              </a>
              <Link
                to="/help"
                className="text-md font-medium hover:text-[#3ebb9e] transition-all duration-300 hover:scale-105"
              >
                Help & FAQ
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full hover:rotate-180 transition-transform duration-500"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link to="/login">
                <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white hover:scale-105 transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link to="/login">
                <Button size="sm" className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
                  Get Started
                </Button>
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
            backgroundImage: `linear-gradient(-45deg, #3ebb9e, #174037, #020817)`,
            backgroundSize: "400% 400%",
          }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
              
              <Badge className="bg-[FFFFFF]/10 text-[#FFFFFF] hover:bg-[#00876e]/20 text-sm sm:text-lg px-3 py-2 text-center">
                The Future of AI Prompt Engineering
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#FFFFFF] mb-6 leading-tight">
              <span className="inline-block min-h-[1.2em]">
                {typedText}
                <span className="animate-blink">|</span>
              </span>{" "}
              <br />
              <span className="text-[#45c1a4]">AI Interactions</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#FFFFFF]/80 mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              The world's first comprehensive marketplace for AI prompts. Discover, test, compare, and master
              high-quality prompts to unlock your AI's full potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link to="/login">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#00674f] hover:bg-[#004d3a] text-white px-6 sm:px-8 py-3 text-base sm:text-lg hover:scale-105 transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <a
                href="https://drive.google.com/file/d/1lekgm25uiSeLMxurxhPEMP1yBw_nFJR-/view"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-[#FFFFFF] hover:bg-[#00674f]/10 px-6 sm:px-8 py-3 text-base sm:text-lg hover:scale-105 transition-all duration-300"
                >
                  Watch Demo
                </Button>
              </a>
            </div>
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-[#FFFFFF]/60 px-4">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-[#FFFFFF] animate-tick" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-[#FFFFFF] animate-tick animation-delay-200" />
                Free Testing Environment
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-[#FFFFFF] animate-tick animation-delay-400" />
                Community Driven
              </div>
            </div>
          </div>

          {/* Bouncing Down Arrow - Mobile Responsive */}
          <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <a
              href="#features"
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-300 backdrop-blur-sm hover:scale-110 active:scale-95 touch-manipulation"
              aria-label="Scroll down to features"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">The Challenge Every AI User Faces</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Creating effective AI prompts is an art and science. Poor prompts lead to mediocre results, while great
              prompts unlock extraordinary AI capabilities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <Card className="p-4 sm:p-6 text-center border-l-4 border-l-red-500 hover:scale-105 transition-all duration-300">
              <div className="text-red-500 mb-4">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Inconsistent Results</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Without proper prompt engineering, AI outputs vary wildly in quality and relevance.
              </p>
            </Card>
            <Card className="p-4 sm:p-6 text-center border-l-4 border-l-yellow-500 hover:scale-105 transition-all duration-300">
              <div className="text-yellow-500 mb-4">
                <Search className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">No Testing Framework</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Users lack proper tools to test, compare, and optimize their prompts systematically.
              </p>
            </Card>
            <Card className="p-4 sm:p-6 text-center border-l-4 border-l-blue-500 hover:scale-105 transition-all duration-300">
              <div className="text-blue-500 mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Isolated Learning</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Prompt engineering knowledge is scattered, making it hard to learn from the community.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Overview */}
      <section id="features" className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-[#3ebb9e]/0 text-[#00674f] text-base sm:text-lg">Our Solution</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Everything You Need for Prompt Excellence</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Prompt Forge provides a comprehensive ecosystem for prompt engineering, from discovery to optimization.
            </p>
          </div>

          {/* Marketplace section - Mobile responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
            <div className="order-2 lg:order-1">
              <div className="flex items-center mb-4">
                <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-4">
                  <ShoppingCart className="h-4 w-4 text-[#3ebb9e]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Prompt Marketplace</h3>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                Discover and purchase high-quality, tested prompts from expert prompt engineers. Filter by industry, use
                case, and performance ratings.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center animate-slideInLeft animation-delay-200">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ebb9e] mr-3 animate-tick flex-shrink-0" />
                  <span className="text-sm sm:text-base">Curated by experts</span>
                </li>
                <li className="flex items-center animate-slideInLeft animation-delay-400">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ebb9e] mr-3 animate-tick animation-delay-200 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Performance guaranteed</span>
                </li>
                <li className="flex items-center animate-slideInLeft animation-delay-600">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ebb9e] mr-3 animate-tick animation-delay-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Industry-specific categories</span>
                </li>
              </ul>
            </div>
            <div className="w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] mx-auto order-1 lg:order-2">
              <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 lg:p-6 rounded-xl shadow-xl">
                <img
                  src="/Marketplace.png"
                  alt="Prompt Marketplace Interface"
                  className="w-full h-auto rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* Testing Ground section - Mobile responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
            <div className="w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] mx-auto order-1">
              <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 lg:p-6 rounded-xl shadow-xl">
                <img
                  src="/TestingGround.png"
                  alt="Testing Ground Interface"
                  className="w-full h-auto rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="order-2">
              <div className="flex items-center mb-4">
                <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-4">
                  <TestTube className="h-4 w-4 text-[#3ebb9e]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Testing Ground</h3>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                Test your prompts in a controlled environment across multiple AI models. Get real-time performance
                metrics and optimization suggestions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center animate-slideInRight animation-delay-200">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ebb9e] mr-3 animate-tick flex-shrink-0" />
                  <span className="text-sm sm:text-base">Multi-model testing</span>
                </li>
                <li className="flex items-center animate-slideInRight animation-delay-400">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ebb9e] mr-3 animate-tick animation-delay-200 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Real-time analytics</span>
                </li>
                <li className="flex items-center animate-slideInRight animation-delay-600">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ebb9e] mr-3 animate-tick animation-delay-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">A/B comparison tools</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Community section - Mobile responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center mb-4">
                <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-4">
                  <BarChart3 className="h-4 w-4 text-[#3ebb9e]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Analytics & Community</h3>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                Community-driven ranking system with comprehensive analytics. Connect with other prompt engineers and
                share knowledge in our vibrant community.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center animate-slideInLeft animation-delay-200">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ebb9e] mr-3 animate-tick flex-shrink-0" />
                  <span className="text-sm sm:text-base">Performance tracking</span>
                </li>
                <li className="flex items-center animate-slideInLeft animation-delay-400">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ebb9e] mr-3 animate-tick animation-delay-200 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Community ratings</span>
                </li>
                <li className="flex items-center animate-slideInLeft animation-delay-600">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ebb9e] mr-3 animate-tick animation-delay-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Knowledge sharing</span>
                </li>
              </ul>
            </div>
            <div className="w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] mx-auto order-1 lg:order-2">
              <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 lg:p-6 rounded-xl shadow-xl">
                <img
                  src="/Community.png"
                  alt="Community & Analytics Dashboard"
                  className="w-full h-auto rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 animate-fadeInUp">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">How Prompt Forge Works</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              A simple, powerful workflow that transforms how you work with AI prompts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="text-center animate-fadeInUp">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Discover</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Browse our marketplace of tested, high-quality prompts across various categories and industries.
              </p>
            </div>
            <div className="text-center animate-fadeInUp animation-delay-200">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Test</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Use our testing ground to evaluate prompts with different AI models and compare performance.
              </p>
            </div>
            <div className="text-center animate-fadeInUp animation-delay-400">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Optimize</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get AI-powered suggestions and community feedback to continuously improve your prompts.
              </p>
            </div>
            <div className="text-center animate-fadeInUp animation-delay-600">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Master</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Deploy optimized prompts in your applications and share successful ones with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            backgroundImage: `linear-gradient(-45deg, #3ebb9e, #174037, #020817)`,
            backgroundSize: "400% 400%",
          }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 animate-fadeInUp">
            Ready to Transform Your AI Experience?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto animate-fadeInUp animation-delay-200 px-4">
            Join thousands of prompt engineers, creators, and AI enthusiasts who are already forging the future of AI
            interactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animation-delay-400 px-4">
            <Link to="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-[#00674f] hover:bg-gray-100 px-6 sm:px-8 py-3 text-base sm:text-lg hover:scale-105 transition-all duration-300"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 animate-bounce-horizontal" />
              </Button>
            </Link>
            <a
              href="https://drive.google.com/file/d/1lekgm25uiSeLMxurxhPEMP1yBw_nFJR-/view"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 text-base sm:text-lg hover:scale-105 transition-all duration-300"
              >
                Watch Demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Responsive */}
      <footer className="bg-[#0C201B] text-white py-8 sm:py-12 animate-fadeInUp">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <BrainCircuit className="w-4 h-4 text-[#3ebb9e] animate-pulse" />
                <span className="text-base font-bold">PROMPT FORGE</span>
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
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2025 Prompt Forge. All rights reserved. Built with ❤️ for the AI community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
