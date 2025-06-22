export interface Prompt {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  price: number;
  visibility: 'public' | 'private';
  createdAt: string;
  publishedAt: string;
  tagIds: string[]; // Array of UUID strings
  usageCount: number;
  rating?: number;
  featured?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  usageCount?: number;
  category?: string;
  createdAt?: string;
  autosuggest?: boolean;
}

export interface Review {
  id: string;
  promptId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: string; // Add if available from backend
}

export interface PromptWithTags extends Omit<MarketplacePrompt[], 'tags'> {
  tags: Tag[];
}



export enum CategoryColors {
    "Writing" = "bg-blue-500/20 text-blue-400",
    "Marketing" = "bg-purple-500/20 text-purple-400",
    "Development" = "bg-green-500/20 text-green-400",
    "Design" = "bg-pink-500/20 text-pink-400",
    "SEO"= "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    "Content"= "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "default" = "bg-blue-500/20 text-blue-400"
  
}

export type Category = keyof typeof CategoryColors;

export interface MarketplacePrompt {
  id: string;
  authorId: string;
  username: string;
  title: string;
  price: number;
  tagnames: Category[];
  slug: string;
  description: string;
  featured?: boolean;
  usageCount: number;
  publishedAt: string;

}
