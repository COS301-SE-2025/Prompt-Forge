import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { ArrowLeft, Wrench, Clock, Zap, Star } from "lucide-react"

export default function MyPromptsPage() {
   return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Robot Image with Animation */}
        <div className="relative mb-8">
          <div className="w-48 h-48 lg:w-64 lg:h-64 mx-auto">
            <img
              src="/robot-ai.png"
              alt="AI Robot Assistant"
              className="object-contain w-full h-full filter drop-shadow-2xl"
            />
          </div>

          {/* Floating Construction Icons */}
          <div className="absolute top-4 left-4 animate-pulse">
            <div className="bg-orange-500/20 p-2 rounded-full">
              <Wrench className="h-6 w-6 text-orange-500" />
            </div>
          </div>

          <div className="absolute top-8 right-8 animate-pulse delay-300">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="absolute bottom-12 left-8 animate-pulse delay-700">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <Star className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">🚧 Under Construction 🚧</h1>
          </div>

          {/* Progress Indicator */}
          <Card className="p-6 bg-muted/50 border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Development Progress</span>
              <span className="text-sm text-[#3ebb9e] font-semibold">20%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3ebb9e] to-[#00674f] rounded-full transition-all duration-1000 ease-out animate-pulse"
                style={{ width: "20%" }}
              ></div>
            </div>
            <div className="flex items-center justify-center mt-4 space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated completion: Coming Soon</span>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link to="/home">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>

            <Link to="/dashboard">
              <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">Visit Dashboard</Button>
            </Link>
          </div>

          {/* Footer Message */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro Tip:</strong> While we're working on this feature, explore our other tools like the
              <Link to="/editor" className="text-[#3ebb9e] hover:underline mx-1">
                Prompt Editor
              </Link>
              and
              <Link to="/marketplace" className="text-[#3ebb9e] hover:underline mx-1">
                Marketplace
              </Link>
              to maximize your AI potential!
            </p>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#3ebb9e]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    </div>
  )
}
