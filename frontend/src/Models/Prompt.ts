export interface APrompt {
  id: string;
  title: string;
  price: number;
  description: string;
  publishedAt: string;
  usageCount: number;
  rating?: number;
}

export interface Prompt extends APrompt{
  id: string;
  authorId: string;
  title: string;
  slug: string;
  price: number;
  content: string;
  description: string;
  visibility: 'public' | 'private';
  createdAt: string;
  publishedAt: string;
  tagIds: string[]; // Array of UUID strings
  usageCount: number;
  rating?: number;
  featured?: boolean;
}

export interface MarketplacePrompt {
  id: string;
  authorId: string;
  authorname: string;
  title: string;
  slug: string;
  price: number;
  description: string;
  tagnames: Category[];
  usageCount: number;
  publishedAt: string;
  featured?: boolean;
  
}




export interface Tag {
  id: string
  name: string
}

export interface Review {
  id: string
  promptId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt?: string
  date?: string     
}

export interface ReviewsApiResponse {
  content: Review[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

// Update existing PromptWithTags interface to include reviews
export interface PromptWithTags {
  id: string
  authorId: string
  title: string
  slug: string
  price: number
  content: string
  description: string
  visibility: "public" | "private"
  createdAt: string
  publishedAt: string
  tags: Tag[]
  tagIds: string[]
  usageCount: number
  rating?: number
  featured?: boolean
  reviews?: Review[] // Add reviews property
  bought?: Review[] // Add reviews property
}

export enum CategoryColors {
    "Writing" = "bg-blue-500/20 text-blue-400",
    "Marketing" = "bg-purple-500/20 text-purple-400",
    "Development" = "bg-green-500/20 text-green-400",
    "Design" = "bg-pink-500/20 text-pink-400",
    "SEO"= "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    "Content"= "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "default" = "bg-blue-500/20 text-blue-400",
    "null" = "bg-transparent"
  
}

export type Category = keyof typeof CategoryColors;


