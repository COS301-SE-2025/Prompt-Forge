"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  BrainCircuit,
  Search,
  Users,
  ShoppingCart,
  TestTube,
  Target,
  CheckCircle,
  Moon,
  Sun,
  Swords,
  Trophy,
  MessageCircle,
  BarChart3,
  Wand2,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Link } from "react-router-dom"
import Silk from "@/components/Silk"
import { useInView } from "react-intersection-observer"
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()

  // Silk background color for light/dark mode
  const silkBg =
    theme === "light" ? ([1, 1, 1] as [number, number, number]) : ([0.0078, 0.031, 0.09] as [number, number, number])

  // Intersection observers for each section
  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const { ref: problemRef, inView: problemInView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const { ref: howItWorksRef, inView: howItWorksInView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const { ref: ctaRef, inView: ctaInView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <div className={`min-h-screen relative ${theme === "light" ? "text-black" : "text-white"}`}>
      <div className="fixed inset-0 bg-gradient-to-br from-[#3ebb9e]/5 via-transparent to-[#00674f]/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(62,187,158,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(0,103,79,0.1),transparent_50%)] pointer-events-none"></div>
      {/* Navigation */}
      <nav
        className={`border-[#00876e] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 animate-slideDown`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2">
              <div className="bg-[#00876e]/10 p-1 rounded-lg">
                <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 text-[#3ebb9e]" />
              </div>
              <span className={`text-lg sm:text-2xl font-bold ${theme === "light" ? "text-[#0C201B]" : "text-white"}`}>
                PROMPT FORGE
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className={`text-md font-medium hover:text-[#3ebb9e] transition-all duration-300 hover:scale-105 ${theme === "light" ? "text-black" : "text-white"}`}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className={`text-md font-medium hover:text-[#3ebb9e] transition-all duration-300 hover:scale-105 ${theme === "light" ? "text-black" : "text-white"}`}
              >
                How It Works
              </a>
              <Link
                to="/help"
                className={`text-md font-medium hover:text-[#3ebb9e] transition-all duration-300 hover:scale-105 ${theme === "light" ? "text-black" : "text-white"}`}
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
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Silk speed={1} bgColor={silkBg} />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-12 pb-16 sm:pb-24 lg:pb-32">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
              <Badge
                className={`bg-[FFFFFF]/10 ${theme === "light" ? "text-black" : "text-[#FFFFFF]"} hover:bg-[#00876e]/20 text-sm sm:text-lg px-3 py-2 text-center`}
              >
                The Future of AI Prompt Engineering
              </Badge>
            </div>
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${theme === "light" ? "text-black" : "text-[#FFFFFF]"}`}
            >
              <span className="inline-block min-h-[1.2em]">Forge the Future of</span>
              <br />
              <span className="inline-block min-h-[1.2em] text-[#45c1a4] drop-shadow-[0_0_25px_rgba(69,193,164,0.6)]">
                AI Interactions
              </span>
            </h1>
            <p
              className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed px-4 ${theme === "light" ? "text-black/80" : "text-[#FFFFFF]/80"}`}
            >
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
                </Button>
              </Link>
              <a href="https://youtu.be/yl0QSkbYKJc" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg hover:scale-105 transition-all duration-300 ${
                    theme === "light"
                      ? "border-black text-black hover:bg-black/10"
                      : "border-white text-white hover:bg-[#00674f]/10"
                  }`}
                >
                  Watch Demo
                </Button>
              </a>
            </div>
            <div
              className={`mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm px-4 ${
                theme === "light" ? "text-black/60" : "text-[#FFFFFF]/60"
              }`}
            >
              <div className="flex items-center">
                <CheckCircle
                  className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-tick ${theme === "light" ? "text-black" : "text-[#FFFFFF]"}`}
                />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle
                  className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-tick animation-delay-200 ${theme === "light" ? "text-black" : "text-[#FFFFFF]"}`}
                />
                Free Testing Environment
              </div>
              <div className="flex items-center">
                <CheckCircle
                  className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-tick animation-delay-400 ${theme === "light" ? "text-black" : "text-[#FFFFFF]"}`}
                />
                Community Driven
              </div>
            </div>
          </div>

          {/* Bouncing Down Arrow - Mobile Responsive */}
          <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <a
              href="#problem"
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110 active:scale-95 touch-manipulation ${
                theme === "light"
                  ? "bg-black/10 hover:bg-black/20 active:bg-black/30"
                  : "bg-white/10 hover:bg-white/20 active:bg-white/30"
              }`}
              aria-label="Scroll down to problem section"
            >
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${theme === "light" ? "text-black" : "text-white"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section id="problem" ref={problemRef} className="py-16 sm:py-20 relative overflow-hidden border-b-2 border-border/40 shadow-md">
        <div
          className={`relative container mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 z-10 ${
            problemInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              The Challenge Every AI User Faces
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Creating effective AI prompts is an art and science. Poor prompts lead to mediocre results, while great
              prompts unlock extraordinary AI capabilities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <Card className="p-4 sm:p-6 text-center border-l-4 border-l-red-500 hover:scale-105 hover:rotate-1 transition-all duration-300 shadow-xl hover:shadow-2xl transform-gpu">
              <div className="text-red-500 mb-4 transform-gpu">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 mx-auto drop-shadow-lg" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Inconsistent Results</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Without proper prompt engineering, AI outputs vary wildly in quality and relevance.
              </p>
            </Card>
            <Card className="p-4 sm:p-6 text-center border-l-4 border-l-yellow-500 hover:scale-105 hover:-rotate-1 transition-all duration-300 shadow-xl hover:shadow-2xl transform-gpu">
              <div className="text-yellow-500 mb-4 transform-gpu">
                <Search className="h-6 w-6 sm:h-8 sm:w-8 mx-auto drop-shadow-lg" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">No Testing Framework</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Users lack proper tools to test, compare, and optimize their prompts systematically.
              </p>
            </Card>
            <Card className="p-4 sm:p-6 text-center border-l-4 border-l-blue-500 hover:scale-105 hover:rotate-1 transition-all duration-300 shadow-xl hover:shadow-2xl transform-gpu">
              <div className="text-blue-500 mb-4 transform-gpu">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto drop-shadow-lg" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Isolated Learning</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Prompt engineering knowledge is scattered, making it hard to learn from the community.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Overview with ScrollStack */}
      <section id="features" className="py-0 relative overflow-hidden border-b-2 border-border/40 shadow-md">
        <div className="text-center pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
          <Badge className="mb-4 bg-[#3ebb9e]/10 text-[#00674f] dark:text-[#3ebb9e] text-base sm:text-lg border-2 border-[#3ebb9e]/30">
            Our Solution
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Everything You Need for Prompt Excellence
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Prompt Forge provides a comprehensive ecosystem for prompt engineering, from discovery to optimization.
          </p>
        </div>

        <ScrollStack useWindowScroll itemDistance={150} itemStackDistance={40} baseScale={0.9} itemScale={0.02} className="relative z-10">
          {/* Marketplace Card */}
          <ScrollStackItem>
            <div
              className={`h-full rounded-3xl backdrop-blur-sm border-2 border-border shadow-2xl overflow-hidden transform-gpu hover:scale-[1.02] transition-all duration-500 ${
                theme === "light" ? "bg-white/90" : "bg-slate-900/90"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center h-full p-6 sm:p-8 lg:p-12">
                <div className="order-2 lg:order-1 space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#3ebb9e]/10 p-3 rounded-xl mr-4 shadow-lg">
                      <ShoppingCart className="h-6 w-6 text-[#3ebb9e]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold">Prompt Marketplace</h3>
                  </div>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6">
                    Discover and purchase high-quality, tested prompts from expert prompt engineers. Filter by industry,
                    use case, and performance ratings.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Curated by experts</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Performance guaranteed</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Industry-specific categories</span>
                    </li>
                  </ul>
                </div>
                <div className="w-full order-1 lg:order-2 flex items-center justify-center">
                  <div className="max-w-md w-full">
                    <div className={`p-4 rounded-xl shadow-xl ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
                      <img
                        src="/Marketplace.png"
                        alt="Prompt Marketplace Interface"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Testing Ground Card */}
          <ScrollStackItem>
            <div
              className={`h-full rounded-3xl backdrop-blur-sm border-2 border-border shadow-2xl overflow-hidden transform-gpu hover:scale-[1.02] transition-all duration-500 ${
                theme === "light" ? "bg-white/90" : "bg-slate-900/90"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center h-full p-6 sm:p-8 lg:p-12">
                <div className="w-full order-1 flex items-center justify-center">
                  <div className="max-w-md w-full">
                    <div className={`p-4 rounded-xl shadow-xl ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
                      <img
                        src="/TestingGround.png"
                        alt="Testing Ground Interface"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="order-2 space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#3ebb9e]/10 p-3 rounded-xl mr-4 shadow-lg">
                      <TestTube className="h-6 w-6 text-[#3ebb9e]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold">Testing Ground</h3>
                  </div>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6">
                    Test your prompts in a controlled environment across multiple AI models. Get real-time performance
                    metrics and optimization suggestions.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Multi-model testing</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Real-time analytics</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">A/B comparison tools</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Prompt Builder Card */}
          <ScrollStackItem>
            <div
              className={`h-full rounded-3xl backdrop-blur-sm border-2 border-border shadow-2xl overflow-hidden transform-gpu hover:scale-[1.02] transition-all duration-500 ${
                theme === "light" ? "bg-white/90" : "bg-slate-900/90"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center h-full p-6 sm:p-8 lg:p-12">
                <div className="order-2 lg:order-1 space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#3ebb9e]/10 p-3 rounded-xl mr-4 shadow-lg">
                      <BrainCircuit className="h-6 w-6 text-[#3ebb9e]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold">Prompt Builder</h3>
                  </div>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6">
                    Create effective AI prompts effortlessly with our beginner-friendly builder. Choose from expert-crafted
                    templates, get personalized guidance, and build prompts that work - no prior experience required.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Beginner-friendly interface</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Pre-built templates for common tasks</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Step-by-step guidance</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Role-based prompt optimization</span>
                    </li>
                  </ul>
                </div>
                <div className="w-full order-1 lg:order-2 flex items-center justify-center">
                  <div className="max-w-md w-full">
                    <div className={`p-4 rounded-xl shadow-xl ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
                      <img
                        src="/Builder.png"
                        alt="Prompt Builder Interface"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Social Hub & Battles Card */}
          <ScrollStackItem>
            <div
              className={`h-full rounded-3xl backdrop-blur-sm border-2 border-border shadow-2xl overflow-hidden transform-gpu hover:scale-[1.02] transition-all duration-500 ${
                theme === "light" ? "bg-white/90" : "bg-slate-900/90"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center h-full p-6 sm:p-8 lg:p-12">
                <div className="w-full order-1 flex items-center justify-center">
                  <div className="max-w-md w-full">
                    <div className={`p-4 rounded-xl shadow-xl ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
                      <img src="/Community.png" alt="Social Hub & Battle System" className="w-full h-auto rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="order-2 space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#3ebb9e]/10 p-3 rounded-xl mr-4 shadow-lg">
                      <Users className="h-6 w-6 text-[#3ebb9e]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold">Social Hub & Battles</h3>
                  </div>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6">
                    Connect with other prompt engineers, follow creators, and challenge them to epic prompt battles.
                    Choose between Classic prompt creation or Unprompted reverse-engineering battles.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <Users className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Follow & connect with creators</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <Swords className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Challenge users to battles</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <Trophy className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Real-time battle notifications</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <MessageCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Community knowledge sharing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Dashboard Analytics & Widgets Card */}
          <ScrollStackItem>
            <div
              className={`h-full rounded-3xl backdrop-blur-sm border-2 border-border shadow-2xl overflow-hidden transform-gpu hover:scale-[1.02] transition-all duration-500 ${
                theme === "light" ? "bg-white/90" : "bg-slate-900/90"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center h-full p-6 sm:p-8 lg:p-12">
                <div className="order-2 lg:order-1 space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#3ebb9e]/10 p-3 rounded-xl mr-4 shadow-lg">
                      <BarChart3 className="h-6 w-6 text-[#3ebb9e]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold">Dashboard Analytics</h3>
                  </div>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6">
                    Track your prompt performance with comprehensive analytics, customizable widgets, and real-time
                    insights. Monitor usage patterns, ratings, and optimize your prompt engineering workflow.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Customizable dashboard widgets</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Real-time performance analytics</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Usage tracking and insights</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Category breakdown analytics</span>
                    </li>
                  </ul>
                </div>
                <div className="w-full order-1 lg:order-2 flex items-center justify-center">
                  <div className="max-w-md w-full">
                    <div className={`p-4 rounded-xl shadow-xl ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
                      <img src="/Dashboard.png" alt="Dashboard Analytics & Widgets" className="w-full h-auto rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Optimizer Wizard & AI Recommendations Card */}
          <ScrollStackItem>
            <div
              className={`h-full rounded-3xl backdrop-blur-sm border-2 border-border shadow-2xl overflow-hidden transform-gpu hover:scale-[1.02] transition-all duration-500 ${
                theme === "light" ? "bg-white/90" : "bg-slate-900/90"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center h-full p-6 sm:p-8 lg:p-12">
                <div className="w-full order-1 flex items-center justify-center">
                  <div className="max-w-md w-full">
                    <div className={`p-4 rounded-xl shadow-xl ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
                      <img src="/Wizard.png" alt="Optimizer Wizard & AI Recommendations" className="w-full h-auto rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="order-2 space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#3ebb9e]/10 p-3 rounded-xl mr-4 shadow-lg">
                      <Wand2 className="h-6 w-6 text-[#3ebb9e]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold">Optimizer Wizard & AI Recommendations</h3>
                  </div>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6">
                    Transform your prompts with our intelligent optimizer wizard. Get AI-powered recommendations,
                    step-by-step improvements, and comprehensive analysis to maximize your prompt effectiveness.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Step-by-step optimization wizard</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">AI-powered prompt analysis</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Smart recommendations & suggestions</span>
                    </li>
                    <li className="flex items-center group">
                      <div className="bg-[#3ebb9e]/10 p-2 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-[#3ebb9e]" />
                      </div>
                      <span className="text-sm sm:text-base">Comprehensive improvement tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollStackItem>
        </ScrollStack>
      </section>

      {/* How It Works */}
      <section ref={howItWorksRef} id="how-it-works" className="py-16 sm:py-20 relative overflow-hidden border-b-2 border-border/40 shadow-md">
        <div
          className={`relative container mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 z-10 ${
            howItWorksInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="text-center mb-12 sm:mb-16 animate-fadeInUp">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">How Prompt Forge Works</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              A simple, powerful workflow that transforms how you work with AI prompts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="text-center animate-fadeInUp hover:scale-105 transition-all duration-300">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4 shadow-xl hover:shadow-2xl transform-gpu hover:rotate-6">
                1
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Discover</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Browse our marketplace of tested, high-quality prompts across various categories and industries.
              </p>
            </div>
            <div className="text-center animate-fadeInUp animation-delay-200 hover:scale-105 transition-all duration-300">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4 shadow-xl hover:shadow-2xl transform-gpu hover:-rotate-6">
                2
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Test</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Use our testing ground to evaluate prompts with different AI models and compare performance.
              </p>
            </div>
            <div className="text-center animate-fadeInUp animation-delay-400 hover:scale-105 transition-all duration-300">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4 shadow-xl hover:shadow-2xl transform-gpu hover:rotate-6">
                3
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Optimize</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get AI-powered suggestions and community feedback to continuously improve your prompts.
              </p>
            </div>
            <div className="text-center animate-fadeInUp animation-delay-600 hover:scale-105 transition-all duration-300">
              <div className="bg-[#3ebb9e] text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold mx-auto mb-4 shadow-xl hover:shadow-2xl transform-gpu hover:-rotate-6">
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
                  <a
                    href="https://youtu.be/yl0QSkbYKJc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Video Tutorial
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="mailto:5iveOps.Capstone@gmail.com" className="hover:text-white">
                    Contact Us
                  </a>
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
              <div className="mt-6">
                <Link to="/login">
                  <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white px-6 py-2 text-sm font-medium hover:scale-105 transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2025 Prompt Forge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
