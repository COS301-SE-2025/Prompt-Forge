"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { BrainCircuit, Github } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-b from-[#3ebb9e] to-[hsl(var(--background))] p-8 flex flex-col justify-center items-center text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="bg-white/10 p-4 rounded-full">
                <BrainCircuit className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2 text-white">Prompt Forge</h1>
            <p className="text-sm text-white/70 uppercase tracking-widest mb-8">Forge the future</p>

            <h2 className="text-xl font-semibold mb-4 text-white">
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
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex border-b border-border mb-6">
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "login" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "signup" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("signup")}
                >
                  Sign Up
                </button>
              </div>

              {activeTab === "login" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input type="email" placeholder="Email" className="bg-muted border-muted" />
                  </div>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Password" className="bg-muted border-muted" />
                  </div>
                  <Button className="w-full bg-[#3ebb9e] hover:bg-[#00674f]">Login</Button>

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
                    <Link to="#" className="hover:text-foreground">
                      Forgot?
                    </Link>
                    <Link to="#" className="hover:text-foreground">
                      Create Account
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "signup" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input type="text" placeholder="Username" className="bg-muted border-muted" />
                  </div>
                  <div className="space-y-2">
                    <Input type="email" placeholder="Email" className="bg-muted border-muted" />
                  </div>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Password" className="bg-muted border-muted" />
                  </div>
                  <Button className="w-full bg-[#3ebb9e] hover:bg-[#00674f]">Sign Up</Button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
