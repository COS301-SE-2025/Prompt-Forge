"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/Card"
import { BarChart3, Scale, ShoppingBag, TestTube, Trophy, FileText, HelpCircle } from "lucide-react"
import InteractiveBackground from "@/components/InteractiveBackground"
import GradientText from "@/components/GradientText"
import { promptWarsWebSocket } from "@/services/promptWarsWebSocket"

export default function HomePage() {
  const [leftLoaded, setLeftLoaded] = useState(false)
  const [cardsLoaded, setCardsLoaded] = useState(false)

  useEffect(() => {
    const leftTimer = setTimeout(() => setLeftLoaded(true), 150)
    const cardsTimer = setTimeout(() => setCardsLoaded(true), 300)
    const userId = localStorage.getItem('userId')
    
    if (userId)
      promptWarsWebSocket.connect(userId)

    return () => {
      clearTimeout(leftTimer)
      clearTimeout(cardsTimer)
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background relative overflow-hidden">
      {/* Interactive Background Effects */}
      <InteractiveBackground />

      <div className="flex-1 flex items-center justify-center p-2 sm:p-3 md:p-6 relative z-10">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 h-full items-center">
            {/* Left side - Text content and robot image, animate together */}
            <div
              className={`flex flex-col justify-center space-y-3 sm:space-y-4 lg:space-y-6 order-1 lg:order-1 transition-all duration-700 ${
                leftLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              {/* Text content */}
              <div className="pt-4 sm:pt-8 lg:pt-12">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-foreground mb-2 sm:mb-3 lg:mb-4 leading-tight">
                  Optimize your AI prompts
                  <br />
                  with
                  <br />
                  <GradientText
                    colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                    animationSpeed={3}
                    showBorder={false}
                    className="inline-block font-medium pb-1 sm:pb-2"
                  >
                    Prompt Forge
                  </GradientText>
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-6 leading-relaxed">
                  Write it. Test it. Refine it. Repeat.
                  <br className="hidden sm:block" />A creative playground for building and perfecting AI prompts.
                  <br className="hidden sm:block" />
                  Because smarter prompts mean smarter AI.
                </p>
              </div>
              {/* Robot Image */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-32 h-32 sm:w-52 sm:h-52 lg:w-80 lg:h-80 relative">
                  <img
                    src="/robot-ai.png"
                    alt="AI Robot"
                    className="object-contain w-full h-full drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Right side - Feature cards grid */}
            <div
              className={`grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-3 h-fit order-2 lg:order-2 transition-all duration-700 ${
                cardsLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              {/* Prompt Marketplace */}
              <Link to="/marketplace" className="col-span-1">
                <Card className="bg-indigo-500/20 border-indigo-500/30 p-2 sm:p-3 lg:p-4 hover:bg-indigo-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-indigo-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
                    <ShoppingBag className="text-white h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-xs sm:text-sm lg:text-base font-medium mb-1 lg:mb-2">
                    <span className="sm:hidden">Marketplace</span>
                    <span className="hidden sm:inline">Prompt Marketplace</span>
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    Buy and sell fine AI prompts with a community of prompt engineers.
                  </p>
                </Card>
              </Link>

              {/* Testing Ground */}
              <Link to="/editor" className="col-span-1">
                <Card className="bg-violet-500/20 border-violet-500/30 p-2 sm:p-3 lg:p-4 hover:bg-violet-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-violet-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
                    <TestTube className="text-white h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-xs sm:text-sm lg:text-base font-medium mb-1 lg:mb-2">
                    <span className="sm:hidden">Testing</span>
                    <span className="hidden sm:inline">Testing Ground</span>
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    Test your prompts across different AI models with real-time results.
                  </p>
                </Card>
              </Link>

              {/* Analytics Engine */}
              <Link to="/dashboard" className="col-span-1">
                <Card className="bg-amber-500/20 border-amber-500/30 p-2 sm:p-3 lg:p-4 hover:bg-amber-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-amber-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
                    <BarChart3 className="text-white h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-xs sm:text-sm lg:text-base font-medium mb-1 lg:mb-2">
                    <span className="sm:hidden">Analytics</span>
                    <span className="hidden sm:inline">Analytics Engine</span>
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    Get actionable insights and improvement suggestions for your prompts.
                  </p>
                </Card>
              </Link>

              {/* My Prompts */}
              <Link to="/my-prompts" className="col-span-1">
                <Card className="bg-teal-500/20 border-teal-500/30 p-2 sm:p-3 lg:p-4 hover:bg-teal-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(20,184,166,0.6)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-teal-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
                    <FileText className="text-white h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-xs sm:text-sm lg:text-base font-medium mb-1 lg:mb-2">
                    <span className="sm:hidden">My Prompts</span>
                    <span className="hidden sm:inline">My Prompts</span>
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    Manage and organize your created prompts in one convenient location.
                  </p>
                </Card>
              </Link>

              {/* Prompt Comparison */}
              <Link to="/comparison" className="col-span-1">
                <Card className="bg-lime-500/20 border-lime-500/30 p-2 sm:p-3 lg:p-4 hover:bg-lime-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(132,204,22,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-lime-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
                    <Scale className="text-white h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-xs sm:text-sm lg:text-base font-medium mb-1 lg:mb-2">
                    <span className="sm:hidden">Compare</span>
                    <span className="hidden sm:inline">Prompt Comparison</span>
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    Compare prompts side-by-side and determine which generates better responses.
                  </p>
                </Card>
              </Link>

              {/* Community Rankings */}
              <Link to="/community" className="col-span-1">
                <Card className="bg-rose-500/20 border-rose-500/30 p-2 sm:p-3 lg:p-4 hover:bg-rose-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-rose-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
                    <Trophy className="text-white h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-xs sm:text-sm lg:text-base font-medium mb-1 lg:mb-2">
                    <span className="sm:hidden">Community</span>
                    <span className="hidden sm:inline">Community Rankings</span>
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    See how your prompts rank against others in the community based on ratings.
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <Link
        to="/help"
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#3ebb9e] hover:bg-[#2ea688] text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg transition-all duration-700 hover:scale-110 z-50 backdrop-blur-sm
        ${cardsLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        title="Help & Support"
      >
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </Link>
    </div>
  )
}