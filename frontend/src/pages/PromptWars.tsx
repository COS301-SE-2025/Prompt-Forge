"use client"

import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
  Swords,
  Send,
  Eye,
  EyeOff,
  Star,
  Trophy,
  Users,
  MessageCircle,
  Play,
  RotateCcw,
  Zap,
  Timer,
  Crown,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

type GameState = "waiting" | "scenario" | "writing" | "rating" | "results"

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
}

export default function PromptWarsPage() {
  const [gameState, setGameState] = useState<GameState>("waiting")
  const [scenario, setScenario] = useState("")
  const [isLoadingScenario, setIsLoadingScenario] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [myPrompt, setMyPrompt] = useState("")
  const [opponentPrompt, setOpponentPrompt] = useState("The opponent is crafting their strategy...")
  const [showOpponentPrompt, setShowOpponentPrompt] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [opponentRating, setOpponentRating] = useState(0)
  const [ratingExplanation, setRatingExplanation] = useState("")
  const [isLoadingRating, setIsLoadingRating] = useState(false)

  // Chat functionality
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      user: "System",
      message: "Welcome to Prompt Wars! Get ready to battle!",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [showChat, setShowChat] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Timer effect
  useEffect(() => {
    let interval: number
    if (gameState === "writing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("rating")
            setShowOpponentPrompt(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState, timeLeft])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const generateScenario = async () => {
    setIsLoadingScenario(true)
    setGameState("scenario")

    try {
      const requestBody = {
        messages: [
          {
            role: "user",
            content: `Generate a creative and engaging scenario for a prompt writing competition. The scenario should be:
            1. Specific enough to guide prompt creation
            2. Open-ended enough to allow creativity
            3. Interesting and fun to work with
            4. Suitable for AI prompt engineering

            Please provide just the scenario description in 2-3 sentences, nothing else.

            Examples of good scenarios:
            - "You're a time traveler who accidentally changed history. Write a prompt to help an AI figure out what went wrong and how to fix it."
            - "An alien species has just made contact with Earth, but they only communicate through colors and emotions. Create a prompt for an AI to help establish meaningful communication."
            - "You've discovered that your dreams are actually glimpses into parallel universes. Design a prompt for an AI to help you navigate and understand these alternate realities."

            Generate a new, unique scenario:`,
          },
        ],
      }

      const response = await fetch("http://localhost:8080/api/test/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const scenarioText = data.choices[0].message.content
          .replace(/\\u[\dA-F]{4}/gi, (match) => String.fromCharCode(Number.parseInt(match.replace(/\\u/g, ""), 16)))
          .replace(/\\n/g, "\n")
          .replace(/\\/g, "")
          .replace(/\*\*/g, "")
          .replace(/\*([^*]+)\*/g, "$1")

        setScenario(scenarioText)

        // Add scenario to chat
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            user: "System",
            message: `🎯 Scenario Generated: ${scenarioText}`,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      setScenario(
        "You are a detective in a cyberpunk city where memories can be stolen and sold. Create a prompt for an AI to help you solve a case involving missing memories from the city's most powerful citizens.",
      )
    } finally {
      setIsLoadingScenario(false)
    }
  }

  const startWritingPhase = () => {
    setGameState("writing")
    setTimeLeft(120)
    setMyPrompt("")
    setOpponentPrompt("The opponent is crafting their strategy...")
    setShowOpponentPrompt(false)

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: "System",
        message: "⏰ Writing phase started! You have 2 minutes to craft your prompt!",
        timestamp: new Date(),
      },
    ])

    // Simulate opponent writing
    setTimeout(() => {
      setOpponentPrompt(
        "Create a comprehensive AI assistant that can analyze stolen memory fragments, cross-reference them with the city's digital archives, identify patterns in memory theft techniques, and provide investigative leads while maintaining ethical boundaries around privacy and consent in a world where memories are commodities.",
      )
    }, 5000)
  }

  const getRating = async () => {
    setIsLoadingRating(true)

    const ratingPrompt = `
You are judging a prompt writing competition. Here's the scenario and two competing prompts:

SCENARIO: ${scenario}

PROMPT 1 (Player): ${myPrompt}

PROMPT 2 (Opponent): ${opponentPrompt}

Please evaluate both prompts based on:
1. Relevance to the scenario (25%)
2. Clarity and specificity (25%) 
3. Creativity and innovation (25%)
4. Practical effectiveness for AI (25%)

Provide:
1. A score for each prompt (1-10)
2. A brief explanation of your scoring
3. Declare the winner

Format your response as:
Player Score: X/10
Opponent Score: Y/10
Winner: [Player/Opponent/Tie]
Explanation: [Your detailed analysis]
`

    try {
      const requestBody = {
        messages: [
          {
            role: "user",
            content: ratingPrompt,
          },
        ],
      }

      const response = await fetch("http://localhost:8080/api/test/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const result = data.choices[0].message.content
          .replace(/\\u[\dA-F]{4}/gi, (match) => String.fromCharCode(Number.parseInt(match.replace(/\\u/g, ""), 16)))
          .replace(/\\n/g, "\n")
          .replace(/\\/g, "")

        // Parse the scores
        const playerScoreMatch = result.match(/Player Score:\s*(\d+)/i)
        const opponentScoreMatch = result.match(/Opponent Score:\s*(\d+)/i)

        if (playerScoreMatch) setMyRating(Number.parseInt(playerScoreMatch[1]))
        if (opponentScoreMatch) setOpponentRating(Number.parseInt(opponentScoreMatch[1]))

        setRatingExplanation(result)
        setGameState("results")
      }
    } catch (error) {
      setRatingExplanation("Error getting rating. Please try again.")
    } finally {
      setIsLoadingRating(false)
    }
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: "You",
          message: newMessage,
          timestamp: new Date(),
        },
      ])
      setNewMessage("")

      // Simulate opponent response (in real app, this would be real-time)
      setTimeout(
        () => {
          const responses = [
            "Good luck! 🔥",
            "This scenario is tricky!",
            "I'm ready for this challenge",
            "May the best prompt win!",
            "Time to get creative 🚀",
            "This is going to be close!",
          ]
          setChatMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              user: "Opponent",
              message: responses[Math.floor(Math.random() * responses.length)],
              timestamp: new Date(),
            },
          ])
        },
        1000 + Math.random() * 2000,
      )
    }
  }

  const resetGame = () => {
    setGameState("waiting")
    setScenario("")
    setMyPrompt("")
    setOpponentPrompt("The opponent is crafting their strategy...")
    setShowOpponentPrompt(false)
    setMyRating(0)
    setOpponentRating(0)
    setRatingExplanation("")
    setTimeLeft(120)

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: "System",
        message: "🔄 New game started! Ready for another round?",
        timestamp: new Date(),
      },
    ])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background">
      <div className="flex">
        {/* Main Game Area */}
        <div className={`flex-1 transition-all duration-300 ${showChat ? "mr-80" : ""}`}>
          {/* Header */}
          <div className="border-b border-border p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-[#3ebb9e] to-[#2ea688] rounded-lg">
                  <Swords className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Prompt Wars</h1>
                  <p className="text-muted-foreground">Battle of the prompts - may the best writer win!</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {gameState === "writing" && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <Timer className={`h-4 w-4 ${timeLeft <= 30 ? "text-red-500 animate-pulse" : "text-[#3ebb9e]"}`} />
                    <span className={`font-mono font-bold ${timeLeft <= 30 ? "text-red-500" : "text-[#3ebb9e]"}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>2 Players</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{showChat ? "Hide" : "Show"} Chat</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="p-6">
            {/* Waiting State */}
            {gameState === "waiting" && (
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="p-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#3ebb9e] to-[#2ea688] rounded-full flex items-center justify-center">
                    <Swords className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Ready for Battle?</h2>
                  <p className="text-muted-foreground mb-8">
                    Challenge your creativity in the ultimate prompt writing competition! You'll get a scenario and have
                    2 minutes to craft the perfect prompt.
                  </p>
                  <Button
                    onClick={generateScenario}
                    disabled={isLoadingScenario}
                    className="bg-gradient-to-r from-[#3ebb9e] to-[#2ea688] hover:from-[#2ea688] hover:to-[#259475] text-white px-8 py-3 text-lg"
                  >
                    {isLoadingScenario ? (
                      <>
                        <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                        Generating Scenario...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Start New Battle
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Scenario Display */}
            {gameState === "scenario" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 text-foreground">Your Scenario</h3>
                      <p className="text-foreground text-lg leading-relaxed mb-6">{scenario}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Read carefully - you'll have 2 minutes to write your prompt once the battle begins!
                        </p>
                        <Button onClick={startWritingPhase} className="bg-[#3ebb9e] hover:bg-[#00674f] text-white px-6">
                          <Play className="h-4 w-4 mr-2" />
                          Start Writing!
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            

            {/* Writing Phase */}
            {gameState === "writing" && (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Your Prompt */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Your Prompt</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{myPrompt.length} characters</span>
                      </div>
                    </div>
                    <textarea
                      className="w-full h-64 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] text-sm resize-none"
                      placeholder="Write your prompt here... Make it creative, specific, and effective!"
                      value={myPrompt}
                      onChange={(e) => setMyPrompt(e.target.value)}
                      disabled={timeLeft === 0}
                    />
                    <div className="mt-4 text-xs text-muted-foreground">
                      💡 Tip: Be specific about what you want the AI to do, provide context, and consider edge cases!
                    </div>
                  </Card>

                  {/* Opponent's Prompt (Blurred) */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Opponent's Prompt</h3>
                      <div className="flex items-center space-x-2">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Hidden until time's up</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full h-64 px-3 py-2 bg-muted border border-border rounded-lg text-sm overflow-hidden">
                        <div className="filter blur-sm select-none">{opponentPrompt}</div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-background/90 px-4 py-2 rounded-lg border">
                          <span className="text-sm text-muted-foreground">Opponent is writing...</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Scenario Reminder */}
                <Card className="mt-6 p-4 bg-blue-500/5 border-blue-500/20">
                  <div className="flex items-start space-x-3">
                    <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Scenario Reminder</h4>
                      <p className="text-sm text-muted-foreground">{scenario}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Rating Phase */}
            {gameState === "rating" && (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Time's Up! ⏰</h2>
                  <p className="text-muted-foreground">Now let's see how both prompts compare...</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Your Prompt */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Your Prompt</h3>
                    <div className="bg-muted rounded-lg p-4 text-sm">
                      <pre className="whitespace-pre-wrap text-foreground">{myPrompt || "No prompt submitted"}</pre>
                    </div>
                  </Card>

                  {/* Opponent's Prompt (Revealed) */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Opponent's Prompt</h3>
                    <div className="bg-muted rounded-lg p-4 text-sm">
                      <pre className="whitespace-pre-wrap text-foreground">{opponentPrompt}</pre>
                    </div>
                  </Card>
                </div>

                <div className="text-center">
                  <Button
                    onClick={getRating}
                    disabled={isLoadingRating}
                    className="bg-[#3ebb9e] hover:bg-[#2ea688] text-white px-8 py-3"
                  >
                    {isLoadingRating ? (
                      <>
                        <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                        AI Judge is Evaluating...
                      </>
                    ) : (
                      <>
                        <Star className="h-5 w-5 mr-2" />
                        Get AI Judge Rating
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Results */}
            {gameState === "results" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#3ebb9e] to-[#2ea688] rounded-full flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Battle Results</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card
                    className={`p-6 ${myRating > opponentRating ? "bg-green-500/10 border-green-500/20" : myRating < opponentRating ? "bg-red-500/10 border-red-500/20" : "bg-[#3ebb9e]/10 border-[#3ebb9e]/20"}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Your Score</h3>
                      {myRating > opponentRating && <Crown className="h-6 w-6 text-[#3ebb9e]" />}
                    </div>
                    <div className="text-4xl font-bold mb-2">{myRating}/10</div>
                    <div className="flex">
                      {[...Array(10)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < myRating ? "text-[#3ebb9e] fill-[#3ebb9e]" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </Card>

                  <Card
                    className={`p-6 ${opponentRating > myRating ? "bg-green-500/10 border-green-500/20" : opponentRating < myRating ? "bg-red-500/10 border-red-500/20" : "bg-[#3ebb9e]/10 border-[#3ebb9e]/20"}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Opponent Score</h3>
                      {opponentRating > myRating && <Crown className="h-6 w-6 text-[#3ebb9e]" />}
                    </div>
                    <div className="text-4xl font-bold mb-2">{opponentRating}/10</div>
                    <div className="flex">
                      {[...Array(10)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < opponentRating ? "text-[#3ebb9e] fill-[#3ebb9e]" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">AI Judge Analysis</h3>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-foreground">{ratingExplanation}</pre>
                  </div>
                </Card>

                <div className="text-center">
                  <Button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-[#3ebb9e] to-[#2ea688] hover:from-[#2ea688] hover:to-[#259475] text-white px-8 py-3"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Play Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                Live Chat
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowChat(false)}>
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`${msg.user === "You" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.user === "You"
                        ? "bg-[#3ebb9e] text-white"
                        : msg.user === "System"
                          ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="font-medium text-xs mb-1 opacity-75">{msg.user}</div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  className="bg-muted"
                />
                <Button onClick={sendMessage} size="icon" className="bg-[#3ebb9e] hover:bg-[#00674f]">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
