import { API_BASE_URL } from '../config/api';
export { API_BASE_URL };

// Types
export interface SocialUser {
  userId: string;
  username: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  followers: string[] | number;
  following: string[] | number;
  active: boolean;
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

export interface Prompt {
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

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerAvatar?: string;
  opponentId: string;
  opponentName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  message?: string;
  gameType?: 'PROMPT_CREATION' | 'REVERSE_PROMPT';
  createdAt: Date;
  expiresAt: Date;
}

export class ChallengeAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-User-Id': userId || '',
    };
  }

  static async sendChallenge(opponentId: string, message?: string, gameType?: 'PROMPT_CREATION' | 'REVERSE_PROMPT'): Promise<Challenge> {
    const response = await fetch(`${API_BASE_URL}/prompt-wars/challenges/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        opponentId, 
        message,
        gameType: gameType || 'PROMPT_CREATION'
      })
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

export class SocialAPI {
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

  static async getDiscoverUsersPaginated(page: number, size: number, search: string): Promise<PaginatedResponse<SocialUser>> {
    let url = `${API_BASE_URL}/user/discover?search=${encodeURIComponent(search.trim())}&page=${page}&size=${size}`;
    
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

export class PromptAPI {
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

export async function cancelActiveGame(): Promise<void> {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const response = await fetch(`${API_BASE_URL}/prompt-wars/games/active`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-User-Id': userId || '',
    },
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}
