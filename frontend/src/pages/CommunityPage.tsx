"use client"

import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import {
  //ArrowLeft,
  Star,
  MessageCircle,
  ThumbsUp,
  Award,
  TrendingUp,
  Search,
  Crown,
  Zap,
  Target,
  Lightbulb,
  Users,
  Calendar,
  Eye,
  Badge,
  Filter,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

interface Prompt {
  id: string
  title: string
  description: string
  author: string
  category: string
  ratings: {
    accuracy: number
    creativity: number
    clarity: number
    usefulness: number
    overall: number
  }
  totalRatings: number
  likes: number
  comments: number
  views: number
  badges: string[]
  createdAt: string
  tags: string[]
}

interface Announcement {
  id: string
  title: string
  content: string
  type: "update" | "event" | "feature"
  date: string
  author: string
}

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  // Mock data for prompts
  const prompts: Prompt[] = [
    {
      id: "1",
      title: "Advanced Code Review Assistant",
      description:
        "A comprehensive prompt for reviewing code with focus on best practices, security, and performance optimization.",
      author: "DevMaster",
      category: "Development",
      ratings: {
        accuracy: 4.8,
        creativity: 4.2,
        clarity: 4.9,
        usefulness: 4.7,
        overall: 4.7,
      },
      totalRatings: 156,
      likes: 89,
      comments: 23,
      views: 1240,
      badges: ["Top Rated", "Community Choice", "Expert Verified"],
      createdAt: "2024-01-15",
      tags: ["coding", "review", "best-practices"],
    },
    {
      id: "2",
      title: "Creative Writing Companion",
      description:
        "Unleash your creativity with this prompt designed to help writers overcome blocks and generate compelling narratives.",
      author: "WordSmith",
      category: "Creative",
      ratings: {
        accuracy: 4.3,
        creativity: 4.9,
        clarity: 4.5,
        usefulness: 4.6,
        overall: 4.6,
      },
      totalRatings: 203,
      likes: 127,
      comments: 45,
      views: 2100,
      badges: ["Most Creative", "Rising Star"],
      createdAt: "2024-01-12",
      tags: ["writing", "creativity", "storytelling"],
    },
    {
      id: "3",
      title: "Business Strategy Analyzer",
      description:
        "Comprehensive business analysis prompt for strategic planning, market research, and competitive analysis.",
      author: "BizGuru",
      category: "Business",
      ratings: {
        accuracy: 4.6,
        creativity: 4.1,
        clarity: 4.7,
        usefulness: 4.8,
        overall: 4.6,
      },
      totalRatings: 98,
      likes: 67,
      comments: 18,
      views: 890,
      badges: ["Business Leader"],
      createdAt: "2024-01-10",
      tags: ["business", "strategy", "analysis"],
    },
  ]

  // Mock data for announcements
  const announcements: Announcement[] = [
    {
      id: "1",
      title: "New Badge System Launch!",
      content:
        "We're excited to introduce our new badge system to recognize outstanding community contributions. Earn badges for top-rated prompts, helpful comments, and community engagement!",
      type: "feature",
      date: "2024-01-20",
      author: "Community Team",
    },
    {
      id: "2",
      title: "Weekly Prompt Challenge",
      content:
        "Join our weekly prompt challenge! This week's theme is 'AI for Education'. Submit your best educational prompts and win exclusive badges.",
      type: "event",
      date: "2024-01-18",
      author: "Challenge Team",
    },
  ]

  const categories = ["all", "Development", "Creative", "Business", "Education", "Marketing", "Research"]

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Top Rated":
        return <Crown className="h-3 w-3" />
      case "Community Choice":
        return <Users className="h-3 w-3" />
      case "Expert Verified":
        return <Badge className="h-3 w-3" />
      case "Most Creative":
        return <Lightbulb className="h-3 w-3" />
      case "Rising Star":
        return <TrendingUp className="h-3 w-3" />
      case "Business Leader":
        return <Target className="h-3 w-3" />
      default:
        return <Award className="h-3 w-3" />
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Top Rated":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
      case "Community Choice":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30"
      case "Expert Verified":
        return "bg-green-500/20 text-green-600 border-green-500/30"
      case "Most Creative":
        return "bg-purple-500/20 text-purple-600 border-purple-500/30"
      case "Rising Star":
        return "bg-orange-500/20 text-orange-600 border-orange-500/30"
      case "Business Leader":
        return "bg-indigo-500/20 text-indigo-600 border-indigo-500/30"
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30"
    }
  }

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.ratings.overall - a.ratings.overall
      case "likes":
        return b.likes - a.likes
      case "comments":
        return b.comments - a.comments
      case "views":
        return b.views - a.views
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile Responsive */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Community Hub</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Discover, rate, and discuss the best AI prompts</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile Sidebar Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Users className="h-4 w-4 mr-1" />
                <span className="text-xs">Info</span>
              </Button>
              <Link to="/submit">
                <Button size="sm" className="bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs sm:text-sm px-3 sm:px-4">
                  Submit Prompt
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters - Mobile Responsive */}
          <div className="space-y-3 sm:space-y-0">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search prompts, tags, or authors..."
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters - Mobile: Collapsible */}
            <div className="flex items-center justify-between pt-3 sm:pt-4">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden flex items-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                <span className="text-xs">Filters</span>
                <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center space-x-2 ml-auto">
                <select
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rating">Top Rated</option>
                  <option value="likes">Most Liked</option>
                  <option value="comments">Most Discussed</option>
                  <option value="views">Most Viewed</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters Dropdown */}
            {showFilters && (
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border">
                <select
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rating">Top Rated</option>
                  <option value="likes">Most Liked</option>
                  <option value="comments">Most Discussed</option>
                  <option value="views">Most Viewed</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Mobile Sidebar Overlay */}
          {showSidebar && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowSidebar(false)}>
              <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-background p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Community Info</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                    ✕
                  </Button>
                </div>
                <div className="space-y-4">
                  {/* Announcements - Mobile */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                      Announcements
                    </h3>
                    <div className="space-y-3">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="border-l-2 border-[#3ebb9e] pl-3">
                          <h4 className="text-sm font-medium text-foreground">{announcement.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{announcement.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">{announcement.date}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                announcement.type === "feature"
                                  ? "bg-green-500/20 text-green-600"
                                  : announcement.type === "event"
                                    ? "bg-blue-500/20 text-blue-600"
                                    : "bg-orange-500/20 text-orange-600"
                              }`}
                            >
                              {announcement.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Top Contributors - Mobile */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                      Top Contributors
                    </h3>
                    <div className="space-y-2">
                      {["DevMaster", "WordSmith", "BizGuru"].map((contributor, index) => (
                        <div key={contributor} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="text-sm text-foreground">{contributor}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">
                              {index === 0 ? "4.8" : index === 1 ? "4.6" : "4.5"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Announcements */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                Announcements
              </h3>
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-l-2 border-[#3ebb9e] pl-3">
                    <h4 className="text-sm font-medium text-foreground">{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{announcement.date}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          announcement.type === "feature"
                            ? "bg-green-500/20 text-green-600"
                            : announcement.type === "event"
                              ? "bg-blue-500/20 text-blue-600"
                              : "bg-orange-500/20 text-orange-600"
                        }`}
                      >
                        {announcement.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Contributors */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-[#3ebb9e]" />
                Top Contributors
              </h3>
              <div className="space-y-2">
                {["DevMaster", "WordSmith", "BizGuru"].map((contributor, index) => (
                  <div key={contributor} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-sm text-foreground">{contributor}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground">
                        {index === 0 ? "4.8" : index === 1 ? "4.6" : "4.5"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content - Mobile Responsive */}
          <div className="lg:col-span-3">
            <div className="space-y-3 sm:space-y-4">
              {sortedPrompts.map((prompt) => (
                <Card key={prompt.id} className="p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground hover:text-[#3ebb9e] cursor-pointer truncate">
                          {prompt.title}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground w-fit">
                          {prompt.category}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2 leading-relaxed">{prompt.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-muted-foreground">
                        <span>by {prompt.author}</span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {prompt.createdAt}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {prompt.views}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:text-right">
                      <div className="flex items-center space-x-1 mb-0 sm:mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-foreground">{prompt.ratings.overall.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({prompt.totalRatings})</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges - Mobile Responsive */}
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {prompt.badges.map((badge) => (
                      <span
                        key={badge}
                        className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full border ${getBadgeColor(badge)}`}
                      >
                        {getBadgeIcon(badge)}
                        <span className="hidden sm:inline">{badge}</span>
                        <span className="sm:hidden">{badge.split(' ')[0]}</span>
                      </span>
                    ))}
                  </div>

                  {/* Rating Breakdown - Mobile Responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    {Object.entries(prompt.ratings)
                      .filter(([key]) => key !== "overall")
                      .map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-xs text-muted-foreground capitalize mb-1">{key}</div>
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{value.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Tags - Mobile Responsive */}
                  <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                    {prompt.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-[#3ebb9e]/10 text-[#3ebb9e] rounded">
                        #{tag}
                      </span>
                    ))}
                    {prompt.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                        +{prompt.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Actions - Mobile Responsive */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 sm:pt-4 border-t border-border gap-3 sm:gap-0">
                    <div className="flex items-center justify-center sm:justify-start space-x-4">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-xs">
                        <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{prompt.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-xs">
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{prompt.comments}</span>
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                        Rate
                      </Button>
                      <Button size="sm" className="flex-1 sm:flex-none bg-[#3ebb9e] hover:bg-[#00674f] text-white text-xs">
                        Use Prompt
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More - Mobile Responsive */}
            <div className="text-center mt-6 sm:mt-8">
              <Button variant="outline" className="px-6 sm:px-8 text-sm">
                Load More Prompts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
