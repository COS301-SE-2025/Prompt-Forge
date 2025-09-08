import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PromptCard } from "../components/PromptCard";
import { Users, UserPlus, UserMinus, Star, Swords, Search, Timer, Trophy, X, Bell, Zap, Loader2 } from "lucide-react";
import { API_BASE_URL } from '../config/api';

// Types
interface SocialUser {
  userId: string;
  username: string;
  email?: string;
  profilePictureUrl?: string;
  bio?: string;
  followers: string[] | number;
  following: string[] | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: string;
  badges?: string[];
  prompts?: Prompt[];
  totalPrompts?: number;
  averageRating?: number;
  isOnline?: boolean;
  isPopular?: boolean;
  isFollowing?: boolean;
}

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  price: number;
  authorId: string;
  authorName?: string;
  createdAt: string;
  rating?: number;
  totalRatings?: number;
}

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerAvatar?: string;
  opponentId: string;
  opponentName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  message?: string;
  createdAt: Date;
  expiresAt: Date;
}

interface GameNotification {
  gameId: string;
  opponentName: string;
  type: 'GAME_STARTING' | 'GAME_FOUND';
}

// WebSocket connection
let socket: any = null;

// API Service Classes
class ChallengeAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      console.warn('No userId found in localStorage');
    }
    
    console.log('Challenge API headers:', { token: !!token, userId });
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-User-Id': userId || '',
    };
  }

  static async sendChallenge(opponentId: string, message?: string): Promise<Challenge> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/challenges/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ opponentId, message })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send challenge');
    }
    
    return response.json();
  }
  
  static async acceptChallenge(challengeId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/challenges/${challengeId}/accept`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Accept challenge failed:', response.status, errorText);
      throw new Error(`Failed to accept challenge: ${errorText}`);
    }
    
    return response.json();
  }
  
  static async declineChallenge(challengeId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/prompt-wars/challenges/${challengeId}/decline`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }
  
  static async getUserChallenges(): Promise<Challenge[]> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/challenges/my-challenges`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      return [];
    }
    
    return response.json();
  }
}

class SocialAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }
  
  static async getUsers(): Promise<SocialUser[]> {
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  }
  
  static async getUserById(userId: string): Promise<SocialUser> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  }
  
  static async getFollowing(): Promise<SocialUser[]> {
    const response = await fetch(`${API_BASE_URL}/user/me/following`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      return [];
    }
    
    return response.json();
  }
  
  static async getFollowers(): Promise<SocialUser[]> {
    const response = await fetch(`${API_BASE_URL}/user/me/followers`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      return [];
    }
    
    return response.json();
  }
  
  static async followUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/follow`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to follow user');
    }
  }
  
  static async unfollowUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/follow`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to unfollow user');
    }
  }
  
  static async searchUsers(query: string): Promise<SocialUser[]> {
    const response = await fetch(`${API_BASE_URL}/user/search?query=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      return [];
    }
    
    return response.json();
  }

  // Paginated API methods
  static async getUsersPaginated(page: number, size: number, search?: string): Promise<PaginatedResponse<SocialUser>> {
    let url = `${API_BASE_URL}/user/paginated?page=${page}&size=${size}`;
    
    if (search?.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page
      };
    }
    
    return response.json();
  }

  static async getFollowingPaginated(page: number, size: number): Promise<PaginatedResponse<SocialUser>> {
    const url = `${API_BASE_URL}/user/me/following/paginated?page=${page}&size=${size}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page
      };
    }
    
    return response.json();
  }

  static async getFollowersPaginated(page: number, size: number): Promise<PaginatedResponse<SocialUser>> {
    const url = `${API_BASE_URL}/user/me/followers/paginated?page=${page}&size=${size}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page
      };
    }
    
    return response.json();
  }
}

class PromptAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }
  
  static async getPromptsByAuthor(authorId: string): Promise<Prompt[]> {
    const response = await fetch(`${API_BASE_URL}/prompts/author/${authorId}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      return [];
    }
    
    return response.json();
  }
  
  static async getAllPrompts(): Promise<Prompt[]> {
    const response = await fetch(`${API_BASE_URL}/prompts`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      return [];
    }
    
    return response.json();
  }
}

export default function SocialPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<SocialUser | null>(null);
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [following, setFollowing] = useState<SocialUser[]>([]);
  const [followers, setFollowers] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState<{[key: string]: boolean}>({
    discover: false,
    following: false,
    followers: false
  });
  const [challengeMessage, setChallengeMessage] = useState("");
  const [challengeLoading, setChallengeLoading] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SocialUser | null>(null);
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<{[key: string]: number}>({
    discover: 1,
    following: 1,
    followers: 1
  });
  const [totalPages, setTotalPages] = useState<{[key: string]: number}>({
    discover: 1,
    following: 1,
    followers: 1
  });
  const [totalElements, setTotalElements] = useState<{[key: string]: number}>({
    discover: 0,
    following: 0,
    followers: 0
  });

  const USERS_PER_PAGE = 12;

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
        return 'You are not authorized to perform this action.'
      }
      if (message.includes('network') || message.includes('fetch')) {
        return 'Connection error. Please check your internet connection and try again.'
      }
      
      return error.message
    }
    
    return 'An unexpected error occurred. Please try again.'
  }

  // Initialize WebSocket connection
  useEffect(() => {
    initializeWebSocket();
    loadInitialData();
    
    // Handle URL hash for direct navigation to challenges
    const handleHashChange = () => {
      if (window.location.hash === '#challenges') {
        setActiveTab('challenges');
        window.location.hash = ''; // Clear the hash
      }
    };
    
    handleHashChange(); // Check on mount
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      if (socket && socket.readyState === 1) { // 1 = OPEN
        socket.close();
      }
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const initializeWebSocket = () => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.warn('No user ID found, skipping WebSocket connection');
        return;
      }

      // Create simple WebSocket connection to our custom handler
      const baseUrl = API_BASE_URL.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');
      const wsUrl = `${baseUrl}/api/simple-ws?userId=${userId}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      socket = new (window as any).WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
        // Wait a moment before sending to ensure connection is fully established
        setTimeout(() => {
          socket?.send(JSON.stringify({
            type: 'USER_CONNECT',
            userId: userId
          }));
        }, 100);
      };

      socket.onmessage = (event: any) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000);
      };

      socket.onerror = (error: any) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    console.log('Handling WebSocket message:', data);
    
    switch (data.type) {
      case 'CHALLENGE_RECEIVED':
        // Add new challenge to the list
        setChallenges(prev => [data.challenge, ...prev]);
        showNotification(`Challenge received from ${data.challenge.challengerName}`);
        
        // Automatically switch to challenges tab if user is not already there
        if (activeTab !== 'challenges') {
          // Show a more prominent notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-[#3ebb9e] text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
          notification.innerHTML = `
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-bold">New Challenge!</h4>
                <p class="text-sm">${data.challenge.challengerName} wants to battle!</p>
                <button class="text-xs underline mt-1" onclick="this.parentElement.parentElement.parentElement.remove(); window.location.hash = 'challenges'">
                  View Challenge →
                </button>
              </div>
              <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white">×</button>
            </div>
          `;
          document.body.appendChild(notification);
          
          // Auto remove after 5 seconds
          setTimeout(() => {
            if (notification.parentElement) {
              notification.remove();
            }
          }, 5000);
        }
        break;
        
      case 'CHALLENGE_DECLINED':
        // Update challenge status in the list
        setChallenges(prev => prev.map(c => 
          c.id === data.challengeId ? { ...c, status: 'DECLINED' } : c
        ));
        showNotification('Your challenge was declined');
        break;
        
      case 'CHALLENGE_EXPIRED':
        // Remove expired challenge from the list
        setChallenges(prev => prev.filter(c => c.id !== data.challengeId));
        showNotification('Challenge expired');
        break;
        
      case 'GAME_STARTING':
        // Redirect both players to the game
        showNotification(`Game starting between ${data.challengerName} and ${data.opponentName}!`);
        window.location.href = `/prompt-wars/game/${data.gameId}`;
        break;
        
      case 'GAME_UPDATE':
        showNotification(data.message || 'Game updated');
        break;
        
      default:
        console.log('Unhandled message type:', data.type);
    }
  };

  const showNotification = (message: string) => {
    // You can implement a toast notification here
    console.log('Notification:', message);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load initial page for discover tab
      await loadPageData('discover', 1);
      
      // Load challenges
      const challengesData = await ChallengeAPI.getUserChallenges().catch(() => []);
      setChallenges(challengesData);
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPageData = async (tab: string, page: number) => {
    try {
      setTabLoading(prev => ({ ...prev, [tab]: true }));
      
      switch (tab) {
        case 'discover': {
          const usersResponse = await SocialAPI.getUsersPaginated(page - 1, USERS_PER_PAGE, search);
          // Add online status simulation and ensure isFollowing is properly set
          const usersWithOnlineStatus = (usersResponse.content || []).map(user => ({
            ...user,
            isOnline: Math.random() > 0.3, // 70% chance of being online for demo
            isFollowing: user.isFollowing || false // Ensure this field exists
          }));
          setUsers(usersWithOnlineStatus);
          setTotalPages(prev => ({ ...prev, discover: usersResponse.totalPages || 1 }));
          setTotalElements(prev => ({ ...prev, discover: usersResponse.totalElements || 0 }));
          setCurrentPage(prev => ({ ...prev, discover: page }));
          break;
        }
          
        case 'following': {
          const followingResponse = await SocialAPI.getFollowingPaginated(page - 1, USERS_PER_PAGE);
          // Add online status simulation - users in following are already being followed
          const followingWithOnlineStatus = (followingResponse.content || []).map(user => ({
            ...user,
            isOnline: Math.random() > 0.3, // 70% chance of being online for demo
            isFollowing: true // All users in following tab are being followed
          }));
          setFollowing(followingWithOnlineStatus);
          setTotalPages(prev => ({ ...prev, following: followingResponse.totalPages || 1 }));
          setTotalElements(prev => ({ ...prev, following: followingResponse.totalElements || 0 }));
          setCurrentPage(prev => ({ ...prev, following: page }));
          break;
        }
          
        case 'followers': {
          const followersResponse = await SocialAPI.getFollowersPaginated(page - 1, USERS_PER_PAGE);
          // Add online status simulation and check if we follow them back
          const followersWithOnlineStatus = (followersResponse.content || []).map(user => ({
            ...user,
            isOnline: Math.random() > 0.3, // 70% chance of being online for demo
            isFollowing: user.isFollowing || false // Check if we follow them back
          }));
          setFollowers(followersWithOnlineStatus);
          setTotalPages(prev => ({ ...prev, followers: followersResponse.totalPages || 1 }));
          setTotalElements(prev => ({ ...prev, followers: followersResponse.totalElements || 0 }));
          setCurrentPage(prev => ({ ...prev, followers: page }));
          break;
        }
      }
    } catch (error) {
      console.error(`Failed to load ${tab} data:`, error);
      setError(`Failed to load ${tab}. Please try again.`);
    } finally {
      setTabLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  const calculateAverageRating = (prompts: Prompt[]): number => {
    if (prompts.length === 0) return 0;
    const totalRating = prompts.reduce((sum, prompt) => sum + (prompt.rating || 0), 0);
    return Math.round((totalRating / prompts.length) * 10) / 10;
  };

  // Handle tab changes
  useEffect(() => {
    loadPageData(activeTab, currentPage[activeTab] || 1);
  }, [activeTab]);

  // Handle search changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'discover') {
        loadPageData('discover', 1);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [search]);

  const changePage = (tab: string, pageNumber: number) => {
    loadPageData(tab, pageNumber);
  };

  const handleSendChallenge = async () => {
    if (!selectedOpponent) return;
    
    try {
      await ChallengeAPI.sendChallenge(
        selectedOpponent.userId,
        challengeMessage || undefined
      );
      
      setShowChallengeModal(false);
      setChallengeMessage("");
      setSelectedOpponent(null);
      showNotification(`Challenge sent to ${selectedOpponent.username}!`);
      
      // Reload challenges
      const updatedChallenges = await ChallengeAPI.getUserChallenges();
      setChallenges(updatedChallenges);
    } catch (error) {
      console.error('Failed to send challenge:', error);
      setError(getErrorMessage(error));
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    setChallengeLoading(prev => ({ ...prev, [challengeId]: true }));
    try {
      console.log('Accepting challenge:', challengeId);
      const gameData = await ChallengeAPI.acceptChallenge(challengeId);
      console.log('Game created:', gameData);
      
      // Update challenge status in local state
      setChallenges(prev => prev.map(c => 
        c.id === challengeId ? { ...c, status: 'ACCEPTED' as const } : c
      ));
      
      showNotification('Challenge accepted! Starting game...');
      
      // Navigate to the war page with game ID
      if (gameData && gameData.id) {
        console.log('Navigating to game:', gameData.id);
        window.location.href = `/war?gameId=${gameData.id}`;
      } else {
        console.log('No game ID, navigating to war page');
        // Fallback - just go to war page
        window.location.href = `/war`;
      }
    } catch (error) {
      console.error('Failed to accept challenge:', error);
      setError(`Failed to accept challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setChallengeLoading(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  const handleDeclineChallenge = async (challengeId: string) => {
    setChallengeLoading(prev => ({ ...prev, [challengeId]: true }));
    try {
      console.log('Declining challenge:', challengeId);
      await ChallengeAPI.declineChallenge(challengeId);
      
      // Update challenge status in local state
      setChallenges(prev => prev.map(c => 
        c.id === challengeId ? { ...c, status: 'DECLINED' as const } : c
      ));
      
      showNotification('Challenge declined');
    } catch (error) {
      console.error('Failed to decline challenge:', error);
      setError('Failed to decline challenge. Please try again.');
    } finally {
      setChallengeLoading(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  const handleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await SocialAPI.unfollowUser(userId);
      } else {
        await SocialAPI.followUser(userId);
      }

      // Update the user's following status in local state
      setUsers(prev => 
        prev.map(user => 
          user.userId === userId 
            ? { 
                ...user, 
                isFollowing: !isCurrentlyFollowing,
                followers: Array.isArray(user.followers) 
                  ? (isCurrentlyFollowing 
                      ? user.followers.filter(f => f !== currentUser?.userId)
                      : [...user.followers, currentUser?.userId || ''])
                  : (typeof user.followers === 'number' 
                      ? (isCurrentlyFollowing ? user.followers - 1 : user.followers + 1)
                      : 0)
              } 
            : user
        )
      );
      
      // Refresh following list if we're currently on the following tab
      if (activeTab === 'following') {
        changePage('following', currentPage.following);
      }
      
      showNotification(
        isCurrentlyFollowing 
          ? `Unfollowed ${users.find(u => u.userId === userId)?.username}` 
          : `Following ${users.find(u => u.userId === userId)?.username}`
      );
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
      setError('Failed to update follow status. Please try again.');
    }
  };

  const UserCard = ({ user }: { user: SocialUser }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col group hover:shadow-[0_0_20px_rgba(62,187,158,0.4)] hover:border-[#3ebb9e]/50">
      <div className="p-4 flex-1">
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <img
              className="w-12 h-12 rounded-full object-cover border-2 border-border group-hover:border-[#3ebb9e]/50 transition-colors duration-300"
              src={user.profilePictureUrl || "/placeholder-user.jpg"}
              alt={user.username}
            />
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold truncate group-hover:text-[#3ebb9e] transition-colors duration-300">{user.username}</h3>
              {user.isPopular && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
              {user.isOnline && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  Online
                </span>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{user.bio || "No bio available"}</p>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                <span>{user.averageRating || 0}</span>
              </div>
              <span>•</span>
              <span>{user.totalPrompts || 0} prompts</span>
              <span>•</span>
              <span>{Array.isArray(user.followers) ? user.followers.length : user.followers} followers</span>
            </div>
          </div>
        </div>
        
        {user.prompts && user.prompts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Recent Prompts</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
              {user.prompts.slice(0, 2).map((prompt) => (
                <div key={prompt.id} className="text-xs bg-muted p-2 rounded-md group-hover:bg-[#3ebb9e]/5 transition-colors duration-300">
                  <div className="font-medium group-hover:text-[#3ebb9e] transition-colors duration-300">{prompt.title}</div>
                  <div className="text-muted-foreground truncate">{prompt.description}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[#3ebb9e] font-medium">${prompt.price}</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-yellow-600">{prompt.rating || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-border p-3 bg-gradient-to-r from-transparent to-transparent group-hover:from-[#3ebb9e]/5 group-hover:to-[#3ebb9e]/10 transition-all duration-300">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={user.isFollowing ? "outline" : "default"}
            className={`flex-1 ${
              user.isFollowing 
                ? "hover:border-[#3ebb9e] hover:text-[#3ebb9e]" 
                : "bg-[#3ebb9e] hover:bg-[#00674f] text-white"
            } transition-colors duration-300`}
            onClick={() => handleFollow(user.userId, user.isFollowing || false)}
          >
            {user.isFollowing ? "Unfollow" : "Follow"}
          </Button>
          
          {/* Challenge button - Always show for followed users */}
          {user.isFollowing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (user.isOnline) {
                  setSelectedOpponent(user);
                  setShowChallengeModal(true);
                } else {
                  showNotification(`${user.username} is currently offline. Try again when they're online!`);
                }
              }}
              className={`transition-all duration-300 ${
                user.isOnline 
                  ? "bg-[#3ebb9e]/10 hover:bg-[#3ebb9e]/20 text-[#3ebb9e] border-[#3ebb9e]/30 hover:border-[#3ebb9e] group-hover:shadow-lg group-hover:shadow-[#3ebb9e]/25" 
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
              }`}
              title={user.isOnline ? "Challenge to Prompt Wars" : "User is offline"}
            >
              {user.isOnline ? (
                <>
                  <Swords className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                  Challenge
                </>
              ) : (
                <>
                  <Timer className="h-4 w-4 mr-1" />
                  Offline
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading social data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Error Loading Social Hub</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={loadInitialData}
            className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
            <div className="mb-3 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Social Hub</h1>
              <p className="text-sm text-muted-foreground">Connect, follow, and challenge other prompt creators</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Prompt Wars Navigation */}
              <Link to="/war">
                <Button 
                  variant="outline"
                  className="bg-gradient-to-r from-[#3ebb9e]/10 to-[#2ea688]/10 hover:from-[#3ebb9e]/20 hover:to-[#2ea688]/20 text-[#3ebb9e] border-[#3ebb9e]/30 hover:border-[#3ebb9e] transition-all duration-300"
                >
                  <Swords className="h-4 w-4 mr-2" />
                  Prompt Wars
                </Button>
              </Link>
              
              {/* Challenge Notifications */}
              {challenges.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('challenges')}
                  className="relative p-2 hover:bg-[#3ebb9e]/10 rounded-lg transition-colors duration-300"
                  title={`${challenges.filter(c => c.status === 'PENDING').length} pending challenges`}
                >
                  <Bell className="h-6 w-6 text-[#3ebb9e]" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {challenges.filter(c => c.status === 'PENDING').length}
                  </span>
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="relative">
              <Input
                placeholder="        Search users, prompts, or topics..."
                className="bg-muted border-muted pl-8 sm:pl-10 text-sm sm:text-base h-9 sm:h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {!search && (
                <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="discover" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Discover</span>
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Following ({following.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="followers" 
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Followers ({followers.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="challenges" 
              className={`flex items-center space-x-2 relative ${
                challenges.filter(c => c.status === 'PENDING').length > 0 
                  ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' 
                  : ''
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Challenges ({challenges.length})</span>
              {challenges.filter(c => c.status === 'PENDING').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {challenges.filter(c => c.status === 'PENDING').length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {tabLoading.discover && (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              </div>
            )}
            
            {!tabLoading.discover && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
                  {users.map((user) => (
                    <UserCard key={user.userId} user={user} />
                  ))}
                </div>
                
                {users.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-muted-foreground mb-4">
                      <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <h3 className="text-base sm:text-lg font-medium mb-2">No users found</h3>
                      <p className="text-sm sm:text-base px-4">Try adjusting your search terms.</p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Pagination for Discover */}
            {!tabLoading.discover && totalPages.discover > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage('discover', Math.max(1, currentPage.discover - 1))}
                  disabled={currentPage.discover === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(totalPages.discover, 5) }).map((_, i) => {
                  let pageNumber;
                  if (totalPages.discover <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage.discover <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage.discover >= totalPages.discover - 2) {
                    pageNumber = totalPages.discover - 4 + i;
                  } else {
                    pageNumber = currentPage.discover - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage.discover === pageNumber ? "default" : "outline"}
                      size="sm"
                      className={`min-w-[2.5rem] ${
                        currentPage.discover === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""
                      }`}
                      onClick={() => changePage('discover', pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 sm:h-9 sm:px-3"
                  onClick={() => changePage('discover', Math.min(totalPages.discover, currentPage.discover + 1))}
                  disabled={currentPage.discover === totalPages.discover}
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-6">
            {tabLoading.following && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#3ebb9e]" />
                <span className="ml-2 text-gray-600">Loading following...</span>
              </div>
            )}
            
            {!tabLoading.following && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
                  {following.map((user) => (
                    <UserCard key={user.userId} user={user} />
                  ))}
                </div>
                
                {following.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No following yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start following creators to see their content here.</p>
                  </div>
                )}
              </>
            )}
            
            {/* Pagination for Following */}
            {!tabLoading.following && totalPages.following > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage('following', Math.max(1, currentPage.following - 1))}
                  disabled={currentPage.following === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(totalPages.following, 5) }).map((_, i) => {
                  let pageNumber;
                  if (totalPages.following <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage.following <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage.following >= totalPages.following - 2) {
                    pageNumber = totalPages.following - 4 + i;
                  } else {
                    pageNumber = currentPage.following - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage.following === pageNumber ? "default" : "outline"}
                      size="sm"
                      className={`min-w-[2.5rem] ${
                        currentPage.following === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""
                      }`}
                      onClick={() => changePage('following', pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage('following', Math.min(totalPages.following, currentPage.following + 1))}
                  disabled={currentPage.following === totalPages.following}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers" className="space-y-6">
            {tabLoading.followers && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#3ebb9e]" />
                <span className="ml-2 text-gray-600">Loading followers...</span>
              </div>
            )}
            
            {!tabLoading.followers && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
                  {followers.map((user) => (
                    <UserCard key={user.userId} user={user} />
                  ))}
                </div>
                
                {followers.length === 0 && (
                  <div className="text-center py-12">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No followers yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Create great prompts to attract followers.</p>
                  </div>
                )}
              </>
            )}
            
            {/* Pagination for Followers */}
            {!tabLoading.followers && totalPages.followers > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage('followers', Math.max(1, currentPage.followers - 1))}
                  disabled={currentPage.followers === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(totalPages.followers, 5) }).map((_, i) => {
                  let pageNumber;
                  if (totalPages.followers <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage.followers <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage.followers >= totalPages.followers - 2) {
                    pageNumber = totalPages.followers - 4 + i;
                  } else {
                    pageNumber = currentPage.followers - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage.followers === pageNumber ? "default" : "outline"}
                      size="sm"
                      className={`min-w-[2.5rem] ${
                        currentPage.followers === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""
                      }`}
                      onClick={() => changePage('followers', pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage('followers', Math.min(totalPages.followers, currentPage.followers + 1))}
                  disabled={currentPage.followers === totalPages.followers}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            {(() => {
              const currentUserId = localStorage.getItem('userId');
              const receivedChallenges = challenges.filter(c => c.opponentId === currentUserId);
              const sentChallenges = challenges.filter(c => c.challengerId === currentUserId);
              const pendingReceived = receivedChallenges.filter(c => c.status === 'PENDING');
              
              return (
                <>
                  {pendingReceived.length > 0 && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full mr-3">
                          <Bell className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-800">
                            {pendingReceived.length} Pending Challenge(s)
                          </h3>
                          <p className="text-sm text-red-600">Accept or decline the challenges below to take action!</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Received Challenges Section */}
                  {receivedChallenges.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-[#3ebb9e]" />
                        Received Challenges ({receivedChallenges.length})
                      </h3>
                      <div className="grid gap-4">
                        {receivedChallenges.map((challenge) => (
                          <Card key={challenge.id} className={`p-4 transition-all duration-300 ${
                            challenge.status === 'PENDING' 
                              ? 'border-[#3ebb9e] bg-gradient-to-r from-[#3ebb9e]/5 to-[#3ebb9e]/10 shadow-lg' 
                              : 'border-border'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <img
                                    className="w-12 h-12 rounded-full object-cover border-2 border-border"
                                    src={challenge.challengerAvatar || "/placeholder-user.jpg"}
                                    alt={challenge.challengerName}
                                  />
                                  {challenge.status === 'PENDING' && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                      !
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold flex items-center">
                                    {challenge.challengerName}
                                    {challenge.status === 'PENDING' && (
                                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                        Waiting for Response
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {challenge.message || "Challenge to a prompt war!"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(challenge.createdAt).toLocaleDateString()} at {new Date(challenge.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                {challenge.status === 'PENDING' && (
                                  <div className="flex space-x-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleAcceptChallenge(challenge.id)}
                                      disabled={challengeLoading[challenge.id]}
                                      className="bg-[#3ebb9e] hover:bg-[#00674f] text-white min-w-[80px]"
                                    >
                                      {challengeLoading[challenge.id] ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                      ) : (
                                        <Swords className="h-4 w-4 mr-1" />
                                      )}
                                      {challengeLoading[challenge.id] ? 'Starting...' : 'Accept'}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleDeclineChallenge(challenge.id)}
                                      disabled={challengeLoading[challenge.id]}
                                      className="min-w-[80px] border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                      {challengeLoading[challenge.id] ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                      ) : (
                                        <X className="h-4 w-4 mr-1" />
                                      )}
                                      {challengeLoading[challenge.id] ? 'Processing...' : 'Decline'}
                                    </Button>
                                  </div>
                                )}
                                
                                <span className={`px-3 py-1 text-xs rounded-full text-center ${
                                  challenge.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  challenge.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                  challenge.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {challenge.status === 'PENDING' ? '⏳ Pending' :
                                   challenge.status === 'ACCEPTED' ? '✅ Accepted' :
                                   challenge.status === 'DECLINED' ? '❌ Declined' :
                                   challenge.status}
                                </span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Sent Challenges Section */}
                  {sentChallenges.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Swords className="h-5 w-5 mr-2 text-blue-500" />
                        Sent Challenges ({sentChallenges.length})
                      </h3>
                      <div className="grid gap-4">
                        {sentChallenges.map((challenge) => (
                          <Card key={challenge.id} className="p-4 border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <img
                                    className="w-12 h-12 rounded-full object-cover border-2 border-border"
                                    src="/placeholder-user.jpg"
                                    alt={challenge.opponentName || 'Opponent'}
                                  />
                                </div>
                                <div>
                                  <h3 className="font-semibold">
                                    Challenged {challenge.opponentName || 'Player'}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {challenge.message || "Challenge to a prompt war!"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(challenge.createdAt).toLocaleDateString()} at {new Date(challenge.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                <span className={`px-3 py-1 text-xs rounded-full text-center ${
                                  challenge.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  challenge.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                  challenge.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {challenge.status === 'PENDING' ? '⏳ Waiting for response' :
                                   challenge.status === 'ACCEPTED' ? '✅ Accepted' :
                                   challenge.status === 'DECLINED' ? '❌ Declined' :
                                   challenge.status}
                                </span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            
            {challenges.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges yet</h3>
                <p className="text-gray-500 mb-4">Challenge friends to prompt wars to see them here!</p>
                <Button
                  onClick={() => setActiveTab('discover')}
                  className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find People to Challenge
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Challenge Modal */}
        {showChallengeModal && selectedOpponent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 w-full max-w-md border border-border shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-[#3ebb9e]/10 p-2 rounded-full mr-3">
                    <Swords className="h-5 w-5 text-[#3ebb9e]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Challenge {selectedOpponent.username}</h2>
                    <p className="text-sm text-muted-foreground">Invite them to a Prompt Wars battle!</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChallengeModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">How Prompt Wars Works:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• You'll both get the same scenario to respond to</li>
                    <li>• Write the best prompt in 2 minutes</li>
                    <li>• AI judge will evaluate and declare the winner</li>
                  </ul>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Challenge Message (Optional)
                  </label>
                  <textarea
                    className="w-full p-3 border border-border rounded-md bg-muted"
                    rows={3}
                    placeholder="Add a trash-talking message or friendly invite..."
                    value={challengeMessage}
                    onChange={(e) => setChallengeMessage(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSendChallenge}
                    className="flex-1 bg-[#3ebb9e] hover:bg-[#00674f] text-white"
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    Send Challenge
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowChallengeModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
