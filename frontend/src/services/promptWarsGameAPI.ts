import { API_BASE_URL } from '../config/api';

export interface GameResponse {
  id: string;
  player1Id: string;
  player2Id: string;
  gameState: 'WAITING' | 'SCENARIO' | 'WRITING' | 'RATING' | 'RESULTS' | 'FINISHED' | 'CANCELLED';
  scenario?: string;
  startedAt?: string;
  endedAt?: string;
  winnerId?: string;
  player1Score?: number;
  player2Score?: number;
  ratingExplanation?: string;
  createdAt: string;
}

export interface GameStateDetails {
  game: GameResponse;
  submissions: PromptSubmission[];
  playerSubmissions: PromptSubmission[];
  opponentSubmissions: PromptSubmission[];
  currentRound: number;
}

export interface PromptSubmission {
  id: string;
  gameId: string;
  playerId: string;
  roundNumber: number;
  prompt: string;
  submittedAt: string;
  aiScore?: number;
  opponentRating?: number;
  opponentExplanation?: string;
}

export interface GameStartRequest {
  gameMode?: string;
}

export interface PromptSubmissionRequest {
  prompt: string;
}

export interface RatingRequest {
  rating: number;
  explanation: string;
}

export class PromptWarsGameAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-User-Id': userId || ''
    };
  }

  async getGame(gameId: string): Promise<GameResponse> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/${gameId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get game: ${response.statusText}`);
    }

    return response.json();
  }

  async startGame(gameId: string, request: GameStartRequest): Promise<GameResponse> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/${gameId}/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to start game: ${response.statusText}`);
    }

    return response.json();
  }

  async restartGame(gameId: string): Promise<GameResponse> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/${gameId}/restart`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to restart game: ${response.statusText}`);
    }

    return response.json();
  }

  async generateScenario(gameId: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/${gameId}/generate-scenario`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate scenario: ${response.statusText}`);
    }

    return response.text();
  }

  async submitPrompt(gameId: string, request: PromptSubmissionRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/${gameId}/submit-prompt`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit prompt: ${response.statusText}`);
    }
  }

  async ratePrompt(gameId: string, request: RatingRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/${gameId}/rate-prompt`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to rate prompt: ${response.statusText}`);
    }
  }

  async getGameState(gameId: string): Promise<GameStateDetails> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/${gameId}/state`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get game state: ${response.statusText}`);
    }

    return response.json();
  }

  async getMyGames(): Promise<GameResponse[]> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/my-games`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get my games: ${response.statusText}`);
    }

    return response.json();
  }

  async getActiveGames(): Promise<GameResponse[]> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/active`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get active games: ${response.statusText}`);
    }

    return response.json();
  }

  async forfeitGame(gameId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/games/${gameId}/forfeit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to forfeit game: ${response.statusText}`);
    }
  }
}

// Singleton instance
export const promptWarsGameAPI = new PromptWarsGameAPI();
