"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Star, Search, Filter, Plus, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Link } from "react-router-dom"
import { StandardPromptCard } from "../components/StandardPromptCard"
import httpClient from "../services/httpClient"
import { MyPrompt } from "@/models/MyPrompt"
import { UserProfile } from "@/models/User"
import { PromptService } from "@/services/promptService"

const PROMPTS_PER_PAGE = 12

export default function MyPromptsPage() {
  const promptService = new PromptService();
  const navigate = useNavigate()
  const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([])
  const [allUserPrompts, setAllUserPrompts] = useState<MyPrompt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingSearch, setPendingSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>(["all"])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [avgRatingMap, setAvgRatingMap] = useState<Record<string, number>>({})
  const [totalPages, setTotalPages] = useState<number>(0)
  const [promptCount, setPromptCount] = useState<number>(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Check authentication and get user profile
  useEffect(() => {
    const checkAuthAndGetProfile = async () => {
      try {
        const username = localStorage.getItem('username')
        if (!username || username === 'Guest') {
          console.log("User not authenticated, redirecting to login")

          navigate('/login')
          return
        }
        setIsAuthenticated(true)


        //Get user profile using JWT token (sent via cookies)
        console.log("Fetching user profile...")

        const response = await httpClient.get('/user/me')
        if (response.ok) {
          const userData: UserProfile = await response.json()
          setUserProfile(userData)


          console.log("User profile loaded:", userData)
        } else if (response.status === 401) {
          console.log("Unauthorized, redirecting to login")

          localStorage.removeItem('username')
          localStorage.removeItem('userId')
          navigate('/login')
          return
        }
      } catch (error) {


        console.error("Auth check failed:", error)

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

        if (userProfile?.userId) {
          authorId = userProfile.userId

          console.log("Using authorId from profile:", authorId)
        }
        else { //Fallback: get from localStorage if profile not loaded yet
          authorId = localStorage.getItem('userId')
          console.log("Using authorId from localStorage:", authorId)
        }

        if (!authorId) {
          console.log("No authorId available, using empty prompts")

          setMyPrompts([])
          // setFilteredPrompts([])
          setLoading(false)
          return
        }

        //Fetch prompts using JWT authentication (cookies)
        console.log("Fetching prompts for authorId:", authorId)
        const userPromptsPage = await promptService.getAuthoredAndPurchasedPrompts(authorId, selectedCategory, selectedFilter, currentPage - 1, 12)
        setTotalPages(userPromptsPage.totalPages);
        setPromptCount(userPromptsPage.totalElements)


        let prompts = userPromptsPage.content
        console.log("prompts", prompts);

        if (!Array.isArray(prompts)) prompts = []
        // Map backend fields to frontend MyPrompt interface
        const mappedPrompts: MyPrompt[] = await Promise.all(
          prompts.map(async (p: any) => {
            const { averageRating } = await promptService.getPromptRatingSummary(p.id)
            return {
              id: p.id,
              title: p.title,
              description: p.description || "",
              content: p.content || "",
              category: "General", // Default, backend does not provide
              tags: p.tagNames || [],
              createdAt: p.createdAt,
              updatedAt: p.publishedAt || p.createdAt,
              rating: averageRating || 0, // Default, backend does not provide
              uses: p.usageCount,   // Default, backend does not provide
              featured: p.featured || false,
              price: p.price || 0,
              isPrivate: p.visibility === "private",
              isFavorite: false, // Default, backend does not provide
              authorName: p.authorName || userProfile?.username || "You",
              source: p.source,
              isPublished: p.visibility === "public" || p.publishedAt !== null, // Add this
              publishedAt: p.publishedAt // Add this
            }
          })
        )
        setMyPrompts(mappedPrompts)
        // setFilteredPrompts(mappedPrompts)

        const tagNamesString = localStorage.getItem("tagNames");
        let tags = ["all"]
        if (tagNamesString != null) {
          tags = [...tags, ...JSON.parse(tagNamesString)];
        }
        else {
          //TODO: fetch tags from API
        }
        setAvailableCategories(tags)

      } catch (error) {

        console.error("Error fetching prompts:", error)

        setMyPrompts([])
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && (userProfile?.userId || localStorage.getItem('userId'))) {
      fetchMyPrompts()
    }
  }, [isAuthenticated, navigate, userProfile, currentPage])


  useEffect(() => {
    const fetchRatings = async () => {
      if (!myPrompts.length) return
      const newMap: Record<string, number> = {}
      await Promise.all(
        myPrompts.map(async (prompt) => {
          try {
            const response = await httpClient.get(`/store/prompts/${prompt.id}/reviews`)
            if (response.ok) {
              const data = await response.json()
              const reviews = data?.content || []
              const avg =
                reviews.length > 0
                  ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
                  : 0
              newMap[prompt.id] = avg
            } else {
              newMap[prompt.id] = 0
            }
          } catch {
            newMap[prompt.id] = 0
          }
        })
      )
      setAvgRatingMap(newMap)
    }
    fetchRatings()
  }, [myPrompts])

    //TODO: create a global fetchMyPrompts function for reuse (the one below is literally the same as the other)
    const fetchMyPrompts = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        let authorId: string | null = null

        if (userProfile?.userId) {
          authorId = userProfile.userId

          console.log("Using authorId from profile:", authorId)
        }
        else { //Fallback: get from localStorage if profile not loaded yet
          authorId = localStorage.getItem('userId')
          console.log("Using authorId from localStorage:", authorId)
        }

        if (!authorId) {
          console.log("No authorId available, using empty prompts")

          setMyPrompts([])
          // setFilteredPrompts([])
          setLoading(false)
          return
        }

        //Fetch prompts using JWT authentication (cookies)
        console.log("Fetching prompts for authorId:", authorId)

        const userPromptsPage = await promptService.getAuthoredAndPurchasedPrompts(authorId, selectedCategory, selectedFilter, currentPage - 1, 12)
        setTotalPages(userPromptsPage.totalPages);
        setPromptCount(userPromptsPage.totalElements)

        let prompts = userPromptsPage.content

        if (!Array.isArray(prompts)) prompts = []

        // Map backend fields to frontend MyPrompt interface
        const mappedPrompts: MyPrompt[] = await Promise.all(
          prompts.map(async (p: any) => {
            const { averageRating } = await promptService.getPromptRatingSummary(p.id)
            return {
              id: p.id,
              title: p.title,
              description: p.description || "",
              content: p.content || "",
              category: "General", // Default, backend does not provide
              tags: p.tagNames || [],
              createdAt: p.createdAt,
              updatedAt: p.publishedAt || p.createdAt,
              rating: averageRating || 0, // Default, backend does not provide
              uses: p.usageCount,   // Default, backend does not provide
              featured: p.featured || false,
              price: p.price || 0,
              isPrivate: p.visibility === "private",
              isFavorite: false, // Default, backend does not provide
              authorName: p.authorName || userProfile?.username || "You",
              source: p.source,
              isPublished: p.visibility === "public" || p.publishedAt !== null, // Add this
              publishedAt: p.publishedAt // Add this
            }
          })
        )
        setMyPrompts(mappedPrompts)
        // setFilteredPrompts(mappedPrompts)

        const tagNamesString = localStorage.getItem("tagNames");
        let tags = ["all"]
        if (tagNamesString != null) {
          tags = [...tags, ...JSON.parse(tagNamesString)];
        }
        else {
          //TODO: fetch tags from API
        }
        setAvailableCategories(tags)

      } catch (error) {

        console.error("Error fetching prompts:", error)

        setMyPrompts([])
      } finally {
        setLoading(false)
      }
    }

  const filters = [
    { value: "all", label: "All" },
    { value: "favorites", label: "Favorites" },
    { value: "recent", label: "Recent" },
    { value: "popular", label: "Popular" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
    { value: "purchased", label: "Purchased" },
  ]

  const handleDeletePrompt = async (id: string) => {
    try {
      const response = await httpClient.delete(`/prompts/${id}`)
      if (response.ok) {
        setMyPrompts((prev) => prev.filter((p) => p.id !== id))


      } else {
        setMyPrompts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (error) {

      console.error("Error deleting prompt:", error)
      // For now, still remove from UI even if backend fails

      setMyPrompts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleToggleFavorite = async (id: string) => {
    setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
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
      expectedOutput: "", // Fill if available
      isPrivate: prompt.isPrivate,
      isPublished: prompt.isPublished, // <-- Add this
      content: prompt.content // <-- Add this
    }
    sessionStorage.setItem("editPromptData", JSON.stringify(editData))
    navigate("/submit")
  }

  const handlePublishPrompt = async (id: string, isCurrentlyPublished: boolean) => {
    try {

      const action = isCurrentlyPublished ? "unpublish" : "publish"

      console.log(`${action}ing prompt ${id}...`)
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


      console.log(`Prompt ${action}ed successfully`)
    } catch (error) {
      console.error(`Error ${isCurrentlyPublished ? 'unpublishing' : 'publishing'} prompt:`, error)
    }

  }

  // 1. State to hold all prompts and search input
  // const [allUserPrompts, setAllUserPrompts] = useState<MyPrompt[]>([])
  // const [pendingSearch, setPendingSearch] = useState("")

  // 2. Fetch ALL prompts for the user once (no search param)
  useEffect(() => {
    const fetchAllPrompts = async () => {
      if (!isAuthenticated) return
      let authorId: string | null = userProfile?.userId || localStorage.getItem('userId')
      if (!authorId) {
        setAllUserPrompts([])
        return
      }
      const userPromptsPage = await promptService.getAuthoredAndPurchasedPrompts(authorId, "all", "all", 0, 1000)
      let prompts = userPromptsPage.content
      if (!Array.isArray(prompts)) prompts = []
      const mappedPrompts: MyPrompt[] = await Promise.all(
        prompts.map(async (p: any) => {
          const { averageRating } = await promptService.getPromptRatingSummary(p.id)
          return {
            id: p.id,
            title: p.title,
            description: p.description || "",
            content: p.content || "",
            category: "General",
            tags: p.tagNames || [],
            createdAt: p.createdAt,
            updatedAt: p.publishedAt || p.createdAt,
            rating: averageRating || 0,
            uses: p.usageCount,
            featured: p.featured || false,
            price: p.price || 0,
            isPrivate: p.visibility === "private",
            isFavorite: false,
            authorName: p.authorName || userProfile?.username || "You",
            source: p.source,
            isPublished: p.visibility === "public" || p.publishedAt !== null,
            publishedAt: p.publishedAt
          }
        })
      )
      setAllUserPrompts(mappedPrompts)
    }
    if (isAuthenticated && (userProfile?.userId || localStorage.getItem('userId'))) {
      fetchAllPrompts()
    }
  }, [isAuthenticated, userProfile])

  // 3. Filter/search/paginate on the frontend
  useEffect(() => {
    let filtered = allUserPrompts

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p =>
        (p.category || "").toLowerCase() === selectedCategory.toLowerCase() ||
        (p.tags || []).map(t => (typeof t === "string" ? t.toLowerCase() : "")).includes(selectedCategory.toLowerCase())
      )
    }

    // Filter type
    if (selectedFilter === "favorites") filtered = filtered.filter(p => p.isFavorite)
    if (selectedFilter === "private") filtered = filtered.filter(p => p.isPrivate)
    if (selectedFilter === "public") filtered = filtered.filter(p => !p.isPrivate)

    // Search: if searchQuery is empty, show all prompts
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase()
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          (p.tags || []).some(tag => typeof tag === "string" && tag.toLowerCase().includes(q))
      )
    }

    // Pagination
    const start = (currentPage - 1) * PROMPTS_PER_PAGE
    const end = start + PROMPTS_PER_PAGE
    setMyPrompts(filtered.slice(start, end))
    setPromptCount(filtered.length)
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PROMPTS_PER_PAGE)))
  }, [allUserPrompts, searchQuery, selectedCategory, selectedFilter, currentPage])

  // 4. Search bar: only search when Enter is pressed
  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setSearchQuery(pendingSearch)
      setCurrentPage(1)
    }
  }

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
        {/* Sidebar - Hide on mobile, overlay when shown */}
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
            className="absolute top-3 right-2 z-10 bg-muted rounded-full p-1 shadow hover:bg-background transition hidden lg:block"
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
            <div className="h-full flex flex-col pt-8 lg:pt-0">
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
                      onClick={() => {
                        setSelectedFilter(filter.value)
                        setShowFilters(false) // Close on mobile after selection
                      }}
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
                      onClick={() => {
                        setSelectedCategory(category)
                        setCurrentPage(1)
                        setShowFilters(false) // Close on mobile after selection
                      }}
                    >
                      {category === "all" ? "All" : category}
                    </Button>
                  ))}
                </div>
              </div>
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
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
              <div className="mb-3 sm:mb-0">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">My Prompts</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {userProfile ? `Manage and organize your AI prompts, ${userProfile.username}` : "Manage and organize your AI prompts"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="lg:hidden" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
                <Link to="/submit">
                  <Button 
                    size="sm"
                    className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                  >
                    <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">New Prompt</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="relative">
                <Input
                  placeholder="        Search for prompts..."
                  className="bg-muted border-muted pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10"
                  value={pendingSearch}
                  onChange={(e) => {
                    setPendingSearch(e.target.value)
                    if (e.target.value === "") {
                      setSearchQuery("")
                      setCurrentPage(1)
                    }
                  }}
                  onKeyDown={handleSearch}
                />
                {pendingSearch === "" && (
                  <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-medium">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategory !== "all"
                    ? `${selectedCategory} Prompts`
                    : selectedFilter !== "all"
                      ? `${filters.find((f) => f.value === selectedFilter)?.label} Prompts`
                      : "All Prompts"}
              </h2>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {promptCount} prompt{promptCount !== 1 ? "s" : ""} found
              </div>
            </div>

            {/* Prompts Grid - 2 columns on mobile, 2 on small screens, 3 on large */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
              {myPrompts.map((prompt) => (
                <StandardPromptCard
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.description}
                  rating={avgRatingMap[prompt.id] ?? 0}
                  uses={prompt.uses || 0}
                  price={prompt.price || 0}
                  featured={prompt.featured || false}
                  isPrivate={prompt.isPrivate || false}
                  isFavorite={prompt.isFavorite || false}
                  tags={prompt.tags || []}
                  category={prompt.category || ""}
                  authorName={prompt.authorName || ""}
                  isOwned={true}
                  isPublished={prompt.isPublished || false}
                  source={prompt.source}
                  onEdit={handleEditPrompt}
                  onDelete={handleDeletePrompt}
                  onToggleFavorite={handleToggleFavorite}
                  onCopy={handleCopyPrompt}
                  onPublish={handlePublishPrompt}
                  copiedId={copiedId}
                  content={prompt.content}
                />
              ))}
            </div>

            {/* Empty State */}
            {promptCount === 0 && !loading && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    {myPrompts.length === 0 ? "No prompts yet" : "No prompts found"}
                  </h3>
                  <p className="text-sm sm:text-base px-4">
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
                      setCurrentPage(1)
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}

            {/* Pagination - Responsive */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-6 sm:mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 sm:h-9 sm:px-3"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 sm:h-9 sm:px-3"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
