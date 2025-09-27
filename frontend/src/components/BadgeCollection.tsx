import React, { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { BadgeComponent, BadgeData } from "./BadgeComponent"
import { BadgeService } from "@/services/badgeService"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { API_BASE_URL } from "@/config/api"

interface BadgeCollectionProps {
  userId?: string
  username?: string
  showProgress?: boolean
  isOwnProfile?: boolean
  maxDisplay?: number
  title?: string
  circularDisplay?: boolean
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  userId,
  username,
  showProgress = false,
  isOwnProfile = false,
  maxDisplay,
  title = "Badges",
  circularDisplay = false
}) => {
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchBadges()
  }, [userId, username, showProgress])

  const fetchBadges = async () => {
    setLoading(true)
    setError(null)

    try {
      let url = `${API_BASE_URL}/badges`
      
      if (isOwnProfile && showProgress) {
        // Get current user's badges with progress
        url = `${API_BASE_URL}/badges/me`
      } else if (isOwnProfile && !showProgress) {
        // Get current user's earned badges only
        url = `${API_BASE_URL}/badges/me/earned`
      } else if (userId) {
        // Get specific user's earned badges
        url = `${API_BASE_URL}/badges/user/${userId}`
      } else if (username) {
        // Get specific user's earned badges by username
        url = `${API_BASE_URL}/badges/user/username/${username}`
      } else {
        // Get all available badges
        url = `${API_BASE_URL}/badges`
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        const data = await response.json()
        setBadges(data)
      } else {
        setError("Failed to load badges")
      }
    } catch (err) {
      setError("Error loading badges")
      console.error("Badge fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { key: "all", label: "All", count: badges.length },
    { key: "achievement", label: "Achievements", count: badges.filter(b => b.category === "achievement").length },
    { key: "social", label: "Social", count: badges.filter(b => b.category === "social").length },
    { key: "milestone", label: "Milestones", count: badges.filter(b => b.category === "milestone").length },
    { key: "special", label: "Special", count: badges.filter(b => b.category === "special").length },
    { key: "streak", label: "Streaks", count: badges.filter(b => b.category === "streak").length }
  ].filter(cat => cat.count > 0)

  const filteredBadges = selectedCategory === "all" 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory)

  const earnedBadges = filteredBadges.filter(badge => badge.progress === 100 || badge.earnedAt)
  const inProgressBadges = filteredBadges.filter(badge => badge.progress !== undefined && badge.progress < 100)

  const displayBadges = maxDisplay ? filteredBadges.slice(0, maxDisplay) : filteredBadges

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

  // Helper function to get next milestone information
  const getNextMilestone = (badge: BadgeData): string => {
    const progress = badge.progress || 0
    
    if (badge.name === "First Prompt") {
      return "Create your first prompt"
    } else if (badge.name === "Prolific Creator") {
      const current = Math.floor((progress / 100) * 10)
      const remaining = 10 - current
      return `${remaining} more prompt${remaining !== 1 ? 's' : ''}`
    } else if (badge.name === "Prompt Master") {
      const current = Math.floor((progress / 100) * 50)
      const remaining = 50 - current
      return `${remaining} more prompt${remaining !== 1 ? 's' : ''}`
    } else if (badge.name === "Community Legend") {
      const current = Math.floor((progress / 100) * 100)
      const remaining = 100 - current
      return `${remaining} more prompt${remaining !== 1 ? 's' : ''}`
    } else if (badge.name === "Early Adopter") {
      return "Limited time offer!"
    } else if (badge.category === "social") {
      return "Keep engaging with the community"
    } else if (badge.category === "quality") {
      return "Maintain high-quality content"
    } else if (badge.category === "streak") {
      return "Continue your streak"
    } else {
      return "Keep making progress"
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e]"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button onClick={fetchBadges} className="mt-2" variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (badges.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="text-center text-muted-foreground py-8">
          <p>No badges yet.</p>
          {isOwnProfile && (
            <p className="text-sm mt-2">
              Start creating prompts and engaging with the community to earn badges!
            </p>
          )}
        </div>
      </Card>
    )
  }

  const checkBadges = async () => {
    if (refreshing) return // Prevent multiple simultaneous requests
    
    setRefreshing(true)
    try {
      const result = await BadgeService.checkAndAssignBadges()
      console.log('Badge check result:', result)
      // Refresh badges after check
      await fetchBadges()
    } catch (error) {
      console.error('Error checking badges:', error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <Card className={`p-6 ${circularDisplay ? 'border-0 shadow-none' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {isOwnProfile && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {earnedBadges.length} earned
              {showProgress && inProgressBadges.length > 0 && (
                <span>, {inProgressBadges.length} in progress</span>
              )}
            </div>
            <Button 
              onClick={checkBadges} 
              variant="outline" 
              size="sm" 
              className="p-2"
              disabled={refreshing}
              title={refreshing ? "Checking for new badges..." : "Check for new badges"}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Category filter for full view */}
      {!maxDisplay && categories.length > 1 && (
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8 bg-gray-100 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
            {categories.map(category => (
              <TabsTrigger 
                key={category.key} 
                value={category.key} 
                className="text-xs rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ebb9e] data-[state=active]:to-[#2ea688] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {showProgress && isOwnProfile ? (
        <Tabs defaultValue="earned" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
            <TabsTrigger 
              value="earned" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ebb9e] data-[state=active]:to-[#2ea688] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              Earned
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ebb9e] data-[state=active]:to-[#2ea688] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              In Progress
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="earned" className="mt-4">
            <div className="h-80 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedBadges
                  .sort((a, b) => {
                    // Sort by rarity (legendary first) then by earned date
                    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 }
                    const rarityDiff = (rarityOrder[a.rarity as keyof typeof rarityOrder] || 5) - (rarityOrder[b.rarity as keyof typeof rarityOrder] || 5)
                    if (rarityDiff !== 0) return rarityDiff
                    return new Date(b.earnedAt || '').getTime() - new Date(a.earnedAt || '').getTime()
                  })
                  .map(badge => (
                  <div key={badge.badgeId} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transition-all duration-200 relative overflow-hidden border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-3 mb-3">
                      <BadgeComponent
                        badge={badge}
                        size="md"
                        showProgress={false}
                        showTooltip={false}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1 flex items-center">
                          Completed
                        </div>
                        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500 ease-out rounded-full bg-green-500 dark:bg-green-400"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {badge.description}
                    </p>
                    {badge.earnedAt && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                        Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                    {/* Shine effect for legendary and epic badges */}
                    {(badge.rarity === 'legendary' || badge.rarity === 'epic') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/30 dark:via-yellow-300/20 to-transparent animate-pulse rounded-lg pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
              {earnedBadges.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">🏆</div>
                    <p className="text-muted-foreground">No badges earned yet.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start creating prompts to earn your first badge!</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="mt-4">
            <div className="h-80 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressBadges
                  .sort((a, b) => (b.progress || 0) - (a.progress || 0)) // Sort by progress descending
                  .map(badge => (
                  <div key={badge.badgeId} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <BadgeComponent
                        badge={badge}
                        size="md"
                        showProgress={false}
                        showTooltip={false}
                      />
                      <div className="flex-1">
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {badge.description}
                    </p>
                    {badge.progress !== undefined && badge.progress < 100 && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Next milestone:</span>
                          <span className="text-green-600 dark:text-green-400">{getNextMilestone(badge)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {inProgressBadges.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">🎯</div>
                    <p className="text-muted-foreground">No badges in progress.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Keep creating and engaging to unlock new achievements!</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className={circularDisplay ? "max-h-40 overflow-y-auto custom-scrollbar" : "h-80 overflow-y-auto custom-scrollbar pr-2"}>
          <div className={circularDisplay 
            ? "flex flex-wrap gap-2 justify-center" 
            : "grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-3"
          }>
            {displayBadges.map(badge => (
              <div key={badge.badgeId} className={circularDisplay ? "" : "flex justify-center"}>
                <BadgeComponent
                  badge={badge}
                  size={circularDisplay ? "md" : "md"}
                  showProgress={showProgress}
                  className={circularDisplay ? "w-12 h-12 rounded-full p-0 min-w-12" : ""}
                />
              </div>
            ))}
          </div>
        </div>
      )}


    </Card>
  )
}