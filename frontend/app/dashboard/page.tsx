import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, ChevronUp, Star, TrendingUp, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-card border-r border-border p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-2">
              <Image
                src="/placeholder.svg?height=80&width=80"
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full"
              />
              <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-card"></div>
            </div>
            <h3 className="font-medium">theo_unknown</h3>

            <div className="grid grid-cols-3 gap-4 w-full mt-4">
              <div className="text-center">
                <div className="font-semibold">2</div>
                <div className="text-xs text-muted-foreground">Prompts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">1</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">4</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>

            <div className="w-full mt-6">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-muted-foreground">Avg. Rating</div>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(var(--forge-green))] rounded-full" style={{ width: "96%" }}></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-green-500">+0.2 this week</span>
                <span className="text-muted-foreground">Last month</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-sm">Home</span>
            </div>
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-md bg-muted cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <line x1="10" x2="8" y1="9" y2="9" />
                </svg>
              </div>
              <span className="text-sm font-medium">Catalog</span>
            </div>
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <span className="text-sm">Email</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>markdavis@gmail.com</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-4 bg-card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total Prompts</p>
                  <h3 className="text-2xl font-bold">175</h3>
                </div>
                <div className="bg-[hsl(var(--forge-green))]/10 p-2 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[hsl(var(--forge-green))]"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <line x1="10" x2="8" y1="9" y2="9" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <ChevronUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+12.5% last month</span>
              </div>
            </Card>

            <Card className="p-4 bg-card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total Uses</p>
                  <h3 className="text-2xl font-bold">1.2k</h3>
                </div>
                <div className="bg-blue-500/10 p-2 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <ChevronUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+8.1% last month</span>
              </div>
            </Card>

            <Card className="p-4 bg-card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Usage</p>
                  <h3 className="text-2xl font-bold">15.2k</h3>
                </div>
                <div className="bg-purple-500/10 p-2 rounded-md">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="flex items-center text-xs">
                <ChevronUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+5.3% last month</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <Card className="bg-card">
                <div className="p-4 border-b border-border">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
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
                        className="mr-2"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      Recent Activity
                    </h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                      </svg>
                    </Button>
                  </div>
                </div>
                <div className="p-0">
                  <div className="border-b border-border p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-500"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">story_crafter - created a new prompt</p>
                        <p className="text-xs text-muted-foreground">Advanced Story Generator</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">2h</div>
                  </div>

                  <div className="border-b border-border p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">janeSmith - rated your prompt</p>
                        <p className="text-xs text-muted-foreground">Technical Writing Assistant</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">5h</div>
                  </div>

                  <div className="border-b border-border p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-500"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">alex.johnson - followed you</p>
                        <p className="text-xs text-muted-foreground">Now following your prompts</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">1d</div>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-purple-500"
                        >
                          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                          <path d="M1 21h22" />
                          <path d="M6 21v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">marketplace - prompt sold</p>
                        <p className="text-xs text-muted-foreground">Creative Storytelling Assistant</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">2d</div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card className="bg-card">
                <div className="p-4 border-b border-border">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
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
                        className="mr-2"
                      >
                        <path d="M12 20V10" />
                        <path d="m18 20-6-6-6 6" />
                        <path d="M18 4H6" />
                        <path d="M18 8H6" />
                      </svg>
                      Top Performing Prompts
                    </h3>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                      </svg>
                    </Button>
                  </div>
                </div>
                <div className="p-0">
                  <div className="border-b border-border p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Technical Writing</p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-xs">4.9</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>934 uses</span>
                      <Link href="#" className="text-[hsl(var(--forge-green))]">
                        View
                      </Link>
                    </div>
                  </div>

                  <div className="border-b border-border p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Creative Storytelling</p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-xs">4.7</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>756 uses</span>
                      <Link href="#" className="text-[hsl(var(--forge-green))]">
                        View
                      </Link>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Code Documentation</p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-xs">4.5</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>592 uses</span>
                      <Link href="#" className="text-[hsl(var(--forge-green))]">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">My Prompts</h2>
              <Button variant="outline" size="sm" className="h-8">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-card border-border overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-green-500/20 text-green-500 text-xs font-medium px-2 py-1 rounded">
                        Featured
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs ml-1">4.8</span>
                      </div>
                    </div>

                    <h3 className="font-medium mb-1">Advanced Story Generator</h3>
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
                      <div className="text-xs font-medium">$9.99</div>
                    </div>
                  </div>

                  <div className="border-t border-border flex">
                    <div className="flex-1 py-2 text-center text-xs text-muted-foreground">
                      <span>245 uses</span>
                    </div>
                    <div className="border-l border-border">
                      <Button className="h-full rounded-none bg-[hsl(var(--forge-green))] hover:bg-[hsl(var(--forge-green-dark))] text-xs px-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                          <path d="M3 6h18" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <span className="ml-1">Add to store</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
