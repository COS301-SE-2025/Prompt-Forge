"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Star, Search, Filter, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { StandardPromptCard } from "../components/StandardPromptCard"
import httpClient from "../services/httpClient"

interface MyPrompt {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  rating: number
  uses: number
  featured: boolean
  price: number
  isPrivate: boolean
  isFavorite: boolean
  authorName: string
  isPublished: boolean // ✅ Add this property
  publishedAt?: string // ✅ Add this property
}

interface UserProfile {
  userId: string
  username: string
  email: string
  // Add other user fields as needed
}

const PROMPTS_PER_PAGE = 12

export default function MyPromptsPage() {
  const navigate = useNavigate()
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication and get user profile
  useEffect(() => {
    const checkAuthAndGetProfile = async () => {
      try {
        // Check if user is logged in (you can also check localStorage)
        const username = localStorage.getItem('username')
        if (!username || username === 'Guest') {
          console.log("❌ User not authenticated, redirecting to login")
          navigate('/login')
          return
        }

        setIsAuthenticated(true)

        //Get user profile using JWT token (sent via cookies)
        console.log("🔍 Fetching user profile...")
        const response = await httpClient.get('/user/me')

        if (response.ok) {
          const userData: UserProfile = await response.json()
          setUserProfile(userData)
          console.log("✅ User profile loaded:", userData)
        } else if (response.status === 401) {
          console.log("❌ Unauthorized, redirecting to login")
          localStorage.removeItem('username')
          localStorage.removeItem('userId')
          navigate('/login')
          return
        } else {
          throw new Error('Failed to fetch user profile')
        }
      } catch (error) {
        console.error("❌ Auth check failed:", error)
        // Don't redirect on network errors, just continue without profile
        setIsAuthenticated(true) // Allow fallback behavior
      }
    }

    checkAuthAndGetProfile()
  }, [navigate])

  // Fetch user's prompts when authentication is confirmed
  useEffect(() => {
    const fetchMyPrompts = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      setLoading(true)
      
      try {
        let authorId: string | null = null

        //Try to get authorId from user profile (preferred)
        if (userProfile?.userId) {
          authorId = userProfile.userId
          console.log("🔍 Using authorId from profile:", authorId)
        } 
        //Fallback: get from localStorage if profile not loaded yet
        else {
          authorId = localStorage.getItem('userId')
          console.log("🔍 Using authorId from localStorage:", authorId)
        }

        if (!authorId) {
          console.log("⚠️ No authorId available, using empty prompts")
          setMyPrompts([])
          setFilteredPrompts([])
          setLoading(false)
          return
        }

        console.log("🔍 Fetching prompts for authorId:", authorId)
        
        //Fetch prompts using JWT authentication (cookies)
        const response = await httpClient.get(`/prompts/author/${authorId}`)
        
        if (response.ok) {
          let prompts = await response.json()
          if (!Array.isArray(prompts)) prompts = []
          
          console.log(`✅ Fetched ${prompts.length} prompts for user`)

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
            rating: 0, // Default, backend does not provide
            uses: 0,   // Default, backend does not provide
            featured: p.featured || false,
            price: p.price || 0,
            isPrivate: p.visibility !== "public",
            isFavorite: false, // Default, backend does not provide
            authorName: userProfile?.username || "You",
            isPublished: p.visibility === "public" || p.publishedAt !== null, // ✅ Add this
            publishedAt: p.publishedAt // ✅ Add this
          }))

          setMyPrompts(mappedPrompts)
          setFilteredPrompts(mappedPrompts)
          
          const categories = ["all", ...new Set(mappedPrompts.map((p) => p.category))]
          setAvailableCategories(categories)
        } else if (response.status === 401) {
          console.log("Unauthorized, redirecting to login")
          localStorage.removeItem('username')
          localStorage.removeItem('userId')
          navigate('/login')
          return
        } else {
          throw new Error(`Failed to fetch prompts: ${response.status}`)
        }
      } catch (error) {
        console.error("❌ Error fetching prompts:", error)
        setMyPrompts([])
        setFilteredPrompts([])
      } finally {
        setLoading(false)
      }
    }

    // ✅ Only fetch prompts when authenticated AND we have either profile or localStorage userId
    if (isAuthenticated && (userProfile?.userId || localStorage.getItem('userId'))) {
      fetchMyPrompts()
    }
  }, [isAuthenticated, navigate]) //Remove userProfile from dependencies

  // Filtering logic
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
        (selectedFilter === "popular" && prompt.uses > 30)

      return matchesSearch && matchesCategory && matchesFilter
    })

    setFilteredPrompts(filtered)
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedFilter, myPrompts])

  // Pagination
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
      const response = await httpClient.delete(`/prompts/${id}`)
      if (response.ok) {
        setMyPrompts((prev) => prev.filter((p) => p.id !== id))
        console.log("Prompt deleted successfully")
      } else {
        throw new Error("Failed to delete prompt")
      }
    } catch (error) {
      console.error("❌ Error deleting prompt:", error)
      // For now, still remove from UI even if backend fails
      setMyPrompts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleToggleFavorite = async (id: string) => {
    // For now, just update locally since backend doesn't support favorites yet
    setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
    console.log("Favorite toggled (local only)")
  }

  const handleCopyPrompt = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      setCopiedId(null)
    }
  }

  const handleEditPrompt = (prompt: MyPrompt) => {
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
    sessionStorage.setItem("editPromptData", JSON.stringify(editData))
    navigate("/submit") // Navigate to submit page for editing
  }

  const handlePublishPrompt = async (id: string, isCurrentlyPublished: boolean) => {
    try {
      const action = isCurrentlyPublished ? "unpublish" : "publish"
      console.log(`🔄 ${action}ing prompt ${id}...`)
      
      // For now, just update local state (you can add API call later)
      setMyPrompts((prev) => prev.map((p) => 
        p.id === id 
          ? { 
              ...p, 
              isPrivate: isCurrentlyPublished, 
              isPublished: !isCurrentlyPublished,
              publishedAt: isCurrentlyPublished ? undefined : new Date().toISOString()
            } 
          : p
      ))
      
      console.log(`✅ Prompt ${action}ed successfully`)
    } catch (error) {
      console.error(`Error ${isCurrentlyPublished ? 'unpublishing' : 'publishing'} prompt:`, error)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your prompts...</p>
        </div>
      </div>
    )
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">Please log in to view your prompts</p>
          <Link to="/login">
            <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-screen">
      <div className="flex h-full min-h-screen">
        {/* Sidebar */}
        <div className="w-48 bg-muted border-r border-border p-4 hidden md:block flex-shrink-0 min-h-screen">
          <div className="h-full flex flex-col">
            <div className="flex-1">
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

            {/* User Info Section */}
            {userProfile && (
              <div className="border-t border-border pt-4 mt-4">
                <div className="text-xs font-medium uppercase text-muted-foreground mb-2">User</div>
                <div className="text-sm">
                  <div className="font-medium">{userProfile.username}</div>
                  <div className="text-muted-foreground text-xs">{myPrompts.length} prompts</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">My Prompts</h1>
                <p className="text-muted-foreground">
                  {userProfile ? `Manage and organize your AI prompts, ${userProfile.username}` : "Manage and organize your AI prompts"}
                </p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {favoritePrompts.map((prompt) => (
                    <StandardPromptCard
                      key={prompt.id}
                      id={prompt.id}
                      title={prompt.title}
                      description={prompt.description}
                      rating={prompt.rating}
                      uses={prompt.uses}
                      price={prompt.price}
                      featured={prompt.featured}
                      isPrivate={prompt.isPrivate}
                      isFavorite={prompt.isFavorite}
                      tags={prompt.tags}
                      category={prompt.category}
                      authorName={userProfile?.username || "You"}
                      isOwned={true}
                      onEdit={handleEditPrompt}
                      onDelete={handleDeletePrompt}
                      onToggleFavorite={handleToggleFavorite}
                      onCopy={handleCopyPrompt}
                      copiedId={copiedId}
                      content={prompt.content}
                      onPublish={handlePublishPrompt}
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
                  rating={prompt.rating || 0}
                  uses={prompt.uses || 0}
                  price={prompt.price || 0}
                  featured={prompt.featured || false}
                  isPrivate={prompt.isPrivate || false}
                  isFavorite={prompt.isFavorite || false}
                  tags={prompt.tags || []}
                  category={prompt.category || ""}
                  authorName={prompt.authorName || ""}
                  isOwned={true} // Since this is MyPromptsPage
                  isPublished={prompt.isPublished || false}
                  onEdit={handleEditPrompt}
                  onDelete={handleDeletePrompt}
                  onToggleFavorite={handleToggleFavorite}
                  onCopy={handleCopyPrompt}
                  onPublish={handlePublishPrompt}
                  copiedId={copiedId}
                  content={prompt.content || ""}
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
                  disabled={currentPage >= totalPages}
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