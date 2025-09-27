import React from "react"
import { Badge as UIBadge } from "@/components/ui/Badge"
import { 
  Star, Award, Trophy, Crown, Rocket, Zap, Gem, Medal, Users, 
  Megaphone, Shield, Calendar, CheckCircle, Target, 
  Flame, MessageCircle, ThumbsUp, Compass, BookOpen, TrendingUp, 
  Heart, Gift, Sparkles 
} from "lucide-react"

export interface BadgeData {
  badgeId: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  rarity: string
  isActive?: boolean
  progress?: number
  earnedAt?: string
  isVisible?: boolean
}

interface BadgeProps {
  badge: BadgeData
  size?: "sm" | "md" | "lg"
  showProgress?: boolean
  showTooltip?: boolean
  className?: string
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Star, Award, Trophy, Crown, Rocket, Zap, Gem, Medal, Users,
  Megaphone, Shield, Calendar, CheckCircle, Target,
  Flame, MessageCircle, ThumbsUp, Compass, BookOpen, TrendingUp,
  Heart, Gift, Sparkles
}

const rarityStyles: Record<string, string> = {
  common: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
  uncommon: "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300",
  rare: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300",
  epic: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300",
  legendary: "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300"
}

const progressColors: Record<string, string> = {
  common: "bg-gray-400",
  uncommon: "bg-green-400", 
  rare: "bg-blue-400",
  epic: "bg-purple-400",
  legendary: "bg-yellow-400"
}

export const BadgeComponent: React.FC<BadgeProps> = ({ 
  badge, 
  size = "md", 
  showProgress = false, 
  showTooltip = true,
  className = "" 
}) => {
  // Helper function to get progress details based on badge name and progress
  const getProgressDetails = (badge: BadgeData): string => {
    const progress = badge.progress || 0
    
    // Calculate current and target values based on badge name and progress percentage
    if (badge.name === "First Prompt") {
      return progress >= 100 ? "1/1 prompts" : "0/1 prompts"
    } else if (badge.name === "Prolific Creator") {
      const current = Math.floor((progress / 100) * 10)
      return `${current}/10 prompts`
    } else if (badge.name === "Prompt Master") {
      const current = Math.floor((progress / 100) * 50)
      return `${current}/50 prompts`
    } else if (badge.name === "Community Legend") {
      const current = Math.floor((progress / 100) * 100)
      return `${current}/100 prompts`
    } else if (badge.name === "Early Adopter") {
      return progress >= 100 ? "Achieved!" : "Limited time"
    } else if (badge.category === "social") {
      // Generic social badges
      if (progress >= 100) return "Achieved!"
      return "Keep engaging!"
    } else if (badge.category === "quality") {
      // Generic quality badges
      if (progress >= 100) return "Achieved!"
      return "Maintain quality!"
    } else if (badge.category === "streak") {
      // Generic streak badges
      if (progress >= 100) return "Achieved!"
      return "Keep the streak!"
    } else {
      // Default fallback
      return progress >= 100 ? "Achieved!" : "In progress"
    }
  }

  const IconComponent = iconMap[badge.icon] || Star
  const isEarned = badge.progress === 100 || badge.earnedAt
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5", 
    lg: "text-base px-4 py-2"
  }
  
  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  }
  
  const isCircular = className.includes('rounded-full')
  const hasBorder = !className.includes('border-0')
  
  const badgeContent = (
    <div className="relative">
      <UIBadge
        variant="secondary"
        className={`
          ${sizeClasses[size]} 
          ${rarityStyles[badge.rarity] || rarityStyles.common}
          ${isEarned ? 'opacity-100' : 'opacity-60'}
          ${className}
          transition-all duration-200 cursor-pointer
          border-2 font-medium
          text-black dark:text-white
          ${isCircular ? 'flex items-center justify-center' : ''}
        `}
        style={{ 
          borderColor: badge.color,
          backgroundColor: isEarned ? `${badge.color}20` : `${badge.color}10`
        }}
      >
        <IconComponent 
          size={isCircular ? iconSizes[size] - 2 : iconSizes[size]} 
          className={isCircular ? "" : "mr-1.5"} 
        />
        {!isCircular && badge.name}
      </UIBadge>
      
      {/* Progress bar for badges in progress */}
      {showProgress && badge.progress !== undefined && badge.progress < 100 && (
        <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{ 
              width: `${badge.progress}%`,
              background: `linear-gradient(90deg, ${badge.color}60, ${badge.color})`
            }}
          />
        </div>
      )}
    </div>
  )
  
  if (!showTooltip) {
    return badgeContent
  }
  
  return (
    <div className="group relative">
      {badgeContent}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-xs rounded-lg px-3 py-2 whitespace-nowrap max-w-xs shadow-lg border border-gray-700 dark:border-gray-600">
          <div className="font-semibold">{badge.name}</div>
          <div className="text-gray-300 dark:text-gray-400 mt-1">{badge.description}</div>
          {badge.earnedAt && (
            <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Earned on {new Date(badge.earnedAt).toLocaleDateString()}
            </div>
          )}
          {badge.progress !== undefined && badge.progress < 100 && (
            <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Progress: {badge.progress}% ({getProgressDetails(badge)})
            </div>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      </div>
    </div>
  )
}