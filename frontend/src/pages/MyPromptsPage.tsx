"use client"

import { useEffect, useState } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Star, User, Search, Filter, Plus, Edit, Trash2, Copy, Calendar, BarChart3, Check } from "lucide-react"
import { Link } from "react-router-dom"
import { StandardPromptCard } from "../components/StandardPromptCard"

interface MyPrompt {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  usageCount: number
  rating: number
  isPrivate: boolean
  isFavorite: boolean
}

const PROMPTS_PER_PAGE = 12

export default function MyPromptsPage() {
  const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<MyPrompt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>(["all"])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch prompts from API and map backend fields to frontend model
  useEffect(() => {
    const fetchMyPrompts = async () => {
      setLoading(true)
      const authorId = localStorage.getItem("userId")
      if (!authorId) {
        setMyPrompts([])
        setFilteredPrompts([])
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/prompts/author/${authorId}`)
        if (!res.ok) throw new Error("Failed to fetch prompts")
        
        let prompts = await res.json()
        if (!Array.isArray(prompts)) prompts = []
        
        // Map backend fields to frontend MyPrompt interface
        const mappedPrompts: MyPrompt[] = prompts.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          content: p.content || "",
          category: "General", // Default, backend does not provide
          tags: p.tagNames || [],
          createdAt: p.createdAt,
          updatedAt: p.publishedAt || p.createdAt,
          usageCount: 0,   // Default, backend does not provide
          rating: 0, // Default, backend does not provide
          isPrivate: p.visibility !== "public",
          isFavorite: false // Default, backend does not provide
        }))
        
        setMyPrompts(mappedPrompts)
        setFilteredPrompts(mappedPrompts)
        
        // Extract unique categories
        const categories = ["all", ...new Set(mappedPrompts.map((p) => p.category))]
        setAvailableCategories(categories)
      } catch (error) {
        console.error("Error fetching prompts:", error)
        setMyPrompts([])
        setFilteredPrompts([])
      }
      setLoading(false)
    }

    fetchMyPrompts()
  }, [])

  useEffect(() => {
    if (myPrompts.length === 0) return

    const filtered = myPrompts.filter((prompt) => {
      // Search filter
      const matchesSearch = searchQuery
        ? prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true

      // Category filter
      const matchesCategory = selectedCategory === "all" ? true : prompt.category === selectedCategory

      // Additional filters
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const isRecent = new Date(prompt.updatedAt) > oneWeekAgo

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "favorites" && prompt.isFavorite) ||
        (selectedFilter === "private" && prompt.isPrivate) ||
        (selectedFilter === "public" && !prompt.isPrivate) ||
        (selectedFilter === "recent" && isRecent) ||
        (selectedFilter === "popular" && prompt.usageCount > 30)

      return matchesSearch && matchesCategory && matchesFilter
    })

    setFilteredPrompts(filtered)
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedFilter, myPrompts])

  // Pagination calculations
  const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE)
  const indexOfLastPrompt = currentPage * PROMPTS_PER_PAGE
  const indexOfFirstPrompt = indexOfLastPrompt - PROMPTS_PER_PAGE
  const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt)
  const favoritePrompts = myPrompts.filter((prompt) => prompt.isFavorite).slice(0, 4)

  const filters = [
    { value: "all", label: "All" },
    { value: "favorites", label: "Favorites" },
    { value: "recent", label: "Recent" },
    { value: "popular", label: "Popular" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
  ]

  const handleDeletePrompt = async (id: string) => {
    try {
      const res = await fetch(`/prompts/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setMyPrompts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
    }
  }

  const handleToggleFavorite = (id: string) => {
    setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
  }

  const handleCopyPrompt = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy prompt: ", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleEditPrompt = (prompt: MyPrompt) => {
    // Store the prompt data for the edit page
    const editData = {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      tags: prompt.tags,
      promptText: prompt.content,
      instructions: "",
      expectedOutput: "",
      useCase: "",
      isPrivate: prompt.isPrivate
    }
    
    // Store in sessionStorage so it persists across page navigation
    sessionStorage.setItem("editPromptData", JSON.stringify(editData))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your prompts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
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
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availableCategories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                className={`w-full justify-start text-sm h-8 px-2 ${
                  selectedCategory === category ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="truncate">
                  {category === "all" ? "All" : category}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">My Prompts</h1>
                  <p className="text-muted-foreground">Manage and organize your AI prompts</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Link to="/submit">
                    <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      New Prompt
                    </Button>
                  </Link>
                </div>
              </div>
              
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

              {/* Favorite Prompts */}
              {selectedFilter === "all" && selectedCategory === "all" && !searchQuery && favoritePrompts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    <h2 className="text-lg font-medium">Favorite Prompts</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {favoritePrompts.map((prompt) => (
                      <StandardPromptCard
                        key={prompt.id}
                        id={prompt.id}
                        title={prompt.title}
                        description={prompt.description}
                        rating={prompt.rating}
                        usageCount={prompt.usageCount}
                        featured={false}
                        isPrivate={prompt.isPrivate}
                        isFavorite={prompt.isFavorite}
                        tags={prompt.tags}
                        category={prompt.category}
                        isOwned={true}
                        onEdit={handleEditPrompt}
                        onDelete={handleDeletePrompt}
                        onToggleFavorite={handleToggleFavorite}
                        onCopy={handleCopyPrompt}
                        copiedId={copiedId}
                        content={prompt.content}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : selectedCategory !== "all"
                      ? `${selectedCategory} Prompts`
                      : selectedFilter !== "all"
                        ? `${filters.find((f) => f.value === selectedFilter)?.label} Prompts`
                        : "All Prompts"}
                </h2>
                <div className="text-sm text-muted-foreground">
                  {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""} found
                </div>
              </div>

              {/* Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {currentPrompts.map((prompt) => (
                  <StandardPromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    description={prompt.description}
                    rating={prompt.rating}
                    usageCount={prompt.usageCount}
                    featured={false}
                    isPrivate={prompt.isPrivate}
                    isFavorite={prompt.isFavorite}
                    tags={prompt.tags}
                    category={prompt.category}
                    isOwned={true}
                    onEdit={handleEditPrompt}
                    onDelete={handleDeletePrompt}
                    onToggleFavorite={handleToggleFavorite}
                    onCopy={handleCopyPrompt}
                    copiedId={copiedId}
                    content={prompt.content}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredPrompts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      {myPrompts.length === 0 ? "No prompts yet" : "No prompts found"}
                    </h3>
                    <p>
                      {myPrompts.length === 0
                        ? "Create your first prompt to get started"
                        : "Try adjusting your search terms or filters"}
                    </p>
                  </div>
                  {myPrompts.length === 0 ? (
                    <Link to="/submit">
                      <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Prompt
                      </Button>
                    </Link>
                  ) : (
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
                  )}
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
    </div>
  )
}