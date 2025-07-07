export interface User {
    id?: number,
    username?: string | undefined,
    email: string | undefined,
    password: string | undefined
    confirmPassword?: string | undefined
}

export interface UserProfile {
    userId: string
    username: string
    email: string
    // Add other user fields as needed
  }