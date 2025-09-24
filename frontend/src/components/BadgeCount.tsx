import React, { useState, useEffect } from "react"
import { Award } from "lucide-react"
import { BadgeService } from "@/services/badgeService"

interface BadgeCountProps {
  userId?: string
  username?: string
  showIcon?: boolean
  className?: string
}

export const BadgeCount: React.FC<BadgeCountProps> = ({
  userId,
  username,
  showIcon = true,
  className = ""
}) => {
  const [badgeCount, setBadgeCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBadgeCount()
  }, [userId, username])

  const fetchBadgeCount = async () => {
    setLoading(true)
    try {
      let badges
      if (username) {
        badges = await BadgeService.getUserBadgesByUsername(username)
      } else if (userId) {
        badges = await BadgeService.getUserBadges(userId)
      } else {
        // Current user
        badges = await BadgeService.getMyEarnedBadges()
      }
      setBadgeCount(badges.length)
    } catch (error) {
      console.error("Failed to fetch badge count:", error)
      setBadgeCount(0)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        {showIcon && <Award className="w-4 h-4 mr-1 opacity-50" />}
        <span className="text-muted-foreground">-</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && <Award className="w-4 h-4 mr-1" />}
      <span className="font-semibold">{badgeCount}</span>
    </div>
  )
}