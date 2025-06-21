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
}

export interface Review {
  id: string;
  promptId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: string; // Add if available from backend
}

export interface PromptWithTags extends Omit<Prompt, 'tagIds'> {
  tags: Tag[];
}



// export enum CategoryColors {
//     "Writing" = "bg-blue-500/20 text-blue-400",
//     "Marketing" = "bg-purple-500/20 text-purple-400",
//     "Development" = "bg-green-500/20 text-green-400",
//     "Design" = "bg-pink-500/20 text-pink-400"
// }///where does this go????