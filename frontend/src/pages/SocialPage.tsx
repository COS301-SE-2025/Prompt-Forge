"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Search, User, UserPlus, UserMinus, Star, TrendingUp, Users } from "lucide-react"

interface SocialUser {
  id: string
  username: string
  profilePicture?: string
  bio?: string
  followers: number
  following: number
  totalPrompts: number
  averageRating: number
  isFollowing: boolean
  isPopular: boolean
  joinedAt: string
}

export default function SocialPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<SocialUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<SocialUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("discover")
  const [followingUsers, setFollowingUsers] = useState<SocialUser[]>([])
  const [followingLoading, setFollowingLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const response = await fetch("http://localhost:8080/api/users/discover", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
          const data = await response.json()
          setUsers(data || [])
          setFilteredUsers(data || [])
        }
      } catch (err) {
        console.error("Failed to fetch users:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchFollowing = async () => {
      if (activeTab !== "following") return

      setFollowingLoading(true)
      try {
        const currentUserId = localStorage.getItem("userId")
        const response = await fetch(`http://localhost:8080/api/users/${currentUserId}/following`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
          const data = await response.json()
          setFollowingUsers(data || [])
        }
      } catch (err) {
        console.error("Failed to fetch following:", err)
      } finally {
        setFollowingLoading(false)
      }
    }

    fetchFollowing()
  }, [activeTab])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  const handleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      const endpoint = isCurrentlyFollowing ? "unfollow" : "follow"
      const response = await fetch(`http://localhost:8080/api/users/${userId}/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        // Update users list
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  isFollowing: !isCurrentlyFollowing,
                  followers: isCurrentlyFollowing ? user.followers - 1 : user.followers + 1,
                }
              : user,
          ),
        )

        // Update filtered users
        setFilteredUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  isFollowing: !isCurrentlyFollowing,
                  followers: isCurrentlyFollowing ? user.followers - 1 : user.followers + 1,
                }
              : user,
          ),
        )

        // Update following users if needed
        if (isCurrentlyFollowing) {
          setFollowingUsers((prev) => prev.filter((user) => user.id !== userId))
        }
      }
    } catch (err) {
      console.error("Failed to follow/unfollow:", err)
    }
  }

  const UserCard = ({ user }: { user: SocialUser }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={user.profilePicture || "/placeholder.svg?height=60&width=60"}
          alt={user.username}
          className="w-15 h-15 rounded-full object-cover cursor-pointer"
          onClick={() => navigate(`/profile/${user.id}`)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3
              className="font-semibold text-lg cursor-pointer hover:text-[#3ebb9e]"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              {user.username}
              {user.isPopular && <Star className="h-4 w-4 text-yellow-400 ml-1 inline" />}
            </h3>

            <Button
              size="sm"
              onClick={() => handleFollow(user.id, user.isFollowing)}
              className={
                user.isFollowing
                  ? "bg-muted text-foreground hover:bg-red-500 hover:text-white"
                  : "bg-[#3ebb9e] hover:bg-[#00674f] text-white"
              }
            >
              {user.isFollowing ? <UserMinus className="h-4 w-4 mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
              {user.isFollowing ? "Unfollow" : "Follow"}
            </Button>
          </div>

          {user.bio && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{user.bio}</p>}

          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <div className="font-semibold">{user.totalPrompts}</div>
              <div className="text-xs text-muted-foreground">Prompts</div>
            </div>
            <div>
              <div className="font-semibold flex items-center justify-center">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                {user.averageRating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div>
              <div className="font-semibold">{user.followers}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="font-semibold">{user.following}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Discover Users</h1>
          <p className="text-muted-foreground">Connect with other prompt engineers and creators</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Input
              placeholder="       Search users..."
              className="bg-muted border-muted pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery === "" && (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="discover" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => <UserCard key={user.id} user={user} />)
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Users Found</h3>
                    <p>Try adjusting your search terms</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="space-y-4">
              {filteredUsers
                .filter((user) => user.isPopular)
                .sort((a, b) => b.followers - a.followers)
                .map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="following">
            {followingLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3ebb9e] mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading following...</p>
                </div>
              </div>
            ) : followingUsers.length > 0 ? (
              <div className="space-y-4">
                {followingUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Not Following Anyone</h3>
                  <p>Start following users to see them here</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
