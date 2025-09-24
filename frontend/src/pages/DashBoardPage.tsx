import { API_BASE_URL } from '../config/api';
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Star, Activity, Rocket, TrendingUp } from "lucide-react"
import { StandardPromptCard } from "@/components/StandardPromptCard"
import { MyPrompt } from '@/Models/MyPrompt';
import WidgetManager, { type Widget } from "@/components/WidgetManager"
import { dashProfileService } from '../services/dashprofileService';


// Category breakdown widget
import { PieChart } from "lucide-react";



type DashboardData = {
  monthlyUsage: number
  totalDownloads: number
  averageRating: number
  totalPrompts: number
  topPrompts: any[]
}

type UserProfile = {
  username: string
  bio: string
  badges: any[]
  followingCount: number
  followersCount: number
  profilePicture?: string
}

// Update the allowedTags array to match the actual Category type

const allowedTags = [
  "Business",
  "Coding",
  "Science",
  "Technical",
  "Health",
  "General"
] as const;

export default function DashboardPage() {
  // Category breakdown state
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});
  const [loadingCategoryBreakdown, setLoadingCategoryBreakdown] = useState(true);
  const navigate = useNavigate()

  // Auth and profile
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=80&width=80")
  const [userBio, setUserBio] = useState(
    "AI prompt engineer specializing in creative writing and technical documentation.",
  )
  const [username, setUsername] = useState("theo_unknown")
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)

  // Prompts and ratings
  const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([])
  const [loadingPrompts, setLoadingPrompts] = useState(true)
  const [avgRatingMap, setAvgRatingMap] = useState<Record<string, number>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Dashboard
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Top user prompts (by avgRating)
  const [topUserPrompts, setTopUserPrompts] = useState<(MyPrompt & { avgRating: number })[]>([])
  const [loadingTopUserPrompts, setLoadingTopUserPrompts] = useState(true)
  //Analytics Overview

const [monthlyPromptCounts, setMonthlyPromptCounts] = useState<Record<number, number>>({});
const [loadingMonthlyCounts, setLoadingMonthlyCounts] = useState(true);

// Add this useEffect to fetch monthly prompt counts
  useEffect(() => {
    const fetchMonthlyPromptCounts = async () => {
      if (!isAuthenticated) return;
      setLoadingMonthlyCounts(true);
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/monthly-prompt-counts`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          setMonthlyPromptCounts(data);
        } else {
          setMonthlyPromptCounts({});
        }
      } catch {
        setMonthlyPromptCounts({});
      }
      setLoadingMonthlyCounts(false);
    };
    if (isAuthenticated) fetchMonthlyPromptCounts();
  }, [isAuthenticated]);

  // Widget management with default widgets
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "total-prompts",
      type: "stat",
      title: "Total Prompts",
      icon: <Rocket size={20} color="#60A5FA" />,
      component: <div></div>,
      isActive: true,
      position: 0,
      size: "small",
      minSize: "small",
    },
    {
      id: "average-rating",
      type: "stat",
      title: "Average Rating",
      icon: <Star size={20} color="#60A5FA" />,
      component: <div></div>,
      isActive: true,
      position: 1,
      size: "small",
      minSize: "small",
    },
    {
      id: "bounce-rate",
      type: "stat",
      title: "Bounce Rate Analytics",
      icon: <TrendingUp size={20} color="#FF6B6B" />,
      component: <div></div>,
      isActive: true,
      position: 2,
      size: "medium",
      minSize: "medium",
    },
    {
      id: "category-breakdown",
      type: "list",
      title: "Category Breakdown",
      icon: <PieChart size={20} color="#60A5FA" />,
      component: <CategoryBreakdownWidget data={categoryBreakdown} loading={loadingCategoryBreakdown} />,
      isActive: true,
      position: 3,
      size: "medium",
      minSize: "medium",
    },
    {
      id: "top-prompts",
      type: "list",
      title: "Your Top Rated Prompts",
      icon: <Star size={24} color="#60A5FA" />,
      component: <div></div>,
      isActive: true,
      position: 4,
      size: "medium",
      minSize: "medium",
    },
    {
      id: "recent-activity",
      type: "list",
      title: "Recent Activity",
      icon: <Activity size={24} color="#60A5FA" />,
      component: <div></div>,
      isActive: true,
      position: 5,
      size: "medium",
      minSize: "medium",
    },
  ])
  // Fetch category breakdown
  useEffect(() => {
    const fetchCategoryBreakdown = async () => {
      setLoadingCategoryBreakdown(true);
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/category-breakdown`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          setCategoryBreakdown(data);
        } else {
          setCategoryBreakdown({});
        }
      } catch {
        setCategoryBreakdown({});
      }
      setLoadingCategoryBreakdown(false);
    };
    if (isAuthenticated) fetchCategoryBreakdown();
  }, [isAuthenticated]);
// Category breakdown widget component
function CategoryBreakdownWidget({ data, loading }: { data: Record<string, number>, loading: boolean }) {
  if (loading) {
    return <div className="flex items-center justify-center h-24"><span className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3ebb9e] mr-2"></span>Loading...</div>;
  }
  const categories = Object.entries(data);
  if (!categories.length) {
    return <div className="text-muted-foreground">No category data available.</div>;
  }
  return (
    <div className="space-y-2">
      {categories.map(([category, count]) => (
        <div key={category} className="flex justify-between items-center py-1 border-b border-border last:border-b-0">
          <span className="font-medium">{category}</span>
          <span className="text-sm text-muted-foreground">{count}</span>
        </div>
      ))}
    </div>
  );
}

  // Auth check
  useEffect(() => {
    const checkAuth = () => {
      const username = localStorage.getItem("username")
      const userId = localStorage.getItem("userId")
      if (username && username !== "Guest" && userId) {
        setIsAuthenticated(true)
        setCurrentUserId(userId)
      } else {
        setIsAuthenticated(false)
        navigate("/login")
      }
      setAuthLoading(false)
    }
    checkAuth()
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "username" || e.key === "userId") checkAuth()
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [navigate])

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return
      
      try {
        const profile: UserProfile = await dashProfileService.getDashboardProfile()
        
        setUserProfile(profile)
        setUsername(profile.username)
        setUserBio(profile.bio || "AI prompt engineer specializing in creative writing and technical documentation.")
        setProfileImage(profile.profilePicture || "/placeholder.svg?height=80&width=80")
        setFollowers(profile.followersCount)
        setFollowing(profile.followingCount)
        
        // Update localStorage with new profile data
        localStorage.setItem("username", profile.username)
        if (profile.bio) localStorage.setItem("userBio", profile.bio)
        if (profile.profilePicture) localStorage.setItem("userProfileImage", profile.profilePicture)
        
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // Check if it's an authentication error
        if (error instanceof Error && error.message.includes('401')) {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          localStorage.removeItem("username")
          setIsAuthenticated(false)
          navigate("/login")
        }
      }
    }
    
    fetchUserProfile()
  }, [isAuthenticated, navigate])

  // Fetch user's prompts
  useEffect(() => {
    const fetchMyPrompts = async () => {
      if (!isAuthenticated) {
        setLoadingPrompts(false)
        return
      }
      setLoadingPrompts(true)
      try {
        const userId = localStorage.getItem("userId")
        if (!userId) {
          setMyPrompts([])
          setLoadingPrompts(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/prompts/author/${userId}?page=0&size=12`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },

        });
        if (response.ok) {
          let page = (await response.json());
        
          let prompts = page.content;
          // console.log("prompts:", prompts);
          
          if (!Array.isArray(prompts)) prompts = [];


          const mappedPrompts: MyPrompt[] = prompts.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || "",
            content: p.content || "",
            category: p.category || "General",
            tags: p.tagNames || [],
            createdAt: p.createdAt,
            updatedAt: p.publishedAt || p.createdAt,
            rating: 0,
            uses: p.uses || 0,
            featured: p.featured || false,
            price: p.price || 0,
            isPrivate: p.visibility === "private",
            isFavorite: p.isFavorite || false,
            source:p.source
          }));
          setMyPrompts(mappedPrompts);
        } else if (response.status === 401) {
          localStorage.removeItem("username")
          localStorage.removeItem("userId")
          setIsAuthenticated(false)
          navigate("/login")
        } else {
          setMyPrompts([])
        }
      } catch {
        setMyPrompts([])
      }
      setLoadingPrompts(false)
    }
    fetchMyPrompts()
  }, [isAuthenticated, navigate])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
        if (response.ok) {
          const data = await response.json()
          setDashboard(data)
        } else if (response.status === 401) {
          localStorage.removeItem("username")
          localStorage.removeItem("userId")
          setIsAuthenticated(false)
          navigate("/login")
          return
        } else {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    if (isAuthenticated) fetchDashboardData()
  }, [isAuthenticated, navigate])

  // Fetch avgRating for each prompt
  useEffect(() => {
    const fetchRatings = async () => {
      if (!myPrompts.length) return
      const newMap: Record<string, number> = {}
      await Promise.all(
        myPrompts.map(async (prompt) => {
          try {
            const response = await fetch(`${API_BASE_URL}/store/prompts/${prompt.id}/reviews`, {
              method: "GET",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            })
            if (response.ok) {
              const data = await response.json()
              const reviews = data?.content || []
              const avg =
                reviews.length > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length : 0
              newMap[prompt.id] = avg
            } else {
              newMap[prompt.id] = 0
            }
          } catch {
            newMap[prompt.id] = 0
          }
        }),
      )
      setAvgRatingMap(newMap)
    }
    fetchRatings()
  }, [myPrompts])

  // Compute top user prompts (by avgRating, descending)
  useEffect(() => {
    setLoadingTopUserPrompts(true)
    if (!myPrompts.length) {
      setTopUserPrompts([])
      setLoadingTopUserPrompts(false)
      return
    }
    const promptsWithRating = myPrompts.map((p) => ({
      ...p,
      avgRating: avgRatingMap[p.id] ?? 0,
    }))
    const sorted = promptsWithRating
      .filter((p) => p.avgRating > 0)
      .sort((a, b) => b.avgRating - a.avgRating || b.uses - a.uses)
      .slice(0, 5)
    setTopUserPrompts(sorted)
    setLoadingTopUserPrompts(false)
  }, [myPrompts, avgRatingMap])

  // Load profile info from localStorage and listen for changes
  useEffect(() => {
    const savedImage = localStorage.getItem("userProfileImage")
    if (savedImage) setProfileImage(savedImage)
    const savedBio = localStorage.getItem("userBio")
    if (savedBio) setUserBio(savedBio)
    const savedUsername = localStorage.getItem("username")
    if (savedUsername) setUsername(savedUsername)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userProfileImage") setProfileImage(e.newValue || "/placeholder.svg?height=80&width=80")
      if (e.key === "userBio") setUserBio(e.newValue || "")
      if (e.key === "username") setUsername(e.newValue || "theo_unknown")
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Notification helper
  const showNotification = (type: "success" | "error", title: string, message: string) => {
    const bg =
      type === "success"
        ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
        : "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200"
    const icon =
      type === "success"
        ? `<svg class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>`
        : `<svg class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>`
    const notification = document.createElement("div")
    notification.className = `fixed bottom-4 right-4 ${bg} border p-4 rounded-lg shadow-lg z-50 max-w-md animate-fade-in transition-all duration-300`
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">${icon}</div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium">${title}</h3>
          <div class="mt-1 text-xs opacity-90">${message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 flex-shrink-0 text-current hover:opacity-70 transition-opacity">
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    `
    document.body.appendChild(notification)
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0'
        notification.style.transform = 'translateX(100%)'
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }
    }, 5000)
  }

  // Handlers for StandardPromptCard
  const handleDeletePrompt = async (id: string) => {
    try {
      // Let the backend handle the deletion logic (it knows whether user is owner or not)
      const response = await fetch(`${API_BASE_URL}/prompts/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      
      if (response.ok) {
        // Handle successful responses
        try {
          const responseData = await response.json()
          if (responseData.message) {
            // Non-owner removal from purchased library
            setMyPrompts((prev) => prev.filter((p) => p.id !== id))
            showNotification("success", "Prompt removed", responseData.message)
          } else {
            // Owner deletion of private prompt
            setMyPrompts((prev) => prev.filter((p) => p.id !== id))
            showNotification("success", "Prompt deleted", "Your prompt has been successfully deleted.")
          }
        } catch {
          // Empty response body for successful deletion
          setMyPrompts((prev) => prev.filter((p) => p.id !== id))
          showNotification("success", "Prompt deleted", "Your prompt has been successfully deleted.")
        }
      } else {
        // Handle different error status codes
        let errorMessage = "An error occurred while deleting the prompt."
        let errorTitle = "Delete failed"
        
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // No JSON response body
        }
        
        switch (response.status) {
          case 401:
            errorTitle = "Authentication required"
            errorMessage = errorMessage || "Please log in to delete prompts."
            break
          case 403:
            errorTitle = "Access denied"
            if (errorMessage.includes("Cannot delete public prompts")) {
              errorMessage = "Cannot delete public prompts. Please unpublish the prompt first to make it private."
            } else if (errorMessage.includes("You can only remove prompts you have purchased")) {
              errorMessage = "You can only remove prompts from your purchased library."
            }
            break
          case 404:
            errorTitle = "Prompt not found"
            errorMessage = "The prompt you're trying to delete no longer exists."
            break
          default:
            errorTitle = "Delete failed"
            errorMessage = errorMessage || `Failed to delete prompt (Status: ${response.status})`
        }
        
        showNotification("error", errorTitle, errorMessage)
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
      showNotification("error", "Network error", "Could not delete prompt. Please check your connection and try again.")
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompts/${id}/favorite`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
      }
    } catch {
      setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
    }
  }

  const handleCopyPrompt = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setCopiedId(null)
    }
  }

  const handleEditPrompt = (prompt: MyPrompt) => {
    const editData = {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      promptText: prompt.content,
      expectedOutput: "",
      isPrivate: prompt.isPrivate,
    }
    sessionStorage.setItem("editPromptData", JSON.stringify(editData))
    navigate("/submit")
  }

  const handleUpdateWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets)
    // Save to localStorage for persistence
    localStorage.setItem("dashboardWidgets", JSON.stringify(newWidgets))
  }

  // Load saved widgets on mount
  useEffect(() => {
    const savedWidgets = localStorage.getItem("dashboardWidgets")
    if (savedWidgets) {
      try {
        const parsedWidgets = JSON.parse(savedWidgets)
        // Ensure all widgets have the required size properties
        const updatedWidgets = parsedWidgets.map((widget: any) => ({
          ...widget,
          size: widget.size || "small",
          minSize: widget.minSize || "small",
        }))
        setWidgets(updatedWidgets)
      } catch {
        // Keep default widgets if parsing fails
      }
    }
  }, [])

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Dashboard Data</h3>
          <p className="text-muted-foreground mb-4">Unable to load dashboard information</p>
          <Button onClick={() => window.location.reload()} className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  // Top 4 for "My Prompts" section
  const displayPrompts = myPrompts.slice(0, 4)

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-card border-r border-border p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-2">
              <img
                src={profileImage || "/placeholder.svg?height=80&width=80"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover cursor-pointer"
                onClick={() => navigate(`/profile-settings`)}
              />
              <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-card"></div>
            </div>
            <h3
              className="font-medium cursor-pointer hover:text-[#3ebb9e]"
              onClick={() => navigate(`/profile-settings`)}
            >
              {username}
            </h3>
            <div className="grid grid-cols-3 gap-4 w-full mt-4">
              <div className="text-center">
                <div className="font-semibold">{myPrompts.length}</div>
                <div className="text-xs text-muted-foreground">Prompts</div>
              </div>
              <div
                className="text-center cursor-pointer hover:text-[#3ebb9e]"
                onClick={() => navigate(`/profile/${currentUserId}`)}
              >
                <div className="font-semibold">{followers}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div
                className="text-center cursor-pointer hover:text-[#3ebb9e]"
                onClick={() => navigate(`/profile/${currentUserId}`)}
              >
                <div className="font-semibold">{following}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-medium">Bio</p>
            <p className="mt-0 max-h-[340px] overflow-auto text-muted-foreground">{userBio}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

          {/* Widget Manager */}
          <div className="mb-8 ">
            <WidgetManager
              widgets={widgets}
              onUpdateWidgets={handleUpdateWidgets}
              dashboardData={{
                ...dashboard,
                categoryBreakdown: categoryBreakdown
              }}
              topUserPrompts={topUserPrompts}
              analyticsOverviewData={monthlyPromptCounts}
              loadingAnalyticsOverview={loadingMonthlyCounts}
              loadingTopUserPrompts={loadingTopUserPrompts}
            />
          </div>

          {/* My Prompts Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">My Prompts</h2>
              <Link to="/my-prompts">
                <Button variant="outline" size="sm" className="flex items-center bg-transparent">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loadingPrompts ? (
                <div className="flex justify-center items-center h-32 col-span-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3ebb9e] mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading prompts...</p>
                  </div>
                </div>
              ) : myPrompts.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground mb-4">No prompts found.</p>
                  <Link to="/submit">
                    <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">Create Your First Prompt</Button>
                  </Link>
                </div>
              ) : (
                displayPrompts.map((prompt, idx) => {
                  const tags = prompt.tags.map((tag, tagIdx) =>
                    allowedTags.includes(tag as typeof allowedTags[number])
                      ? (tag as typeof allowedTags[number])
                      : "General"
                  );
                  return (
                    <div key={prompt.id + '-' + idx}>
                      <StandardPromptCard
                        id={prompt.id}
                        title={prompt.title}
                        description={prompt.description}
                        rating={avgRatingMap[prompt.id] ?? 0}
                        uses={prompt.uses}
                        price={prompt.price}
                        featured={prompt.featured}
                        isPrivate={prompt.isPrivate}
                        isFavorite={prompt.isFavorite}
                        tags={tags.map((tag, tagIdx) => tag )}
                        category={prompt.category}
                        authorName={username}
                        isOwned={true}
                        source={prompt.source}
                        onEdit={handleEditPrompt}
                        onDelete={handleDeletePrompt}
                        onToggleFavorite={handleToggleFavorite}
                        onCopy={handleCopyPrompt}
                        copiedId={copiedId}
                        content={prompt.content}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
