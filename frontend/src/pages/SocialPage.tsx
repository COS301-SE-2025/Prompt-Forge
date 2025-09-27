"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Users, UserPlus, Swords, Search, Trophy, X, Bell, Zap, Loader2, TrendingUp, Sparkles, Home, MessageSquare, User, RotateCcw } from "lucide-react"
import { UserCard } from "../components/UserCard"
import {
  ChallengeAPI,
  SocialAPI,
  type SocialUser,
  type Prompt,
  type Challenge,
  API_BASE_URL,
  cancelActiveGame,
} from "../services/socialService"

// WebSocket connection
let socket: any = null

export default function SocialPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("discover")
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [selectedOpponent, setSelectedOpponent] = useState<SocialUser | null>(null)
  const [users, setUsers] = useState<SocialUser[]>([])
  const [following, setFollowing] = useState<SocialUser[]>([])
  const [followers, setFollowers] = useState<SocialUser[]>([])
  const [loading, setLoading] = useState(true)
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set())
  const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({
    discover: false,
    following: false,
    followers: false,
  })
  const [challengeMessage, setChallengeMessage] = useState("")
  const [selectedGameType, setSelectedGameType] = useState<"PROMPT_CREATION" | "REVERSE_PROMPT">("PROMPT_CREATION")
  const [challengeLoading, setChallengeLoading] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<SocialUser | null>(null)
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([])
  const [activeGameError, setActiveGameError] = useState<string | null>(null)
  const [activeGameId, setActiveGameId] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({
    discover: 1,
    following: 1,
    followers: 1,
  })
  const [totalPages, setTotalPages] = useState<{ [key: string]: number }>({
    discover: 1,
    following: 1,
    followers: 1,
  })
  const [totalElements, setTotalElements] = useState<{ [key: string]: number }>({
    discover: 0,
    following: 0,
    followers: 0,
  })

  const USERS_PER_PAGE = 12

  // Add state to track failed avatars
  const [failedAvatars, setFailedAvatars] = useState<{ [id: string]: boolean }>({})

  // Helper function to ensure correct isFollowing status
  const applyFollowingStatus = (users: SocialUser[]) => {
    return users.map(user => ({
      ...user,
      isFollowing: followedUserIds.has(user.userId)
    }))
  }

  // Helper function to show user-friendly error messages
  const getErrorMessage = (error: any): string => {
    // Handle array error responses (e.g. ["Already have a pending challenge with this user"])
    if (Array.isArray(error) && error.length > 0) {
      const msg = (typeof error[0] === "string" ? error[0] : "").toLowerCase()
      if (msg.includes("already have a pending challenge")) {
        return "You already have a pending challenge with this user. Please wait for them to respond."
      }
      return error[0]
    }
    if (typeof error === "string") {
      // If the error is a plain text response that looks like JSON parse error, show the string directly
      if (error.startsWith("Unexpected token")) {
        return "An error occurred. Please try again."
      }
      if (error.toLowerCase().includes("already have a pending challenge")) {
        return "You already have a pending challenge with this user. Please wait for them to respond."
      }
      if (error.toLowerCase().includes("already in an active game")) {
        setActiveGameError(
          "You are currently in another battle. Please finish or cancel your current battle before starting a new one.",
        )
      }
      return error
    }
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("already have a pending challenge")) {
        return "You already have a pending challenge with this user. Please wait for them to respond."
      }
      if (message.includes("already in an active game")) {
        setActiveGameError(
          "You are currently in another battle. Please finish or cancel your current battle before starting a new one.",
        )
        return "You are currently in another battle. Please finish your current battle before starting a new one."
      }
      // Transform backend errors to user-friendly messages
      if (message.includes("player is already in an active game")) {
        return "This player is currently in another battle. Please try challenging them later."
      }
      if (message.includes("users you follow")) {
        return "You can only challenge users you follow. Please follow this user first."
      }
      if (message.includes("currently offline")) {
        return "This user is currently offline. Please try again when they are online."
      }
      if (message.includes("pending challenge")) {
        return "You already have a pending challenge with this user. Please wait for them to respond."
      }
      if (message.includes("not found")) {
        return "The requested battle could not be found. It may have been cancelled or completed."
      }
      if (message.includes("unauthorized")) {
        return "You are not authorized to perform this action."
      }
      if (message.includes("network") || message.includes("fetch")) {
        return "Connection error. Please check your internet connection and try again."
      }

      return error.message
    }

    return "An unexpected error occurred. Please try again."
  }

  // Initialize WebSocket connection
  useEffect(() => {
    initializeWebSocket()
    loadInitialData()

    // Handle URL hash for direct navigation to challenges
    const handleHashChange = () => {
      if (window.location.hash === "#challenges") {
        setActiveTab("challenges")
        window.location.hash = "" // Clear the hash
      }
    }

    handleHashChange() // Check on mount
    window.addEventListener("hashchange", handleHashChange)

    return () => {
      if (socket && socket.readyState === 1) {
        // 1 = OPEN
        socket.close()
      }
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  const initializeWebSocket = () => {
    try {
      const userId = localStorage.getItem("userId")

      if (!userId) {
        console.warn("No user ID found, skipping WebSocket connection")
        return
      }

      // Create simple WebSocket connection to our custom handler
      const baseUrl = API_BASE_URL.replace("/api", "").replace("http://", "ws://").replace("https://", "wss://")
      const wsUrl = `${baseUrl}/api/simple-ws?userId=${userId}`

      console.log("Connecting to WebSocket:", wsUrl)

      socket = new (window as any).WebSocket(wsUrl)

      socket.onopen = () => {
        console.log("WebSocket connected")
        // Wait a moment before sending to ensure connection is fully established
        setTimeout(() => {
          socket?.send(
            JSON.stringify({
              type: "USER_CONNECT",
              userId: userId,
            }),
          )
        }, 100)
      }

      socket.onmessage = (event: any) => {
        try {
          const data = JSON.parse(event.data)
          console.log("Received WebSocket message:", data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      socket.onclose = () => {
        console.log("WebSocket disconnected")
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000)
      }

      socket.onerror = (error: any) => {
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error)
    }
  }

  const handleWebSocketMessage = (data: any) => {
    console.log("Handling WebSocket message:", data)

    switch (data.type) {
      case "CHALLENGE_RECEIVED":
        // Add new challenge to the list immediately
        setChallenges((prev) => [data.challenge, ...prev])
        
        // Create and show popup notification
        showChallengeNotification(data.challenge)
        break

      case "CHALLENGE_DECLINED":
        // Update challenge status in the list
        setChallenges((prev) => prev.map((c) => (c.id === data.challengeId ? { ...c, status: "DECLINED" } : c)))
        showNotification("Your challenge was declined")
        break

      case "CHALLENGE_EXPIRED":
        // Remove expired challenge from the list
        setChallenges((prev) => prev.filter((c) => c.id !== data.challengeId))
        showNotification("Challenge expired")
        break

      case "GAME_STARTING":
        // Redirect both players to the game
        showNotification(`Game starting between ${data.challengerName} and ${data.opponentName}!`)
        window.location.href = `/prompt-wars/game/${data.gameId}`
        break

      case "GAME_UPDATE":
        showNotification(data.message || "Game updated")
        break

      case "USER_CONNECTED":
        // Handle user connected message, e.g., update online status if needed
        console.log("User connected:", data.userId)
        break

      default:
        console.log("Unhandled message type:", data.type)
    }
  }

  const showChallengeNotification = (challenge: any) => {
    // Remove any existing challenge notifications
    const existingNotifications = document.querySelectorAll('.challenge-notification')
    existingNotifications.forEach(notification => notification.remove())

    // Create popup notification
    const notification = document.createElement("div")
    notification.className = "challenge-notification fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-gradient-to-r from-[#3ebb9e] to-[#2ea688] text-white p-4 sm:p-6 rounded-xl shadow-2xl z-[9999] backdrop-blur-lg border border-white/20 transform translate-y-[-100%] transition-transform duration-500 ease-out"
    
    notification.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center mb-2">
            <span class="text-2xl mr-2">⚔️</span>
            <h4 class="font-bold text-lg">New Challenge!</h4>
          </div>
          <p class="text-sm opacity-90 mb-1">${challenge.challengerName} wants to battle!</p>
          <p class="text-xs opacity-75">${challenge.gameType === "REVERSE_PROMPT" ? "Reverse Battle" : "Classic Battle"}</p>
          <div class="flex gap-2 mt-4">
            <button class="challenge-accept-btn bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 border border-white/30">
              Accept ⚡
            </button>
            <button class="challenge-view-btn bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 border border-white/20">
              View →
            </button>
          </div>
        </div>
        <button class="challenge-close-btn ml-3 text-white hover:text-red-200 text-xl font-bold opacity-70 hover:opacity-100 transition-opacity duration-200">×</button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateY(0)'
    }, 100)
    
    // Add event listeners
    const acceptBtn = notification.querySelector('.challenge-accept-btn')
    const viewBtn = notification.querySelector('.challenge-view-btn')
    const closeBtn = notification.querySelector('.challenge-close-btn')
    
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        notification.remove()
        handleAcceptChallenge(challenge.id)
      })
    }
    
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        notification.remove()
        setActiveTab("challenges")
        // Scroll to top to ensure challenges are visible
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateY(-100%)'
        setTimeout(() => notification.remove(), 300)
      })
    }
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateY(-100%)'
        setTimeout(() => notification.remove(), 300)
      }
    }, 10000)
    
    // Also trigger browser notification if permission granted
    if ('Notification' in window && window.Notification.permission === 'granted') {
      new window.Notification('New Challenge!', {
        body: `${challenge.challengerName} wants to battle!`,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    }
  }

  const showNotification = (message: string) => {
    // Simple toast notification for other messages
    const toast = document.createElement("div")
    toast.className = "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-4 py-3 rounded-lg shadow-lg z-50 transform translate-y-full transition-transform duration-300 text-sm sm:text-base"
    toast.textContent = message
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.style.transform = 'translateY(0)'
    }, 100)
    
    setTimeout(() => {
      toast.style.transform = 'translateY(full)'
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  // Initialize data and load challenges
  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load cached counts first
      await loadCachedCounts()

      // Initialize followed users set from following list
      await initializeFollowedUsers()

      // Load initial page for discover tab
      await loadPageData("discover", 1)

      // Load challenges
      await loadChallenges()
    } catch (error) {
      console.error("Failed to load initial data:", error)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Initialize the followed users set
  const initializeFollowedUsers = async () => {
    try {
      const followingResponse = await SocialAPI.getFollowingPaginated(0, 1000) // Get all followed users
      const followedIds = new Set((followingResponse.content || []).map((user: any) => user.userId))
      setFollowedUserIds(followedIds)
    } catch (error) {
      console.error("Failed to initialize followed users:", error)
    }
  }

  // Add function to load cached counts
  const loadCachedCounts = async () => {
    try {
      // Load following count
      const followingResponse = await SocialAPI.getFollowingPaginated(0, 1)
      const followingCount = followingResponse.totalElements || 0

      // Load followers count  
      const followersResponse = await SocialAPI.getFollowersPaginated(0, 1)
      const followersCount = followersResponse.totalElements || 0

      setCachedCounts({
        following: followingCount,
        followers: followersCount
      })

      // Update totalElements state as well
      setTotalElements(prev => ({
        ...prev,
        following: followingCount,
        followers: followersCount
      }))
    } catch (error) {
      console.error("Failed to load cached counts:", error)
    }
  }

  // Separate function to load challenges
  const loadChallenges = async () => {
    try {
      const challengesData = await ChallengeAPI.getUserChallenges().catch(() => [])
      setChallenges(challengesData)
    } catch (error) {
      console.error("Failed to load challenges:", error)
    }
  }

  // Search users with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === "discover") {
        loadPageData("discover", 1)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const loadPageData = async (tab: string, page: number) => {
    try {
      setTabLoading((prev) => ({ ...prev, [tab]: true }))
      const userId = localStorage.getItem('userId')

      switch (tab) {
        case "discover": {
          // Changed from search to searchQuery
          const usersResponse = await SocialAPI.getDiscoverUsersPaginated(page - 1, USERS_PER_PAGE, searchQuery)
          // Add online status simulation and ensure isFollowing is properly set
          const usersWithFollowingStatus = applyFollowingStatus(usersResponse.content)
          setUsers(usersWithFollowingStatus)
          setTotalPages((prev) => ({ ...prev, discover: usersResponse.totalPages || 1 }))
          setTotalElements((prev) => ({ ...prev, discover: usersResponse.totalElements || 0 }))
          setCurrentPage((prev) => ({ ...prev, discover: page }))
          break
        }

        case "following": {
          const followingResponse = await SocialAPI.getFollowingPaginated(page - 1, USERS_PER_PAGE)
          // Add online status simulation - users in following are already being followed
          const followingWithOnlineStatus = (followingResponse.content || []).map((user) => ({
            ...user,
            isFollowing: true, // All users in following tab are being followed
          }))
          setFollowing(followingWithOnlineStatus)
          
          // Update the followed users set with current following list
          const currentFollowedIds = new Set(followedUserIds)
          followingWithOnlineStatus.forEach(user => currentFollowedIds.add(user.userId))
          setFollowedUserIds(currentFollowedIds)
          
          setTotalPages((prev) => ({ ...prev, following: followingResponse.totalPages || 1 }))
          setTotalElements((prev) => ({ ...prev, following: followingResponse.totalElements || 0 }))
          setCurrentPage((prev) => ({ ...prev, following: page }))
          
          // Update cached count
          setCachedCounts(prev => ({
            ...prev,
            following: followingResponse.totalElements || 0
          }))
          break
        }

        case "followers": {
          const followersResponse = await SocialAPI.getFollowersPaginated(page - 1, USERS_PER_PAGE)
          // Add online status simulation and apply correct following status
         
          const followersWithFollowingStatus = applyFollowingStatus(followersResponse.content)
          setFollowers(followersWithFollowingStatus)
          setTotalPages((prev) => ({ ...prev, followers: followersResponse.totalPages || 1 }))
          setTotalElements((prev) => ({ ...prev, followers: followersResponse.totalElements || 0 }))
          setCurrentPage((prev) => ({ ...prev, followers: page }))
          
          // Update cached count
          setCachedCounts(prev => ({
            ...prev,
            followers: followersResponse.totalElements || 0
          }))
          break
        }
      }
    } catch (error) {
      console.error(`Failed to load ${tab} data:`, error)
      setError(`Failed to load ${tab}. Please try again.`)
    } finally {
      setTabLoading((prev) => ({ ...prev, [tab]: false }))
    }
  }

  // Handle tab changes
  useEffect(() => {
    loadPageData(activeTab, currentPage[activeTab] || 1)
  }, [activeTab])

  const changePage = (tab: string, pageNumber: number) => {
    loadPageData(tab, pageNumber)
  }

  const handleSendChallenge = async () => {
    if (!selectedOpponent) return

    try {
      await ChallengeAPI.sendChallenge(selectedOpponent.userId, challengeMessage || undefined, selectedGameType)

      setShowChallengeModal(false)
      setChallengeMessage("")
      setSelectedOpponent(null)
      setSelectedGameType("PROMPT_CREATION") // Reset to default
      showNotification(`Challenge sent to ${selectedOpponent.username}!`)

      // Reload challenges
      await loadChallenges()
    } catch (error) {
      console.error("Failed to send challenge:", error)
      setError(getErrorMessage(error))
    }
  }

  const handleAcceptChallenge = async (challengeId: string) => {
    setChallengeLoading((prev) => ({ ...prev, [challengeId]: true }))
    try {
      console.log("Accepting challenge:", challengeId)
      const gameData = await ChallengeAPI.acceptChallenge(challengeId)
      console.log("Game created:", gameData)

      // Update challenge status in local state
      setChallenges((prev) => prev.map((c) => (c.id === challengeId ? { ...c, status: "ACCEPTED" as const } : c)))

      showNotification("Challenge accepted! Starting game...")

      // Navigate to the war page with game ID
      if (gameData && gameData.id) {
        console.log("Navigating to game:", gameData.id)
        window.location.href = `/war?gameId=${gameData.id}`
      } else {
        console.log("No game ID, navigating to war page")
        // Fallback - just go to war page
        window.location.href = `/war`
      }
    } catch (error) {
      console.error("Failed to accept challenge:", error)
      setError(`Failed to accept challenge: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setChallengeLoading((prev) => ({ ...prev, [challengeId]: false }))
    }
  }

  const handleDeclineChallenge = async (challengeId: string) => {
    setChallengeLoading((prev) => ({ ...prev, [challengeId]: true }))
    try {
      console.log("Declining challenge:", challengeId)
      await ChallengeAPI.declineChallenge(challengeId)

      // Update challenge status in local state
      setChallenges((prev) => prev.map((c) => (c.id === challengeId ? { ...c, status: "DECLINED" as const } : c)))

      showNotification("Challenge declined")
    } catch (error) {
      console.error("Failed to decline challenge:", error)
      setError("Failed to decline challenge. Please try again.")
    } finally {
      setChallengeLoading((prev) => ({ ...prev, [challengeId]: false }))
    }
  }

  const [cachedCounts, setCachedCounts] = useState<{
    following: number
    followers: number
  }>({
    following: 0,
    followers: 0
  })

  const handleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await SocialAPI.unfollowUser(userId)
        // Update followed users set
        setFollowedUserIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
        // Update cached following count
        setCachedCounts(prev => ({
          ...prev,
          following: Math.max(0, prev.following - 1)
        }))
        // Update totalElements
        setTotalElements(prev => ({
          ...prev,
          following: Math.max(0, prev.following - 1)
        }))
      } else {
        await SocialAPI.followUser(userId)
        // Update followed users set
        setFollowedUserIds(prev => {
          const newSet = new Set(prev)
          newSet.add(userId)
          return newSet
        })
        // Update cached following count
        setCachedCounts(prev => ({
          ...prev,
          following: prev.following + 1
        }))
        // Update totalElements
        setTotalElements(prev => ({
          ...prev,
          following: prev.following + 1
        }))
      }

      // Update the user's following status in local state across ALL state arrays
      const updateUserInArray = (user: any) => 
        user.userId === userId
          ? {
              ...user,
              isFollowing: !isCurrentlyFollowing,
              followers: Array.isArray(user.followers)
                ? isCurrentlyFollowing
                  ? user.followers.filter((f: string) => f !== currentUser?.userId)
                  : [...user.followers, currentUser?.userId || ""]
                : typeof user.followers === "number"
                  ? isCurrentlyFollowing
                    ? user.followers - 1
                    : user.followers + 1
                  : 0,
            }
          : user

      // Update users array (discover tab)
      setUsers((prev) => prev.map(updateUserInArray))
      
      // Update following array (following tab)
      setFollowing((prev) => prev.map(updateUserInArray))
      
      // Update followers array (followers tab)
      setFollowers((prev) => prev.map(updateUserInArray))

      // Only refresh following list if we're currently on the following tab AND we unfollowed someone
      // (to remove them from the following list)
      if (activeTab === "following" && isCurrentlyFollowing) {
        changePage("following", currentPage.following)
      }

      showNotification(
        isCurrentlyFollowing
          ? `Unfollowed ${users.find((u) => u.userId === userId)?.username}`
          : `Following ${users.find((u) => u.userId === userId)?.username}`,
      )
    } catch (error) {
      console.error("Failed to follow/unfollow user:", error)
      setError("Failed to update follow status. Please try again.")
    }
  }

  const handleCancelActiveGame = async () => {
    try {
      await cancelActiveGame()
      setActiveGameError(null)
      showNotification("Your active game has been cancelled.")
    } catch (err: any) {
      setActiveGameError("Failed to cancel active game: " + (err?.message || "Unknown error"))
    }
  }

  // Check for active game on mount and when switching to challenges tab
  const checkActiveGame = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")
      const response = await fetch(`${API_BASE_URL}/prompt-wars/games/active`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          "X-User-Id": userId || "",
        },
      })
      if (response.ok) {
        const games = await response.json()
        if (Array.isArray(games) && games.length > 0) {
          setActiveGameError(
            "You are currently in another battle. Please finish or cancel your current battle before starting a new one.",
          )
          setActiveGameId(games[0].id || null)
        } else {
          setActiveGameError(null)
          setActiveGameId(null)
        }
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Check for active game when switching to challenges tab
  useEffect(() => {
    if (activeTab === "challenges") {
      checkActiveGame()
    }
  }, [activeTab, checkActiveGame])

  // Helper to resolve avatar URL
  const getAvatarUrl = (avatar: string | undefined | null) => {
    if (!avatar) return "/placeholder-user.jpg"
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) return avatar
    // If backend returns a relative path, prefix with API_BASE_URL (without /api)
    if (avatar.startsWith("/")) return API_BASE_URL.replace(/\/api$/, "") + avatar
    return avatar
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your social feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fallback error UI if something goes wrong */}
      {error && (
        <div className="mx-3 sm:mx-4 mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="bg-red-100 dark:bg-red-800 p-2 rounded-lg mr-3 flex-shrink-0">
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm sm:text-base">Error</h4>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

            {/* Header - Enhanced for social media feel */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-background backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Discover Users</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Connect with other prompt engineers and creators</p>
            </div>

            <div className="flex items-center justify-end space-x-2 sm:space-x-3">
              <Link to="/war">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-[#3ebb9e]/10 to-[#2ea688]/10 hover:from-[#3ebb9e]/20 hover:to-[#2ea688]/20 text-[#3ebb9e] border-[#3ebb9e]/30 hover:border-[#3ebb9e] transition-all duration-300 rounded-lg text-xs sm:text-sm"
                >
                  <Swords className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Battles</span>
                  <span className="xs:hidden">War</span>
                </Button>
              </Link>

              {challenges.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("challenges")}
                  className="relative p-2 hover:bg-[#3ebb9e]/10 dark:hover:bg-[#3ebb9e]/20 rounded-lg transition-colors duration-300"
                  title={`${challenges.filter((c) => c.status === "PENDING").length} pending challenges`}
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-[#3ebb9e]" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-lg h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                    {challenges.filter((c) => c.status === "PENDING").length}
                  </span>
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Input
                placeholder="Search users..."
                className="bg-muted border-muted pl-10 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery === "" && (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Social Media Style */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 custom-scrollbar">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8 bg-gray-100 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm overflow-x-auto">
            <TabsTrigger
              value="discover"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ebb9e] data-[state=active]:to-[#2ea688] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center text-xs sm:text-sm min-w-0 flex-shrink-0"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="truncate">Discover</span>
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ebb9e] data-[state=active]:to-[#2ea688] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center text-xs sm:text-sm min-w-0 flex-shrink-0"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Following</span>
              <span className="sm:hidden">Follow</span>
              <span className="ml-1">({totalElements.following})</span>
            </TabsTrigger>
            <TabsTrigger
              value="followers"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ebb9e] data-[state=active]:to-[#2ea688] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center text-xs sm:text-sm min-w-0 flex-shrink-0"
            >
              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Followers</span>
              <span className="sm:hidden">Fans</span>
              <span className="ml-1">({totalElements.followers})</span>
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className={`rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ebb9e] data-[state=active]:to-[#2ea688] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 relative flex items-center justify-center text-xs sm:text-sm min-w-0 flex-shrink-0 ${
                challenges.filter((c) => c.status === "PENDING").length > 0
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 animate-pulse"
                  : ""
              }`}
            >
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Challenges</span>
              <span className="sm:hidden">Duel</span>
              <span className="ml-1">({challenges.length})</span>
              {challenges.filter((c) => c.status === "PENDING").length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-lg h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {challenges.filter((c) => c.status === "PENDING").length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab - Enhanced Grid */}
          <TabsContent value="discover" className="space-y-6">
            {tabLoading.discover && (
              <div className="flex justify-center items-center py-16">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-[#3ebb9e]/20 border-t-[#3ebb9e] rounded-full animate-spin mx-auto"></div>
                    <Sparkles className="w-4 h-4 text-[#3ebb9e] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Discovering amazing creators...</p>
                </div>
              </div>
            )}

            {!tabLoading.discover && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {users.map((user) => (
                    <UserCard
                      key={user.userId}
                      user={user}
                      handleFollow={handleFollow}
                      setSelectedOpponent={setSelectedOpponent}
                      setShowChallengeModal={setShowChallengeModal}
                      showNotification={showNotification}
                    />
                  ))}
                </div>

                {users.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#3ebb9e]/10 to-[#2ea688]/10 dark:from-[#3ebb9e]/20 dark:to-[#2ea688]/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <Search className="w-12 h-12 text-[#3ebb9e]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No creators found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or explore different categories.</p>
                  </div>
                )}
              </>
            )}

            {/* Pagination for Discover */}
            {!tabLoading.discover && totalPages.discover > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-2 mt-6 sm:mt-8">
                <div className="flex justify-center gap-1 sm:gap-2 order-2 sm:order-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage("discover", Math.max(1, currentPage.discover - 1))}
                    disabled={currentPage.discover === 1}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(totalPages.discover, 5) }).map((_, i) => {
                    let pageNumber
                    if (totalPages.discover <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage.discover <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage.discover >= totalPages.discover - 2) {
                      pageNumber = totalPages.discover - 4 + i
                    } else {
                      pageNumber = currentPage.discover - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage.discover === pageNumber ? "default" : "outline"}
                        size="sm"
                        className={`min-w-[32px] sm:min-w-[40px] rounded-lg text-xs sm:text-sm px-2 sm:px-3 ${
                          currentPage.discover === pageNumber
                            ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""
                        }`}
                        onClick={() => changePage("discover", pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage("discover", Math.min(totalPages.discover, currentPage.discover + 1))}
                    disabled={currentPage.discover === totalPages.discover}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Next
                  </Button>
                </div>
                <div className="text-center text-xs sm:text-sm text-muted-foreground order-1 sm:order-2">
                  Page {currentPage.discover} of {totalPages.discover}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-6">
            {tabLoading.following && (
              <div className="flex justify-center items-center py-16">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-[#3ebb9e]/20 border-t-[#3ebb9e] rounded-full animate-spin mx-auto"></div>
                    <Sparkles className="w-4 h-4 text-[#3ebb9e] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your following...</p>
                </div>
              </div>
            )}

            {!tabLoading.following && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {following.map((user) => (
                    <UserCard
                      key={user.userId}
                      user={user}
                      handleFollow={handleFollow}
                      setSelectedOpponent={setSelectedOpponent}
                      setShowChallengeModal={setShowChallengeModal}
                      showNotification={showNotification}
                    />
                  ))}
                </div>

                {following.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#3ebb9e]/10 to-[#2ea688]/10 dark:from-[#3ebb9e]/20 dark:to-[#2ea688]/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <Users className="w-12 h-12 text-[#3ebb9e]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Not following anyone yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Start following creators to see their content here.</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-[#3ebb9e] to-[#2ea688] hover:from-[#2ea688] hover:to-[#1e7a66] rounded-lg"
                      onClick={() => setActiveTab("discover")}
                    >
                      Discover Creators
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Pagination for Following */}
            {!tabLoading.following && totalPages.following > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-2 mt-6 sm:mt-8">
                <div className="flex justify-center gap-1 sm:gap-2 order-2 sm:order-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage("following", Math.max(1, currentPage.following - 1))}
                    disabled={currentPage.following === 1}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(totalPages.following, 5) }).map((_, i) => {
                    let pageNumber
                    if (totalPages.following <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage.following <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage.following >= totalPages.following - 2) {
                      pageNumber = totalPages.following - 4 + i
                    } else {
                      pageNumber = currentPage.following - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage.following === pageNumber ? "default" : "outline"}
                        size="sm"
                        className={`min-w-[32px] sm:min-w-[40px] rounded-lg text-xs sm:text-sm px-2 sm:px-3 ${
                          currentPage.following === pageNumber
                            ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""
                        }`}
                        onClick={() => changePage("following", pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage("following", Math.min(totalPages.following, currentPage.following + 1))}
                    disabled={currentPage.following === totalPages.following}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Next
                  </Button>
                </div>
                <div className="text-center text-xs sm:text-sm text-muted-foreground order-1 sm:order-2">
                  Page {currentPage.following} of {totalPages.following}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers" className="space-y-6">
            {tabLoading.followers && (
              <div className="flex justify-center items-center py-16">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-[#3ebb9e]/20 border-t-[#3ebb9e] rounded-full animate-spin mx-auto"></div>
                    <Sparkles className="w-4 h-4 text-[#3ebb9e] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your followers...</p>
                </div>
              </div>
            )}

            {!tabLoading.followers && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {followers.map((user) => (
                    <UserCard
                      key={user.userId}
                      user={user}
                      handleFollow={handleFollow}
                      setSelectedOpponent={setSelectedOpponent}
                      setShowChallengeModal={setShowChallengeModal}
                      showNotification={showNotification}
                    />
                  ))}
                </div>

                {followers.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#3ebb9e]/10 to-[#2ea688]/10 dark:from-[#3ebb9e]/20 dark:to-[#2ea688]/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <UserPlus className="w-12 h-12 text-[#3ebb9e]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No followers yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Create amazing prompts to attract followers.</p>
                  </div>
                )}
              </>
            )}

            {/* Pagination for Followers */}
            {!tabLoading.followers && totalPages.followers > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-2 mt-6 sm:mt-8">
                <div className="flex justify-center gap-1 sm:gap-2 order-2 sm:order-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage("followers", Math.max(1, currentPage.followers - 1))}
                    disabled={currentPage.followers === 1}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(totalPages.followers, 5) }).map((_, i) => {
                    let pageNumber
                    if (totalPages.followers <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage.followers <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage.followers >= totalPages.followers - 2) {
                      pageNumber = totalPages.followers - 4 + i
                    } else {
                      pageNumber = currentPage.followers - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage.followers === pageNumber ? "default" : "outline"}
                        size="sm"
                        className={`min-w-[32px] sm:min-w-[40px] rounded-lg text-xs sm:text-sm px-2 sm:px-3 ${
                          currentPage.followers === pageNumber
                            ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""
                        }`}
                        onClick={() => changePage("followers", pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage("followers", Math.min(totalPages.followers, currentPage.followers + 1))}
                    disabled={currentPage.followers === totalPages.followers}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Next
                  </Button>
                </div>
                <div className="text-center text-xs sm:text-sm text-muted-foreground order-1 sm:order-2">
                  Page {currentPage.followers} of {totalPages.followers}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            {/* Cancel Active Game Banner inside Challenges tab */}
            {activeGameError && (
              <div className="p-4 sm:p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0">
                  <div className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-lg flex-shrink-0 self-start">
                    <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 text-sm sm:text-base">Active Battle Detected</h4>
                    <p className="text-yellow-700 dark:text-yellow-300 mb-4 text-sm">{activeGameError}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleCancelActiveGame}
                        className="bg-red-500 text-white hover:bg-red-600 rounded-lg text-sm py-2"
                      >
                        Cancel Active Game
                      </Button>
                      {activeGameId && (
                        <Button
                          onClick={() => (window.location.href = `/prompt-wars/game/${activeGameId}`)}
                          className="bg-gradient-to-r from-[#3ebb9e] to-[#2ea688] text-white hover:from-[#2ea688] hover:to-[#1e7a66] rounded-lg text-sm py-2"
                        >
                          Return to Ongoing Match
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(() => {
              const currentUserId = localStorage.getItem("userId")
              const receivedChallenges = challenges.filter((c) => c.opponentId === currentUserId)
              const sentChallenges = challenges.filter((c) => c.challengerId === currentUserId)
              const pendingReceived = receivedChallenges.filter((c) => c.status === "PENDING")

              return (
                <>
                  {pendingReceived.length > 0 && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
                        <div className="bg-red-100 dark:bg-red-800 p-2 sm:p-3 rounded-lg flex-shrink-0 self-start">
                          <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-red-800 dark:text-red-200 mb-1">
                            {pendingReceived.length} Pending Challenge{pendingReceived.length > 1 ? "s" : ""}!
                          </h3>
                          <p className="text-red-600 dark:text-red-300 text-sm">Accept or decline the challenges below to take action!</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Received Challenges Section */}
                  {receivedChallenges.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-bold flex items-center text-gray-900 dark:text-gray-100">
                        <Swords className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#3ebb9e]" />
                        <span className="text-sm sm:text-base">Received Challenges ({receivedChallenges.length})</span>
                      </h3>
                      <div className="grid gap-4">
                        {receivedChallenges.map((challenge) => (
                          <Card
                            key={challenge.id}
                            className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border hover:shadow-[0_0_20px_rgba(62,187,158,0.4)] hover:border-[#3ebb9e]/50 bg-white dark:bg-gray-800 ${
                              challenge.status === "PENDING"
                                ? "border-[#3ebb9e]/30 bg-gradient-to-r from-[#3ebb9e]/5 via-white to-[#3ebb9e]/5 dark:from-[#3ebb9e]/10 dark:via-gray-800 dark:to-[#3ebb9e]/10 ring-2 ring-[#3ebb9e]/20"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                  <div className="relative flex-shrink-0">
                                    <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-white dark:border-gray-700 shadow-lg group-hover:border-[#3ebb9e] transition-all duration-300">
                                      <AvatarImage
                                        src={getAvatarUrl(challenge.challengerAvatar) || "/placeholder.svg"}
                                        alt={challenge.challengerName}
                                      />
                                      <AvatarFallback className="bg-gradient-to-br from-[#3ebb9e] to-[#2ea688] text-white font-bold">
                                        {challenge.challengerName ? challenge.challengerName.charAt(0).toUpperCase() : '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    {challenge.status === "PENDING" && (
                                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-lg h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center animate-pulse">
                                        !
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                                      <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 group-hover:text-[#3ebb9e] transition-colors duration-300 truncate">{challenge.challengerName}</h4>
                                      {challenge.status === "PENDING" && (
                                        <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800 text-xs self-start">
                                          Waiting for Response
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                      {challenge.message || "Challenge to a prompt war!"}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs ${
                                          challenge.gameType === "REVERSE_PROMPT"
                                            ? "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800"
                                            : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                                        }`}
                                      >
                                        {challenge.gameType === "REVERSE_PROMPT" ? (
                                          <RotateCcw className="w-3 h-3 mr-1" />
                                        ) : (
                                          <Swords className="w-3 h-3 mr-1" />
                                        )}
                                        {challenge.gameType === "REVERSE_PROMPT"
                                          ? "Reverse Battle"
                                          : "Classic Battle"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(challenge.createdAt).toLocaleDateString()} at{" "}
                                      {new Date(challenge.createdAt).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                  {challenge.status === "PENDING" && (
                                    <div className="flex flex-col sm:flex-row gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                                      <Button
                                        size="sm"
                                        onClick={() => handleAcceptChallenge(challenge.id)}
                                        disabled={challengeLoading[challenge.id]}
                                        className="bg-gradient-to-r from-[#3ebb9e] to-[#2ea688] hover:from-[#2ea688] hover:to-[#1e7a66] text-white min-w-[90px] rounded-lg group-hover:shadow-lg group-hover:shadow-[#3ebb9e]/25 transition-all duration-300 text-sm"
                                      >
                                        {challengeLoading[challenge.id] ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        ) : (
                                          <Swords className="h-4 w-4 mr-1" />
                                        )}
                                        {challengeLoading[challenge.id] ? "Starting..." : "Accept"}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeclineChallenge(challenge.id)}
                                        disabled={challengeLoading[challenge.id]}
                                        className="min-w-[90px] border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 text-sm"
                                      >
                                        {challengeLoading[challenge.id] ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        ) : (
                                          <X className="h-4 w-4 mr-1" />
                                        )}
                                        {challengeLoading[challenge.id] ? "Processing..." : "Decline"}
                                      </Button>
                                    </div>
                                  )}

                                  <div className="flex justify-center sm:flex sm:justify-end">
                                    <Badge
                                      className={`text-center rounded-lg text-xs ${
                                        challenge.status === "PENDING"
                                          ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
                                          : challenge.status === "ACCEPTED"
                                            ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
                                            : challenge.status === "DECLINED"
                                              ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
                                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
                                      }`}
                                    >
                                      {challenge.status === "PENDING"
                                        ? "⏳ Pending"
                                        : challenge.status === "ACCEPTED"
                                          ? "✅ Accepted"
                                          : challenge.status === "DECLINED"
                                            ? "❌ Declined"
                                            : challenge.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sent Challenges Section */}
                  {sentChallenges.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-bold flex items-center text-gray-900 dark:text-gray-100">
                        <Swords className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-500" />
                        <span className="text-sm sm:text-base">Sent Challenges ({sentChallenges.length})</span>
                      </h3>
                      <div className="grid gap-4">
                        {sentChallenges.map((challenge) => (
                          <Card
                            key={challenge.id}
                            className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group border border-gray-200 dark:border-gray-700 hover:shadow-[0_0_20px_rgba(62,187,158,0.2)] hover:border-[#3ebb9e]/30 bg-white dark:bg-gray-800"
                          >
                            <div className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                  <div className="relative flex-shrink-0">
                                    <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-white dark:border-gray-700 shadow-lg group-hover:border-[#3ebb9e] transition-all duration-300">
                                      <AvatarImage
                                        src={
                                          challenge.challengerAvatar && !failedAvatars[challenge.id]
                                            ? getAvatarUrl(challenge.challengerAvatar)
                                            : undefined
                                        }
                                        alt={challenge.challengerName}
                                        onError={() => setFailedAvatars((prev) => ({ ...prev, [challenge.id]: true }))}
                                      />
                                      <AvatarFallback className="bg-gradient-to-br from-[#3ebb9e] to-[#2ea688] text-white font-bold">
                                        {challenge.challengerName ? challenge.challengerName.charAt(0).toUpperCase() : '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                                      <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 group-hover:text-[#3ebb9e] transition-colors duration-300 truncate">
                                        Challenged {challenge.opponentName || "Player"}
                                      </h4>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                      {challenge.message || "Challenge to a prompt war!"}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs ${
                                          challenge.gameType === "REVERSE_PROMPT"
                                            ? "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800"
                                            : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                                        }`}
                                      >
                                        {challenge.gameType === "REVERSE_PROMPT" ? (
                                          <RotateCcw className="w-3 h-3 mr-1" />
                                        ) : (
                                          <Swords className="w-3 h-3 mr-1" />
                                        )}
                                        {challenge.gameType === "REVERSE_PROMPT"
                                          ? "Reverse Battle"
                                          : "Classic Battle"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(challenge.createdAt).toLocaleDateString()} at{" "}
                                      {new Date(challenge.createdAt).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex justify-center sm:flex sm:justify-end">
                                  <Badge
                                    className={`text-center rounded-lg text-xs ${
                                      challenge.status === "PENDING"
                                        ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
                                        : challenge.status === "ACCEPTED"
                                          ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
                                          : challenge.status === "DECLINED"
                                            ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
                                    }`}
                                  >
                                    {challenge.status === "PENDING"
                                      ? "⏳ Waiting for response"
                                      : challenge.status === "ACCEPTED"
                                        ? "✅ Accepted"
                                        : challenge.status === "DECLINED"
                                          ? "❌ Declined"
                                          : challenge.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {receivedChallenges.length === 0 && sentChallenges.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#3ebb9e]/10 to-[#2ea688]/10 dark:from-[#3ebb9e]/20 dark:to-[#2ea688]/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                        <Swords className="w-12 h-12 text-[#3ebb9e]" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No challenges yet</h3>
                      <p className="text-gray-600 dark:text-gray-400">Challenge other creators to prompt battles!</p>
                    </div>
                  )}
                </>
              )
            })()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Challenge Modal */}
      {showChallengeModal && selectedOpponent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-0 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#3ebb9e] to-[#2ea688] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">Challenge {selectedOpponent.username}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ready for battle?</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowChallengeModal(false)} className="rounded-lg flex-shrink-0 ml-2">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Game Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      variant={selectedGameType === "PROMPT_CREATION" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGameType("PROMPT_CREATION")}
                      className={`rounded-lg transition-all duration-200 h-auto py-3 px-4 text-sm sm:text-base ${
                        selectedGameType === "PROMPT_CREATION"
                          ? "bg-gradient-to-r from-[#3ebb9e] to-[#2ea688] text-white shadow-lg"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Swords className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Classic Battle</span>
                    </Button>
                    <Button
                      variant={selectedGameType === "REVERSE_PROMPT" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGameType("REVERSE_PROMPT")}
                      className={`rounded-lg transition-all duration-200 h-auto py-3 px-4 text-sm sm:text-base ${
                        selectedGameType === "REVERSE_PROMPT"
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <RotateCcw className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Reverse Battle</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {selectedGameType === "REVERSE_PROMPT" 
                      ? "Guess what prompt created the given image" 
                      : "Create the best prompt for a given theme"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Challenge Message</label>
                  <textarea
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-[#3ebb9e] focus:ring-[#3ebb9e]/20 dark:focus:ring-[#3ebb9e]/30 focus:bg-white dark:focus:bg-gray-600 transition-colors text-sm sm:text-base"
                    rows={3}
                    placeholder="Add a message to your challenge..."
                    value={challengeMessage}
                    onChange={(e) => setChallengeMessage(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleSendChallenge}
                    className="flex-1 bg-gradient-to-r from-[#3ebb9e] to-[#2ea688] hover:from-[#2ea688] hover:to-[#1e7a66] text-white font-semibold rounded-lg py-3 text-sm sm:text-base"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Send Challenge
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowChallengeModal(false)} 
                    className="px-6 py-3 rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
