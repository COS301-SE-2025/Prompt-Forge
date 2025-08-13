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
  "Business"= "bg-fuchsia-500/20 text-fuchsia-500",
  "Development"= "bg-teal-100 text-teal-800 dark:bg-teal-500/30 dark:text-teal-300",
  "Coding"= "bg-cyan-500/20 text-cyan-500",
  "Science"= "bg-indigo-500/20 text-indigo-800 dark:bg-indigo-500/30 dark:text-indigo-300",
  "Problem Solving" = "bg-lime-300/50 text-lime-800 dark:text-lime-300",
  "Technical" = "bg-blue-500/20 text-blue-400",
  "Health" = "bg-green-500/20 text-green-400",
  "Creative Writing" = "bg-pink-500/20 text-pink-600 dark:bg-pink-600/30 dark:text-pink-300",
  "Research" = "bg-yellow-400/30 text-yellow-700 dark:text-yellow-300",
  "Education" = "bg-sky-400/30 text-sky-700 dark:text-sky-300",
  "Marketing" = "bg-rose-400/30 text-rose-700 dark:text-rose-300",
  "Data Analysis" = "bg-orange-400/20 text-orange-600 dark:text-orange-300",
  "Content Creation" = "bg-red-400/20 text-red-600 dark:bg-red-500/30 dark:text-red-300 ",
  "Gaming" = "bg-violet-500/20 text-violet-600 dark:text-violet-300",
  "Environment" = "bg-emerald-400/20 text-emerald-600 dark:text-emerald-300",
  "default" = "bg-amber-500/20 text-amber-600",
  "null" = "bg-transparent",
  "General" = " bg-purple-400/30 text-purple-700 dark:text-purple-300", // <-- More vibrant!
}

export type Category = keyof typeof CategoryColors;


