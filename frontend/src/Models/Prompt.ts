export interface Prompt {
    id: number,
    category: Category,
    rating: number,
    title: string,
    description: string,
    author: string,
    price: number,
    uses: number,
    featured:boolean,
    reviews?:JSON
}

export enum CategoryColors {
    "Writing" = "bg-blue-500/20 text-blue-400",
    "Marketing" = "bg-purple-500/20 text-purple-400",
    "Development" = "bg-green-500/20 text-green-400",
    "Design" = "bg-pink-500/20 text-pink-400"
}

export type Category = keyof typeof CategoryColors;