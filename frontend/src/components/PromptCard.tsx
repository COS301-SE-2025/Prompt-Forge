import { Star, User } from "lucide-react"
import { Card } from "./ui/Card"
import { Button } from "./ui/Button"
import { Link } from "react-router-dom"
import { Tag } from "@/models/Prompt"

interface PromptCardProps {
  id: string
  tags: Tag[]
  rating?: number
  title: string
  description: string
  authorId: string
  price: number
  featured?: boolean
  tagsLoading?: boolean
}

export const PromptCard = ({ 
  id, 
  tags,
  rating, 
  title, 
  description, 
  authorId, 
  price,
  tagsLoading = false
}: PromptCardProps) => {
  const getTagColorClass = (tagName: string) => {
    const colorMap: Record<string, string> = {
      'Writing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Marketing': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Development': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Design': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'SEO': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      'Content': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    }
    return colorMap[tagName] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow hover:scale-[1.01] h-full flex flex-col">
      <Link to={`/prompt/${id}`} className="flex flex-col flex-1">
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            {/* Tags with loading state */}
            {tagsLoading ? (
              <div className="flex gap-1">
                {[1, 2].map((i) => (
                  <div 
                    key={i}
                    className="h-6 w-16 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <span 
                    key={tag.id}
                    className={`text-xs font-medium px-2 py-1 rounded ${getTagColorClass(tag.name)}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs ml-1">{rating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>

          <h3 className="font-medium mb-1 line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>

          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3 w-3" />
              </div>
              <span className="text-xs ml-1 text-muted-foreground">@{authorId}</span>
            </div>
            <div className="text-xs font-medium">${price.toFixed(2)}</div>
          </div>
        </div>

        <div className="border-t border-border flex">
          <div className="border-l border-border">
            <Button className="h-full rounded-none bg-[#3ebb9e] hover:bg-[#00674f] text-xs px-3">
              Buy Now
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  )
}