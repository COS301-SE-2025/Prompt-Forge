"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Star, Search, Filter, Plus } from "lucide-react"
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
  // const [filteredPrompts, setFilteredPrompts] = useState<MyPrompt[]>([])
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
  const [avgRatingMap, setAvgRatingMap] = useState<Record<string, number>>({})
  const [totalPages, setTotalPages] = useState<number>(0)
  const [promptCount, setPromptCount] = useState<number>(0)

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
        console.log("prompts",prompts);
        
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
              isPrivate: p.visibility !== "public",
              isFavorite: false, // Default, backend does not provide
              authorName: p.authorName || userProfile?.username || "You",
              source:p.source,
              isPublished: p.visibility === "public" || p.publishedAt !== null, // Add this
              publishedAt: p.publishedAt // Add this
            }
          })
        )
        setMyPrompts(mappedPrompts)
        // setFilteredPrompts(mappedPrompts)

        const tagNamesString = localStorage.getItem("tagNames");
        let tags = ["all"]
        if (tagNamesString != null){
          tags = [...tags,...JSON.parse(tagNamesString)];
        }
        else{
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
  }, [isAuthenticated, navigate, userProfile,currentPage])

  // Fetch avgRating for each prompt using the reviews endpoint
  //TODO: change the function to not send a request to the backend for each prompt
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

  // Filtering logic
  useEffect(() => {
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
              uses: 0,   // Default, backend does not provide
              featured: p.featured || false,
              price: p.price || 0,
              isPrivate: p.visibility !== "public",
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
          tags = [...tags,...JSON.parse(tagNamesString)];          
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
    
    fetchMyPrompts()
  }, [searchQuery, selectedCategory, selectedFilter])

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
      instructions: "",
      expectedOutput: "",
      useCase: "",
      isPrivate: prompt.isPrivate
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
                    className={`w-full justify-start text-sm h-8 px-2 ${selectedFilter === filter.value ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
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
                    className={`w-full justify-start text-sm h-8 px-2 ${selectedCategory === category ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                      }`}
                    onClick={() => {setSelectedCategory(category)
                      setCurrentPage(1)}}
                  >
                    {category === "all" ? "All" : category}
                    {/* {category === "all"?"yesss":"nooo"} */}
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
            {/* {selectedFilter === "all" && selectedCategory === "all" && !searchQuery && favoritePrompts.length > 0 && (
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
                      rating={avgRatingMap[prompt.id] ?? 0}
                      uses={prompt.uses}
                      price={prompt.price}
                      featured={prompt.featured}
                      isPrivate={prompt.isPrivate}
                      isFavorite={prompt.isFavorite}
                      tags={prompt.tags}
                      category={prompt.category}
                      authorName={prompt.authorName || userProfile?.username || "You"}
                      source={prompt.source}
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
            )} */}

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
                {promptCount} prompt{promptCount !== 1 ? "s" : ""} found
              </div>
            </div>

            {/* Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                  isOwned={true} // Since this is MyPromptsPage
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
            {promptCount=== 0 && !loading && (
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
                      setCurrentPage(1);
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
                      className={`min-w-[2.5rem] ${currentPage === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""}`}
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
