import { Star } from "lucide-react";
import { Link } from "react-router-dom";


interface RecentActivityProps{
  heading:string,
  rating:number,
  usesCount:number
  promptId:string
}
export function TopPrompt({ heading, rating, usesCount, promptId }:RecentActivityProps) {
    return <div className="mb-5 flex text-muted-foreground justify-between items-center w-full">
        <div>
            <div className="text-foreground text-sm">{heading}</div>
            <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-xs text-rating font-medium">{rating}</span>
                <span className="ml-2 text-muted-foreground">{usesCount} uses</span>
            </div>
        </div>
        <Link to={`/prompt/${promptId}`}><button className="text-[#0066e2] font-semibold">view</button></Link>
    </div>
}
  

