import Header from "@/components/header"
import { Card } from "@/components/ui/card"
import { Code, Command, FileText, MessageSquare, Sparkles, Zap } from "lucide-react"
import Image from "next/image"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl font-bold text-forge-green mb-4">
                Optimize your AI prompts
                <br />
                with
                <br />
                <span className="text-white">Prompt Forge</span>
              </h1>

              <p className="text-white/70 mb-6">
                Test, refine, and optimize AI prompts to get the best results. Our platform helps you create, test, and
                share prompts that deliver consistent, high-quality AI outputs every time.
              </p>

              <div className="text-xs text-white/50">
                Trusted by thousands of AI professionals and enthusiasts worldwide
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-64 h-64 relative">
                <Image
                  src="/placeholder.svg?height=256&width=256"
                  alt="AI Assistant"
                  width={256}
                  height={256}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-blue-500/10 border-blue-500/20 p-6">
              <div className="bg-blue-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Command className="text-blue-400 h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Prompt Engineering</h3>
              <p className="text-sm text-white/70">
                Create and refine prompts with our intuitive editor. Test variations and see results in real-time.
              </p>
            </Card>

            <Card className="bg-purple-500/10 border-purple-500/20 p-6">
              <div className="bg-purple-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="text-purple-400 h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Model Comparison</h3>
              <p className="text-sm text-white/70">
                Test your prompts across different AI models to find the best fit for your specific use case.
              </p>
            </Card>

            <Card className="bg-green-500/10 border-green-500/20 p-6">
              <div className="bg-green-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="text-green-400 h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Prompt Library</h3>
              <p className="text-sm text-white/70">
                Save and organize your prompts in a personal library. Share with your team or keep them private.
              </p>
            </Card>

            <Card className="bg-orange-500/10 border-orange-500/20 p-6">
              <div className="bg-orange-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="text-orange-400 h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Template Gallery</h3>
              <p className="text-sm text-white/70">
                Browse our collection of prompt templates for various use cases and industries.
              </p>
            </Card>

            <Card className="bg-red-500/10 border-red-500/20 p-6">
              <div className="bg-red-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-red-400 h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Performance Analytics</h3>
              <p className="text-sm text-white/70">
                Track and analyze the performance of your prompts with detailed metrics and insights.
              </p>
            </Card>

            <Card className="bg-cyan-500/10 border-cyan-500/20 p-6">
              <div className="bg-cyan-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Code className="text-cyan-400 h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Community Sharing</h3>
              <p className="text-sm text-white/70">
                Share your prompts with the community and discover prompts created by other users.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
