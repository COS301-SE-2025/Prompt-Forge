import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Plus, Star, Trash, User } from "lucide-react"

export default function MyPromptsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Prompts</h1>
            <Button className="bg-[hsl(var(--forge-green))] hover:bg-[hsl(var(--forge-green-dark))]">
              <Plus className="h-4 w-4 mr-2" />
              Create New Prompt
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Input placeholder="Search your prompts..." className="bg-muted border-muted pl-10" />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full mb-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="all">All Prompts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="bg-green-500/20 text-green-500 text-xs font-medium px-2 py-1 rounded">
                      {i % 2 === 0 ? "Published" : "Draft"}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs ml-1">4.{7 + (i % 3)}</span>
                    </div>
                  </div>

                  <h3 className="font-medium mb-1">Advanced Story Generator {i}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    An advanced prompt to generate detailed and creative story outlines for any genre.
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                      <span className="text-xs ml-1 text-muted-foreground">@theo_unknown</span>
                    </div>
                    <div className="text-xs font-medium">${(4.99 + (i % 5)).toFixed(2)}</div>
                  </div>
                </div>

                <div className="border-t border-border flex">
                  <Button variant="ghost" className="flex-1 h-9 rounded-none text-xs">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <div className="border-l border-border">
                    <Button
                      variant="ghost"
                      className="h-9 rounded-none text-xs px-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
