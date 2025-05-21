import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-b from-forge-green-dark to-forge-dark p-8 flex flex-col justify-center items-center text-center">
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

        <div className="w-full md:w-1/2 bg-forge-dark p-8 flex items-center justify-center">
          <Card className="w-full max-w-md bg-forge-card border-forge-card">
            <div className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-forge-darker">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Input type="email" placeholder="Email" className="bg-forge-darker border-forge-darker" />
                  </div>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Password" className="bg-forge-darker border-forge-darker" />
                  </div>
                  <Button className="w-full bg-forge-green hover:bg-forge-green-dark">Login</Button>

                  <div className="flex justify-between text-xs text-white/60 mt-4">
                    <Link href="#" className="hover:text-white">
                      Forgot?
                    </Link>
                    <Link href="#" className="hover:text-white">
                      Create Account
                    </Link>
                  </div>
                </TabsContent>
                <TabsContent value="signup" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Input type="text" placeholder="Username" className="bg-forge-darker border-forge-darker" />
                  </div>
                  <div className="space-y-2">
                    <Input type="email" placeholder="Email" className="bg-forge-darker border-forge-darker" />
                  </div>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Password" className="bg-forge-darker border-forge-darker" />
                  </div>
                  <Button className="w-full bg-forge-green hover:bg-forge-green-dark">Sign Up</Button>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
