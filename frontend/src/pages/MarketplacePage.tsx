import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Sparkles, Star, User, Search, Filter } from "lucide-react"

// Mock data for prompts
const PROMPTS_PER_PAGE = 12
const TOTAL_PROMPTS = 48

const MOCK_PROMPTS = [
  {
    id: 1,
    title: "Expert Content Writer",
    description:
      "A professional prompt for generating high-quality blog posts and articles on any topic with SEO optimization.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.8,
    uses: 1245,
    price: 4.99,
    author: "writer_pro",
    featured: true,
  },
  {
    id: 2,
    title: "Advanced SEO Optimizer",
    description:
      "Optimize your content for search engines with this advanced SEO prompt that covers keywords, meta descriptions, and more.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.9,
    uses: 2389,
    price: 6.99,
    author: "seomaster",
    featured: true,
  },
  {
    id: 3,
    title: "Code Documentation Pro",
    description:
      "Generate comprehensive documentation for your code with detailed explanations, examples, and best practices.",
    category: "Development",
    categoryColor: "green",
    rating: 4.7,
    uses: 987,
    price: 5.99,
    author: "codemaster",
    featured: false,
  },
  {
    id: 4,
    title: "UI/UX Design Assistant",
    description: "Get professional UI/UX design suggestions and feedback for your projects with detailed analysis.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.6,
    uses: 1567,
    price: 7.99,
    author: "designpro",
    featured: true,
  },
  {
    id: 5,
    title: "Email Marketing Wizard",
    description: "Create compelling email marketing campaigns that convert with this comprehensive email prompt.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.5,
    uses: 1876,
    price: 5.49,
    author: "emailguru",
    featured: false,
  },
  {
    id: 6,
    title: "Fiction Story Generator",
    description: "Generate creative fiction stories with detailed plots, characters, and settings for any genre.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.7,
    uses: 2145,
    price: 3.99,
    author: "storyteller",
    featured: false,
  },
  {
    id: 7,
    title: "React Component Creator",
    description: "Generate clean, efficient React components with proper TypeScript typing and best practices.",
    category: "Development",
    categoryColor: "green",
    rating: 4.8,
    uses: 1432,
    price: 8.99,
    author: "reactdev",
    featured: true,
  },
  {
    id: 8,
    title: "Social Media Content Planner",
    description: "Plan and create engaging social media content for multiple platforms with scheduling suggestions.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.6,
    uses: 2567,
    price: 6.49,
    author: "socialmedia",
    featured: false,
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
    featured: false,
  },
  {
    id: 10,
    title: "Product Description Expert",
    description: "Write compelling product descriptions that convert browsers into buyers with persuasive copy.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.7,
    uses: 1876,
    price: 5.99,
    author: "copywriter",
    featured: false,
  },
  {
    id: 11,
    title: "API Documentation Generator",
    description: "Generate comprehensive API documentation with examples, endpoints, and detailed explanations.",
    category: "Development",
    categoryColor: "green",
    rating: 4.8,
    uses: 1245,
    price: 9.99,
    author: "apidev",
    featured: false,
  },
  {
    id: 12,
    title: "Logo Design Consultant",
    description: "Get professional logo design suggestions and feedback for your brand with creative concepts.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.5,
    uses: 876,
    price: 8.49,
    author: "logodesigner",
    featured: false,
  },
  {
    id: 13,
    title: "Resume Builder Pro",
    description: "Create professional resumes tailored to specific job positions and industries with ATS optimization.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.9,
    uses: 3245,
    price: 4.99,
    author: "resumepro",
    featured: false,
  },
  {
    id: 14,
    title: "Email Subject Line Generator",
    description: "Generate high-converting email subject lines that increase open rates and engagement.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.6,
    uses: 2189,
    price: 3.49,
    author: "emailexpert",
    featured: false,
  },
  {
    id: 15,
    title: "SQL Query Optimizer",
    description: "Optimize your SQL queries for better performance and efficiency with detailed explanations.",
    category: "Development",
    categoryColor: "green",
    rating: 4.7,
    uses: 987,
    price: 7.99,
    author: "sqlmaster",
    featured: false,
  },
  {
    id: 16,
    title: "UX Research Assistant",
    description: "Plan and structure user research studies with comprehensive methodologies and analysis.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.8,
    uses: 765,
    price: 9.99,
    author: "uxresearcher",
    featured: false,
  },
  {
    id: 17,
    title: "Academic Paper Writer",
    description:
      "Generate well-structured academic papers with proper citations, formatting, and research methodology.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.9,
    uses: 1432,
    price: 8.99,
    author: "academicwriter",
    featured: false,
  },
  {
    id: 18,
    title: "Ad Copy Generator",
    description: "Create compelling ad copy for various platforms that drives conversions and engagement.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.7,
    uses: 2345,
    price: 6.49,
    author: "adcopywriter",
    featured: false,
  },
  {
    id: 19,
    title: "Docker Configuration Expert",
    description: "Generate optimized Docker configurations for your applications with security best practices.",
    category: "Development",
    categoryColor: "green",
    rating: 4.8,
    uses: 876,
    price: 9.99,
    author: "dockerpro",
    featured: false,
  },
  {
    id: 20,
    title: "UI Animation Creator",
    description: "Design smooth and engaging UI animations with detailed CSS and JavaScript implementations.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.6,
    uses: 987,
    price: 7.49,
    author: "animationdesigner",
    featured: false,
  },
  {
    id: 21,
    title: "Business Plan Writer",
    description:
      "Create comprehensive business plans with market analysis, financial projections, and strategic planning.",
    category: "Writing",
    categoryColor: "blue",
    rating: 4.9,
    uses: 1876,
    price: 12.99,
    author: "businessplanner",
    featured: false,
  },
  {
    id: 22,
    title: "Social Media Strategy Expert",
    description: "Develop comprehensive social media strategies tailored to your business goals and target audience.",
    category: "Marketing",
    categoryColor: "purple",
    rating: 4.8,
    uses: 2145,
    price: 9.99,
    author: "strategist",
    featured: false,
  },
  {
    id: 23,
    title: "GraphQL Schema Designer",
    description: "Design efficient GraphQL schemas with proper types, resolvers, and optimization techniques.",
    category: "Development",
    categoryColor: "green",
    rating: 4.7,
    uses: 765,
    price: 8.49,
    author: "graphqldev",
    featured: false,
  },
  {
    id: 24,
    title: "Brand Identity Creator",
    description: "Develop comprehensive brand identity guidelines with color schemes, typography, and visual elements.",
    category: "Design",
    categoryColor: "pink",
    rating: 4.9,
    uses: 1432,
    price: 14.99,
    author: "branddesigner",
    featured: false,
  },
]

// Generate more prompts to reach 48 total
for (let i = 25; i <= 48; i++) {
  const categories = ["Writing", "Marketing", "Development", "Design"]
  const categoryColors = ["blue", "purple", "green", "pink"]
  const randomCategory = categories[i % 4]
  const randomCategoryColor = categoryColors[i % 4]

  MOCK_PROMPTS.push({
    id: i,
    title: `Professional ${randomCategory} Assistant ${i}`,
    description: `Advanced ${randomCategory.toLowerCase()} prompt that helps you create high-quality content with professional results.`,
    category: randomCategory,
    categoryColor: randomCategoryColor,
    rating: 4.3 + Math.random() * 0.6,
    uses: Math.floor(Math.random() * 3000) + 500,
    price: Math.floor(Math.random() * 10) + 2.99,
    author: `user${i}`,
    featured: Math.random() > 0.8,
  })
}

const getCategoryColorClasses = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-500/20 text-blue-400"
    case "purple":
      return "bg-purple-500/20 text-purple-400"
    case "green":
      return "bg-green-500/20 text-green-400"
    case "pink":
      return "bg-pink-500/20 text-pink-400"
    default:
      return "bg-blue-500/20 text-blue-400"
  }
}

export default function MarketplacePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Filter prompts based on search and category
  const filteredPrompts = MOCK_PROMPTS.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "featured" && prompt.featured) ||
      (selectedFilter === "popular" && prompt.uses > 2000) ||
      (selectedFilter === "new" && prompt.id > 40)

    return matchesSearch && matchesCategory && matchesFilter
  })

  const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE)
  const indexOfLastPrompt = currentPage * PROMPTS_PER_PAGE
  const indexOfFirstPrompt = indexOfLastPrompt - PROMPTS_PER_PAGE
  const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt)

  const categories = ["all", "Writing", "Marketing", "Development", "Design"]
  const filters = [
    { value: "all", label: "All" },
    { value: "featured", label: "Featured" },
    { value: "popular", label: "Popular" },
    { value: "new", label: "New" },
  ]

  const featuredPrompts = MOCK_PROMPTS.filter((prompt) => prompt.featured).slice(0, 4)

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 bg-muted border-r border-border p-4 hidden md:block">
          <h3 className="text-xs font-medium uppercase text-muted-foreground mb-2">Filters</h3>
          <div className="space-y-1">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant="ghost"
                className={`w-full justify-start text-sm h-8 px-2 ${
                  selectedFilter === filter.value ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                }`}
                onClick={() => setSelectedFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <h3 className="text-xs font-medium uppercase text-muted-foreground mt-6 mb-2">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                className={`w-full justify-start text-sm h-8 px-2 ${
                  selectedCategory === category ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold mb-4 md:mb-0">Prompt Marketplace</h1>

              {/* Mobile Filter Toggle */}
              <Button variant="outline" className="md:hidden mb-4" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="md:hidden mb-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Filter</h4>
                    <div className="space-y-1">
                      {filters.map((filter) => (
                        <Button
                          key={filter.value}
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-start ${
                            selectedFilter === filter.value ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                          }`}
                          onClick={() => setSelectedFilter(filter.value)}
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Category</h4>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-start ${
                            selectedCategory === category ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                          }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category === "all" ? "All" : category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Input
                  placeholder="        Search for prompts..."
                  className="bg-muted border-muted pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {!searchQuery && (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            {/* Featured Prompts */}
            {selectedFilter === "all" && selectedCategory === "all" && !searchQuery && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Sparkles className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                  <h2 className="text-lg font-medium">Featured Prompts</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {featuredPrompts.map((prompt) => (
                    <Card key={prompt.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div
                            className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColorClasses(prompt.categoryColor)}`}
                          >
                            {prompt.category}
                          </div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs ml-1">{prompt.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <h3 className="font-medium mb-1 line-clamp-1">{prompt.title}</h3>
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
                          <Button className="h-full rounded-none bg-[#3ebb9e] hover:bg-[#00674f] text-xs px-3">
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-400" />
                <h2 className="text-lg font-medium">
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : selectedCategory !== "all"
                      ? `${selectedCategory} Prompts`
                      : selectedFilter !== "all"
                        ? `${filters.find((f) => f.value === selectedFilter)?.label} Prompts`
                        : "All Prompts"}
                </h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""} found
              </div>
            </div>

            {/* Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {currentPrompts.map((prompt) => (
                <Card key={prompt.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColorClasses(prompt.categoryColor)}`}
                      >
                        {prompt.category}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs ml-1">{prompt.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <h3 className="font-medium mb-1 line-clamp-1">{prompt.title}</h3>
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
                      <Button className="h-full rounded-none bg-[#3ebb9e] hover:bg-[#00674f] text-xs px-3">
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredPrompts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No prompts found</h3>
                  <p>Try adjusting your search terms or filters</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={currentPage === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
