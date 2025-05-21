import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, Star, User } from "lucide-react"

export default function MarketplacePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex">
        <div className="w-48 bg-forge-darker border-r border-forge-card p-4 hidden md:block">
          <h3 className="text-xs font-medium uppercase text-white/60 mb-2">Filters</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-sm h-8 px-2">
              All
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-8 px-2 bg-forge-green/10 text-forge-green"
            >
              Featured
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm h-8 px-2">
              Popular
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm h-8 px-2">
              New
            </Button>
          </div>

          <h3 className="text-xs font-medium uppercase text-white/60 mt-6 mb-2">Categories</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-sm h-8 px-2">
              Writing
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm h-8 px-2">
              Marketing
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm h-8 px-2">
              Development
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm h-8 px-2">
              Design
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Prompt Marketplace</h1>

            <div className="mb-8">
              <div className="relative">
                <Input placeholder="Search for prompts..." className="bg-forge-card border-forge-card pl-10" />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/40"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Sparkles className="h-5 w-5 mr-2 text-forge-green" />
                <h2 className="text-lg font-medium">Featured Prompts</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-forge-card border-forge-card overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-1 rounded">
                          Writing
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs ml-1">4.8</span>
                        </div>
                      </div>

                      <h3 className="font-medium mb-1">Expert Content Writer</h3>
                      <p className="text-xs text-white/60 mb-3 line-clamp-2">
                        A professional prompt for generating high-quality blog posts and articles on any topic.
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-forge-darker flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-xs ml-1 text-white/60">@writer</span>
                        </div>
                        <div className="text-xs font-medium">$4.99</div>
                      </div>
                    </div>

                    <div className="border-t border-forge-darker flex">
                      <div className="flex-1 py-2 text-center text-xs text-white/60">
                        <span>1,245 uses</span>
                      </div>
                      <div className="border-l border-forge-darker">
                        <Button className="h-full rounded-none bg-forge-green hover:bg-forge-green-dark text-xs px-3">
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 mr-2 text-yellow-400" />
                <h2 className="text-lg font-medium">Popular Prompts</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-forge-card border-forge-card overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-purple-500/20 text-purple-400 text-xs font-medium px-2 py-1 rounded">
                          Marketing
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs ml-1">4.9</span>
                        </div>
                      </div>

                      <h3 className="font-medium mb-1">Advanced SEO Optimizer</h3>
                      <p className="text-xs text-white/60 mb-3 line-clamp-2">
                        Optimize your content for search engines with this advanced SEO prompt.
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-forge-darker flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-xs ml-1 text-white/60">@seomaster</span>
                        </div>
                        <div className="text-xs font-medium">$6.99</div>
                      </div>
                    </div>

                    <div className="border-t border-forge-darker flex">
                      <div className="flex-1 py-2 text-center text-xs text-white/60">
                        <span>2,389 uses</span>
                      </div>
                      <div className="border-l border-forge-darker">
                        <Button className="h-full rounded-none bg-forge-green hover:bg-forge-green-dark text-xs px-3">
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
