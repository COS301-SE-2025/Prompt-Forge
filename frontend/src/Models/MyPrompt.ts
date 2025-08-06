import { Category } from "../Models/Prompt";

export interface MyPrompt {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: Category[]
  createdAt: string
  updatedAt: string
  rating: number
  uses: number
  featured: boolean
  price: number
  isPrivate: boolean
  isFavorite: boolean
  authorName: string
  isPublished: boolean // ✅ Add this property
  publishedAt?: string // ✅ Add this property
  source:"purchased"|"authored"
}