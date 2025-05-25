import { Link } from "react-router-dom"
import { Card } from "../components/ui/Card"
import { BarChart3, Scale, ShoppingBag, TestTube, Trophy, Tag } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background">
      <div className="flex-1 flex items-center justify-center p-3 md:p-6">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full items-center">
            {/* Left side - Text content and robot image */}
            <div className="flex flex-col justify-center space-y-4 lg:space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground mb-3 lg:mb-4 leading-tight">
                  Optimize your AI prompts
                  <br />
                  with
                  <br />
                  <span className="text-[#3ebb9e] font-medium">Prompt Forge</span>
                </h1>

                <p className="text-muted-foreground text-sm lg:text-base mb-4 lg:mb-6 leading-relaxed">
                  Test, rank, and evaluate AI prompts in a
                  <br className="hidden sm:block" />
                  structured and collaborative environment.
                  <br className="hidden sm:block" />
                  Unlock the full potential of AI with better prompts.
                </p>
              </div>

              {/* Robot Image */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-64 h-64 lg:w-96 lg:h-96">
                  <img src="/robot-ai.png" alt="AI Robot Assistant" className="object-contain w-full h-full" />
                </div>
              </div>
            </div>

            {/* Right side - Feature cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3 h-fit">
              {/* Prompt Marketplace */}
              <Link to="/marketplace">
                <Card className="bg-blue-500/20 border-blue-500/30 p-3 lg:p-4 hover:bg-blue-500/30 transition-colors cursor-pointer h-full">
                  <div className="bg-blue-500 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-2 lg:mb-3">
                    <ShoppingBag className="text-white h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-sm lg:text-base font-medium mb-1 lg:mb-2">Prompt Marketplace</h3>
                  <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
                    Buy and sell fine AI prompts with a community of prompt engineers.
                  </p>
                </Card>
              </Link>

              {/* Testing Ground */}
              <Link to="/editor">
                <Card className="bg-purple-500/20 border-purple-500/30 p-3 lg:p-4 hover:bg-purple-500/30 transition-colors cursor-pointer h-full">
                  <div className="bg-purple-500 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-2 lg:mb-3">
                    <TestTube className="text-white h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-sm lg:text-base font-medium mb-1 lg:mb-2">Testing Ground</h3>
                  <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
                    Test your prompts across different AI models with real-time results.
                  </p>
                </Card>
              </Link>

              {/* Prompt Comparison */}
              <Link to="/editor">
                <Card className="bg-green-500/20 border-green-500/30 p-3 lg:p-4 hover:bg-green-500/30 transition-colors cursor-pointer h-full">
                  <div className="bg-green-500 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-2 lg:mb-3">
                    <Scale className="text-white h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-sm lg:text-base font-medium mb-1 lg:mb-2">Prompt Comparison</h3>
                  <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
                    Compare prompts side-by-side and determine which generates better responses.
                  </p>
                </Card>
              </Link>

              {/* Analytics Engine */}
              <Link to="/dashboard">
                <Card className="bg-orange-500/20 border-orange-500/30 p-3 lg:p-4 hover:bg-orange-500/30 transition-colors cursor-pointer h-full">
                  <div className="bg-orange-500 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-2 lg:mb-3">
                    <BarChart3 className="text-white h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-sm lg:text-base font-medium mb-1 lg:mb-2">Analytics Engine</h3>
                  <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
                    Get actionable insights and improvement suggestions for your prompts.
                  </p>
                </Card>
              </Link>

              {/* Categorization */}
              <Link to="/marketplace">
                <Card className="bg-purple-600/20 border-purple-600/30 p-3 lg:p-4 hover:bg-purple-600/30 transition-colors cursor-pointer h-full">
                  <div className="bg-purple-600 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-2 lg:mb-3">
                    <Tag className="text-white h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-sm lg:text-base font-medium mb-1 lg:mb-2">Categorization</h3>
                  <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
                    Find prompts by industry, use case, and complexity to suit your needs.
                  </p>
                </Card>
              </Link>

              {/* Community Rankings */}
              <Link to="/community">
                <Card className="bg-red-500/20 border-red-500/30 p-3 lg:p-4 hover:bg-red-500/30 transition-colors cursor-pointer h-full">
                  <div className="bg-red-500 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-2 lg:mb-3">
                    <Trophy className="text-white h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <h3 className="text-foreground text-sm lg:text-base font-medium mb-1 lg:mb-2">Community Rankings</h3>
                  <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
                    See how your prompts rank against others in the community based on ratings.
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
