"use client"

import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Sparkles, Star, User } from "lucide-react"
import { useState } from "react"

// Mock data for prompts
const PROMPTS_PER_PAGE = 8
const TOTAL_PROMPTS = 24

const MOCK_PROMPTS = [
  {
    id: 1,
    title: "Expert Content Writer",
    description: "A professional prompt for generating high-quality blog posts and articles on any topic.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.8,
    uses: 1245,
    price: 4.99,
    author: "writer",
  },
  {
    id: 2,
    title: "Advanced SEO Optimizer",
    description: "Optimize your content for search engines with this advanced SEO prompt.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.9,
    uses: 2389,
    price: 6.99,
    author: "seomaster",
  },
  {
    id: 3,
    title: "Code Documentation Pro",
    description: "Generate comprehensive documentation for your code with detailed explanations.",
    category: "Development",
    categoryColor: "green",
    rating: 4.7,
    uses: 987,
    price: 5.99,
    author: "codemaster",
  },
  {
    id: 4,
    title: "UI/UX Design Assistant",
    description: "Get professional UI/UX design suggestions and feedback for your projects.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.6,
    uses: 1567,
    price: 7.99,
    author: "designpro",
  },
  {
    id: 5,
    title: "Email Marketing Wizard",
    description: "Create compelling email marketing campaigns that convert with this prompt.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.5,
    uses: 1876,
    price: 5.49,
    author: "emailguru",
  },
  {
    id: 6,
    title: "Fiction Story Generator",
    description: "Generate creative fiction stories with detailed plots, characters, and settings.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.7,
    uses: 2145,
    price: 3.99,
    author: "storyteller",
  },
  {
    id: 7,
    title: "React Component Creator",
    description: "Generate clean, efficient React components with proper TypeScript typing.",
    category: "Development",
    categoryColor: "green",
    rating: 4.8,
    uses: 1432,
    price: 8.99,
    author: "reactdev",
  },
  {
    id: 8,
    title: "Social Media Content Planner",
    description: "Plan and create engaging social media content for multiple platforms.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.6,
    uses: 2567,
    price: 6.49,
    author: "socialmedia",
  },
  {
    id: 9,
    title: "Technical Documentation Writer",
    description: "Create clear and comprehensive technical documentation for software and products.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.9,
    uses: 987,
    price: 7.99,
    author: "techdoc",
  },
  {
    id: 10,
    title: "Product Description Expert",
    description: "Write compelling product descriptions that convert browsers into buyers.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.7,
    uses: 1876,
    price: 5.99,
    author: "copywriter",
  },
  {
    id: 11,
    title: "API Documentation Generator",
    description: "Generate comprehensive API documentation with examples and explanations.",
    category: "Development",
    categoryColor: "green",
    rating: 4.8,
    uses: 1245,
    price: 9.99,
    author: "apidev",
  },
  {
    id: 12,
    title: "Logo Design Consultant",
    description: "Get professional logo design suggestions and feedback for your brand.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.5,
    uses: 876,
    price: 8.49,
    author: "logodesigner",
  },
  {
    id: 13,
    title: "Resume Builder Pro",
    description: "Create professional resumes tailored to specific job positions and industries.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.9,
    uses: 3245,
    price: 4.99,
    author: "resumepro",
  },
  {
    id: 14,
    title: "Email Subject Line Generator",
    description: "Generate high-converting email subject lines that increase open rates.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.6,
    uses: 2189,
    price: 3.49,
    author: "emailexpert",
  },
  {
    id: 15,
    title: "SQL Query Optimizer",
    description: "Optimize your SQL queries for better performance and efficiency.",
    category: "Development",
    categoryColor: "green",
    rating: 4.7,
    uses: 987,
    price: 7.99,
    author: "sqlmaster",
  },
  {
    id: 16,
    title: "UX Research Assistant",
    description: "Plan and structure user research studies with comprehensive methodologies.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.8,
    uses: 765,
    price: 9.99,
    author: "uxresearcher",
  },
  {
    id: 17,
    title: "Academic Paper Writer",
    description: "Generate well-structured academic papers with proper citations and formatting.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.9,
    uses: 1432,
    price: 8.99,
    author: "academicwriter",
  },
  {
    id: 18,
    title: "Ad Copy Generator",
    description: "Create compelling ad copy for various platforms that drives conversions.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.7,
    uses: 2345,
    price: 6.49,
    author: "adcopywriter",
  },
  {
    id: 19,
    title: "Docker Configuration Expert",
    description: "Generate optimized Docker configurations for your applications.",
    category: "Development",
    categoryColor: "green",
    rating: 4.8,
    uses: 876,
    price: 9.99,
    author: "dockerpro",
  },
  {
    id: 20,
    title: "UI Animation Creator",
    description: "Design smooth and engaging UI animations with detailed CSS and JavaScript.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.6,
    uses: 987,
    price: 7.49,
    author: "animationdesigner",
  },
  {
    id: 21,
    title: "Business Plan Writer",
    description: "Create comprehensive business plans with market analysis and financial projections.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.9,
    uses: 1876,
    price: 12.99,
    author: "businessplanner",
  },
  {
    id: 22,
    title: "Social Media Strategy Expert",
    description: "Develop comprehensive social media strategies tailored to your business goals.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.8,
    uses: 2145,
    price: 9.99,
    author: "strategist",
  },
  {
    id: 23,
    title: "GraphQL Schema Designer",
    description: "Design efficient GraphQL schemas with proper types and resolvers.",
    category: "Development",
    categoryColor: "green",
    rating: 4.7,
    uses: 765,
    price: 8.49,
    author: "graphqldev",
  },
  {
    id: 24,
    title: "Brand Identity Creator",
    description: "Develop comprehensive brand identity guidelines with color schemes and typography.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.9,
    uses: 1432,
    price: 14.99,
    author: "branddesigner",
  },
]

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Writing":
      return "blue"
    case "Marketing":
      return "purple"
    case "Development":
      return "green"
    case "Design":
      return "pink"
    default:
      return "blue"
  }
}

export default function MarketplacePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(TOTAL_PROMPTS / PROMPTS_PER_PAGE)

  // Get current prompts
  const indexOfLastPrompt = currentPage * PROMPTS_PER_PAGE
  const indexOfFirstPrompt = indexOfLastPrompt - PROMPTS_PER_PAGE
  const currentPrompts = MOCK_PROMPTS.slice(indexOfFirstPrompt, indexOfLastPrompt)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex">
        <div className="w-48 bg-muted border-r border-border p-4 hidden md:block">
          <h3 className="text-xs font-medium uppercase text-muted-foreground mb-2">Filters</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-sm h-8 px-2">
              All
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-8 px-2 bg-[hsl(var(--forge-green))]/10 text-[hsl(var(--forge-green))]"
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

          <h3 className="text-xs font-medium uppercase text-muted-foreground mt-6 mb-2">Categories</h3>
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
                <Input placeholder="Search for prompts..." className="bg-muted border-muted pl-10" />
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
                    className="text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Sparkles className="h-5 w-5 mr-2 text-[hsl(var(--forge-green))]" />
                <h2 className="text-lg font-medium">Featured Prompts</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentPrompts.slice(0, 4).map((prompt) => (
                  <Card key={prompt.id} className="bg-card border-border overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className={`bg-${prompt.categoryColor}-500/20 text-${prompt.categoryColor}-400 text-xs font-medium px-2 py-1 rounded`}
                        >
                          {prompt.category}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs ml-1">{prompt.rating}</span>
                        </div>
                      </div>

                      <h3 className="font-medium mb-1">{prompt.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{prompt.description}</p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-xs ml-1 text-muted-foreground">@{prompt.author}</span>
                        </div>
                        <div className="text-xs font-medium">${prompt.price.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="border-t border-border flex">
                      <div className="flex-1 py-2 text-center text-xs text-muted-foreground">
                        <span>{prompt.uses.toLocaleString()} uses</span>
                      </div>
                      <div className="border-l border-border">
                        <Button className="h-full rounded-none bg-[hsl(var(--forge-green))] hover:bg-[hsl(var(--forge-green-dark))] text-xs px-3">
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 mr-2 text-yellow-400" />
                <h2 className="text-lg font-medium">Popular Prompts</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentPrompts.slice(4).map((prompt) => (
                  <Card key={prompt.id} className="bg-card border-border overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className={`bg-${prompt.categoryColor}-500/20 text-${prompt.categoryColor}-400 text-xs font-medium px-2 py-1 rounded`}
                        >
                          {prompt.category}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs ml-1">{prompt.rating}</span>
                        </div>
                      </div>

                      <h3 className="font-medium mb-1">{prompt.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{prompt.description}</p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-xs ml-1 text-muted-foreground">@{prompt.author}</span>
                        </div>
                        <div className="text-xs font-medium">${prompt.price.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="border-t border-border flex">
                      <div className="flex-1 py-2 text-center text-xs text-muted-foreground">
                        <span>{prompt.uses.toLocaleString()} uses</span>
                      </div>
                      <div className="border-l border-border">
                        <Button className="h-full rounded-none bg-[hsl(var(--forge-green))] hover:bg-[hsl(var(--forge-green-dark))] text-xs px-3">
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
                  const pageNumber = i + 1
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(pageNumber)
                        }}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                {totalPages > 3 && (
                  <>
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {currentPage > 3 && currentPage < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                          isActive={true}
                        >
                          {currentPage}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {totalPages > 3 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(totalPages)
                          }}
                          isActive={currentPage === totalPages}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  )
}
