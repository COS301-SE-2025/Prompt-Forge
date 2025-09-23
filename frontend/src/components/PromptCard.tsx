import { Star, User, ShoppingCart, Eye } from "lucide-react"
import { Card } from "./ui/Card"
import { Button } from "./ui/Button"
import { Link } from "react-router-dom"
import { Category, CategoryColors } from "@/Models/Prompt"
import IdObfuscator from "@/utils/idObfuscator"

interface PromptCardProps {
  id: string
  tags: Category[]
  rating?: number
  reviewCount?: number
  title: string
  description: string
  authorname: string
  price: number
}

export const PromptCard = ({ 
  id, 
  tags,
  rating, 
  //reviewCount = 0,
  title, 
  description, 
  authorname, 
  price,
}: PromptCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col group hover:shadow-[0_0_20px_rgba(62,187,158,0.4)] hover:border-[#3ebb9e]/50">
      <Link to={`/prompt/${IdObfuscator.hide(id)}`} className="flex flex-col flex-1">
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <span 
                  key={tag}
                  className={`text-xs font-medium px-2 py-1 rounded ${CategoryColors[tag] ? CategoryColors[tag] : CategoryColors["default"]}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Rating - Simple single star with rating */}
            {rating ? (
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs ml-1">{rating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>

          <h3 className="font-medium mb-1 line-clamp-1 group-hover:text-[#3ebb9e] transition-colors duration-300">{title}</h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>

          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center group-hover:bg-[#3ebb9e]/10 transition-colors duration-300">
                <User className="h-3 w-3 group-hover:text-[#3ebb9e] transition-colors duration-300" />
              </div>
              <span className="text-xs ml-1 text-muted-foreground">@{authorname}</span>
            </div>
            <div className="text-xs font-medium group-hover:text-[#3ebb9e] transition-colors duration-300">
              {price === 0 ? "Free" : `ZAR ${price.toFixed(2)}`}
            </div>
          </div>
        </div>

        <div className="border-t border-border p-3 bg-gradient-to-r from-transparent to-transparent group-hover:from-[#3ebb9e]/5 group-hover:to-[#3ebb9e]/10 transition-all duration-300">
          <Button className="w-full h-10 bg-[#3ebb9e] hover:bg-[#00674f] text-white text-sm font-medium flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-[#3ebb9e]/25 transition-all duration-300">
            {price === 0 ? (
              <>
                <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                View
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                Buy Now
              </>
            )}
          </Button>
        </div>
      </Link>
    </Card>
  )
}