import { API_BASE_URL } from '../config/api';
import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { MyPrompt } from '@/Models/MyPrompt';
import { dashProfileService } from '../services/dashprofileService';


import { PromptCard } from '@/components/PromptCard';
import { SocialAPI } from '@/services/socialService';
import { FullScreenSpinner } from '@/components/FullScreenSpinner';
import { Swords } from 'lucide-react';
import { promptWarsWebSocket } from '@/services/promptWarsWebSocket';


type UserProfile = {
  userId: string
  username: string
  bio: string
  badges: any[]
  followingCount: number
  followersCount: number
  profilePicture?: string
  isFollowing: boolean
  isFollowedBy: boolean
  isActive?:boolean
}


export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  // Category breakdown state
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});
  const [loadingCategoryBreakdown, setLoadingCategoryBreakdown] = useState(true);
  const navigate = useNavigate()

  // Auth and profile
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    userId: "",
    username: username || "",
    bio: "",
    badges: [],
    followingCount: 0,
    followersCount: 0,
    isFollowing: false,
    isFollowedBy: false
  })

  // Prompts and ratings
  const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([])
  const [loadingPrompts, setLoadingPrompts] = useState(true)
  const [avgRatingMap, setAvgRatingMap] = useState<Record<string, number>>({})
  const [publicPromptCount, setPublicPromptCount] = useState<number>(0)
  // Dashboard
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  //Pagination
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

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
        const profile: UserProfile = await dashProfileService.getDashboardProfileByUsername(username || "")
        setUserProfile(profile)
        setLoading(false);
        return profile;
      }
      catch (error) {
        console.error('Failed to fetch user profile:', error)
        // Check if it's an authentication error
        if (error instanceof Error && error.message.includes('401')) {
          setIsAuthenticated(false)
          navigate("/login")
        }
      }
    }

    fetchUserProfile()
    .then((profile) =>{
      const userId = localStorage.getItem('userId')
      
      if (profile && userId) {
        promptWarsWebSocket.connect(userId)
        .then(()=>{
          promptWarsWebSocket.getUserOnlineStatus({"userId":userId,"otherUserId":profile.userId})
        })
      }

    })

    const subscribeActivity = promptWarsWebSocket.on('USER_ONLINE_STATUS', (data: any) => {
      setUserProfile(prev => ({
        ...prev,
        isActive: data.isActive,
      }))

      
    })

    return () => {
      subscribeActivity();
    }

    
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

        const response = await fetch(`${API_BASE_URL}/prompts/public/author/${username}?page=${currentPage - 1}&size=12`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },

        });
        if (response.ok) {
          let page = (await response.json());

          setTotalPages(page.totalPages)
          setPublicPromptCount(page.totalElements)
          let prompts = page.content;

          if (!Array.isArray(prompts)) prompts = [];
          console.log("propmts:",prompts);

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
            source: p.source
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
  }, [isAuthenticated, navigate, currentPage])

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

  const handleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await SocialAPI.unfollowUser(userId);
        setUserProfile(prev => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.followersCount - 1
        }));
      } else {
        await SocialAPI.followUser(userId);
        setUserProfile(prev => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.followersCount + 1
        }));
      }
    }
    catch (error) {
      console.error('Failed to follow/unfollow user:', error);
      setError('Failed to update follow status. Please try again.');
    }
  }


  if (authLoading) {
    return (
      <FullScreenSpinner content="Checking authentication"/>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <FullScreenSpinner content="Redirecting to login"/>
    )
  }

  if (loading) {
    return (
      <FullScreenSpinner content="Loading profile"/>
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
          <h3 className="text-lg font-medium mb-2">Error Loading Profile</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (userProfile.userId === "") {
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
          <h3 className="text-lg font-medium mb-2">No Profile Data</h3>
          <p className="text-muted-foreground mb-4">Unable to load dashboard information</p>
          <Button onClick={() => window.location.reload()} className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-card border-r border-border p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-2">
              <img
                src={userProfile.profilePicture || "/placeholder.svg?height=80&width=80"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover cursor-pointer"
                onClick={() => navigate(`/profile-settings`)}
              />
              {
                userProfile.isActive &&
                <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-card"></div>
              }
            </div>
            <h3
              className="font-medium cursor-pointer hover:text-[#3ebb9e]"
              onClick={() => navigate(`/profile-settings`)}
            >
              {username}
            </h3>

            <div className="flex space-x-2 my-3">
              <Button
                size="sm"
                variant={userProfile.isFollowing ? "outline" : "default"}
                className={`px-6 flex-1 ${userProfile.isFollowing
                  ? "hover:border-[#3ebb9e] hover:text-[#3ebb9e]"
                  : "bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                  } transition-colors duration-300`}
                onClick={() => handleFollow(userProfile.userId, userProfile.isFollowing)}
              >
                {userProfile.isFollowing ? "Following" : "Follow"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                
                className={`transition-all duration-300 w-full 
                  bg-[#3ebb9e]/10 hover:bg-[#3ebb9e]/20 text-[#3ebb9e] border-[#3ebb9e]/30 
                  `}
                title={ "Challenge to Prompt Wars" }
              >
                
                <Swords className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                {/* Challenge */}
               

              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full mt-4">
              <div className="text-center">
                <div className="font-semibold">{publicPromptCount}</div>
                <div className="text-xs text-muted-foreground">Prompts</div>
              </div>
              <div
                className="text-center cursor-pointer hover:text-[#3ebb9e]"
                onClick={() => navigate(`/profile/${currentUserId}`)}
              >
                <div className="font-semibold">{userProfile.followersCount}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div
                className="text-center cursor-pointer hover:text-[#3ebb9e]"
                onClick={() => navigate(`/profile/${currentUserId}`)}
              >
                <div className="font-semibold">{userProfile.followingCount}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-medium">Bio</p>
            <p className="mt-0 max-h-[340px] overflow-auto text-muted-foreground">{userProfile.bio}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <h1 className="text-xl font-semibold mb-6">{`${userProfile.username}'s Profile`}</h1>

          {/* My Prompts Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Public Prompts</h2>
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
                  <p className="text-muted-foreground mb-4">No Prompts Yet.</p>
                </div>
              ) : (
                myPrompts.map((prompt, idx) => {
                  
                  return (
                    <div key={prompt.id + '-' + idx}>
                      <PromptCard
                        id={prompt.id}
                        title={prompt.title}
                        description={prompt.description}
                        rating={avgRatingMap[prompt.id] ?? 0}
                        price={prompt.price}
                        tags={prompt.tags}
                        authorname={username || ""}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

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
                    className={`min-w-[2rem] h-8 sm:min-w-[2.5rem] sm:h-9 text-xs sm:text-sm ${currentPage === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""
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
  )
}
