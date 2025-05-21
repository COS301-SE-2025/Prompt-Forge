import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, Github } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-b from-[hsl(var(--forge-green-dark))] to-[hsl(var(--forge-dark))] p-8 flex flex-col justify-center items-center text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="bg-white/10 p-4 rounded-full">
                <BrainCircuit className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Prompt Forge</h1>
            <p className="text-sm text-white/70 uppercase tracking-widest mb-8">Forge the future</p>

            <h2 className="text-xl font-semibold mb-4">
              Discover, Test & Master
              <br />
              AI Prompts
            </h2>

            <p className="text-sm text-white/80 mb-6">
              The marketplace for high-quality, tested AI prompts.
              <br />
              Buy, sell, test, and compare prompts to maximize
              <br />
              your AI potential.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-background p-8 flex items-center justify-center">
          <Card className="w-full max-w-md bg-card border-border">
            <div className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Input type="email" placeholder="Email" className="bg-muted border-muted" />
                  </div>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Password" className="bg-muted border-muted" />
                  </div>
                  <Button className="w-full bg-[hsl(var(--forge-green))] hover:bg-[hsl(var(--forge-green-dark))]">
                    Login
                  </Button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>

                  <div className="flex justify-between text-xs text-muted-foreground mt-4">
                    <Link href="#" className="hover:text-foreground">
                      Forgot?
                    </Link>
                    <Link href="#" className="hover:text-foreground">
                      Create Account
                    </Link>
                  </div>
                </TabsContent>
                <TabsContent value="signup" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Input type="text" placeholder="Username" className="bg-muted border-muted" />
                  </div>
                  <div className="space-y-2">
                    <Input type="email" placeholder="Email" className="bg-muted border-muted" />
                  </div>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Password" className="bg-muted border-muted" />
                  </div>
                  <Button className="w-full bg-[hsl(var(--forge-green))] hover:bg-[hsl(var(--forge-green-dark))]">
                    Sign Up
                  </Button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
