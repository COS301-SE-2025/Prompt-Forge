"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Star, Swords, Timer, Crown, Gem, UserPlus, Sparkles } from "lucide-react"
import type React from "react"
import { useState } from "react"

interface Prompt {
  id: string
  title: string
  description: string
  content: string
  tags: string[]
  price: number
  authorId: string
  authorName?: string
  createdAt: string
  rating?: number
  totalRatings?: number
}

interface SocialUser {
  userId: string
  username: string
  email?: string
  profilePictureUrl?: string
  bio?: string
  followers: string[] | number
  following: string[] | number
  active: boolean
  createdAt: string
  updatedAt: string
  role: string
  badges?: string[]
  prompts?: Prompt[]
  totalPrompts?: number
  averageRating?: number
  isPopular?: boolean
  isFollowing?: boolean
}

type UserCardProps = {
  user: SocialUser
  handleFollow: (userId: string, isCurrentlyFollowing: boolean) => void
  setSelectedOpponent: (user: SocialUser) => void
  setShowChallengeModal: (show: boolean) => void
  showNotification: (msg: string) => void
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  handleFollow,
  setSelectedOpponent,
  setShowChallengeModal,
  showNotification,
}) => {
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col cursor-pointer group hover:shadow-[0_0_20px_rgba(62,187,158,0.4)] hover:border-[#3ebb9e]/50">
      {/* Header with Avatar and Status */}
      <div className="relative p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="relative">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-border group-hover:border-[#3ebb9e] transition-all duration-300">
                <AvatarImage
                  src={!imageError ? user.profilePictureUrl : undefined}
                  alt={user.username}
                  onError={() => setImageError(true)}
                />
                <AvatarFallback className="bg-[#3ebb9e] text-white font-semibold text-lg">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Fixed Online Status - properly aligned */}
              {user.active && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full shadow-sm" />
              )}

              {/* Popular Badge */}
              {user.isPopular && (
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {user.isFollowing && (
              <Button
                size="sm"
                variant="outline"
                className="border-border text-muted-foreground hover:border-[#3ebb9e] hover:text-[#3ebb9e] transition-colors duration-300"
                onClick={() => handleFollow(user.userId, user.isFollowing || false)}
              >
                Following
              </Button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-sm line-clamp-1 text-[#3ebb9e] transition-colors duration-300 cursor-pointer">
              {user.username}
            </h3>
            {user.badges?.includes("Verified") && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {user.bio || "Exploring the world of AI prompts ✨"}
          </p>

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {user.badges.slice(0, 2).map((badge, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border border-border"
                >
                  {badge === "Top Creator" && <Sparkles className="w-3 h-3 mr-1" />}
                  {badge === "Verified" && <Gem className="w-3 h-3 mr-1" />}
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-3 border-t border-border bg-gradient-to-r from-transparent to-transparent group-hover:from-[#3ebb9e]/5 group-hover:to-[#3ebb9e]/10 transition-all duration-300">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-foreground">
              {typeof user.followers === "number" ? user.followers.toLocaleString() : user.followers.length}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Followers</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-foreground">{user.totalPrompts?.toLocaleString() || 0}</div>
            <div className="text-xs text-muted-foreground font-medium">Prompts</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-lg font-semibold text-foreground">{user.averageRating?.toFixed(1) || "0.0"}</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium">Rating</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border flex bg-gradient-to-r from-transparent to-transparent group-hover:from-[#3ebb9e]/5 group-hover:to-[#3ebb9e]/10 transition-all duration-300">
        <div className="flex-1 flex items-center justify-end p-3">
          <div className="flex space-x-2">
            {/* Challenge Button - only for following users */}
            {user.isFollowing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (user.active) {
                    setSelectedOpponent(user)
                    setShowChallengeModal(true)
                  } else {
                    showNotification(`${user.username} is currently offline. Try again when they're online!`)
                  }
                }}
                className={`transition-all duration-300 group-hover:shadow-sm ${
                  user.active
                    ? "border-[#3ebb9e] text-[#3ebb9e] hover:bg-[#3ebb9e] hover:text-white group-hover:shadow-[#3ebb9e]/20"
                    : "border-border text-muted-foreground cursor-not-allowed opacity-60"
                }`}
                disabled={!user.active}
                title={user.active ? "Challenge to Prompt Wars" : "User is offline"}
              >
                {user.active ? (
                  <>
                    <Swords className="h-4 w-4 mr-2" />
                    Challenge
                  </>
                ) : (
                  <>
                    <Timer className="h-4 w-4 mr-2" />
                    Offline
                  </>
                )}
              </Button>
            )}

            {/* Follow Button - only for non-following users */}
            {!user.isFollowing && (
              <Button
                size="sm"
                className="bg-[#3ebb9e] hover:bg-[#00674f] text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#3ebb9e]/25"
                onClick={() => handleFollow(user.userId, user.isFollowing || false)}
              >
                <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Follow
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
