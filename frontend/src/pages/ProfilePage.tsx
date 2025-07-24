"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  User,
  Star,
  Calendar,
  MapPin,
  LinkIcon,
  UserPlus,
  UserMinus,
  MessageCircle,
  Share,
  MoreHorizontal,
} from "lucide-react"
import { StandardPromptCard } from "@/components/StandardPromptCard"

interface UserProfile {
  id: string
  username: string
  email: string
  profilePicture?: string
  bio?: string
  location?: string
  website?: string
  joinedAt: string
  followers: number
  following: number
  totalPrompts: number
  averageRating: number
  isFollowing: boolean
  isCurrentUser: boolean
}

interface UserPrompt {
  id: string
  title: string
  description: string
  rating: number
  uses: number
  price: number
  featured: boolean
  tags: string[]
  category: string
  createdAt: string
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [prompts, setPrompts] = useState<UserPrompt[]>([])
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [following, setFollowing] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("prompts")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return

      setLoading(true)
      setError(null)

      try {
        // Fetch user profile
        const profileResponse = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })

        if (!profileResponse.ok) {
          throw new Error("User not found")
        }

        const profileData = await profileResponse.json()
        const currentUserId = localStorage.getItem("userId")

        setProfile({
          ...profileData,
          isCurrentUser: profileData.id === currentUserId,
          isFollowing: profileData.isFollowing || false,
        })

        // Fetch user's public prompts
        const promptsResponse = await fetch(`http://localhost:8080/api/prompts/author/${userId}/public`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })

        if (promptsResponse.ok) {
          const promptsData = await promptsResponse.json()
          setPrompts(promptsData || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId])

  const fetchFollowers = async () => {
    if (!userId) return

    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/followers`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const data = await response.json()
        setFollowers(data || [])
      }
    } catch (err) {
      console.error("Failed to fetch followers:", err)
    }
  }

  const fetchFollowing = async () => {
    if (!userId) return

    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/following`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const data = await response.json()
        setFollowing(data || [])
      }
    } catch (err) {
      console.error("Failed to fetch following:", err)
    }
  }

  const handleFollow = async () => {
    if (!profile || isFollowLoading) return

    setIsFollowLoading(true)

    try {
      const endpoint = profile.isFollowing ? "unfollow" : "follow"
      const response = await fetch(`http://localhost:8080/api/users/${userId}/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: !prev.isFollowing,
                followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1,
              }
            : null,
        )
      }
    } catch (err) {
      console.error("Failed to follow/unfollow:", err)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleMessage = () => {
    // Navigate to messaging page or open chat
    navigate(`/messages/${userId}`)
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${profile?.username}'s Profile`,
        url: window.location.href,
      })
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Define allowed tags
  const allowedTags = [
    "Writing", "Marketing", "Development", "Design", "SEO", "Content", "default", "null"
  ] as const;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <User className="h-12 w-12 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium mb-2">Profile Not Found</h3>
          <p className="text-muted-foreground mb-4">{error || "This user profile could not be found"}</p>
          <Button onClick={() => navigate("/marketplace")} className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
            Back to Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative mb-4">
                <img
                  src={profile.profilePicture || "/placeholder.svg?height=120&width=120"}
                  alt={profile.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-border"
                />
                <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-background"></div>
              </div>

              {/* Action Buttons */}
              {!profile.isCurrentUser && (
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={
                      profile.isFollowing
                        ? "bg-muted text-foreground hover:bg-red-500 hover:text-white"
                        : "bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                    }
                  >
                    {isFollowLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : profile.isFollowing ? (
                      <UserMinus className="h-4 w-4 mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {profile.isFollowing ? "Unfollow" : "Follow"}
                  </Button>

                  <Button variant="outline" onClick={handleMessage}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>

                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                {profile.isCurrentUser && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/profile/settings")}>
                    Edit Profile
                  </Button>
                )}
              </div>

              {profile.bio && <p className="text-muted-foreground mb-4 max-w-2xl">{profile.bio}</p>}

              {/* Profile Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}

                {profile.website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#3ebb9e]"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined{" "}
                  {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{profile.totalPrompts}</div>
                  <div className="text-sm text-muted-foreground">Prompts</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 text-yellow-400" />
                    {profile.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>

                <div
                  className="text-center p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                  onClick={() => {
                    setActiveTab("followers")
                    fetchFollowers()
                  }}
                >
                  <div className="text-2xl font-bold">{profile.followers}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>

                <div
                  className="text-center p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                  onClick={() => {
                    setActiveTab("following")
                    fetchFollowing()
                  }}
                >
                  <div className="text-2xl font-bold">{profile.following}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="prompts">Prompts ({prompts.length})</TabsTrigger>
            <TabsTrigger value="followers">Followers ({profile.followers})</TabsTrigger>
            <TabsTrigger value="following">Following ({profile.following})</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts">
            {prompts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {prompts.map((prompt) => (
                  <StandardPromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    description={prompt.description}
                    rating={prompt.rating}
                    uses={prompt.uses}
                    price={prompt.price}
                    featured={prompt.featured}
                    tags={
                      prompt.tags
                        .map(tag => allowedTags.includes(tag as typeof allowedTags[number]) ? (tag as typeof allowedTags[number]) : "default")
                    }
                    category={prompt.category}
                    authorName={profile.username}
                    isOwned={false}
                    isBought={false}
                    isPrivate={false}
                    isFavorite={false}
                    content=""
                    copiedId={null}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Public Prompts</h3>
                  <p>{profile.username} hasn't shared any public prompts yet.</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="followers">
            {followers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map((follower) => (
                  <Card key={follower.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <img
                        src={follower.profilePicture || "/placeholder.svg?height=40&width=40"}
                        alt={follower.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{follower.username}</h3>
                        {follower.bio && <p className="text-sm text-muted-foreground truncate">{follower.bio}</p>}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${follower.id}`)}>
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Followers</h3>
                  <p>{profile.username} doesn't have any followers yet.</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="following">
            {following.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.map((user) => (
                  <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.profilePicture || "/placeholder.svg?height=40&width=40"}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{user.username}</h3>
                        {user.bio && <p className="text-sm text-muted-foreground truncate">{user.bio}</p>}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${user.id}`)}>
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Not Following Anyone</h3>
                  <p>{profile.username} isn't following anyone yet.</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
