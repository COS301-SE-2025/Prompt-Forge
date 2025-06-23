import { Star, User } from "lucide-react"
import { Card } from "./ui/Card"
import { Button } from "./ui/Button"
import { Link } from "react-router-dom"
import { Category, CategoryColors, Tag } from "@/Models/Prompt"

interface PromptCardProps {
  id: string
  tags: Category[]
  rating?: number
  title: string
  description: string
  username: string
  price: number
  // featured?: boolean
  // tagsLoading?: boolean
}

export const PromptCard = ({ 
  id, 
  tags,
  rating, 
  title, 
  description, 
  username, 
  price,
  // tagsLoading = false
}: PromptCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow hover:scale-[1.01] h-full flex flex-col">
      <Link to={`/prompt/${id}`} className="flex flex-col flex-1">
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            {/* Tags with loading state */}
            { (
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <span 
                    key={tag}
                    className={`text-xs font-medium px-2 py-1 rounded ${CategoryColors[tag] ? CategoryColors[tag] : CategoryColors["default"] }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
              {
                rating?
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs ml-1">{rating.toFixed(1)}</span>
                </div>
                :null
                
              }
          </div>

          <h3 className="font-medium mb-1 line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>

          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3 w-3" />
              </div>
              <span className="text-xs ml-1 text-muted-foreground">@{username}</span>
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