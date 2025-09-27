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
  MessageSquare,
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
import { normalizeScenario, parseAIJudgment } from "../utils/gameHelpers"
import { useParams } from "react-router-dom"
import { promptWarsGameAPI, GameResponse, GameStateDetails, PromptSubmission } from "../services/promptWarsGameAPI"
import { promptWarsWebSocket, GameUpdate } from "../services/promptWarsWebSocket"

type GameState = "waiting" | "scenario" | "writing" | "rating" | "results" | "finished" | "cancelled"


interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

export default function PromptWars() {
  // Helper to generate unique IDs for chat messages
  function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Game and UI state
  const [gameData, setGameData] = useState<any>(null);
  const [gameStateDetails, setGameStateDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper for error messages
  function getErrorMessage(error: any) {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && 'message' in error) return (error as any).message;
    return 'An unknown error occurred';
  }

  // Robust parser for options payloads (backend sometimes returns malformed JSON)
  function parseOptions(raw: any): string[] {
    if (!raw && raw !== "" ) return []
    // If it's already an array, return as-is
    if (Array.isArray(raw)) return raw

    let s = String(raw).trim()

    // Quick attempt: try direct JSON.parse
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed
      // If parsed to something else, try to coerce to array of strings
      if (parsed == null) return []
      return Array.isArray(parsed) ? parsed : [String(parsed)]
    } catch (e) {
      // continue to heuristics
    }

    // Common backend bug: double double-quotes -> replace "" with "
    try {
      const fixed = s.replace(/""/g, '"')
      const parsed = JSON.parse(fixed)
      if (Array.isArray(parsed)) return parsed
    } catch (e) {
      // ignore
    }

    // If the payload uses single quotes for strings, switch them to double quotes
    if (/^\[\s*'/.test(s) || s.includes("',")) {
      try {
        const attempt = s.replace(/'/g, '"')
        const parsed = JSON.parse(attempt)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {
        // ignore
      }
    }

    // Fallback: extract quoted segments (either single or double quoted)
    const matches = Array.from(s.matchAll(/"([^"]+)"|'([^']+)'/g))
    if (matches && matches.length > 0) {
      return matches.map(m => (m[1] || m[2] || '').trim())
    }

    // Last resort: split on commas and trim brackets/quotes
    try {
      const stripped = s.replace(/^\[|\]$/g, '')
      const parts = stripped.split(',').map(p => p.trim().replace(/^['"]|['"]$/g, ''))
      return parts.filter(p => p.length > 0)
    } catch (e) {
      console.error('parseOptions fallback failed:', e, 'raw:', raw)
      return []
    }
  }

// Get params for multiplayer game (must be after gameData)
const params = useParams();
const gameId = params.gameId || (typeof gameData?.id === 'string' ? gameData.id : undefined);
const isMultiplayerGame = !!gameId;
  // Game state
  const [gameState, setGameState] = useState<GameState>("waiting")
  const [scenario, setScenario] = useState("")
  const [isLoadingScenario, setIsLoadingScenario] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [myPrompt, setMyPrompt] = useState("")
  const [opponentPrompt, setOpponentPrompt] = useState("")
  const [showOpponentPrompt, setShowOpponentPrompt] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [playerRating, setPlayerRating] = useState(0)
  const [opponentRating, setOpponentRating] = useState(0)
  const [ratingExplanation, setRatingExplanation] = useState("")
  const [isLoadingRating, setIsLoadingRating] = useState(false)
  const [winner, setWinner] = useState<"player" | "opponent" | "tie" | null>(null)
  const [opponentName, setOpponentName] = useState("Player 2")

  // Reverse prompt battle state
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [currentOutput, setCurrentOutput] = useState("")
  const [currentOptions, setCurrentOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [questionNumber, setQuestionNumber] = useState(1)
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [correctAnswer, setCorrectAnswer] = useState<string>("")
  const [showResults, setShowResults] = useState(false)
  const [roundLoading, setRoundLoading] = useState(false)
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false)
  // Guard to prevent duplicate generateQuestion requests for the same question number
  const generationRequestedForQN = useRef<number | null>(null)

  // Helper to map backend player1/player2 scores into the local player's perspective.
  // Accepts optional player1Id/player2Id from payload to avoid relying on possibly-stale `gameData`.
  const mapAndSetScores = (p1: number, p2: number, player1Id?: string, player2Id?: string) => {
    try {
      const currentUserId = localStorage.getItem('userId')
      const p1Id = player1Id || gameData?.player1Id
      const p2Id = player2Id || gameData?.player2Id
      if (p1Id && p2Id) {
        if (currentUserId === p1Id) {
          setPlayerScore(p1 || 0)
          setOpponentScore(p2 || 0)
        } else {
          setPlayerScore(p2 || 0)
          setOpponentScore(p1 || 0)
        }
      } else {
        // Fallback when IDs are not available: assume p1 is the current player
        setPlayerScore(p1 || 0)
        setOpponentScore(p2 || 0)
      }
    } catch (e) {
      console.error('mapAndSetScores failed', e)
      setPlayerScore(p1 || 0)
      setOpponentScore(p2 || 0)
    }
  }

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
  const [showEndPopup, setShowEndPopup] = useState(false)
  const [endPopupMessage, setEndPopupMessage] = useState('')

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
          setScenario(normalizeScenario(update.scenario))
        }
        loadGameData() // Refresh full game state
      }
    })

    // Handle scenario generation
    const unsubscribeScenarioGenerated = promptWarsWebSocket.on('SCENARIO_GENERATED', (data: any) => {
      if (data.gameId === gameId) {
  console.log('Scenario generated:', data)
  setScenario(normalizeScenario(data.scenario))
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

    // Handle game finished event
    const unsubscribeGameFinished = promptWarsWebSocket.on('GAME_FINISHED', (data: any) => {
      if (data.gameId === gameId) {
        console.log('Game finished:', data)
        setGameState('finished')
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "🏁 Battle complete! AI rating completed - check the results!",
            timestamp: new Date(),
          },
        ])
        loadGameData() // Load final results with AI ratings
      }
    })

    // Handle AI rating started event
    const unsubscribeAIRatingStarted = promptWarsWebSocket.on('AI_RATING_STARTED', (data: any) => {
      if (data.gameId === gameId) {
        console.log('AI rating started:', data)
        setGameState('rating')
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "🤖 Both prompts submitted! AI judge is evaluating your creativity...",
            timestamp: new Date(),
          },
        ])
      }
    })

    // Handle game restart event
    const unsubscribeGameRestarted = promptWarsWebSocket.on('GAME_RESTARTED', (data: any) => {
      if (data.gameId === gameId) {
  console.log('Game restarted:', data)
  setGameState(data.gameState.toLowerCase() as GameState) // Convert to lowercase
  setScenario(normalizeScenario(data.scenario))
        setTimeLeft(120) // Start the timer
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "🎮 New battle started! You have 2 minutes to craft your prompt!",
            timestamp: new Date(),
          },
        ])
        
        // Reset all battle state
        setMyPrompt("")
        setOpponentPrompt("")
        setShowOpponentPrompt(false)
        setMyRating(0)
        setPlayerRating(0)
        setOpponentRating(0)
        setRatingExplanation("")
        setWinner(null)
        // Reset reverse-battle specific state
        setQuestionNumber(1)
        setPlayerScore(0)
        setOpponentScore(0)
        setCurrentQuestion("")
        setCurrentOutput("")
        setCurrentOptions([])
        setRoundLoading(false)
        setHasSubmittedAnswer(false)

        // If this is a reverse prompt game, attempt to auto-generate the first question.
        // Fetch a fresh game record to avoid relying on possibly stale closure values.
        ;(async () => {
          try {
            console.debug('GAME_RESTARTED: fetching fresh game to check type...')
            const freshGame = isMultiplayerGame && gameId ? await promptWarsGameAPI.getGame(gameId) : null
            console.debug('GAME_RESTARTED: freshGame:', freshGame)
            const isReverse = (data.gameType === 'REVERSE_PROMPT') || (freshGame && freshGame.gameType === 'REVERSE_PROMPT')
            console.debug('GAME_RESTARTED: isReverse=', isReverse, 'isMultiplayerGame=', isMultiplayerGame, 'gameId=', gameId)
            if (isMultiplayerGame && gameId && isReverse) {
              // mark loading and request generation
              console.debug('GAME_RESTARTED: auto-generating first question for reverse game:', gameId)
              setRoundLoading(true)
              await promptWarsGameAPI.generateQuestion(gameId)
              setChatMessages(prev => [
                ...prev,
                {
                  id: generateUniqueId(),
                  user: "System",
                  message: "🎮 Generating first reverse question after rematch...",
                  timestamp: new Date(),
                },
              ])
            } else {
              console.debug('GAME_RESTARTED: skipping auto-generate (not reverse or missing gameId)')
            }
          } catch (e) {
            console.error('Auto-generate question after GAME_RESTARTED failed:', e)
            setRoundLoading(false)
          }
        })()
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

    // Listen for explicit game actions (e.g., player left) so we can show a popup and redirect
    const unsubscribeGameAction = promptWarsWebSocket.on('GAME_ACTION', (data: any) => {
      if (data.gameId === gameId) {
        try {
          const action = data.action
          if (action === 'PLAYER_LEFT') {
            // Show a friendly in-app popup and redirect to social hub
            setEndPopupMessage('The other player left the match. The game has ended.')
            setShowEndPopup(true)
            // Leave the room locally to stop receiving further messages
            try { promptWarsWebSocket.leaveGameRoom(gameId) } catch (e) { /* ignore */ }
            // Redirect immediately for consistency with handleReturnToSocial
            window.location.href = '/social'
          }
        } catch (e) {
          console.warn('Failed to handle GAME_ACTION:', e)
        }
      }
    })

    // Reverse prompt battle event listeners
    const unsubscribeQuestionGenerated = promptWarsWebSocket.on('QUESTION_GENERATED', (data: any) => {
      if (data.gameId === gameId) {
        console.log('Question generated:', data)
        console.log('Setting question:', data.question)
        console.log('Setting output:', data.output)
        console.log('Setting options:', data.options)
        
  setCurrentQuestion(data.question || '')
  setCurrentOutput(data.output || '')
        
        // Robustly parse options using helper to handle malformed payloads
        const options = parseOptions(data.options)
        console.log('Parsed options (robust):', options)
        if ((!options || options.length === 0) && data.options) {
          console.warn('parseOptions returned empty for raw options:', data.options)
        }
  setCurrentOptions(options)
        
        setQuestionNumber(data.questionNumber || 1)
        setGameState('writing') // Players are now "answering"
        setTimeLeft(60) // 1 minute to answer
        setSelectedAnswer('') // Reset selection
        setShowResults(false)
        // Round finished loading
        setRoundLoading(false)
        setHasSubmittedAnswer(false)
        // Clear client-side generation guard for this question
        generationRequestedForQN.current = null
      }
    })

    

    const unsubscribeAnswerResults = promptWarsWebSocket.on('ANSWER_RESULTS', (data: any) => {
      if (data.gameId === gameId) {
        console.log('Answer results:', data)
        setCorrectAnswer(data.correctAnswer)
        // Map scores correctly according to which player we are.
        // Prefer IDs supplied in the payload (avoid relying on possibly stale gameData)
        const currentUserId = localStorage.getItem('userId')
        // Use payload IDs when available to map scores reliably
        mapAndSetScores(data.player1Score || 0, data.player2Score || 0, data.player1Id, data.player2Id)
        setQuestionNumber(data.questionNumber)
        setShowResults(true)
        
        // Show results for 3 seconds, then prepare for next question
        setTimeout(() => {
          setShowResults(false)
          // Show waiting state and display loading spinner until next question is generated
          setGameState('waiting') // Ready for next question
          setRoundLoading(true)
          // Prepare for next round - ensure submit button state resets
          setHasSubmittedAnswer(false)
        }, 3000)
      }
    })

    const unsubscribeReverseGameFinished = promptWarsWebSocket.on('REVERSE_GAME_FINISHED', (data: any) => {
      if (data.gameId === gameId) {
        console.log('Reverse game finished:', data)
        setGameState('finished')
        const currentUserId = localStorage.getItem('userId')
        let result: "player" | "opponent" | "tie" = "opponent";
        // Determine player IDs and scores from payload or fallback to gameData
        const p1 = data.player1Score || 0
        const p2 = data.player2Score || 0
        const p1Id = data.player1Id || gameData?.player1Id
        const p2Id = data.player2Id || gameData?.player2Id

        // Compute myScore and oppScore deterministically
        let myScore = 0
        let oppScore = 0
        if (currentUserId && p1Id && p2Id) {
          if (currentUserId === p1Id) {
            myScore = p1; oppScore = p2
          } else if (currentUserId === p2Id) {
            myScore = p2; oppScore = p1
          } else {
            // unknown userId: default to assigning p1->player
            myScore = p1; oppScore = p2
          }
        } else if (currentUserId && gameData?.player1Id && gameData?.player2Id) {
          // Fallback to gameData ids
          if (currentUserId === gameData.player1Id) {
            myScore = p1; oppScore = p2
          } else {
            myScore = p2; oppScore = p1
          }
        } else {
          // Last resort: assume p1 is local player
          myScore = p1; oppScore = p2
        }

        // Set scores synchronously so UI reflects the correct perspective immediately
        setPlayerScore(myScore)
        setOpponentScore(oppScore)

        // Also set ratings for score card display
        setPlayerRating(myScore)
        setOpponentRating(oppScore)

        // Debug trace to help diagnose mapping issues
        console.debug('REVERSE_GAME_FINISHED mapping:', { currentUserId, p1Id, p2Id, p1, p2, myScore, oppScore, winnerId: data.winnerId })

        // Determine result from computed scores
        if (myScore === oppScore) {
          result = 'tie'
        } else if (myScore > oppScore) {
          result = 'player'
        } else {
          result = 'opponent'
        }

        setWinner(result)
        setChatMessages(prev => [...prev, {
          id: generateUniqueId(),
          user: "System",
          message: `🏆 Game Over! ${
            result === 'player' ? 'You won!' : result === 'opponent' ? 'You lost!' : 'Draw!'} Final Score: ${myScore}-${oppScore}`,
          timestamp: new Date(),
        }])
      }
    })

    return () => {
      unsubscribeGameUpdate()
      unsubscribeScenarioGenerated()
      unsubscribePromptSubmitted()
      unsubscribePhaseChange()
      unsubscribeRatingSubmitted()
      unsubscribeGameFinished()
      unsubscribeAIRatingStarted()
      unsubscribeGameRestarted()
      unsubscribeChatMessage()
      unsubscribeUserJoined()
      unsubscribeAll()
      unsubscribeGameAction()
      unsubscribeQuestionGenerated()
      unsubscribeAnswerResults()
      unsubscribeReverseGameFinished()
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
      
      console.log('Loaded game data:', game)
      console.log('Game type:', game.gameType)
      
      // Load reverse prompt battle data if applicable
      if (game.gameType === 'REVERSE_PROMPT') {
        setQuestionNumber(game.questionNumber || 1)
        // Map stored correct answers to the local player's perspective
        mapAndSetScores(game.player1CorrectAnswers || 0, game.player2CorrectAnswers || 0)
        
        if (game.currentQuestion) {
          setCurrentQuestion(game.currentQuestion)
          setCurrentOutput(game.currentOutput || '')
          if (game.currentOptions) {
            try {
              // Fix backend double-double-quote bug: replace all "" with "
              const fixedOptions = game.currentOptions.replace(/""/g, '"');
              setCurrentOptions(JSON.parse(fixedOptions));
            } catch (e) {
              console.error('Malformed currentOptions from backend:', game.currentOptions, e);
              setCurrentOptions([]);
              setError('Failed to load answer options. Please try again or contact support.');
            }
          } else {
            setCurrentOptions([]);
          }
        }
      }
      
      if (game.scenario) {
        setScenario(normalizeScenario(game.scenario))
      }

      // Compute remaining time for writing phase using server-side timestamp if available
      try {
        const writingStarted = game.writingStartedAt || (state && state.game && state.game.writingStartedAt) || null
        if (writingStarted && (game.gameState === 'WRITING' || game.gameState === 'SCENARIO')) {
          const started = new Date(writingStarted).getTime()
          const now = Date.now()
          // standard durations: classic writing = 120s, reverse = 60s
          const total = (game.gameType === 'REVERSE_PROMPT') ? 60 : 120
          const elapsed = Math.floor((now - started) / 1000)
          const remaining = Math.max(0, total - elapsed)
          console.debug('Computed remaining time from server:', { started: writingStarted, elapsed, remaining, total })
          setTimeLeft(remaining)
        }
      } catch (e) {
        console.warn('Failed to compute remaining time from writingStartedAt:', e)
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
        console.log('Game finished, loading final results:', game)
        setShowOpponentPrompt(true)

        const currentUserId = localStorage.getItem('userId')

        // Classic prompt battles use scores out of 10. Reverse prompt uses correct answer counts (out of 5).
        if (game.gameType === 'PROMPT_CREATION' || !game.gameType) {
          // Prefer explicit player1Score/player2Score fields from backend.
          const rawP1 = (typeof game.player1Score === 'number') ? game.player1Score : null
          const rawP2 = (typeof game.player2Score === 'number') ? game.player2Score : null

          // Try to parse scores/explanation from ratingExplanation if backend placed them there
          const parsed = parseAIJudgment(game.ratingExplanation)

          // Prefer explicit numeric fields from backend; fall back to parsed values
          const finalP1 = (typeof game.player1Score === 'number') ? game.player1Score : (parsed.p1 ?? null)
          const finalP2 = (typeof game.player2Score === 'number') ? game.player2Score : (parsed.p2 ?? null)

          // Map to current player's perspective
          if (game.player1Id === currentUserId) {
            setPlayerRating(finalP1 ?? 0)
            setOpponentRating(finalP2 ?? 0)
          } else {
            setPlayerRating(finalP2 ?? 0)
            setOpponentRating(finalP1 ?? 0)
          }

          // Determine winner from winnerId if present, otherwise from scores
          if (game.winnerId === currentUserId) {
            setWinner('player')
          } else if (game.winnerId) {
            setWinner('opponent')
          } else if (finalP1 != null && finalP2 != null) {
            // Compare using mapped scores
            const myScore = game.player1Id === currentUserId ? finalP1 : finalP2
            const theirScore = game.player1Id === currentUserId ? finalP2 : finalP1
            if (myScore > theirScore) setWinner('player')
            else if (myScore < theirScore) setWinner('opponent')
            else setWinner('tie')
            setPlayerScore(myScore || 0)
            setOpponentScore(theirScore || 0)
          } else {
            setWinner('tie')
          }

          // Keep parsed numeric extraction for scores, but display the raw AI text as provided by the backend
          setRatingExplanation(game.ratingExplanation || '')

        } else if (game.gameType === 'REVERSE_PROMPT') {
          // Reverse prompt: scores are correct-answer counts (out of 5)
          if (game.player1Id === currentUserId) {
            setPlayerRating(game.player1CorrectAnswers || 0)
            setOpponentRating(game.player2CorrectAnswers || 0)
            setPlayerScore(game.player1CorrectAnswers || 0)
            setOpponentScore(game.player2CorrectAnswers || 0)
          } else {
            setPlayerRating(game.player2CorrectAnswers || 0)
            setOpponentRating(game.player1CorrectAnswers || 0)
            setPlayerScore(game.player2CorrectAnswers || 0)
            setOpponentScore(game.player1CorrectAnswers || 0)
          }

          if (game.winnerId === currentUserId) {
            setWinner('player')
          } else if (game.winnerId) {
            setWinner('opponent')
          } else {
            setWinner('tie')
          }

          // For reverse prompts, keep the ratingExplanation as-is (it's likely the AI text)
          setRatingExplanation(game.ratingExplanation || '')
        }
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

  // Auto-submit on timeout for reverse prompt battles
  useEffect(() => {
    if (!isMultiplayerGame || !gameId) return
    if (gameState !== 'writing') return
    if (timeLeft !== 0) return
    // Only for reverse prompt battles
    if (gameData?.gameType !== 'REVERSE_PROMPT') return

    // If already submitted, nothing to do
    if (hasSubmittedAnswer) return

    const answerToSend = selectedAnswer && selectedAnswer.trim() ? selectedAnswer : 'NO_ANSWER'

    const doAutoSubmit = async () => {
      try {
        setLoading(true)
        console.debug('Auto-submitting answer due to timeout:', answerToSend)
        await promptWarsGameAPI.submitAnswer(gameId, { answer: answerToSend })
        setHasSubmittedAnswer(true)
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: 'System',
            message: answerToSend === 'NO_ANSWER' ? '⏱️ Time expired — auto-submitted NO_ANSWER.' : '⏱️ Time expired — auto-submitted your selection.',
            timestamp: new Date(),
          },
        ])
      } catch (e) {
        console.error('Auto-submit failed:', e)
        setError(getErrorMessage(e))
      } finally {
        setLoading(false)
      }
    }

    doAutoSubmit()
  }, [timeLeft, gameState, selectedAnswer, hasSubmittedAnswer, isMultiplayerGame, gameId, gameData])

  // Auto-handle timeout for classic prompt battles: if timer hits zero, ensure game moves to rating/finished
  useEffect(() => {
    if (!isMultiplayerGame || !gameId) return
    if (gameState !== 'writing') return
    if (timeLeft !== 0) return
    // Only for classic prompt battles
    if (gameData?.gameType === 'REVERSE_PROMPT') return

    const doForceFinish = async () => {
      try {
        setLoading(true)
        // Ask server to force finish the game: it will assign empty prompts where missing and run AI rating if at least one prompt exists
        await promptWarsGameAPI.forceFinishGame(gameId)
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: 'System',
            message: '⏱️ Time expired — game forced to finish. Awaiting AI judgment...',
            timestamp: new Date(),
          },
        ])
      } catch (e) {
        console.error('Force-finish failed:', e)
        setError(getErrorMessage(e))
      } finally {
        setLoading(false)
      }
    }

    // Debounce a bit to avoid double-calls from simultaneous clients
    const t = setTimeout(() => {
      doForceFinish()
    }, 250)

    return () => clearTimeout(t)
  }, [timeLeft, gameState, isMultiplayerGame, gameId, gameData])

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
        model: "meta-llama/llama-4-scout",
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
        // Check if this is a reverse prompt battle
        if (gameData?.gameType === 'REVERSE_PROMPT') {
          // For reverse prompt battles, mark the next round as loading and generate the first question
          setRoundLoading(true)
          // Prevent duplicate generation: mark that we've requested generation for the current question number
          const qn = gameData.questionNumber || 1
          generationRequestedForQN.current = qn
          // For reverse prompt battles, generate the first question instead of scenario
          await promptWarsGameAPI.generateQuestion(gameId)

          setChatMessages(prev => [
            ...prev,
            {
              id: generateUniqueId(),
              user: "System",
              message: "🎮 Reverse Battle started! Generating first question...",
              timestamp: new Date(),
            },
          ])
        } else {
          // For classic prompt battles, start the game and request scenario generation.
          // Allow either player to initiate; server-side generation is idempotent and guarded.
          await promptWarsGameAPI.startGame(gameId, { gameMode: "multiplayer" })

          // Immediately request scenario generation so both players are notified via WS
          setIsLoadingScenario(true)
          try {
            await promptWarsGameAPI.generateScenario(gameId)
            setChatMessages(prev => [
              ...prev,
              {
                id: generateUniqueId(),
                user: "System",
                message: "🎮 Battle started! Generating scenario...",
                timestamp: new Date(),
              },
            ])
            // Do not set local scenario here - will be pushed via WebSocket
          } catch (e) {
            console.warn('Scenario generation request failed or was already handled by another player', e)
            // If another player already generated, refresh game state
            await loadGameData()
          } finally {
            setIsLoadingScenario(false)
          }
        }
        
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
      // Allow either player to request scenario generation. Server enforces single generation.
      // Add a small client-side debounce to avoid immediate duplicate requests from fast double-clicks.
      if (isLoadingScenario) return
      setIsLoadingScenario(true)
      try {
        const newScenario = await promptWarsGameAPI.generateScenario(gameId)
        // Do not set local scenario here - wait for WebSocket push to ensure both clients sync
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
        console.warn('Scenario generation request failed or already handled by peer:', error)
        // Refresh game state to sync up if another player already generated
        await loadGameData()
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
            message: " Prompt submitted! Waiting for opponent...",
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
          model: "meta-llama/llama-4-scout",
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
          model: "meta-llama/llama-4-scout",
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
          
          // Parse the AI response to extract ratings and a cleaned explanation
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

          // Preserve the raw AI response for display (don't alter or parse it for presentation)
          setRatingExplanation(ratingText)
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

  const resetBattle = async () => {
    setGameState("waiting")
    setScenario("")
    setMyPrompt("")
    setOpponentPrompt("")
    setShowOpponentPrompt(false)
    setMyRating(0)
    setPlayerRating(0)
    setOpponentRating(0)
    setRatingExplanation("")
    setWinner(null)
    setTimeLeft(120)
    setError(null)
    // Reset reverse-battle state as well
    setQuestionNumber(1)
    setPlayerScore(0)
    setOpponentScore(0)
    setCurrentQuestion("")
    setCurrentOutput("")
    setCurrentOptions([])
    setRoundLoading(false)
    setChatMessages(prev => [
      ...prev,
      {
        id: generateUniqueId(),
        user: "System",
        message: "🔄 Arena reset! Ready for another epic battle?",
        timestamp: new Date(),
      },
    ])

    // Restart the actual game
    if (isMultiplayerGame && gameId) {
      // For multiplayer, restart the backend game
      try {
        await promptWarsGameAPI.restartGame(gameId)
        // Don't set state here - wait for WebSocket notification
        // The backend will send GAME_RESTARTED with the writing state
        setChatMessages(prev => [
          ...prev,
          {
            id: generateUniqueId(),
            user: "System",
            message: "🎮 Restarting battle...",
            timestamp: new Date(),
          },
        ])
      } catch (error) {
        console.error('Failed to restart game:', error)
        setError(getErrorMessage(error))
      }
    } else {
      // For demo mode, immediately start a new battle
      setGameState("writing")
      setTimeLeft(120)
      await generateDemoScenario()
    }
  }

  // Reverse Prompt Battle Functions
  const generateQuestion = async () => {
    if (!gameId) return
    
    console.log('Generating question for game:', gameId)
    setLoading(true)
    setError(null)
    
    try {
      // mark that a new round is loading so UI hides begin button
      const qn = (gameData && gameData.questionNumber) ? gameData.questionNumber : questionNumber
      if (generationRequestedForQN.current === qn) {
        console.log('Generation already requested for questionNumber', qn, '— skipping duplicate request')
        return
      }
      generationRequestedForQN.current = qn
      setRoundLoading(true)
      const response = await promptWarsGameAPI.generateQuestion(gameId)
      console.log('Generate question response:', response)
      // Question data will come via WebSocket
    } catch (error) {
      console.error('Failed to generate question:', error)
      setError(getErrorMessage(error))
      // if generation fails, clear round loading so players can retry
      setRoundLoading(false)
      generationRequestedForQN.current = null
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!gameId || !selectedAnswer) return
    
    setLoading(true)
    setError(null)
    
    try {
      await promptWarsGameAPI.submitAnswer(gameId, { answer: selectedAnswer })
      // Prevent duplicate submits locally until results arrive
      setHasSubmittedAnswer(true)
      // Results will come via WebSocket
    } catch (error) {
      console.error('Failed to submit answer:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  // Handle returning to social hub: finish game, notify opponent, show popup and redirect
  const handleReturnToSocial = async () => {
    // Non-multiplayer fallback: immediate redirect
    if (!isMultiplayerGame || !gameId) {
      window.location.href = "/social"
      return
    }

    setLoading(true)
    try {
      // Cancel the active game for this user (similar to social page)
      try {
        await fetch(`${API_BASE_URL}/prompt-wars/games/active`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
            'X-User-Id': localStorage.getItem('userId') || '',
          },
        })
      } catch (e) {
        console.warn('Cancel active game failed:', e)
      }

      // Broadcast a game action so the opponent can show a friendly popup and redirect
      try {
        promptWarsWebSocket.sendGameAction(gameId, 'PLAYER_LEFT', { message: 'A player left the match.' })
      } catch (e) {
        console.warn('sendGameAction failed while returning to social:', e)
      }

      // Show popup for the leaving player
      setEndPopupMessage('You left the match. The game has ended.')
      setShowEndPopup(true)

      // Wait a moment for the WebSocket message to be sent and processed
      setTimeout(() => {
        // Ensure we leave the room locally then redirect
        try { promptWarsWebSocket.leaveGameRoom(gameId) } catch (e) { /* ignore */ }
        window.location.href = '/social'
      }, 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      gameData?.gameType === 'REVERSE_PROMPT' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-slate-900 via-green-900 to-slate-900'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {gameData?.gameType === 'REVERSE_PROMPT' ? (
          <>
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-violet-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-violet-500/5 rounded-full blur-xl animate-pulse delay-3000"></div>
          </>
        ) : (
          <>
            <div className="absolute top-20 left-10 w-32 h-32 bg-[#3ebb9e]/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-[#4079ff]/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-[#3ebb9e]/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-[#4079ff]/5 rounded-full blur-xl animate-pulse delay-3000"></div>
          </>
        )}
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
                {gameData?.gameType === 'REVERSE_PROMPT' ? 'REVERSE PROMPT WARS' : 'PROMPT WARS'}
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
                      {gameData?.gameType === 'REVERSE_PROMPT' 
                        ? (isMultiplayerGame ? "REVERSE BATTLE READY" : "REVERSE ARENA") 
                        : (isMultiplayerGame ? "AWAITING CHALLENGER" : "ENTER THE ARENA")}
                    </h2>
                    <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                      {gameData?.gameType === 'REVERSE_PROMPT' 
                        ? (isMultiplayerGame
                          ? "Ready for reverse prompt battle! You'll guess which prompts generated AI outputs. First to 5 wins!"
                          : "Test your prompt analysis skills in reverse battles!")
                        : (isMultiplayerGame
                          ? "Your opponent is preparing for battle. Both warriors must be ready before the arena opens..."
                          : "Step into the ultimate prompt crafting battleground. Face AI opponents in epic battles of creativity, strategy, and wit.")}
                    </p>
                  </div>

                  {/* Show loading spinner and round info between rounds for reverse prompt battles */}
                  {/* Show loading spinner whenever a round is being generated or between rounds (questionNumber > 1) */}
                  {gameData?.gameType === 'REVERSE_PROMPT' && isMultiplayerGame && gameState === 'waiting' && (roundLoading || (questionNumber > 1)) ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                      <Loader2 className="h-12 w-12 animate-spin text-[#4079ff] mb-4" />
                      <div className="text-xl text-white font-bold">Loading next round...</div>
                      <div className="text-slate-400">Round {questionNumber} of 5</div>
                    </div>
                  ) : (
                    <Button
                      onClick={startNewBattle}
                      disabled={
                        loading || isLoadingScenario || roundLoading ||
                        (isMultiplayerGame && gameData?.gameType === 'REVERSE_PROMPT' && (questionNumber > 1 || gameState !== 'waiting'))
                      }
                      className="bg-gradient-to-r from-[#3ebb9e] to-[#4079ff] hover:from-[#3ebb9e]/80 hover:to-[#4079ff]/80 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {loading || isLoadingScenario || roundLoading ? (
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
                  )}

                  {/* Next Question Button for Reverse Battles
                  {isMultiplayerGame && gameData?.gameType === 'REVERSE_PROMPT' && gameState === 'waiting' && gameData.questionNumber && gameData.questionNumber > 0 && (
                    <Button
                      onClick={generateQuestion}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ml-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                          GENERATING...
                        </>
                      ) : (
                        <>
                          <Target className="h-6 w-6 mr-3" />
                          NEXT QUESTION
                        </>
                      )}
                    </Button>
                  )} */}
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
                  {/* Classic Prompt Battle - Writing Phase */}
                  {(!gameData?.gameType || gameData?.gameType === 'PROMPT_CREATION') && (
                    <>
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
                    </>
                  )}

                  {/* Reverse Prompt Battle - Answering Phase */}
                  {gameData?.gameType === 'REVERSE_PROMPT' && (
                    <>
                      <div className="text-center mb-6">
                        <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
                          <Target className="h-8 w-8 text-purple-400" />
                          REVERSE BATTLE
                          <div
                            className={`text-2xl font-black ml-4 ${
                              timeLeft <= 15 ? "text-red-400 animate-pulse" : "text-purple-400"
                            }`}
                          >
                            {formatTime(timeLeft)}
                          </div>
                        </h2>
                        <p className="text-slate-400">Question {questionNumber} • Score: {playerScore} vs {opponentScore}</p>
                      </div>

                      {/* Question */}
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">
                              {currentQuestion || 'Loading question...'}
                            </h4>
                            <div className="bg-slate-800 rounded-lg p-4 mt-4">
                              <h5 className="text-purple-300 font-medium mb-2">AI Output:</h5>
                              <p className="text-slate-300 italic">
                                {currentOutput || 'Loading AI output...'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Answer Options */}
                      <div className="space-y-3">
                        <h4 className="text-white font-bold text-lg">Which prompt generated this output?</h4>
                        {currentOptions.length > 0 ? (
                          currentOptions.map((option, index) => {
                            const letter = String.fromCharCode(65 + index); // A, B, C, D
                            return (
                              <div
                                key={letter}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                  selectedAnswer === letter
                                    ? 'border-purple-400 bg-purple-400/10'
                                    : 'border-slate-600 hover:border-slate-500'
                                }`}
                                onClick={() => setSelectedAnswer(letter)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    selectedAnswer === letter
                                      ? 'border-purple-400 bg-purple-400'
                                      : 'border-slate-500'
                                  }`}>
                                    <span className="text-white text-sm font-bold">{letter}</span>
                                  </div>
                                  <span className="text-slate-300">{option}</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-4" />
                            <p className="text-slate-400">Loading answer options...</p>
                          </div>
                        )}
                      </div>

                      {/* Results Display */}
                      {showResults && (
                        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
                          <div className="text-center">
                            <h4 className="text-2xl font-bold text-white mb-4">
                              {selectedAnswer === correctAnswer ? '🎉 Correct!' : '❌ Wrong!'}
                            </h4>
                            <p className="text-slate-300 mb-2">
                              Correct answer was: <span className="text-purple-400 font-bold">{correctAnswer}</span>
                            </p>
                            <p className="text-slate-400">
                              Score: {playerScore} vs {opponentScore}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="text-center">
                        <Button
                          onClick={submitAnswer}
                          disabled={loading || hasSubmittedAnswer || !selectedAnswer || timeLeft === 0}
                          className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-3 text-lg font-bold rounded-xl disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              Submit Answer
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
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
                            ? (gameData?.gameType === 'REVERSE_PROMPT' ? 'You got the most correct answers!' : 'You scored higher on the AI judge!')
                            : winner === "opponent"
                              ? (gameData?.gameType === 'REVERSE_PROMPT' ? 'A worthy opponent has bested you. Train harder, warrior!' : 'A worthy opponent has bested you. Train harder, warrior!')
                              : 'Both warriors showed equal skill! An honorable draw!'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                          className={`rounded-xl p-6 ${
                            playerRating >= opponentRating
                              ? "bg-gradient-to-br from-[#3ebb9e]/20 to-emerald-500/20 border border-[#3ebb9e]/40"
                              : "bg-slate-700/30 border border-slate-600/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Your Score</h3>
                            {playerRating > opponentRating && <Crown className="h-6 w-6 text-[#3ebb9e]" />}
                          </div>
                          <div className="text-4xl font-black text-white mb-2">{playerRating}/{gameData?.gameType === 'REVERSE_PROMPT' ? 5 : 10}</div>
                          <p className="text-sm text-slate-400">{gameData?.gameType === 'REVERSE_PROMPT' ? 'Correct Answers' : 'AI Judge Score'}</p>
                        </div>

                        <div
                          className={`rounded-xl p-6 ${
                            opponentRating > playerRating
                              ? "bg-gradient-to-br from-[#4079ff]/20 to-blue-500/20 border border-[#4079ff]/40"
                              : "bg-slate-700/30 border border-slate-600/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Opponent's Score</h3>
                            {opponentRating > playerRating && <Crown className="h-6 w-6 text-[#4079ff]" />}
                          </div>
                          <div className="text-4xl font-black text-white mb-2">{opponentRating}/{gameData?.gameType === 'REVERSE_PROMPT' ? 5 : 10}</div>
                          <p className="text-sm text-slate-400">{gameData?.gameType === 'REVERSE_PROMPT' ? 'Correct Answers' : 'AI Judge Score'}</p>
                        </div>
                      </div>

                      {/* AI Rating Explanation: show only the explanation text for classic games, keep as-is for reverse */}
                      {ratingExplanation && (
                        <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-[#3ebb9e]" />
                            AI Judge Analysis
                          </h3>
                          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {ratingExplanation}
                          </div>
                        </div>
                      )}

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
                        onClick={handleReturnToSocial}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-6 py-3 text-lg font-semibold rounded-xl"
                      >
                        <Users className="h-5 w-5 mr-2" />
                        Return to Social
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
                onClick={handleReturnToSocial}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white bg-slate-900/90 backdrop-blur-sm border-2 font-semibold"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Back to Social
              </Button>
            </div>
          )}

          {/* End-game non-blocking popup */}
          {showEndPopup && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center">
              <div className="bg-slate-900/95 border border-slate-700/60 text-white rounded-xl px-8 py-6 shadow-2xl max-w-md mx-4">
                <div className="text-center">
                  <div className="text-4xl mb-4">⚔️</div>
                  <div className="font-bold text-lg mb-2">Match Ended</div>
                  <div className="text-slate-300">{endPopupMessage}</div>
                  <div className="text-xs text-slate-400 mt-4">Redirecting to social hub...</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
