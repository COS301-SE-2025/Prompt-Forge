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
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { promptWarsGameAPI, GameResponse, GameStateDetails, PromptSubmission } from "../services/promptWarsGameAPI"
import { promptWarsWebSocket, GameUpdate } from "../services/promptWarsWebSocket"

type GameState = "waiting" | "scenario" | "writing" | "rating" | "results" | "finished" | "cancelled"

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
}

export default function PromptWarsPage() {
  // Helper function to generate unique IDs
  let idCounter = 0;
  const generateUniqueId = () => `${Date.now()}-${++idCounter}`
  
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

  const [searchParams] = useSearchParams()
  const gameId = searchParams.get('gameId')
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
  const [opponentName, setOpponentName] = useState("Opponent")

  // UI state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: generateUniqueId(),
      user: "System",
      message: "Welcome to Prompt Wars! Get ready to battle!",
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
      
      setOpponentName("Real Player")
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

  const generateDemoScenario = () => {
    const scenarios = [
      "Create a prompt that generates a compelling product description for a revolutionary smart home device.",
      "Design a prompt that produces an engaging blog post about sustainable living tips.",
      "Craft a prompt that generates a creative story opening with an unexpected twist.",
      "Create a prompt that produces a professional email template for customer service.",
      "Design a prompt that generates educational content about emerging technologies."
    ]
    return scenarios[Math.floor(Math.random() * scenarios.length)]
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
      setIsLoadingScenario(true)
      setTimeout(() => {
        setScenario(generateDemoScenario())
        setGameState("scenario")
        setIsLoadingScenario(false)
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "Battle scenario generated! Review it and start writing.",
            timestamp: new Date(),
          },
        ])
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
      // Demo mode - set state locally
      setGameState("writing")
      setTimeLeft(120)
      setChatMessages(prev => [
        ...prev,
        {
          id: generateUniqueId(),
          user: "System",
          message: "⏰ Writing phase started! You have 2 minutes to craft your prompt.",
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
      // Demo mode
      setGameState("rating")
      setOpponentPrompt("Create a smart home device that predicts user needs through behavioral analysis and environmental sensors, offering proactive suggestions for comfort, security, and energy efficiency.")
      setShowOpponentPrompt(true)
      setChatMessages(prev => [
        ...prev,
        {
          id: generateUniqueId(),
          user: "System",
          message: "📝 Prompts submitted! Now rate your opponent's creativity.",
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
      // Demo mode
      setIsLoadingRating(true)
      setTimeout(() => {
        setOpponentRating(Math.floor(Math.random() * 3) + 7)
        setGameState("results")
        setWinner(myRating > 7 ? "player" : "opponent")
        setIsLoadingRating(false)
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "🏆 Battle complete! Check out the results.",
            timestamp: new Date(),
          },
        ])
      }, 3000)
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
        message: "🔄 Ready for another battle!",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Swords className="h-8 w-8 text-yellow-400" />
            {isMultiplayerGame ? "🔥" : "⚡"} Prompt Wars
            <Swords className="h-8 w-8 text-yellow-400" />
          </h1>
          <p className="text-blue-200 text-lg">
            {isMultiplayerGame ? `vs ${opponentName}` : "AI-Powered Prompt Battle Arena"}
          </p>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-blue-200 mt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
            <AlertCircle className="h-5 w-5" />
            {error}
            <Button 
              onClick={() => setError(null)}
              variant="ghost" 
              size="sm"
              className="ml-auto text-red-200 hover:text-white"
            >
              ×
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Status Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Battle Status
              </h2>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {isMultiplayerGame ? "Live Match" : "Practice Mode"}
                  </div>
                  {isMultiplayerGame && gameId && (
                    <div className="text-sm text-gray-400">
                      ID: {gameId.slice(0, 8)}...
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Current Phase</div>
                  <div className="text-lg font-semibold text-white capitalize">
                    {gameState === "waiting" ? (isMultiplayerGame ? "Waiting for opponent to join the battle..." : "Ready to battle") : gameState}
                  </div>
                </div>

                {gameState === "writing" && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-sm text-gray-400 mb-2">Time Remaining</div>
                    <div className="text-2xl font-bold text-red-400 flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Players</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white">You</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white">{opponentName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 p-6 min-h-[600px]">
              {/* Debug Controls - Remove in production */}
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
              )}

              {gameState === "waiting" && (
                <div className="text-center">
                  <div className="mb-8">
                    <div className="text-6xl mb-4">⚔️</div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {isMultiplayerGame ? "Waiting for Battle" : "Ready for Battle"}
                    </h2>
                    <p className="text-gray-300 mb-6">
                      {isMultiplayerGame 
                        ? "Waiting for your opponent to join and both players to be ready..."
                        : "Test your prompt crafting skills against AI opponents in epic battles of creativity and strategy."
                      }
                    </p>
                  </div>
                  
                  <Button
                    onClick={startNewBattle}
                    disabled={loading || isLoadingScenario}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
                  >
                    {loading || isLoadingScenario ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {isMultiplayerGame ? "Starting Battle..." : "Generating Scenario..."}
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        {isMultiplayerGame ? "Start Live Battle" : "Start New Battle"}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {gameState === "scenario" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Play className="h-6 w-6 text-green-400" />
                    Battle Scenario
                  </h2>
                  
                  <div className="bg-gray-700/50 rounded-lg p-6 mb-6">
                    <p className="text-gray-200 text-lg leading-relaxed">
                      {scenario}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={proceedToWriting}
                      disabled={isLoadingScenario}
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-2"
                    >
                      {isLoadingScenario ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Start Writing Phase
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {gameState === "writing" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Timer className="h-6 w-6 text-yellow-400" />
                    Writing Phase
                    <span className="text-lg text-yellow-400 ml-auto">
                      {formatTime(timeLeft)}
                    </span>
                  </h2>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                    <p className="text-gray-300 text-sm mb-2">Scenario:</p>
                    <p className="text-gray-200">
                      {scenario}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-2">
                      Your Prompt
                    </label>
                    <textarea
                      value={myPrompt}
                      onChange={(e) => setMyPrompt(e.target.value)}
                      placeholder="Craft your battle-winning prompt here..."
                      className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={submitPrompt}
                      disabled={loading || !myPrompt.trim() || timeLeft === 0}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Prompt
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {gameState === "rating" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-400" />
                    Rating Phase
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Your Prompt */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Your Prompt</h3>
                      <p className="text-gray-200 text-sm">{myPrompt}</p>
                    </div>
                    
                    {/* Opponent's Prompt */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">Opponent's Prompt</h3>
                      {showOpponentPrompt ? (
                        <p className="text-gray-200 text-sm">{opponentPrompt}</p>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <EyeOff className="h-4 w-4" />
                          Hidden until rated
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {showOpponentPrompt && (
                    <div className="mb-6">
                      <label className="block text-white font-medium mb-2">
                        Rate Opponent's Prompt (1-10)
                      </label>
                      <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                          <Button
                            key={rating}
                            onClick={() => setMyRating(rating)}
                            variant={myRating === rating ? "default" : "outline"}
                            size="sm"
                            className={myRating === rating ? "bg-yellow-500 text-black" : ""}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                      
                      <textarea
                        value={ratingExplanation}
                        onChange={(e) => setRatingExplanation(e.target.value)}
                        placeholder="Explain your rating (optional)"
                        className="w-full h-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      
                      <div className="text-center mt-4">
                        <Button
                          onClick={submitRating}
                          disabled={loading || myRating === 0 || isLoadingRating}
                          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-2"
                        >
                          {loading || isLoadingRating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting Rating...
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Submit Rating
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(gameState === "results" || gameState === "finished") && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    Battle Results
                  </h2>
                  
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">
                      {winner === "player" ? "🏆" : winner === "opponent" ? "😔" : "🤝"}
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                      {winner === "player" 
                        ? "Victory!" 
                        : winner === "opponent" 
                        ? "Defeat" 
                        : "It's a Tie!"}
                    </div>
                    <p className="text-gray-300">
                      {winner === "player" 
                        ? "Your prompt was superior! Well crafted." 
                        : winner === "opponent" 
                        ? "Your opponent's prompt was better this time." 
                        : "Both prompts were equally impressive!"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Your Score</h3>
                      <div className="text-3xl font-bold text-white mb-2">{opponentRating}/10</div>
                      <p className="text-sm text-gray-300">Opponent's Rating</p>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">Opponent's Score</h3>
                      <div className="text-3xl font-bold text-white mb-2">{myRating}/10</div>
                      <p className="text-sm text-gray-300">Your Rating</p>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={resetBattle}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-2"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        New Battle
                      </Button>
                      
                      {isMultiplayerGame && (
                        <Button
                          onClick={() => window.location.href = '/social'}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-2"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Back to Social
                        </Button>
                      )}
                    </div>
                    
                    {isMultiplayerGame && (
                      <p className="text-sm text-gray-400">
                        The game will be automatically cleaned up when both players leave.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 p-4 h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-400" />
                  Battle Chat
                </h2>
                <Button
                  onClick={() => setShowChat(!showChat)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  {showChat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {showChat && (
                <>
                  <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-2 rounded-lg text-sm ${
                          message.user === "System"
                            ? "bg-blue-900/50 text-blue-200"
                            : message.user === "You"
                            ? "bg-green-900/50 text-green-200 ml-4"
                            : "bg-gray-700/50 text-gray-200 mr-4"
                        }`}
                      >
                        <div className="font-medium text-xs opacity-70 mb-1">
                          {message.user}
                        </div>
                        <div>{message.message}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    <Button
                      onClick={sendChatMessage}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
        
        {/* Floating End Game Button - Only show during active gameplay */}
        {isMultiplayerGame && (gameState === "writing" || gameState === "rating") && (
          <div className="fixed bottom-6 left-6 z-50">
            <Button
              onClick={() => {
                const confirmLeave = window.confirm(
                  "Are you sure you want to end this game? This will forfeit the battle and return you to the social page."
                );
                if (confirmLeave) {
                  // Leave the game room
                  if (gameId) {
                    promptWarsWebSocket.leaveGameRoom(gameId);
                  }
                  // Navigate back to social page
                  window.location.href = '/social';
                }
              }}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-gray-900/90 backdrop-blur-sm"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              End Game
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
