import { useState } from "react"
import { Button } from "./ui/Button"
import { Card } from "./ui/Card"
import { Star, User, Edit, Trash2, Copy, Check, ShoppingCart } from "lucide-react"
import { Link } from "react-router-dom"
import { Category, CategoryColors } from "@/Models/Prompt"

interface StandardPromptCardProps {
  id: string
  title: string
  description: string
  rating: number
  usageCount?: number
  uses?: number
  price?: number
  featured?: boolean
  isPrivate?: boolean
  isFavorite?: boolean
  tags?: string[]
  tagnames?: string[]
  category?: string
  authorName?: string
  isOwned?: boolean // If true, shows edit/delete buttons
  onEdit?: (prompt: any) => void
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  onCopy?: (content: string, id: string) => void
  copiedId?: string | null
  content?: string
}

export function StandardPromptCard({
  id,
  title,
  description,
  rating,
  usageCount,
  uses,
  price,
  featured,
  isPrivate,
  isFavorite,
  tags,
  tagnames,
  category,
  authorName,
  isOwned = false,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
  copiedId,
  content
}: StandardPromptCardProps) {
  const displayTags = tags || tagnames || []
  const displayUsage = usageCount || uses || 0

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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow hover:scale-[1.01] h-full flex flex-col">
      <div className="p-4 flex-1">
        {/* Header with tags and rating */}
        <div className="flex justify-between items-start mb-2">
          {/* Tags - Using same styling as PromptCard */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {displayTags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    CategoryColors[tag as Category] ? CategoryColors[tag as Category] : CategoryColors["default"]
                  }`}
                >
                  {tag}
                </span>
              ))}
              {displayTags.length > 3 && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${CategoryColors["default"]}`}>
                  +{displayTags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Rating and favorite button */}
          <div className="flex items-center gap-2">
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
          <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
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
            {category && (
              <span className="text-xs text-muted-foreground">• {category}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Price - only for non-owned prompts */}
            {!isOwned && price !== undefined && (
              <div className="text-xs font-medium">${price.toFixed(2)}</div>
            )}
            
            {/* Author info - only for non-owned prompts */}
            {!isOwned && authorName && (
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-xs ml-1 text-muted-foreground">@{authorName}</span>
              </div>
            )}
            
            {/* Private indicator - only for owned prompts */}
            {isOwned && isPrivate && (
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                Private
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="border-t border-border flex">
        <div className="flex-1 flex items-center justify-between p-3">
          <div className="flex items-center space-x-1">
            {/* Copy button - always visible if content is available */}
            {onCopy && content && (
              <Button
                variant="ghost"
                size="icon"
                className={`${isOwned ? "h-8 w-8" : "h-6 w-6"}`}
                onClick={() => onCopy(content, id)}
                title="Copy prompt content"
              >
                {copiedId === id ? (
                  <Check className={`${isOwned ? "h-4 w-4" : "h-3 w-3"} text-green-500`} />
                ) : (
                  <Copy className={`${isOwned ? "h-4 w-4" : "h-3 w-3"}`} />
                )}
              </Button>
            )}
            
            {/* Edit button - only for owned prompts */}
            {isOwned && onEdit && (
              <Link to="/submit" onClick={handleEdit}>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit prompt">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            )}
            
            {/* Delete button - only for owned prompts */}
            {isOwned && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700"
                onClick={() => onDelete(id)}
                title="Delete prompt"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Buy/Add to cart button - only for non-owned prompts */}
          {!isOwned && price !== undefined && (
            <div className="border-l border-border">
              <Button className="h-full rounded-none bg-[#3ebb9e] hover:bg-[#00674f] text-xs px-3">
                Buy Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}