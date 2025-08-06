import { useEffect, useState } from "react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Sparkles, Star, Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { PromptCard } from "@/components/PromptCard"
import { PromptService } from "@/services/promptService"
import { Tag, MarketplacePrompt } from "@/Models/Prompt"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

const PROMPTS_PER_PAGE = 12

interface EnrichedMarketplacePrompt extends MarketplacePrompt {
  averageRating?: number;
  reviewCount?: number;
}

const useCacheInvalidation = () => {
  useEffect(() => {
    const clearRatingsCache = () => {
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith('rating_')) {
          sessionStorage.removeItem(key)
        }
      })
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        clearRatingsCache()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}

export default function MarketplacePage() {
  useCacheInvalidation()
  
  const promptService = new PromptService()
  const [currentPrompts, setCurrentPrompts] = useState<EnrichedMarketplacePrompt[]>([]);
  const [featuredPrompts, setFeaturedPrompts] = useState<MarketplacePrompt[]>([]);
  const [currentPage, setCurrentPage] = useState(1)
  const [promptsFound, setPromptsFound] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showFeatured, setShowFeatured] = useState(true)
  const [availableCategories, setAvailableCategories] = useState<Tag[]>([]) // ✅ Changed to Tag[]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ratingsLoading, setRatingsLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true) // ✅ Add categories loading state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Pagination calculations
  const [totalPages, setTotalPages] = useState<number>(1)
  const filters = [
    { value: "all", label: "All" },
    { value: "featured", label: "Featured" },
    { value: "popular", label: "Popular" },
    { value: "new", label: "New" },
  ]

  // ✅ Fetch available categories/tags from the database
  const fetchAvailableCategories = async () => {
    setCategoriesLoading(true)
    try {
      const tags = await promptService.getAllTags()
      console.log("Fetched tags:", tags) // Debug log
      setAvailableCategories(tags)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setAvailableCategories([]) // Fallback to empty array
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1) //Reset to page 1
    console.log("filter:", filter);
    
    fetchData(selectedCategory, filter, searchQuery, 1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1) //Reset to page 1
    console.log("category:", category);
    fetchData(category, selectedFilter, searchQuery, 1)
  }

  const enrichPromptsWithRatings = async (prompts: MarketplacePrompt[]): Promise<EnrichedMarketplacePrompt[]> => {
    const enrichedPrompts = await Promise.all(
      prompts.map(async (prompt) => {
        const { averageRating, reviewCount } = await promptService.getPromptRatingSummary(prompt.id);
        return {
          ...prompt,
          averageRating,
          reviewCount
        };
      })
    );
    
    return enrichedPrompts;
  };

  const fetchData = async (tag = "all", filter = "all", search = "", page = 1) => {
    setLoading(true);
    setCurrentPage(page) //Update current page
    
    try {
      const pageData = await promptService.fetchMarketplacePrompts({ tag, filter, search }, page - 1);
      
      // Set prompts first without ratings
      setCurrentPrompts(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setPromptsFound(pageData.totalElements || 0);
      setLoading(false);
      
      //Load ratings in background
      setRatingsLoading(true);
      const enrichedPrompts = await enrichPromptsWithRatings(pageData.content || []);
      setCurrentPrompts(enrichedPrompts);
      setRatingsLoading(false);
      
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError('Failed to load prompts. Please try again.');
      setLoading(false);
      setRatingsLoading(false);
    }
  }

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // setSearchQuery(query)
    if (event.key === "Enter") {
      setCurrentPage(1) //Reset to page 1
      
      fetchData(selectedCategory, selectedFilter, searchQuery,1)
    }
  }

  const changePage = (pageNumber: number) => {
    fetchData(selectedCategory, selectedFilter, searchQuery, pageNumber)
  }

  //Load initial data and categories when component mounts
  useEffect(() => {
    fetchAvailableCategories() // Fetch categories first
    fetchData() // Then fetch prompts
  }, [])

  // Add this useEffect to check for refresh flag:
  useEffect(() => {
    const checkRefreshFlag = () => {
      if (sessionStorage.getItem('needsRatingRefresh') === 'true') {
        sessionStorage.removeItem('needsRatingRefresh')
        
        // Clear all rating caches
        const keys = Object.keys(sessionStorage)
        keys.forEach(key => {
          if (key.startsWith('rating_')) {
            sessionStorage.removeItem(key)
          }
        })
        
        // Refresh current data
        if (currentPrompts.length > 0) {
          fetchData(selectedCategory, selectedFilter, searchQuery, currentPage)
        }
      }
    }

    // Check on mount and on visibility change
    checkRefreshFlag()
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkRefreshFlag()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentPrompts, selectedCategory, selectedFilter, searchQuery, currentPage])

  // Show loading screen (full screen like other pages)
  if ((loading && currentPrompts.length === 0) || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  // Show error screen
  if (error && currentPrompts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Error Loading Marketplace</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError(null)
              fetchData()
            }} 
            className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Hidden on mobile, overlay when filters shown */}
        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? "w-0 -ml-48 lg:ml-0 lg:w-12" : "w-48"
          } ${
            showFilters && !sidebarCollapsed 
              ? "fixed inset-y-0 left-0 z-50 bg-muted border-r border-border lg:relative lg:inset-auto lg:z-auto" 
              : "hidden lg:block"
          } bg-muted border-r border-border p-4 flex-shrink-0 min-h-screen relative`}
        >
          {/* Close button for mobile */}
          {showFilters && (
            <button
              className="absolute top-3 right-3 lg:hidden bg-background rounded-full p-1 shadow hover:bg-muted transition z-20"
              onClick={() => setShowFilters(false)}
              aria-label="Close filters"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          <button
            className="absolute top-3 right-2 z-10 bg-muted p-1 transition hidden lg:block"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[calc(100vh-6rem)] pt-8 lg:pt-0">
              <h3 className="text-xs font-medium uppercase text-muted-foreground mb-2">Filters</h3>
              <div className="space-y-1 mb-6">
                {filters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant="ghost"
                    className={`w-full justify-start text-sm h-8 px-2 ${
                      selectedFilter === filter.value ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                    }`}
                    onClick={() => {
                      handleFilterChange(filter.value)
                      setShowFilters(false) // Close on mobile after selection
                    }}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <h3 className="text-xs font-medium uppercase text-muted-foreground mb-2">Categories</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm h-8 px-2 ${
                    selectedCategory === "all" ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                  }`}
                  onClick={() => {
                    handleCategoryChange("all")
                    setShowFilters(false) // Close on mobile after selection
                  }}
                >
                  All Categories
                </Button>
                {availableCategories.map((tag) => (
                  <Button
                    key={tag.id || tag.name}
                    variant="ghost"
                    className={`w-full justify-start text-sm h-8 px-2 ${
                      selectedCategory === tag.name ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                    }`}
                    onClick={() => {
                      handleCategoryChange(tag.name)
                      setShowFilters(false) // Close on mobile after selection
                    }}
                  >
                    <span className="truncate">{tag.name}</span>
                  </Button>
                ))}
                {categoriesLoading && (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3ebb9e]"></div>
                  </div>
                )}
                {!categoriesLoading && availableCategories.length === 0 && (
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    No categories found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Overlay for mobile sidebar */}
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header and Mobile Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Prompt Marketplace</h1>
                  <p className="text-sm text-muted-foreground lg:hidden">
                    Discover and purchase AI prompts
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="lg:hidden" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">Filter</span>
                </Button>
              </div>

              {/* Search Bar */}
              <div className="mb-6 sm:mb-8">
                <div className="relative">
                  <Input
                    placeholder="        Search for prompts..."
                    className="bg-muted border-muted pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value === "") {
                        setCurrentPage(1)
                        fetchData("all", "all", "", 1)
                      }
                    }}
                    onKeyDown={handleSearch}
                  />
                  {!searchQuery && (
                    <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2">
                      <Search className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Prompts - 2 columns on mobile */}
              {featuredPrompts.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#3ebb9e]" />
                      <h2 className="text-base sm:text-lg font-medium">Featured</h2>
                      <span className="ml-2 text-xs sm:text-sm text-muted-foreground">({featuredPrompts.length})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFeatured(!showFeatured)}
                      className="flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground h-7 sm:h-8"
                    >
                      <span className="hidden sm:inline">{showFeatured ? "Hide" : "Show"}</span>
                      {showFeatured ? (
                        <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
                      )}
                    </Button>
                  </div>
                  
                  {showFeatured && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 transition-all duration-300 ease-in-out">
                      {featuredPrompts.map((prompt) => (
                        <PromptCard
                          key={`featured-${prompt.id}`}
                          {...prompt}
                          tags={prompt.tagnames}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {loading && currentPrompts.length > 0 && (
                <div className="flex justify-center items-center h-24 sm:h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#3ebb9e] mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-muted-foreground text-sm">Updating results...</p>
                  </div>
                </div>
              )}

              {/* Results - only show when not loading initial data */}
              {!loading || currentPrompts.length > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-400" />
                      <h2 className="text-base sm:text-lg font-medium">
                        {searchQuery
                          ? `Results for "${searchQuery}"`
                          : selectedCategory !== "all"
                            ? `${selectedCategory}`
                            : selectedFilter !== "all"
                              ? `${filters.find((f) => f.value === selectedFilter)?.label}`
                              : "All Prompts"}
                      </h2>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {promptsFound} prompt{promptsFound !== 1 ? "s" : ""} found
                    </div>
                  </div>

                  {/* Prompts Grid - 2 columns on mobile, 3 on large screens */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
                    {currentPrompts.map((prompt) => (
                      <PromptCard 
                        key={`prompt-${prompt.id}`}
                        id={prompt.id}
                        title={prompt.title}
                        description={prompt.description}
                        authorname={prompt.authorname}
                        price={prompt.price}
                        tags={prompt.tagnames}
                        rating={prompt.averageRating}
                        reviewCount={prompt.reviewCount}
                      />
                    ))}
                  </div>

                  {/* Empty State */}
                  {currentPrompts.length === 0 && !loading && (
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-muted-foreground mb-4">
                        <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                        <h3 className="text-base sm:text-lg font-medium mb-2">No prompts found</h3>
                        <p className="text-sm sm:text-base px-4">Try adjusting your search terms or filters</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setSelectedCategory("all")
                          setSelectedFilter("all")
                          fetchData("all", "all", "", 1)
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}

                  {/* Pagination - Responsive */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-6 sm:mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 sm:h-9 sm:px-3"
                        onClick={() => changePage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>

                      {/* Show fewer page numbers on mobile */}
                      {Array.from({ length: Math.min(totalPages, window.innerWidth < 640 ? 3 : 5) }).map((_, i) => {
                        let pageNumber
                        const maxPages = window.innerWidth < 640 ? 3 : 5
                        
                        if (totalPages <= maxPages) {
                          pageNumber = i + 1
                        } else if (currentPage <= Math.ceil(maxPages / 2)) {
                          pageNumber = i + 1
                        } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
                          pageNumber = totalPages - maxPages + 1 + i
                        } else {
                          pageNumber = currentPage - Math.floor(maxPages / 2) + i
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            className={`min-w-[2rem] h-8 sm:min-w-[2.5rem] sm:h-9 text-xs sm:text-sm ${
                              currentPage === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""
                            }`}
                            onClick={() => changePage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 sm:h-9 sm:px-3"
                        onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                      </Button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}