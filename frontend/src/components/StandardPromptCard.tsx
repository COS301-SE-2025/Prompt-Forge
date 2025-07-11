import { Button } from "./ui/Button"
import { Card } from "./ui/Card"
import {
  Star,
  User,
  Copy,
  Edit,
  Trash2,
  Heart,
  Play,
  Check,
  Globe,
  Lock
} from "lucide-react"
import { Link } from "react-router-dom"
import { Category, CategoryColors } from "@/models/Prompt"

// Update the interface to make onEdit optional
interface StandardPromptCardProps {
  id: string
  title: string
  description: string
  rating: number
  uses: number
  price: number
  featured: boolean
  isPrivate: boolean
  isFavorite: boolean
  tags: Category[]
  category: string
  authorName: string
  isOwned: boolean
  isPublished?: boolean // ✅ Add this
  isBought: boolean
  onEdit?: (prompt: any) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  onCopy?: (content: string, id: string) => void
  onPublish?: (id: string, isCurrentlyPublished: boolean) => void // ✅ Add this
  copiedId: string | null
  content: string
}

export function StandardPromptCard({
  id,
  title,
  description,
  rating,
  uses,
  price,
  featured,
  isPrivate,
  isFavorite,
  tags,
  category,
  authorName,
  isOwned = false,
  isPublished = false, // ✅ Add this
  isBought,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
  onPublish, // ✅ Add this
  copiedId,
  content
}: StandardPromptCardProps) {
  const displayTags = tags || []
  const displayUsage = uses || 0

  const handleEdit = () => {
    if (onEdit && isOwned) {
      const promptData = {
        id,
        title,
        description,
        category: category || "",
        tags: displayTags,
        content: content || "",
        isPrivate: isPrivate || false
      }
      onEdit(promptData)
    }
  }

  // Handle card click (navigate to details)
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
  }

  return (
    <Link to={`/prompt/${id}`} onClick={handleCardClick}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col cursor-pointer group hover:shadow-[0_0_20px_rgba(62,187,158,0.4)] hover:border-[#3ebb9e]/50">
        <div className="p-4 flex-1">
          {/* Header with tags and rating */}
          <div className="flex justify-between items-start mb-2">
            {/* Tags - Using same styling as PromptCard */}
            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {displayTags.slice(0, 3).map((tag) => {
                  return (
                    <span
                      key={tag}
                      className={`text-xs font-medium px-2 py-1 rounded ${CategoryColors[tag] ? CategoryColors[tag] : CategoryColors["default"]}`}
                    >
                      {tag}
                    </span>
                  );
                })}
                {displayTags.length > 3 && (
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                    +{displayTags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Rating and favorite button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs ml-1">{rating.toFixed(1)}</span>
              </div>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => onToggleFavorite(id)}
                >
                  <Star className={`h-3 w-3 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </Button>
              )}
            </div>
          </div>

          {/* Title and description */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm line-clamp-1 text-[#3ebb9e] transition-colors duration-300">{title}</h3>
            {featured && (
              <span className="bg-green-500/20 text-green-500 text-xs font-medium px-2 py-0.5 rounded">
                Featured
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>

          {/* Metadata */}
          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-2">
              {/* Usage count */}
              <span className="text-xs text-muted-foreground">{displayUsage} uses</span>

              {/* Category */}

            </div>

            <div className="flex items-center space-x-2">
              {/* Price - only for non-owned prompts */}
              {!isOwned && price !== undefined && (
                <div className="text-xs font-medium group-hover:text-[#3ebb9e] transition-colors duration-300">${price.toFixed(2)}</div>
              )}

              {/* Author info - only for non-owned prompts */}
              {isBought && authorName && (
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#3ebb9e]/10 transition-colors duration-300">
                    <User className="h-3 w-3 text-[#3ebb9e] transition-colors duration-300" />
                  </div>
                  <span className="text-xs ml-1 text-[#3ebb93]">@{authorName}</span>
                </div>
              )}

              {/* Private indicator - only for owned prompts */}
              {/* {isBought === true && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                  Bought
                </span>
              )} */}

              {isBought === false && isOwned && isPrivate && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                  Private
                </span>
              )}
              {isBought === false && isOwned && !isPrivate && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                  Public
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="border-t border-border flex bg-gradient-to-r from-transparent to-transparent group-hover:from-[#3ebb9e]/5 group-hover:to-[#3ebb9e]/10 transition-all duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="flex-1 flex items-center justify-between p-3">
            <div className="flex items-center space-x-1">
              {/* Copy button - always visible if content is available */}
              {onCopy && content && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isOwned ? "h-8 w-8" : "h-6 w-6"} group-hover:shadow-sm group-hover:shadow-[#3ebb9e]/20 transition-all duration-300`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onCopy(content, id)
                  }}
                  title="Copy prompt content"
                >
                  {copiedId === id ? (
                    <Check className={`${isOwned ? "h-4 w-4" : "h-3 w-3"} text-green-500`} />
                  ) : (
                    <Copy className={`${isOwned ? "h-4 w-4" : "h-3 w-3"} group-hover:scale-110 transition-transform duration-300`} />
                  )}
                </Button>
              )}

              {/* Test Prompt button - always visible if content is available */}
              {content && (
                <Link
                  to="/editor"
                  state={{ promptText: content }}
                  title="Test this prompt"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${isOwned ? "h-8 w-8" : "h-6 w-6"} text-green-600 hover:text-green-700 hover:bg-green-50 group-hover:shadow-sm group-hover:shadow-green-500/20 transition-all duration-300`}
                  >
                    <Play className={`${isOwned ? "h-4 w-4" : "h-3 w-3"} group-hover:scale-110 transition-transform duration-300`} />
                  </Button>
                </Link>
              )}

              {/* Publish/Unpublish button - only for owned prompts */}
              {!isBought && isOwned && onPublish && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${isPublished
                      ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    } group-hover:shadow-sm group-hover:shadow-blue-500/20 transition-all duration-300`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onPublish(id, isPublished)
                  }}
                  title={isPublished ? "Unpublish from marketplace" : "Publish to marketplace"}
                >
                  {isPublished ? (
                    <Globe className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <Lock className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  )}
                </Button>
              )}

              {/* Edit button - only for owned prompts */}
              {isOwned && onEdit && (
                <Link
                  to="/submit"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit()
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 group-hover:shadow-sm group-hover:shadow-[#3ebb9e]/20 transition-all duration-300"
                    title="Edit prompt"
                  >
                    <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  </Button>
                </Link>
              )}

              {/* Delete button - only for owned prompts */}
              {isOwned && onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 group-hover:shadow-sm group-hover:shadow-red-500/20 transition-all duration-300"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete(id)
                  }}
                  title="Delete prompt"
                >
                  <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </Button>
              )}
            </div>

            {/* Buy/Add to cart button - only for non-owned prompts */}
            {!isOwned && price !== undefined && (
              <div className="border-l border-border">
                <Button
                  className="h-full rounded-none bg-[#3ebb9e] hover:bg-[#00674f] text-xs px-3 group-hover:shadow-lg group-hover:shadow-[#3ebb9e]/25 transition-all duration-300"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Add your buy logic here
                  }}
                >
                  Buy Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}