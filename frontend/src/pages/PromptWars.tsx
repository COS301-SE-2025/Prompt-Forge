"use client"

import { API_BASE_URL } from '../config/api';
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
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
  Loader2,
  AlertCircle,
  Shield,
  Target,
  Flame,
  Sparkles,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { promptWarsGameAPI, GameResponse, GameStateDetails, PromptSubmission } from "../services/promptWarsGameAPI"
import { promptWarsWebSocket, GameUpdate } from "../services/promptWarsWebSocket"

type GameState = "waiting" | "scenario" | "writing" | "rating" | "results" | "finished" | "cancelled"

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
}

// Helper function to generate unique IDs (move outside component)
let idCounter = 0
const generateUniqueId = () => `${Date.now()}-${++idCounter}`

export default function PromptWarsPage() {
  
  // Helper function to show user-friendly error messages
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
      return error
    }
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      // Transform backend errors to user-friendly messages
      if (message.includes('already in an active game')) {
        return 'You are currently in another battle. Please finish your current battle before starting a new one.'
      }
      if (message.includes('player is already in an active game')) {
        return 'This player is currently in another battle. Please try challenging them later.'
      }
      if (message.includes('users you follow')) {
        return 'You can only challenge users you follow. Please follow this user first.'
      }
      if (message.includes('currently offline')) {
        return 'This user is currently offline. Please try again when they are online.'
      }
      if (message.includes('pending challenge')) {
        return 'You already have a pending challenge with this user. Please wait for them to respond.'
      }
      if (message.includes('not found')) {
        return 'The requested battle could not be found. It may have been cancelled or completed.'
      }
      if (message.includes('unauthorized')) {
        return 'You are not authorized to view this battle.'
      }
      if (message.includes('network') || message.includes('fetch')) {
        return 'Connection error. Please check your internet connection and try again.'
      }
      
      return error.message
    }
    
    return 'An unexpected error occurred. Please try again.'
  }

  // Get gameId from URL params (for /prompt-wars/game/:gameId)
  const params = useParams();
  const gameId = params.gameId;
  const isMultiplayerGame = !!gameId
  
  // Game data from backend
  const [gameData, setGameData] = useState<GameResponse | null>(null)
  const [gameStateDetails, setGameStateDetails] = useState<GameStateDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Game state
  const [gameState, setGameState] = useState<GameState>("waiting")
  const [scenario, setScenario] = useState("")
  const [isLoadingScenario, setIsLoadingScenario] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [myPrompt, setMyPrompt] = useState("")
  const [opponentPrompt, setOpponentPrompt] = useState("")
  const [showOpponentPrompt, setShowOpponentPrompt] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [opponentRating, setOpponentRating] = useState(0)
  const [ratingExplanation, setRatingExplanation] = useState("")
  const [isLoadingRating, setIsLoadingRating] = useState(false)
  const [winner, setWinner] = useState<"player" | "opponent" | "tie" | null>(null)
  const [opponentName, setOpponentName] = useState("Player 2")

  // UI state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: generateUniqueId(),
      user: "System",
      message: "⚔️ Welcome to the Arena! Prepare for battle!",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [showChat, setShowChat] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize multiplayer game and WebSocket
  useEffect(() => {
    if (isMultiplayerGame && gameId) {
      console.log('Initializing multiplayer game:', gameId)
      
      // Connect to WebSocket
      const userId = localStorage.getItem('userId')
      if (userId) {
        promptWarsWebSocket.connect(userId).then(() => {
          console.log('Joining game room:', gameId, 'with userId:', userId)
          promptWarsWebSocket.joinGameRoom(gameId)
        }).catch(console.error)
      }
      
      // Load game data
      loadGameData()
      
      // Add welcome message for multiplayer
      setChatMessages(prev => [
        ...prev,
        {
          id: generateUniqueId(),
          user: "System",
          message: `🎮 Joined multiplayer game! Game ID: ${gameId.slice(0, 8)}...`,
          timestamp: new Date(),
        },
      ])
      
      setOpponentName("Player 2")
    }

    return () => {
      if (gameId) {
        promptWarsWebSocket.leaveGameRoom(gameId)
      }
    }
  }, [gameId, isMultiplayerGame])

  // WebSocket event listeners
  useEffect(() => {
    const unsubscribeGameUpdate = promptWarsWebSocket.on('GAME_STATE_UPDATE', (update: GameUpdate) => {
      if (update.gameId === gameId) {
        console.log('Game state update received:', update)
        setGameState(update.gameState.toLowerCase() as GameState)
        if (update.scenario) {
          setScenario(update.scenario)
        }
        loadGameData() // Refresh full game state
      }
    })

    // Handle scenario generation
    const unsubscribeScenarioGenerated = promptWarsWebSocket.on('SCENARIO_GENERATED', (data: any) => {
      if (data.gameId === gameId) {
        console.log('Scenario generated:', data)
        setScenario(data.scenario)
        setGameState(data.gameState.toLowerCase() as GameState)
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "⏰ Writing phase started! You have 2 minutes to craft your prompt.",
            timestamp: new Date(),
          },
        ])
        setTimeLeft(120)
      }
    })

    // Handle prompt submissions
    const unsubscribePromptSubmitted = promptWarsWebSocket.on('PROMPT_SUBMITTED', (data: any) => {
      if (data.gameId === gameId) {
        console.log('Prompt submitted:', data)
        // Show notification that someone submitted
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "📝 A player submitted their prompt!",
            timestamp: new Date(),
          },
        ])
      }
    })

    // Handle phase changes
    const unsubscribePhaseChange = promptWarsWebSocket.on('PHASE_CHANGE', (data: any) => {
      if (data.gameId === gameId) {
        console.log('Phase change:', data)
        setGameState(data.newPhase.toLowerCase() as GameState)
        
        if (data.newPhase === 'RATING') {
          setChatMessages(prev => [
            ...prev,
            {
              id: generateUniqueId(),
              user: "System",
              message: "🎯 Both players submitted! Time to rate the prompts.",
              timestamp: new Date(),
            },
          ])
          loadGameData() // Load prompts for rating
        } else if (data.newPhase === 'FINISHED') {
          setChatMessages(prev => [
            ...prev,
            {
              id: generateUniqueId(),
              user: "System",
              message: "🏁 Battle complete! Check the results!",
              timestamp: new Date(),
            },
          ])
          loadGameData() // Load final results
        }
      }
    })

    // Handle rating submissions
    const unsubscribeRatingSubmitted = promptWarsWebSocket.on('RATING_SUBMITTED', (data: any) => {
      if (data.gameId === gameId) {
        console.log('Rating submitted:', data)
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "⭐ A player submitted their rating!",
            timestamp: new Date(),
          },
        ])
      }
    })

    const unsubscribeChatMessage = promptWarsWebSocket.on('GAME_CHAT', (chatData: any) => {
      if (chatData.gameId === gameId) {
        console.log('Chat message received:', chatData)
        
        const currentUserId = localStorage.getItem('userId')
        const isOwnMessage = chatData.userId === currentUserId
        
        // Show all messages - both your own and opponent's
        const newChatMessage: ChatMessage = {
          id: `${chatData.userId}-${chatData.timestamp}`,
          user: isOwnMessage ? 'You' : (opponentName || 'Opponent'),
          message: chatData.message,
          timestamp: new Date(chatData.timestamp)
        }
        console.log('Adding chat message:', newChatMessage)
        setChatMessages(prev => {
          // Prevent duplicate messages by checking if this exact message already exists
          const messageExists = prev.some(msg => 
            msg.id === newChatMessage.id || 
            (msg.message === newChatMessage.message && 
             msg.user === newChatMessage.user && 
             Math.abs(msg.timestamp.getTime() - newChatMessage.timestamp.getTime()) < 1000)
          )
          
          if (!messageExists) {
            return [...prev, newChatMessage]
          }
          return prev
        })
      }
    })

    const unsubscribeUserJoined = promptWarsWebSocket.on('USER_JOINED_GAME', (data: any) => {
      if (data.gameId === gameId) {
        console.log('User joined game room:', data)
        setChatMessages(prev => [...prev, {
          id: generateUniqueId(),
          user: "System",
          message: `🚀 Another player joined the game!`,
          timestamp: new Date(),
        }])
      }
    })

    const unsubscribeAll = promptWarsWebSocket.onAny((data: any) => {
      console.log('WebSocket event:', data)
    })

    return () => {
      unsubscribeGameUpdate()
      unsubscribeScenarioGenerated()
      unsubscribePromptSubmitted()
      unsubscribePhaseChange()
      unsubscribeRatingSubmitted()
      unsubscribeChatMessage()
      unsubscribeUserJoined()
      unsubscribeAll()
    }
  }, [gameId, opponentName])

  // Load game data from backend
  const loadGameData = async () => {
    if (!gameId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const [game, state] = await Promise.all([
        promptWarsGameAPI.getGame(gameId),
        promptWarsGameAPI.getGameState(gameId)
      ])
      
      setGameData(game)
      setGameStateDetails(state)
      setGameState(game.gameState.toLowerCase() as GameState)
      
      if (game.scenario) {
        setScenario(game.scenario)
      }
      
      // Load current submissions
      const mySubmission = state.playerSubmissions.find(s => s.roundNumber === state.currentRound)
      if (mySubmission) {
        setMyPrompt(mySubmission.prompt)
      }
      
      const opponentSubmission = state.opponentSubmissions.find(s => s.roundNumber === state.currentRound)
      if (opponentSubmission && opponentSubmission.prompt !== "***") {
        setOpponentPrompt(opponentSubmission.prompt)
        // Show opponent prompt in rating phase or when both players have submitted
        if (game.gameState.toLowerCase() === 'rating' || 
            game.gameState.toLowerCase() === 'finished' || 
            game.gameState.toLowerCase() === 'results') {
          setShowOpponentPrompt(true)
        }
      }
      
      // Load ratings if in finished state
      if (game.gameState.toLowerCase() === 'finished' || game.gameState.toLowerCase() === 'results') {
        // These would come from the game data - you might need to add these to the backend response
        console.log('Game finished, loading final results:', game)
        setShowOpponentPrompt(true)
      }
      
    } catch (error) {
      console.error('Failed to load game data:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  // Timer effect
  useEffect(() => {
    let interval: number
    if (gameState === "writing" && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameState, timeLeft])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const generateDemoScenario = async () => {
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

      const response = await fetch(`${API_BASE_URL}/test/openrouter/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const scenarioText = data.choices[0].message.content
          .replace(/\\u[\dA-F]{4}/gi, (match: string) => String.fromCharCode(Number.parseInt(match.replace(/\\u/g, ""), 16)))
          .replace(/\\n/g, "\n")
          .replace(/\\/g, "")

        setScenario(scenarioText)

        // Add scenario to chat
        setChatMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: `🎯 Scenario Generated: ${scenarioText}`,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error('Failed to generate scenario:', error)
      // Fallback scenarios
      const scenarios = [
        "You're a time traveler who accidentally changed history. Write a prompt to help an AI figure out what went wrong and how to fix it.",
        "An alien species has just made contact with Earth, but they only communicate through colors and emotions. Create a prompt for an AI to help establish meaningful communication.",
        "You've discovered that your dreams are actually glimpses into parallel universes. Design a prompt for an AI to help you navigate and understand these alternate realities.",
        "A mysterious digital virus is turning all text into poetry. Craft a prompt for an AI to help decode important messages while the world speaks in verse.",
        "You're the last librarian in a world where books are becoming sentient. Write a prompt to help an AI negotiate peace between humans and literature.",
      ]
      const fallbackScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
      setScenario(fallbackScenario)
      
      setChatMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          user: "System",
          message: `🎯 Scenario Generated: ${fallbackScenario}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoadingScenario(false)
    }
  }

  const startNewBattle = async () => {
    if (isMultiplayerGame && gameId) {
      // Start real multiplayer game
      setLoading(true)
      try {
        await promptWarsGameAPI.startGame(gameId, { gameMode: "multiplayer" })
        
        // Update local state immediately for better UX
        setGameState("scenario")
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "🎮 Battle started! Generating scenario...",
            timestamp: new Date(),
          },
        ])
        
        // Game state will also be updated via WebSocket
      } catch (error) {
        console.error('Failed to start game:', error)
        setError(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    } else {
      // Demo mode
      setTimeout(async () => {
        await generateDemoScenario()
      }, 2000)
    }
  }

  const proceedToWriting = async () => {
    if (isMultiplayerGame && gameId && !scenario) {
      // Generate scenario for real game - only if not already generated
      setIsLoadingScenario(true)
      try {
        const newScenario = await promptWarsGameAPI.generateScenario(gameId)
        setScenario(newScenario)
        
        // Don't set local state here - wait for WebSocket notification
        // This ensures both players get the update simultaneously
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "🚀 Battle started! Generating scenario...",
            timestamp: new Date(),
          },
        ])
      } catch (error) {
        console.error('Failed to generate scenario:', error)
        setError(getErrorMessage(error))
        
        // Check if the error is because game already started
        if (getErrorMessage(error).includes('not in waiting state')) {
          setChatMessages(prev => [
            ...prev,
            {
              id: generateUniqueId(),
              user: "System",
              message: "⚠️ Battle already started by another player!",
              timestamp: new Date(),
            },
          ])
          // Refresh game state to sync with current state
          loadGameData()
        }
      } finally {
        setIsLoadingScenario(false)
      }
    } else if (!isMultiplayerGame) {
      // Demo mode - set state locally and generate AI scenario
      await generateDemoScenario()
      setGameState("writing")
      setTimeLeft(120)
      setChatMessages(prev => [
        ...prev,
        {
          id: generateUniqueId(),
          user: "System",
          message: "⏰ Battle commenced! You have 2 minutes to craft your ultimate prompt!",
          timestamp: new Date(),
        },
      ])
    }
  }

  const submitPrompt = async () => {
    if (!myPrompt.trim()) {
      setError("Please enter a prompt before submitting")
      return
    }

    if (isMultiplayerGame && gameId) {
      // Submit to real game
      setLoading(true)
      try {
        await promptWarsGameAPI.submitPrompt(gameId, { prompt: myPrompt })
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "✅ Prompt submitted! Waiting for opponent...",
            timestamp: new Date(),
          },
        ])
        // Game state will be updated via WebSocket when both players submit
      } catch (error) {
        console.error('Failed to submit prompt:', error)
        setError(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    } else {
      // Demo mode - Generate AI opponent prompt
      setGameState("rating")
      setShowOpponentPrompt(true)
      
      // Generate opponent prompt using AI
      try {
        const requestBody = {
          messages: [
            {
              role: "user",
              content: `You are competing in a prompt writing competition. Create a high-quality prompt that addresses this scenario:

"${scenario}"

Your prompt should be:
- Creative and well-crafted
- Clearly structured
- Effective for AI interaction
- Competitive quality (this is for a contest)

Please provide only the prompt itself, nothing else.`,
            },
          ],
        }

        const response = await fetch(`${API_BASE_URL}/test/openrouter/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        if (data.choices && data.choices[0] && data.choices[0].message) {
          const aiOpponentPrompt = data.choices[0].message.content
            .replace(/\\u[\dA-F]{4}/gi, (match: string) => String.fromCharCode(Number.parseInt(match.replace(/\\u/g, ""), 16)))
            .replace(/\\n/g, "\n")
            .replace(/\\/g, "")
            .trim()

          setOpponentPrompt(aiOpponentPrompt)
        } else {
          // Fallback opponent prompt
          setOpponentPrompt("You are an advanced AI time-travel consultant. Analyze the following temporal anomaly data, identify the specific historical event that was altered, calculate the ripple effects across the timeline, and provide a detailed step-by-step restoration plan that minimizes paradoxes while ensuring the original timeline is preserved.")
        }
      } catch (error) {
        console.error('Failed to generate opponent prompt:', error)
        // Fallback opponent prompt
        setOpponentPrompt("You are an advanced AI time-travel consultant. Analyze the following temporal anomaly data, identify the specific historical event that was altered, calculate the ripple effects across the timeline, and provide a detailed step-by-step restoration plan that minimizes paradoxes while ensuring the original timeline is preserved.")
      }
      
      setChatMessages(prev => [
        ...prev,
        {
          id: generateUniqueId(),
          user: "System",
          message: "📝 Prompts submitted! Time to judge your opponent's work...",
          timestamp: new Date(),
        },
      ])
    }
  }

  const submitRating = async () => {
    if (myRating === 0) {
      setError("Please provide a rating before submitting")
      return
    }

    if (isMultiplayerGame && gameId) {
      // Submit rating to real game
      setLoading(true)
      try {
        await promptWarsGameAPI.ratePrompt(gameId, { 
          rating: myRating, 
          explanation: ratingExplanation 
        })
        // Game state will be updated via WebSocket
      } catch (error) {
        console.error('Failed to submit rating:', error)
        setError(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    } else {
      // Demo mode - Use AI to rate the prompts
      setIsLoadingRating(true)
      
      try {
        const requestBody = {
          messages: [
            {
              role: "user",
              content: `You are an expert prompt engineer judging a prompt writing competition. Please rate these two prompts based on creativity, clarity, effectiveness, and how well they address the scenario.

Scenario: "${scenario}"

Prompt 1 (Player): "${myPrompt}"

Prompt 2 (Opponent): "${opponentPrompt}"

Please provide:
1. A rating for each prompt (1-10 scale, where 10 is exceptional)
2. Brief explanation for each rating
3. Which prompt is better overall

Format your response as:
Rating 1: [1-10]
Explanation 1: [brief explanation]
Rating 2: [1-10] 
Explanation 2: [brief explanation]
Winner: [1 or 2 or Tie]
Overall Analysis: [brief summary]`,
            },
          ],
        }

        const response = await fetch(`${API_BASE_URL}/test/openrouter/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        if (data.choices && data.choices[0] && data.choices[0].message) {
          const ratingText = data.choices[0].message.content
          
          // Parse the AI response to extract ratings
          const rating1Match = ratingText.match(/Rating 1:\s*(\d+)/i)
          const rating2Match = ratingText.match(/Rating 2:\s*(\d+)/i)
          const winnerMatch = ratingText.match(/Winner:\s*(1|2|Tie)/i)
          
          const myAIRating = rating1Match ? Number.parseInt(rating1Match[1]) : myRating
          const opponentAIRating = rating2Match ? Number.parseInt(rating2Match[1]) : Math.floor(Math.random() * 3) + 7
          
          setOpponentRating(opponentAIRating)
          
          // Determine winner based on AI analysis
          let gameWinner = "tie"
          if (winnerMatch) {
            const winnerResult = winnerMatch[1].toLowerCase()
            if (winnerResult === "1") {
              gameWinner = "player"
            } else if (winnerResult === "2") {
              gameWinner = "opponent"
            }
          } else {
            // Fallback to numeric comparison
            gameWinner = myAIRating > opponentAIRating ? "player" : myAIRating === opponentAIRating ? "tie" : "opponent"
          }
          
          setWinner(gameWinner as "player" | "opponent" | "tie")
          setGameState("results")
          
          setChatMessages(prev => [
            ...prev,
            {
              id: generateUniqueId(),
              user: "AI Judge",
              message: `🏆 AI Analysis Complete!\n\n${ratingText}`,
              timestamp: new Date(),
            },
          ])
        }
      } catch (error) {
        console.error('AI rating failed, using fallback:', error)
        // Fallback to random rating if AI fails
        setOpponentRating(Math.floor(Math.random() * 3) + 7)
        setGameState("results")
        setWinner(myRating > 7 ? "player" : myRating === 7 ? "tie" : "opponent")
        
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "🏆 Battle concluded! The results are in!",
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoadingRating(false)
      }
    }
  }

  const sendChatMessage = () => {
    if (newMessage.trim() && gameId) {
      // Send via WebSocket for multiplayer games
      if (isMultiplayerGame) {
        // Send via WebSocket - the echo will show our own message
        promptWarsWebSocket.sendChatMessage(gameId, newMessage.trim())
      } else {
        // For single player, just add to local state
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "You",
            message: newMessage,
            timestamp: new Date(),
          },
        ])
      }
      setNewMessage("")
    }
  }

  const resetBattle = () => {
    setGameState("waiting")
    setScenario("")
    setMyPrompt("")
    setOpponentPrompt("")
    setShowOpponentPrompt(false)
    setMyRating(0)
    setOpponentRating(0)
    setRatingExplanation("")
    setWinner(null)
    setTimeLeft(120)
    setError(null)
    setChatMessages(prev => [
      ...prev,
      {
        id: generateUniqueId(),
        user: "System",
        message: "🔄 Arena reset! Ready for another epic battle?",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#3ebb9e]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-[#4079ff]/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-[#3ebb9e]/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-[#4079ff]/5 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Epic Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <Swords className="h-12 w-12 text-[#3ebb9e] animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 text-[#3ebb9e] opacity-20">
                  <Swords className="h-12 w-12" />
                </div>
              </div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-[#3ebb9e] via-white to-[#4079ff] bg-clip-text text-transparent">
                PROMPT WARS
              </h1>
              <div className="relative">
                <Swords className="h-12 w-12 text-[#4079ff] animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 text-[#4079ff] opacity-20">
                  <Swords className="h-12 w-12" />
                </div>
              </div>
            </div>
            <p className="text-xl text-slate-300 font-medium">
              {isMultiplayerGame ? `🔥 LIVE BATTLE vs ${opponentName}` : "⚡ AI-Powered Combat Arena"}
            </p>
            {loading && (
              <div className="flex items-center justify-center gap-2 text-[#3ebb9e] mt-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-semibold">Initializing Battle Systems...</span>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 mx-auto max-w-2xl">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-200 flex-1">{error}</span>
                  <Button
                    onClick={() => setError(null)}
                    variant="ghost"
                    size="sm"
                    className="text-red-300 hover:text-white hover:bg-red-500/20 h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Battle Status Panel */}
            <div className="xl:col-span-3">
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-[#3ebb9e] to-[#4079ff] rounded-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Battle Status</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Game Mode */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3ebb9e]/20 to-[#4079ff]/20 border border-[#3ebb9e]/30 rounded-full mb-2">
                        <Sparkles className="h-4 w-4 text-[#3ebb9e]" />
                        <span className="text-sm font-semibold text-white">
                          {isMultiplayerGame ? "LIVE MATCH" : "TRAINING MODE"}
                        </span>
                      </div>
                      {isMultiplayerGame && typeof gameId === "string" && gameId && (
                        <div className="text-xs text-slate-400 font-mono">ID: {gameId.slice(0, 8)}...</div>
                      )}
                    </div>

                    {/* Current Phase */}
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Current Phase
                      </div>
                      <div className="text-lg font-bold text-white capitalize flex items-center gap-2">
                        {gameState === "waiting" && <Zap className="h-5 w-5 text-[#3ebb9e]" />}
                        {gameState === "scenario" && <Eye className="h-5 w-5 text-[#4079ff]" />}
                        {gameState === "writing" && <Timer className="h-5 w-5 text-yellow-400" />}
                        {gameState === "rating" && <Star className="h-5 w-5 text-purple-400" />}
                        {(gameState === "results" || gameState === "finished") && (
                          <Trophy className="h-5 w-5 text-[#3ebb9e]" />
                        )}
                        {gameState === "waiting"
                          ? isMultiplayerGame
                            ? "Awaiting Challenger"
                            : "Ready to Battle"
                          : gameState}
                      </div>
                    </div>

                    {/* Timer */}
                    {gameState === "writing" && (
                      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="text-sm text-red-300 mb-2 flex items-center gap-2">
                          <Flame className="h-4 w-4" />
                          Time Remaining
                        </div>
                        <div
                          className={`text-3xl font-black flex items-center gap-2 ${
                            timeLeft <= 30 ? "text-red-400 animate-pulse" : "text-orange-400"
                          }`}
                        >
                          <Timer className="h-6 w-6" />
                          {formatTime(timeLeft)}
                        </div>
                      </div>
                    )}

                    {/* Players */}
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Combatants
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-[#3ebb9e] rounded-full animate-pulse"></div>
                          <span className="text-white font-semibold">You</span>
                          <div className="ml-auto text-xs text-[#3ebb9e] font-semibold">READY</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-[#4079ff] rounded-full animate-pulse"></div>
                          <span className="text-white font-semibold">{opponentName}</span>
                          <div className="ml-auto text-xs text-[#4079ff] font-semibold">READY</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Battle Arena */}
            <div className="xl:col-span-6">
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm min-h-[400px]">
                <div className="p-8">
              {/* Debug Controls - Remove in production
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                  <h4 className="text-yellow-400 font-semibold mb-2">Debug Controls</h4>
                  <div className="flex space-x-2 text-sm">
                    <button 
                      onClick={() => loadGameData()} 
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Refresh Game Data
                    </button>
                    <button 
                      onClick={() => setGameState('rating')} 
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Force Rating Phase
                    </button>
                    <span className="text-yellow-200">
                      Current State: {gameState}
                    </span>
                  </div>
                </div>
              )} */}

              {gameState === "waiting" && (
                <div className="text-center h-full flex flex-col justify-center">
                  <div className="mb-8">
                    <div className="relative inline-block mb-6">
                      <div className="text-8xl mb-4">⚔️</div>
                      <div className="absolute inset-0 text-8xl animate-ping opacity-20">⚔️</div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">
                      {isMultiplayerGame ? "AWAITING CHALLENGER" : "ENTER THE ARENA"}
                    </h2>
                    <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                      {isMultiplayerGame
                        ? "Your opponent is preparing for battle. Both warriors must be ready before the arena opens..."
                        : "Step into the ultimate prompt crafting battleground. Face AI opponents in epic battles of creativity, strategy, and wit."}
                    </p>
                  </div>

                  <Button
                    onClick={startNewBattle}
                    disabled={loading || isLoadingScenario}
                    className="bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] hover:from-[#3ebb9e]/80 hover:to-[#4079ff]/80 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {loading || isLoadingScenario ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        {isMultiplayerGame ? "INITIATING BATTLE..." : "GENERATING SCENARIO..."}
                      </>
                    ) : (
                      <>
                        <Zap className="h-6 w-6 mr-3" />
                        {isMultiplayerGame ? "BEGIN LIVE BATTLE" : "START NEW BATTLE"}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {gameState === "scenario" && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
                      <Target className="h-8 w-8 text-[#4079ff]" />
                      BATTLE SCENARIO
                    </h2>
                    <p className="text-slate-400">Study your mission carefully, warrior</p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-[#4079ff]/20 rounded-lg">
                        <Eye className="h-6 w-6 text-[#4079ff]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-4">Your Mission</h3>
                        <p className="text-slate-200 text-lg leading-relaxed">{scenario}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                      <p className="text-sm text-slate-400 mb-2">⚠️ Battle Instructions</p>
                      <p className="text-slate-300">
                        You'll have 2 minutes to craft the perfect prompt. Make it creative, specific, and
                        strategically effective!
                      </p>
                    </div>
                    <Button
                      onClick={proceedToWriting}
                      disabled={isLoadingScenario}
                      className="bg-gradient-to-r from-[#3ebb9e] to-emerald-500 hover:from-[#3ebb9e]/80 hover:to-emerald-500/80 text-white px-8 py-3 text-lg font-bold rounded-xl"
                    >
                      {isLoadingScenario ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          COMMENCE BATTLE
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {gameState === "writing" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
                      <Timer className="h-8 w-8 text-yellow-400" />
                      CRAFTING PHASE
                      <div
                        className={`text-2xl font-black ml-4 ${
                          timeLeft <= 30 ? "text-red-400 animate-pulse" : "text-yellow-400"
                        }`}
                      >
                        {formatTime(timeLeft)}
                      </div>
                    </h2>
                    <p className="text-slate-400">Channel your creativity into the ultimate prompt</p>
                  </div>

                  {/* Scenario Reminder */}
                  <div className="bg-[#4079ff]/10 border border-[#4079ff]/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-[#4079ff] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Mission Briefing</h4>
                        <p className="text-sm text-slate-300">{scenario}</p>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <div className="space-y-4">
                    <label className="block text-white font-bold text-lg">🎯 Your Battle Prompt</label>
                    <textarea
                      value={myPrompt}
                      onChange={(e) => setMyPrompt(e.target.value)}
                      placeholder="Forge your legendary prompt here... Make it count, warrior!"
                      className="w-full h-40 px-4 py-3 bg-muted border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] focus:border-transparent resize-none text-lg custom-scrollbar"
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">💡 Tip: Be specific, creative, and consider edge cases</span>
                      <span className="text-slate-400">{myPrompt.length} characters</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={submitPrompt}
                      disabled={loading || !myPrompt.trim() || timeLeft === 0}
                      className="bg-gradient-to-r from-[#3ebb9e] to-emerald-500 hover:from-[#3ebb9e]/80 hover:to-emerald-500/80 text-white px-8 py-3 text-lg font-bold rounded-xl disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          SUBMIT PROMPT
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {gameState === "rating" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
                      <Star className="h-8 w-8 text-purple-400" />
                      JUDGMENT PHASE
                    </h2>
                    <p className="text-slate-400">Evaluate your opponent's strategy</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Your Prompt */}
                    <div className="bg-gradient-to-br from-[#3ebb9e]/10 to-emerald-500/10 border border-[#3ebb9e]/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-[#3ebb9e] mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Your Prompt
                      </h3>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-slate-200 text-sm leading-relaxed">{myPrompt}</p>
                      </div>
                    </div>

                    {/* Opponent's Prompt */}
                    <div className="bg-gradient-to-br from-[#4079ff]/10 to-blue-500/10 border border-[#4079ff]/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-[#4079ff] mb-4 flex items-center gap-2">
                        <Swords className="h-5 w-5" />
                        Opponent's Prompt
                      </h3>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        {showOpponentPrompt ? (
                          <p className="text-slate-200 text-sm leading-relaxed">{opponentPrompt}</p>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                            <EyeOff className="h-4 w-4" />
                            Revealed after rating
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {showOpponentPrompt && (
                    <div className="bg-slate-700/30 rounded-xl p-6 space-y-6">
                      <div>
                        <label className="block text-white font-bold text-lg mb-4">
                          ⭐ Rate Your Opponent's Prompt (1-10)
                        </label>
                        <div className="flex gap-2 mb-4 justify-center">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                            <Button
                              key={rating}
                              onClick={() => setMyRating(rating)}
                              variant={myRating === rating ? "default" : "outline"}
                              size="sm"
                              className={`w-12 h-12 text-lg font-bold ${
                                myRating === rating
                                  ? "bg-gradient-to-r from-[#3ebb9e] to-emerald-500 text-white border-0"
                                  : "border-slate-600 text-slate-300 hover:border-[#3ebb9e] hover:text-white"
                              }`}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2">
                          💭 Explain Your Rating (Optional)
                        </label>
                        <textarea
                          value={ratingExplanation}
                          onChange={(e) => setRatingExplanation(e.target.value)}
                          placeholder="Share your thoughts on their strategy..."
                          className="w-full h-24 px-4 py-3 bg-muted border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3ebb9e] focus:border-transparent resize-none"
                        />
                      </div>

                      <div className="text-center">
                        <Button
                          onClick={submitRating}
                          disabled={loading || myRating === 0 || isLoadingRating}
                          className="bg-gradient-to-r from-green-600 to-pink-600 hover:from-green-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-bold rounded-xl"
                        >
                          {loading || isLoadingRating ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Submitting Judgment...
                            </>
                          ) : (
                            <>
                              <Star className="h-5 w-5 mr-2" />
                              SUBMIT RATING
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(gameState === "results" || gameState === "finished") && (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="text-8xl mb-4">
                      {winner === "player" ? "🏆" : winner === "opponent" ? "⚔️" : "🤝"}
                    </div>
                    <h2 className="text-4xl font-black mb-4">
                      <span
                        className={`bg-gradient-to-r bg-clip-text text-transparent ${
                          winner === "player"
                            ? "from-[#3ebb9e] to-emerald-400"
                            : winner === "opponent"
                              ? "from-red-400 to-orange-400"
                              : "from-[#4079ff] to-purple-400"
                        }`}
                      >
                        {winner === "player" ? "VICTORY!" : winner === "opponent" ? "DEFEAT" : "DRAW!"}
                      </span>
                    </h2>
                    <p className="text-slate-300 text-lg">
                      {winner === "player"
                        ? "Your prompt mastery has triumphed! Legendary craftsmanship!"
                        : winner === "opponent"
                          ? "A worthy opponent has bested you. Train harder, warrior!"
                          : "Both warriors showed equal skill! An honorable draw!"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className={`rounded-xl p-6 ${
                        winner === "player"
                          ? "bg-gradient-to-br from-[#3ebb9e]/20 to-emerald-500/20 border border-[#3ebb9e]/40"
                          : "bg-slate-700/30 border border-slate-600/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Your Score</h3>
                        {winner === "player" && <Crown className="h-6 w-6 text-[#3ebb9e]" />}
                      </div>
                      <div className="text-4xl font-black text-white mb-2">{opponentRating}/10</div>
                      <div className="flex mb-2">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < opponentRating ? "text-[#3ebb9e] fill-[#3ebb9e]" : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-400">Opponent's Rating</p>
                    </div>

                    <div
                      className={`rounded-xl p-6 ${
                        winner === "opponent"
                          ? "bg-gradient-to-br from-[#4079ff]/20 to-blue-500/20 border border-[#4079ff]/40"
                          : "bg-slate-700/30 border border-slate-600/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Opponent's Score</h3>
                        {winner === "opponent" && <Crown className="h-6 w-6 text-[#4079ff]" />}
                      </div>
                      <div className="text-4xl font-black text-white mb-2">{myRating}/10</div>
                      <div className="flex mb-2">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < myRating ? "text-[#4079ff] fill-[#4079ff]" : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-400">Your Rating</p>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <Button
                      onClick={resetBattle}
                      className="bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] hover:from-[#3ebb9e]/80 hover:to-[#4079ff]/80 text-white px-8 py-3 text-lg font-bold rounded-xl mr-4"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      NEW BATTLE
                    </Button>

                    {isMultiplayerGame && (
                      <Button
                        onClick={() => (window.location.href = "/social")}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-6 py-3 text-lg font-semibold rounded-xl"
                      >
                        <Users className="h-5 w-5 mr-2" />
                        Return to Arena
                      </Button>
                    )}
                  </div>
                </div>
              )}
                </div>
              </Card>
            </div>

            {/* Battle Chat */}
            <div className="xl:col-span-3">
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm min-h-[200px] max-h-[70vh] flex flex-col custom-scrollbar">
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-[#3ebb9e]" />
                      Battle Chat
                    </h2>
                    <Button
                      onClick={() => setShowChat(!showChat)}
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                    >
                      {showChat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {showChat && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[40vh] custom-scrollbar">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg text-sm ${
                           message.user === "System"
                            ? "bg-gradient-to-r from-[#4079ff]/20 to-green-500/20 border border-[#4079ff]/30 text-white"
                            : message.user === "You"
                              ? "bg-gradient-to-r from-[#3ebb9e]/20 to-emerald-500/20 border border-[#3ebb9e]/30 text-[#3ebb9e] ml-4"
                            : message.user === "Player 2"
                              ? "bg-gradient-to-r from-pink-500/20 to-yellow-400/20 border border-pink-400/30 text-pink-300 mr-4"
                              : "bg-slate-700/50 border border-slate-600/50 text-slate-200 mr-4"
                          }`}
                        >
                          <div className="font-semibold text-xs opacity-80 mb-1">{message.user}</div>
                          <div className="font-medium">{message.message}</div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 border-t border-slate-700/50 custom-scrollbar">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                          placeholder="Send a battle cry..."
                          className="flex-1 bg-muted/20 border-slate-600 text-white placeholder-slate-400 focus:ring-[#3ebb9e] focus:border-[#3ebb9e]"
                        />
                        <Button
                          onClick={sendChatMessage}
                          size="sm"
                          className="bg-gradient-to-r from-[#3ebb9e] to-emerald-500 hover:from-[#3ebb9e]/80 hover:to-emerald-500/80 text-white px-4"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>

          {/* Floating End Game Button */}
          {isMultiplayerGame && (
            <div className="fixed bottom-6 left-6 z-50">
              <Button
                onClick={() => {
                  if (gameId) {
                    promptWarsWebSocket.leaveGameRoom(gameId);
                  }
                  window.location.href = "/social";
                }}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white bg-slate-900/90 backdrop-blur-sm border-2 font-semibold"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Back to Social
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
