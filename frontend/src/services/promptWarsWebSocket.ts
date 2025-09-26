import { API_BASE_URL } from '../config/api';

export interface GameUpdate {
  type: string;
  gameId: string;
  gameState: string;
  scenario?: string;
  [key: string]: any;
}

export interface ChallengeNotification {
  type: string;
  challengerId: string;
  challengerName: string;
  message: string;
  challengeId: string;
}

export type WebSocketMessage = GameUpdate | ChallengeNotification;

class PromptWarsWebSocketService {
  private socket: any = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use the correct WebSocket endpoint that we set up
        const baseUrl = API_BASE_URL.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');
        const wsUrl = `${baseUrl}/api/simple-ws?userId=${userId}`;
        
        console.log('Connecting to WebSocket:', wsUrl);
        if(this.socket === null){
          this.socket = new (window as any).WebSocket(wsUrl);

          this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            
            // Send user identification
            this.send({
              type: 'USER_CONNECT',
              userId: userId
            });
            
            resolve();
          };
        }

        this.socket.onmessage = (event: any) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.socket.onclose = (event: any) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.handleReconnect();
        };

        this.socket.onerror = (error: any) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.listeners.clear();
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      this.reconnectTimeout = window.setTimeout(() => {
        // Retrieve userId from localStorage or context
        const userId = localStorage.getItem('userId');
        if (userId) {
          this.connect(userId).catch(console.error);
        }
      }, delay);
    }
  }

  private handleMessage(data: WebSocketMessage) {
    console.log('WebSocket message received:', data);
    
    // Emit to specific event listeners
    const eventListeners = this.listeners.get(data.type);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }

    // Emit to general listeners
    const generalListeners = this.listeners.get('*');
    if (generalListeners) {
      generalListeners.forEach(listener => listener(data));
    }
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === 1) { // 1 = OPEN
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message:', data);
    }
  }

  // Subscribe to specific event types
  on(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  // Subscribe to all events
  onAny(callback: (data: any) => void) {
    return this.on('*', callback);
  }

  // Game-specific methods
  sendGameAction(gameId: string, action: string, data?: any) {
    this.send({
      type: 'GAME_ACTION',
      gameId,
      action,
      ...data
    });
  }

  joinGameRoom(gameId: string) {
    this.send({
      type: 'JOIN_GAME_ROOM',
      gameId,
      userId: localStorage.getItem('userId')
    });
  }

  leaveGameRoom(gameId: string) {
    this.send({
      type: 'LEAVE_GAME_ROOM',
      gameId,
      userId: localStorage.getItem('userId')
    });
  }

  // Chat methods
  sendChatMessage(gameId: string, message: string) {
    this.send({
      type: 'GAME_CHAT',
      gameId,
      message,
      userId: localStorage.getItem('userId')
    });
  }

  // Challenge-specific methods
  sendChallenge(opponentId: string, message: string) {
    this.send({
      type: 'SEND_CHALLENGE',
      opponentId,
      message
    });
  }

  acceptChallenge(challengeId: string) {
    this.send({
      type: 'ACCEPT_CHALLENGE',
      challengeId
    });
  }

  declineChallenge(challengeId: string) {
    this.send({
      type: 'DECLINE_CHALLENGE',
      challengeId
    });
  }
  
  getUserOnlineStatus({ userId, otherUserId }:{userId: string, otherUserId:string}) {
    this.send({
      type: 'GET_USER_ONLINE_STATUS',
      userId,
      otherUserId
    });
  }
}

// Singleton instance
export const promptWarsWebSocket = new PromptWarsWebSocketService();

// Hook for React components
export function usePromptWarsWebSocket() {
  return promptWarsWebSocket;
}
