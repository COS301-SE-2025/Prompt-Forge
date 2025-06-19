import { Star, User } from "lucide-react"
import { Card } from "./ui/Card"
import { Button } from "./ui/Button"
import { CategoryColors, Prompt } from "@/models/Prompt";
import { Link } from "react-router-dom";

export const PromptCard = ({ id, category, rating, title, description, author, price, uses, featured }: Prompt) => {

    return <Card key={id} className="overflow-hidden hover:shadow-lg transition-shadow pointer hover:scale-[1.01]">
        <Link to={`/prompt/${id}`} >
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div
                        className={`text-xs font-medium px-2 py-1 rounded ${CategoryColors[category]}`}
                    >
                        {category}
                    </div>
                    <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs ml-1">{rating.toFixed(1)}</span>
                    </div>
                </div>

                <h3 className="font-medium mb-1 line-clamp-1">{title}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>

                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3" />
                        </div>
                        <span className="text-xs ml-1 text-muted-foreground">@{author}</span>
                    </div>
                    <div className="text-xs font-medium">${price.toFixed(2)}</div>
                </div>
            </div>

            <div className="border-t border-border flex">
                <div className="flex-1 py-2 text-center text-xs text-muted-foreground">
                    <span>{uses.toLocaleString()} uses</span>
                </div>
                <div className="border-l border-border">
                    <Button className="h-full rounded-none bg-[#3ebb9e] hover:bg-[#00674f]bg-[#3ebb9e] hover:bg-[#00674f] text-xs px-3">
                        Buy Now
                    </Button>
                </div>
            </div>
        </Link>
    </Card>

}