"use client"

import { Link } from "react-router-dom"
import { Card } from "@/components/ui/Card"
import { BarChart3, Scale, ShoppingBag, TestTube, Trophy, Tag, HelpCircle } from "lucide-react"
import InteractiveBackground from "@/components/InteractiveBackground"
import GradientText from "@/components/GradientText"

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background relative overflow-hidden">
      {/* Interactive Background Effects */}
      <InteractiveBackground />

      <div className="flex-1 flex items-center justify-center p-2 sm:p-3 md:p-6 relative z-10">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 h-full items-center">
            {/* Left side - Text content and robot image */}
            <div className="flex flex-col justify-center space-y-3 sm:space-y-4 lg:space-y-6 order-1 lg:order-1">
              {/* Text content - Always at top */}
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

              {/* Robot Image - Now shows on all screen sizes, smaller on mobile */}
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

            {/* Right side - Feature cards grid - 2 columns on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-3 h-fit order-2 lg:order-2">
              {/* Prompt Marketplace */}
              <Link to="/marketplace" className="col-span-1">
                <Card className="bg-blue-500/20 border-blue-500/30 p-2 sm:p-3 lg:p-4 hover:bg-blue-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-blue-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
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
                <Card className="bg-purple-500/20 border-purple-500/30 p-2 sm:p-3 lg:p-4 hover:bg-purple-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-purple-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
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

              {/* Prompt Comparison */}
              <Link to="/comparison" className="col-span-1">
                <Card className="bg-green-500/20 border-green-500/30 p-2 sm:p-3 lg:p-4 hover:bg-green-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-green-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
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

              {/* Analytics Engine */}
              <Link to="/dashboard" className="col-span-1">
                <Card className="bg-orange-500/20 border-orange-500/30 p-2 sm:p-3 lg:p-4 hover:bg-orange-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-orange-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
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

              {/* Categorization */}
              <Link to="/construction" className="col-span-1">
                <Card className="bg-purple-600/20 border-purple-600/30 p-2 sm:p-3 lg:p-4 hover:bg-purple-600/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-purple-600 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
                    <Tag className="text-white h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-xs sm:text-sm lg:text-base font-medium mb-1 lg:mb-2">
                    <span className="sm:hidden">Categories</span>
                    <span className="hidden sm:inline">Categorization</span>
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    Find prompts by industry, use case, and complexity to suit your needs.
                  </p>
                </Card>
              </Link>

              {/* Community Rankings */}
              <Link to="/community" className="col-span-1">
                <Card className="bg-red-500/20 border-red-500/30 p-2 sm:p-3 lg:p-4 hover:bg-red-500/30 transition-all duration-300 cursor-pointer h-full hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-105 backdrop-blur-sm">
                  <div className="bg-red-500 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 lg:mb-3">
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

      {/* Help Button - Responsive sizing */}
      <Link
        to="/help"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#3ebb9e] hover:bg-[#2ea688] text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-50 backdrop-blur-sm"
        title="Help & Support"
      >
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </Link>
    </div>
  )
}
