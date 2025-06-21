import { useEffect, useState } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Sparkles, Star, User, Search, Filter } from "lucide-react"
import { PromptCard } from "@/components/PromptCard"
import { PromptService } from "@/services/promptService"
import { Prompt, Tag,PromptWithTags} from "@/models/Prompt"

const PROMPTS_PER_PAGE = 12

export default function MarketplacePage() {
  const promptService = new PromptService()
const [enrichedPrompts, setEnrichedPrompts] = useState<PromptWithTags[]>([]);
const [filteredPrompts, setFilteredPrompts] = useState<PromptWithTags[]>([]);
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>(['all'])
  const [loading, setLoading] = useState(true)
  const [tagsLoading, setTagsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setTagsLoading(true)
        setError(null)
        
        const promptsWithTags = await promptService.getMarketplacePrompts()
        setEnrichedPrompts(promptsWithTags)
        setFilteredPrompts(promptsWithTags)
        
        // Extract unique categories from resolved tags
        const categories = ['all', ...new Set(
          promptsWithTags.flatMap(p => 
            p.tags
              .filter(tag => tag.name !== 'Unknown')
              .map(t => t.name)
          )
        )]
        setAvailableCategories(categories)
        
      } catch (err) {
        setError('Failed to load data')
        console.error(err)
      } finally {
        setLoading(false)
        setTagsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (enrichedPrompts.length === 0) return
    
    const filtered = enrichedPrompts.filter(prompt => {
      // Search filter
      const matchesSearch = searchQuery 
        ? prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true
      
      // Category filter (only show known tags)
      const matchesCategory = selectedCategory === 'all' 
        ? true 
        : prompt.tags.some(tag => tag.name !== 'Unknown' && tag.name === selectedCategory)
      
      // Additional filters
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const isNew = new Date(prompt.publishedAt) > oneWeekAgo
      
      const matchesFilter = 
        selectedFilter === "all" ||
        (selectedFilter === "featured" && prompt.featured) ||
        (selectedFilter === "popular" && prompt.usageCount > 2000) ||
        (selectedFilter === "new" && isNew)
      
      return matchesSearch && matchesCategory && matchesFilter
    })
    
    setFilteredPrompts(filtered)
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedFilter, enrichedPrompts])

  // Pagination calculations
  const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE)
  const indexOfLastPrompt = currentPage * PROMPTS_PER_PAGE
  const indexOfFirstPrompt = indexOfLastPrompt - PROMPTS_PER_PAGE
  const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt)
  const featuredPrompts = enrichedPrompts.filter(prompt => prompt.featured).slice(0, 4)

  const filters = [
    { value: "all", label: "All" },
    { value: "featured", label: "Featured" },
    { value: "popular", label: "Popular" },
    { value: "new", label: "New" },
  ]

  if (loading) return <div className="flex justify-center p-8">Loading prompts...</div>
  if (error) return <div className="text-red-500 p-8">{error}</div>

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
            {availableCategories.map((category) => (
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
            {/* Header and Mobile Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold mb-4 md:mb-0">Prompt Marketplace</h1>
              <Button 
                variant="outline" 
                className="md:hidden mb-4" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="md:hidden mb-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  {/* Mobile filter UI would go here */}
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {featuredPrompts.map((prompt) => (
                    <PromptCard 
                      key={prompt.id} 
                      {...prompt}
                      tagsLoading={tagsLoading}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {currentPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  {...prompt}
                  tagsLoading={tagsLoading}
                />
              ))}
            </div>

            {/* Empty State */}
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