import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, ThumbsUp, User } from "lucide-react"
import Image from "next/image"

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Community</h1>
            <Button className="bg-[hsl(var(--forge-green))] hover:bg-[hsl(var(--forge-green-dark))]">
              Create Post
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Input placeholder="Search discussions..." className="bg-muted border-muted pl-10" />
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

          <Tabs defaultValue="discussions" className="w-full mb-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="showcase">Showcase</TabsTrigger>
              <TabsTrigger value="help">Help & Support</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
            </TabsList>

            <TabsContent value="discussions" className="mt-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4 bg-card border-border">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium mr-2">
                          user{i}_{i * 123}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Posted {i} day{i !== 1 ? "s" : ""} ago
                        </span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        {i % 2 === 0
                          ? `How to optimize prompts for ${i === 2 ? "creative writing" : "technical documentation"}?`
                          : `Share your experience with ${i === 1 ? "GPT-4" : i === 3 ? "Claude" : "Gemini"} prompts`}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {i % 2 === 0
                          ? `I've been trying to get better results for my ${i === 2 ? "creative writing" : "technical documentation"} prompts, but I'm not sure what I'm doing wrong. Any tips?`
                          : `I've been using ${i === 1 ? "GPT-4" : i === 3 ? "Claude" : "Gemini"} for a while now and wanted to share my experience and hear from others.`}
                      </p>
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {12 + i * 5}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {8 + i * 3}
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          {i === 1 ? "Hot" : i === 2 ? "Trending" : i === 3 ? "New" : "Active"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="showcase" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden bg-card border-border">
                    <div className="aspect-video relative bg-muted">
                      <Image
                        src={`/placeholder.svg?height=200&width=400&text=Prompt+Showcase+${i}`}
                        alt={`Showcase ${i}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1">
                        {i === 1
                          ? "Amazing AI Art Generator Prompt"
                          : i === 2
                            ? "Business Plan Creator"
                            : i === 3
                              ? "Technical Documentation Helper"
                              : "Creative Writing Assistant"}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {i === 1
                          ? "Create stunning AI art with this optimized prompt structure"
                          : i === 2
                            ? "Generate comprehensive business plans in minutes"
                            : i === 3
                              ? "Technical documentation made easy with this prompt"
                              : "Write creative stories with depth and character"}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-xs ml-1 text-muted-foreground">@user{i * 100}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{42 + i * 17}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="help" className="mt-6 space-y-4">
              <Card className="p-4 bg-card border-border">
                <h3 className="font-medium mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">How do I create an effective prompt?</h4>
                    <p className="text-xs text-muted-foreground">
                      Creating effective prompts involves being specific, providing context, and using clear
                      instructions. Check our guide for more details.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">How do I sell my prompts on the marketplace?</h4>
                    <p className="text-xs text-muted-foreground">
                      To sell prompts, you need to create a seller account, submit your prompt for review, and set a
                      price. Our team will review and approve it.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">What makes a prompt worth buying?</h4>
                    <p className="text-xs text-muted-foreground">
                      High-quality prompts are well-tested, produce consistent results, solve specific problems, and
                      save time for the user.
                    </p>
                  </div>
                </div>
                <Button className="mt-4 w-full">View All FAQs</Button>
              </Card>

              <Card className="p-4 bg-card border-border">
                <h3 className="font-medium mb-4">Recent Help Requests</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className="flex justify-between mb-1">
                        <h4 className="text-sm font-medium">
                          {i === 1
                            ? "How to test prompts across different models?"
                            : i === 2
                              ? "Payment issue with marketplace"
                              : "Can I transfer prompts between accounts?"}
                        </h4>
                        <span className="text-xs text-muted-foreground">{i}h ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {i === 1
                          ? "I want to test my prompts on different AI models but not sure how to do it efficiently."
                          : i === 2
                            ? "I tried to purchase a prompt but the payment failed multiple times."
                            : "I have two accounts and want to transfer my prompts from one to another."}
                      </p>
                      <div className="flex items-center text-xs">
                        <MessageSquare className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{i === 1 ? "5" : i === 2 ? "3" : "0"} replies</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Ask for Help
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="announcements" className="mt-6 space-y-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--forge-green))]/20 flex items-center justify-center mr-3">
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
                      className="text-[hsl(var(--forge-green))]"
                    >
                      <path d="M19.3 14.8C20.1 13.4 20.1 11.6 19.3 10.2L18 8L16.7 9.3C16.3 9.7 15.7 9.7 15.3 9.3C14.9 8.9 14.9 8.3 15.3 7.9L16.6 6.6L14.5 5.3C13.1 4.5 11.3 4.5 9.9 5.3L8.6 6.6L9.9 7.9C10.3 8.3 10.3 8.9 9.9 9.3C9.5 9.7 8.9 9.7 8.5 9.3L7.2 8L5.9 10.2C5.1 11.6 5.1 13.4 5.9 14.8L7.2 17L8.5 15.7C8.9 15.3 9.5 15.3 9.9 15.7C10.3 16.1 10.3 16.7 9.9 17.1L8.6 18.4L10.8 19.7C12.2 20.5 14 20.5 15.4 19.7L17.6 18.4L16.3 17.1C15.9 16.7 15.9 16.1 16.3 15.7C16.7 15.3 17.3 15.3 17.7 15.7L19 17L20.3 14.8Z" />
                      <path d="M12.5 12.5C12.5 13.3 11.8 14 11 14C10.2 14 9.5 13.3 9.5 12.5C9.5 11.7 10.2 11 11 11C11.8 11 12.5 11.7 12.5 12.5Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">New Feature: Prompt Analytics Dashboard</h3>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <p className="text-sm mb-3">
                  We're excited to announce our new Prompt Analytics Dashboard! Now you can track the performance of
                  your prompts with detailed metrics and insights.
                </p>
                <Button variant="outline" size="sm">
                  Read More
                </Button>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
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
                      className="text-blue-500"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Platform Update: Version 2.5 Released</h3>
                    <p className="text-xs text-muted-foreground">1 week ago</p>
                  </div>
                </div>
                <p className="text-sm mb-3">
                  We've released version 2.5 of Prompt Forge with improved performance, new prompt templates, and
                  enhanced collaboration features.
                </p>
                <Button variant="outline" size="sm">
                  Read More
                </Button>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
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
                      className="text-purple-500"
                    >
                      <path d="M12 2v7.5" />
                      <path d="M16 5.25 12 7.5 8 5.25" />
                      <path d="M3 10.5c0-1 .5-2 3-2" />
                      <path d="M21 10.5c0-1-.5-2-3-2" />
                      <path d="M12 7.5V10" />
                      <path d="M19.5 19.25c-1.2.8-2.85.75-3.5.25" />
                      <path d="M8 19.5c-1.2.8-2.7.75-3.5.25" />
                      <path d="M12 10v3.5" />
                      <path d="M12 18.5V22" />
                      <path d="M12 13.5c-2.5 0-2.5 2.5-5 2.5" />
                      <path d="M12 13.5c2.5 0 2.5 2.5 5 2.5" />
                      <path d="M12 18.5c-1.5 0-2-1-2-2" />
                      <path d="M12 18.5c1.5 0 2-1 2-2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">New AI Models Added</h3>
                    <p className="text-xs text-muted-foreground">2 weeks ago</p>
                  </div>
                </div>
                <p className="text-sm mb-3">
                  We've added support for the latest AI models from OpenAI, Anthropic, and Google. Test your prompts
                  across all these models to find the best fit.
                </p>
                <Button variant="outline" size="sm">
                  Read More
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
