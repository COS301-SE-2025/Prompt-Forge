import { API_BASE_URL } from '@/config/api'
import { BadgeData } from '@/components/BadgeComponent'

export class BadgeService {
  // Get all available badges
  static async getAllBadges(): Promise<BadgeData[]> {
    const response = await fetch(`${API_BASE_URL}/badges`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch badges')
    }
    
    return response.json()
  }

  // Get current user's badges with progress
  static async getMyBadges(): Promise<BadgeData[]> {
    const response = await fetch(`${API_BASE_URL}/badges/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user badges')
    }
    
    return response.json()
  }

  // Get current user's earned badges only
  static async getMyEarnedBadges(): Promise<BadgeData[]> {
    const response = await fetch(`${API_BASE_URL}/badges/me/earned`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch earned badges')
    }
    
    return response.json()
  }

  // Get badges for a specific user
  static async getUserBadges(userId: string): Promise<BadgeData[]> {
    const response = await fetch(`${API_BASE_URL}/badges/user/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user badges')
    }
    
    return response.json()
  }

  // Get badges for a specific username
  static async getUserBadgesByUsername(username: string): Promise<BadgeData[]> {
    const response = await fetch(`${API_BASE_URL}/badges/user/username/${username}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user badges')
    }
    
    return response.json()
  }

  // Toggle badge visibility
  static async toggleBadgeVisibility(badgeId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/badges/${badgeId}/toggle-visibility`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to toggle badge visibility')
    }
  }

  // Get badge count for current user
  static async getMyBadgeCount(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/badges/me/count`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch badge count')
    }
    
    const data = await response.json()
    return data.count
  }
}