// "use client"

// import { useEffect, useState } from "react"
// import { Button } from "../components/ui/Button"
// import { Card } from "../components/ui/Card"
// import { Input } from "../components/ui/Input"
// import { Star, User, Search, Filter, Plus, Edit, Trash2, Copy, Calendar, BarChart3, Check } from "lucide-react"
// import { Link } from "react-router-dom"

// interface MyPrompt {
//   id: string
//   title: string
//   description: string
//   content: string
//   category: string
//   tags: string[]
//   createdAt: string
//   updatedAt: string
//   uses: number
//   rating: number
//   isPrivate: boolean
//   isFavorite: boolean
// }

// const PROMPTS_PER_PAGE = 12

// export default function MyPromptsPage() {
//   const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([])
//   const [filteredPrompts, setFilteredPrompts] = useState<MyPrompt[]>([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState("all")
//   const [selectedFilter, setSelectedFilter] = useState("all")
//   const [showFilters, setShowFilters] = useState(false)
//   const [availableCategories, setAvailableCategories] = useState<string[]>(["all"])
//   const [loading, setLoading] = useState(true)
//   const [copiedId, setCopiedId] = useState<string | null>(null)

//   // Mock data - replace with actual API call
//   useEffect(() => {
//     const fetchMyPrompts = async () => {
//       setLoading(true)
//       // Simulate API call
//       setTimeout(() => {
//         const mockPrompts: MyPrompt[] = [
//           {
//             id: "1",
//             title: "Creative Writing Assistant",
//             description: "A prompt to help generate creative story ideas and character development",
//             content: "You are a creative writing assistant. Help me develop compelling characters and engaging storylines. Please provide detailed character backgrounds, plot suggestions, and writing techniques that will make my stories more engaging and memorable.",
//             category: "Writing",
//             tags: ["creative", "storytelling", "characters"],
//             createdAt: "2024-01-15",
//             updatedAt: "2024-01-20",
//             uses: 45,
//             rating: 4.8,
//             isPrivate: false,
//             isFavorite: true,
//           },
//           {
//             id: "2",
//             title: "Code Review Helper",
//             description: "Prompt for conducting thorough code reviews and suggesting improvements",
//             content: "Please review the following code and provide feedback on code quality, performance, security, and best practices. Identify potential bugs, suggest optimizations, and recommend improvements for maintainability and readability.",
//             category: "Programming",
//             tags: ["code", "review", "development"],
//             createdAt: "2024-01-10",
//             updatedAt: "2024-01-18",
//             uses: 32,
//             rating: 4.5,
//             isPrivate: true,
//             isFavorite: false,
//           },
//           {
//             id: "3",
//             title: "Marketing Copy Generator",
//             description: "Generate compelling marketing copy for products and services",
//             content: "Create engaging marketing copy that converts visitors into customers. Focus on highlighting unique value propositions, addressing pain points, and including compelling calls-to-action. Make the copy persuasive yet authentic.",
//             category: "Marketing",
//             tags: ["marketing", "copywriting", "sales"],
//             createdAt: "2024-01-08",
//             updatedAt: "2024-01-16",
//             uses: 67,
//             rating: 4.9,
//             isPrivate: false,
//             isFavorite: true,
//           },
//           {
//             id: "4",
//             title: "Data Analysis Helper",
//             description: "Assist with data analysis and interpretation tasks",
//             content: "Help me analyze this dataset and provide insights. Look for patterns, trends, and anomalies. Present findings in a clear, actionable format with visualizations suggestions and statistical interpretations.",
//             category: "Analytics",
//             tags: ["data", "analysis", "insights"],
//             createdAt: "2024-01-05",
//             updatedAt: "2024-01-12",
//             uses: 28,
//             rating: 4.3,
//             isPrivate: true,
//             isFavorite: false,
//           },
//         ]

//         setMyPrompts(mockPrompts)
//         setFilteredPrompts(mockPrompts)

//         // Extract unique categories
//         const categories = ["all", ...new Set(mockPrompts.map((p) => p.category))]
//         setAvailableCategories(categories)

//         setLoading(false)
//       }, 1000)
//     }

//     fetchMyPrompts()
//   }, [])

//   useEffect(() => {
//     if (myPrompts.length === 0) return

//     const filtered = myPrompts.filter((prompt) => {
//       // Search filter
//       const matchesSearch = searchQuery
//         ? prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
//         : true

//       // Category filter
//       const matchesCategory = selectedCategory === "all" ? true : prompt.category === selectedCategory

//       // Additional filters
//       const oneWeekAgo = new Date()
//       oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
//       const isRecent = new Date(prompt.updatedAt) > oneWeekAgo

//       const matchesFilter =
//         selectedFilter === "all" ||
//         (selectedFilter === "favorites" && prompt.isFavorite) ||
//         (selectedFilter === "private" && prompt.isPrivate) ||
//         (selectedFilter === "public" && !prompt.isPrivate) ||
//         (selectedFilter === "recent" && isRecent) ||
//         (selectedFilter === "popular" && prompt.uses > 30)

//       return matchesSearch && matchesCategory && matchesFilter
//     })

//     setFilteredPrompts(filtered)
//     setCurrentPage(1)
//   }, [searchQuery, selectedCategory, selectedFilter, myPrompts])

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE)
//   const indexOfLastPrompt = currentPage * PROMPTS_PER_PAGE
//   const indexOfFirstPrompt = indexOfLastPrompt - PROMPTS_PER_PAGE
//   const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt)
//   const favoritePrompts = myPrompts.filter((prompt) => prompt.isFavorite).slice(0, 4)

//   const filters = [
//     { value: "all", label: "All" },
//     { value: "favorites", label: "Favorites" },
//     { value: "recent", label: "Recent" },
//     { value: "popular", label: "Popular" },
//     { value: "private", label: "Private" },
//     { value: "public", label: "Public" },
//   ]

//   const handleDeletePrompt = (id: string) => {
//     setMyPrompts((prev) => prev.filter((p) => p.id !== id))
//   }

//   const handleToggleFavorite = (id: string) => {
//     setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
//   }

//   const handleCopyPrompt = async (content: string, id: string) => {
//     try {
//       await navigator.clipboard.writeText(content)
//       setCopiedId(id)
//       setTimeout(() => setCopiedId(null), 2000)
//     } catch (err) {
//       console.error("Failed to copy prompt: ", err)
//       // Fallback for older browsers
//       const textArea = document.createElement("textarea")
//       textArea.value = content
//       document.body.appendChild(textArea)
//       textArea.focus()
//       textArea.select()
//       try {
//         document.execCommand('copy')
//         setCopiedId(id)
//         setTimeout(() => setCopiedId(null), 2000)
//       } catch (fallbackErr) {
//         console.error("Fallback copy failed: ", fallbackErr)
//       }
//       document.body.removeChild(textArea)
//     }
//   }

//   const handleEditPrompt = (prompt: MyPrompt) => {
//     // Store the prompt data for the edit page
//     const editData = {
//       id: prompt.id,
//       title: prompt.title,
//       description: prompt.description,
//       category: prompt.category,
//       tags: prompt.tags,
//       promptText: prompt.content,
//       instructions: "",
//       expectedOutput: "",
//       useCase: "",
//       isPrivate: prompt.isPrivate
//     }
    
//     // Store in sessionStorage so it persists across page navigation
//     sessionStorage.setItem("editPromptData", JSON.stringify(editData))
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading your prompts...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex-1 flex flex-col w-full h-full">
//       <div className="flex">
//         {/* Sidebar */}
//         <div className="w-48 bg-muted border-r border-border p-4 hidden md:block">
//           <div className="mb-6">
//           </div>

//           <h3 className="text-xs font-medium uppercase text-muted-foreground mb-2">Filters</h3>
//           <div className="space-y-1">
//             {filters.map((filter) => (
//               <Button
//                 key={filter.value}
//                 variant="ghost"
//                 className={`w-full justify-start text-sm h-8 px-2 ${
//                   selectedFilter === filter.value ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
//                 }`}
//                 onClick={() => setSelectedFilter(filter.value)}
//               >
//                 {filter.label}
//               </Button>
//             ))}
//           </div>

//           <h3 className="text-xs font-medium uppercase text-muted-foreground mt-6 mb-2">Categories</h3>
//           <div className="space-y-1">
//             {availableCategories.map((category) => (
//               <Button
//                 key={category}
//                 variant="ghost"
//                 className={`w-full justify-start text-sm h-8 px-2 ${
//                   selectedCategory === category ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
//                 }`}
//                 onClick={() => setSelectedCategory(category)}
//               >
//                 {category === "all" ? "All" : category}
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 p-6">
//           <div className="max-w-6xl mx-auto">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//               <div>
//                 <h1 className="text-2xl font-bold mb-2">My Prompts</h1>
//                 <p className="text-muted-foreground">Manage and organize your AI prompts</p>
//               </div>
//               <div className="flex items-center space-x-2 mt-4 md:mt-0">
//                 <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
//                   <Filter className="h-4 w-4 mr-2" />
//                   Filters
//                 </Button>
//                 <Link to="/submit">
//                   <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
//                     <Plus className="h-4 w-4 mr-2" />
//                     New Prompt
//                   </Button>
//                 </Link>
//               </div>
//             </div>
            
//             {/* Search Bar */}
//             <div className="mb-8">
//               <div className="relative">
//                 <Input
//                   placeholder="        Search for prompts..."
//                   className="bg-muted border-muted pl-10"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 {!searchQuery && (
//                   <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                     <Search className="h-4 w-4 text-muted-foreground" />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Favorite Prompts */}
//             {selectedFilter === "all" && selectedCategory === "all" && !searchQuery && favoritePrompts.length > 0 && (
//               <div className="mb-8">
//                 <div className="flex items-center mb-4">
//                   <Star className="h-5 w-5 mr-2 text-yellow-400" />
//                   <h2 className="text-lg font-medium">Favorite Prompts</h2>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                   {favoritePrompts.map((prompt) => (
//                     <Card key={prompt.id} className="p-4 hover:shadow-md transition-shadow">
//                       <div className="flex items-start justify-between mb-2">
//                         <h3 className="font-medium text-sm truncate flex-1">{prompt.title}</h3>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-6 w-6 ml-2"
//                           onClick={() => handleToggleFavorite(prompt.id)}
//                         >
//                           <Star className={`h-3 w-3 ${prompt.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
//                         </Button>
//                       </div>
//                       <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{prompt.description}</p>
//                       <div className="flex items-center justify-between text-xs text-muted-foreground">
//                         <span>{prompt.uses} uses</span>
//                         <span>{prompt.category}</span>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Results */}
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-medium">
//                 {searchQuery
//                   ? `Search Results for "${searchQuery}"`
//                   : selectedCategory !== "all"
//                     ? `${selectedCategory} Prompts`
//                     : selectedFilter !== "all"
//                       ? `${filters.find((f) => f.value === selectedFilter)?.label} Prompts`
//                       : "All Prompts"}
//               </h2>
//               <div className="text-sm text-muted-foreground">
//                 {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""} found
//               </div>
//             </div>

//             {/* Prompts Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
//               {currentPrompts.map((prompt) => (
//                 <Card key={prompt.id} className="p-4 hover:shadow-md transition-shadow">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex-1">
//                       <h3 className="font-medium mb-1">{prompt.title}</h3>
//                       <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{prompt.description}</p>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-6 w-6 ml-2"
//                       onClick={() => handleToggleFavorite(prompt.id)}
//                     >
//                       <Star className={`h-3 w-3 ${prompt.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
//                     </Button>
//                   </div>

//                   <div className="flex flex-wrap gap-1 mb-3">
//                     {prompt.tags.slice(0, 3).map((tag) => (
//                       <span key={tag} className="px-2 py-1 bg-muted text-xs rounded-md">
//                         {tag}
//                       </span>
//                     ))}
//                     {prompt.tags.length > 3 && (
//                       <span className="px-2 py-1 bg-muted text-xs rounded-md">+{prompt.tags.length - 3}</span>
//                     )}
//                   </div>

//                   <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
//                     <span>{prompt.category}</span>
//                     <span>{prompt.uses} uses</span>
//                     <div className="flex items-center">
//                       <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
//                       {prompt.rating}
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-1">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-6 w-6"
//                         onClick={() => handleCopyPrompt(prompt.content, prompt.id)}
//                         title="Copy prompt content"
//                       >
//                         {copiedId === prompt.id ? (
//                           <Check className="h-3 w-3 text-green-500" />
//                         ) : (
//                           <Copy className="h-3 w-3" />
//                         )}
//                       </Button>
//                       <Link to="/submit" onClick={() => handleEditPrompt(prompt)}>
//                         <Button variant="ghost" size="icon" className="h-6 w-6" title="Edit prompt">
//                           <Edit className="h-3 w-3" />
//                         </Button>
//                       </Link>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-6 w-6 text-red-500 hover:text-red-700"
//                         onClick={() => handleDeletePrompt(prompt.id)}
//                         title="Delete prompt"
//                       >
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       {prompt.isPrivate && (
//                         <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Private</span>
//                       )}
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>

//             {/* Empty State */}
//             {filteredPrompts.length === 0 && !loading && (
//               <div className="text-center py-12">
//                 <div className="text-muted-foreground mb-4">
//                   <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                   <h3 className="text-lg font-medium mb-2">
//                     {myPrompts.length === 0 ? "No prompts yet" : "No prompts found"}
//                   </h3>
//                   <p>
//                     {myPrompts.length === 0
//                       ? "Create your first prompt to get started"
//                       : "Try adjusting your search terms or filters"}
//                   </p>
//                 </div>
//                 {myPrompts.length === 0 ? (
//                   <Link to="/submit">
//                     <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
//                       <Plus className="h-4 w-4 mr-2" />
//                       Create Your First Prompt
//                     </Button>
//                   </Link>
//                 ) : (
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setSearchQuery("")
//                       setSelectedCategory("all")
//                       setSelectedFilter("all")
//                     }}
//                   >
//                     Clear Filters
//                   </Button>
//                 )}
//               </div>
//             )}

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center space-x-2 mt-8">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                 >
//                   Previous
//                 </Button>

//                 {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
//                   let pageNumber
//                   if (totalPages <= 5) {
//                     pageNumber = i + 1
//                   } else if (currentPage <= 3) {
//                     pageNumber = i + 1
//                   } else if (currentPage >= totalPages - 2) {
//                     pageNumber = totalPages - 4 + i
//                   } else {
//                     pageNumber = currentPage - 2 + i
//                   }

//                   return (
//                     <Button
//                       key={pageNumber}
//                       variant={currentPage === pageNumber ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setCurrentPage(pageNumber)}
//                       className={currentPage === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""}
//                     >
//                       {pageNumber}
//                     </Button>
//                   )
//                 })}

//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                   disabled={currentPage === totalPages}
//                 >
//                   Next
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


///////////////////////////////////////////////////////////////////////////////
// "use client"

// import { useEffect, useState } from "react"
// import { Button } from "../components/ui/Button"
// import { Card } from "../components/ui/Card"
// import { Input } from "../components/ui/Input"
// import { Star, User, Search, Filter, Plus, Edit, Trash2, Copy, Calendar, BarChart3, Check } from "lucide-react"
// import { Link } from "react-router-dom"

// interface MyPrompt {
//   id: string
//   title: string
//   description: string
//   content: string
//   category: string
//   tags: string[]
//   createdAt: string
//   updatedAt: string
//   rating: number
//   uses: number
//   featured: boolean
//   visibility: string // "public" | "private"
//   isPrivate: boolean
//   isFavorite: boolean
  
// }

// const PROMPTS_PER_PAGE = 12

// export default function MyPromptsPage() {
//   const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([])
//   const [filteredPrompts, setFilteredPrompts] = useState<MyPrompt[]>([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState("all")
//   const [selectedFilter, setSelectedFilter] = useState("all")
//   const [showFilters, setShowFilters] = useState(false)
//   const [availableCategories, setAvailableCategories] = useState<string[]>(["all"])
//   const [loading, setLoading] = useState(true)
//   const [copiedId, setCopiedId] = useState<string | null>(null)

//   // Mock data - replace with actual API call
//   useEffect(() => {
//     const fetchMyPrompts = async () => {
//       setLoading(true)
//       // Simulate API call
//       setTimeout(() => {
//         const mockPrompts: MyPrompt[] = [
//           {
//             id: "1",
//             title: "Creative Writing Assistant",
//             description: "A prompt to help generate creative story ideas and character development",
//             content: "You are a creative writing assistant. Help me develop compelling characters and engaging storylines. Please provide detailed character backgrounds, plot suggestions, and writing techniques that will make my stories more engaging and memorable.",
//             category: "Writing",
//             tags: ["creative", "storytelling", "characters"],
//             createdAt: "2024-01-15",
//             updatedAt: "2024-01-20",
//             uses: 45,
//             rating: 4.8,
//             featured: false,
//             visibility: "public",
//             isPrivate: false,
//             isFavorite: true,
//           },
//           {
//             id: "2",
//             title: "Code Review Helper",
//             description: "Prompt for conducting thorough code reviews and suggesting improvements",
//             content: "Please review the following code and provide feedback on code quality, performance, security, and best practices. Identify potential bugs, suggest optimizations, and recommend improvements for maintainability and readability.",
//             category: "Programming",
//             tags: ["code", "review", "development"],
//             createdAt: "2024-01-10",
//             updatedAt: "2024-01-18",
//             uses: 32,
//             rating: 4.5,
//             featured: false,
//             visibility: "private",
//             isPrivate: true,
//             isFavorite: false,
//           },
//           {
//             id: "3",
//             title: "Marketing Copy Generator",
//             description: "Generate compelling marketing copy for products and services",
//             content: "Create engaging marketing copy that converts visitors into customers. Focus on highlighting unique value propositions, addressing pain points, and including compelling calls-to-action. Make the copy persuasive yet authentic.",
//             category: "Marketing",
//             tags: ["marketing", "copywriting", "sales"],
//             createdAt: "2024-01-08",
//             updatedAt: "2024-01-16",
//             uses: 67,
//             rating: 4.9,
//             featured: false,
//             visibility: "public",
//             isPrivate: false,
//             isFavorite: true,
//           },
//           {
//             id: "4",
//             title: "Data Analysis Helper",
//             description: "Assist with data analysis and interpretation tasks",
//             content: "Help me analyze this dataset and provide insights. Look for patterns, trends, and anomalies. Present findings in a clear, actionable format with visualizations suggestions and statistical interpretations.",
//             category: "Analytics",
//             tags: ["data", "analysis", "insights"],
//             createdAt: "2024-01-05",
//             updatedAt: "2024-01-12",
//             uses: 28,
//             rating: 4.3,
//             featured: false,
//             visibility: "private",
//             isPrivate: true,
//             isFavorite: false,
//           },
//         ]

//         setMyPrompts(mockPrompts)
//         setFilteredPrompts(mockPrompts)

//         // Extract unique categories
//         const categories = ["all", ...new Set(mockPrompts.map((p) => p.category))]
//         setAvailableCategories(categories)

//         setLoading(false)
//       }, 1000)
//     }

//     fetchMyPrompts()
//   }, [])

//   useEffect(() => {
//     if (myPrompts.length === 0) return

//     const filtered = myPrompts.filter((prompt) => {
//       // Search filter
//       const matchesSearch = searchQuery
//         ? prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
//         : true

//       // Category filter
//       const matchesCategory = selectedCategory === "all" ? true : prompt.category === selectedCategory

//       // Additional filters
//       const oneWeekAgo = new Date()
//       oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
//       const isRecent = new Date(prompt.updatedAt) > oneWeekAgo

//       const matchesFilter =
//         selectedFilter === "all" ||
//         (selectedFilter === "favorites" && prompt.isFavorite) ||
//         (selectedFilter === "private" && prompt.isPrivate) ||
//         (selectedFilter === "public" && !prompt.isPrivate) ||
//         (selectedFilter === "recent" && isRecent) ||
//         (selectedFilter === "popular" && prompt.uses > 30)

//       return matchesSearch && matchesCategory && matchesFilter
//     })

//     setFilteredPrompts(filtered)
//     setCurrentPage(1)
//   }, [searchQuery, selectedCategory, selectedFilter, myPrompts])

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE)
//   const indexOfLastPrompt = currentPage * PROMPTS_PER_PAGE
//   const indexOfFirstPrompt = indexOfLastPrompt - PROMPTS_PER_PAGE
//   const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt)
//   const favoritePrompts = myPrompts.filter((prompt) => prompt.isFavorite).slice(0, 4)

//   const filters = [
//     { value: "all", label: "All" },
//     { value: "favorites", label: "Favorites" },
//     { value: "recent", label: "Recent" },
//     { value: "popular", label: "Popular" },
//     { value: "private", label: "Private" },
//     { value: "public", label: "Public" },
//   ]

//   const handleDeletePrompt = (id: string) => {
//     setMyPrompts((prev) => prev.filter((p) => p.id !== id))
//   }

//   const handleToggleFavorite = (id: string) => {
//     setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
//   }

//   const handleCopyPrompt = async (content: string, id: string) => {
//     try {
//       await navigator.clipboard.writeText(content)
//       setCopiedId(id)
//       setTimeout(() => setCopiedId(null), 2000)
//     } catch (err) {
//       console.error("Failed to copy prompt: ", err)
//       // Fallback for older browsers
//       const textArea = document.createElement("textarea")
//       textArea.value = content
//       document.body.appendChild(textArea)
//       textArea.focus()
//       textArea.select()
//       try {
//         document.execCommand('copy')
//         setCopiedId(id)
//         setTimeout(() => setCopiedId(null), 2000)
//       } catch (fallbackErr) {
//         console.error("Fallback copy failed: ", fallbackErr)
//       }
//       document.body.removeChild(textArea)
//     }
//   }

//   const handleEditPrompt = (prompt: MyPrompt) => {
//     // Store the prompt data for the edit page
//     const editData = {
//       id: prompt.id,
//       title: prompt.title,
//       description: prompt.description,
//       category: prompt.category,
//       tags: prompt.tags,
//       promptText: prompt.content,
//       instructions: "",
//       expectedOutput: "",
//       useCase: "",
//       isPrivate: prompt.isPrivate
//     }
    
//     // Store in sessionStorage so it persists across page navigation
//     sessionStorage.setItem("editPromptData", JSON.stringify(editData))
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading your prompts...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex-1 flex flex-col w-full h-full">
//       <div className="flex">
//         {/* Sidebar */}
//         <div className="w-48 bg-muted border-r border-border p-4 hidden md:block">
//           <div className="mb-6">
//           </div>

//           <h3 className="text-xs font-medium uppercase text-muted-foreground mb-2">Filters</h3>
//           <div className="space-y-1">
//             {filters.map((filter) => (
//               <Button
//                 key={filter.value}
//                 variant="ghost"
//                 className={`w-full justify-start text-sm h-8 px-2 ${
//                   selectedFilter === filter.value ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
//                 }`}
//                 onClick={() => setSelectedFilter(filter.value)}
//               >
//                 {filter.label}
//               </Button>
//             ))}
//           </div>

//           <h3 className="text-xs font-medium uppercase text-muted-foreground mt-6 mb-2">Categories</h3>
//           <div className="space-y-1">
//             {availableCategories.map((category) => (
//               <Button
//                 key={category}
//                 variant="ghost"
//                 className={`w-full justify-start text-sm h-8 px-2 ${
//                   selectedCategory === category ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
//                 }`}
//                 onClick={() => setSelectedCategory(category)}
//               >
//                 {category === "all" ? "All" : category}
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 p-6">
//           <div className="max-w-6xl mx-auto">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//               <div>
//                 <h1 className="text-2xl font-bold mb-2">My Prompts</h1>
//                 <p className="text-muted-foreground">Manage and organize your AI prompts</p>
//               </div>
//               <div className="flex items-center space-x-2 mt-4 md:mt-0">
//                 <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
//                   <Filter className="h-4 w-4 mr-2" />
//                   Filters
//                 </Button>
//                 <Link to="/submit">
//                   <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
//                     <Plus className="h-4 w-4 mr-2" />
//                     New Prompt
//                   </Button>
//                 </Link>
//               </div>
//             </div>
            
//             {/* Search Bar */}
//             <div className="mb-8">
//               <div className="relative">
//                 <Input
//                   placeholder="        Search for prompts..."
//                   className="bg-muted border-muted pl-10"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 {!searchQuery && (
//                   <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                     <Search className="h-4 w-4 text-muted-foreground" />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Favorite Prompts */}
//             {selectedFilter === "all" && selectedCategory === "all" && !searchQuery && favoritePrompts.length > 0 && (
//               <div className="mb-8">
//                 <div className="flex items-center mb-4">
//                   <Star className="h-5 w-5 mr-2 text-yellow-400" />
//                   <h2 className="text-lg font-medium">Favorite Prompts</h2>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                   {favoritePrompts.map((prompt) => (
//                     <Card key={prompt.id} className="p-4 hover:shadow-md transition-shadow">
//                       <div className="flex items-start justify-between mb-2">
//                         <h3 className="font-medium text-sm truncate flex-1">{prompt.title}</h3>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-6 w-6 ml-2"
//                           onClick={() => handleToggleFavorite(prompt.id)}
//                         >
//                           <Star className={`h-3 w-3 ${prompt.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
//                         </Button>
//                       </div>
//                       <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{prompt.description}</p>
//                       <div className="flex items-center justify-between text-xs text-muted-foreground">
//                         <span>{prompt.uses} uses</span>
//                         <span>{prompt.category}</span>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Results */}
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-medium">
//                 {searchQuery
//                   ? `Search Results for "${searchQuery}"`
//                   : selectedCategory !== "all"
//                     ? `${selectedCategory} Prompts`
//                     : selectedFilter !== "all"
//                       ? `${filters.find((f) => f.value === selectedFilter)?.label} Prompts`
//                       : "All Prompts"}
//               </h2>
//               <div className="text-sm text-muted-foreground">
//                 {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""} found
//               </div>
//             </div>

//             {/* Prompts Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
//               {currentPrompts.map((prompt) => (
//                 <Card key={prompt.id} className="p-4 hover:shadow-md transition-shadow">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex-1">
//                       <h3 className="font-medium mb-1">{prompt.title}</h3>
//                       <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{prompt.description}</p>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-6 w-6 ml-2"
//                       onClick={() => handleToggleFavorite(prompt.id)}
//                     >
//                       <Star className={`h-3 w-3 ${prompt.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
//                     </Button>
//                   </div>

//                   <div className="flex flex-wrap gap-1 mb-3">
//                     {prompt.tags.slice(0, 3).map((tag) => (
//                       <span key={tag} className="px-2 py-1 bg-muted text-xs rounded-md">
//                         {tag}
//                       </span>
//                     ))}
//                     {prompt.tags.length > 3 && (
//                       <span className="px-2 py-1 bg-muted text-xs rounded-md">+{prompt.tags.length - 3}</span>
//                     )}
//                   </div>

//                   <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
//                     <span>{prompt.category}</span>
//                     <span>{prompt.uses} uses</span>
//                     <div className="flex items-center">
//                       <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
//                       {prompt.rating}
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-1">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-6 w-6"
//                         onClick={() => handleCopyPrompt(prompt.content, prompt.id)}
//                         title="Copy prompt content"
//                       >
//                         {copiedId === prompt.id ? (
//                           <Check className="h-3 w-3 text-green-500" />
//                         ) : (
//                           <Copy className="h-3 w-3" />
//                         )}
//                       </Button>
//                       <Link to="/submit" onClick={() => handleEditPrompt(prompt)}>
//                         <Button variant="ghost" size="icon" className="h-6 w-6" title="Edit prompt">
//                           <Edit className="h-3 w-3" />
//                         </Button>
//                       </Link>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-6 w-6 text-red-500 hover:text-red-700"
//                         onClick={() => handleDeletePrompt(prompt.id)}
//                         title="Delete prompt"
//                       >
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       {prompt.isPrivate && (
//                         <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Private</span>
//                       )}
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>

//             {/* Empty State */}
//             {filteredPrompts.length === 0 && !loading && (
//               <div className="text-center py-12">
//                 <div className="text-muted-foreground mb-4">
//                   <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                   <h3 className="text-lg font-medium mb-2">
//                     {myPrompts.length === 0 ? "No prompts yet" : "No prompts found"}
//                   </h3>
//                   <p>
//                     {myPrompts.length === 0
//                       ? "Create your first prompt to get started"
//                       : "Try adjusting your search terms or filters"}
//                   </p>
//                 </div>
//                 {myPrompts.length === 0 ? (
//                   <Link to="/submit">
//                     <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
//                       <Plus className="h-4 w-4 mr-2" />
//                       Create Your First Prompt
//                     </Button>
//                   </Link>
//                 ) : (
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setSearchQuery("")
//                       setSelectedCategory("all")
//                       setSelectedFilter("all")
//                     }}
//                   >
//                     Clear Filters
//                   </Button>
//                 )}
//               </div>
//             )}

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center space-x-2 mt-8">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                 >
//                   Previous
//                 </Button>

//                 {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
//                   let pageNumber
//                   if (totalPages <= 5) {
//                     pageNumber = i + 1
//                   } else if (currentPage <= 3) {
//                     pageNumber = i + 1
//                   } else if (currentPage >= totalPages - 2) {
//                     pageNumber = totalPages - 4 + i
//                   } else {
//                     pageNumber = currentPage - 2 + i
//                   }

//                   return (
//                     <Button
//                       key={pageNumber}
//                       variant={currentPage === pageNumber ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setCurrentPage(pageNumber)}
//                       className={currentPage === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""}
//                     >
//                       {pageNumber}
//                     </Button>
//                   )
//                 })}

//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                   disabled={currentPage === totalPages}
//                 >
//                   Next
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

///////////////////////////////////////////////////////////////////////
//NOT DISPLAYING PROMPTS down

// "use client"

// import { useEffect, useState } from "react"
// import { Button } from "../components/ui/Button"
// import { Card } from "../components/ui/Card"
// import { Input } from "../components/ui/Input"
// import { Star, Search, Filter, Plus, Edit, Trash2, Copy, Check } from "lucide-react"
// import { Link } from "react-router-dom"

// interface MyPrompt {
//   id: string
//   title: string
//   description: string
//   content: string
//   category: string
//   tags: string[]
//   createdAt: string
//   updatedAt: string
//   rating: number
//   uses: number
//   featured: boolean
//   price: number
//   isPrivate: boolean
//   isFavorite: boolean
// }

// const PROMPTS_PER_PAGE = 12

// export default function MyPromptsPage() {
//   const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([])
//   const [filteredPrompts, setFilteredPrompts] = useState<MyPrompt[]>([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState("all")
//   const [selectedFilter, setSelectedFilter] = useState("all")
//   const [showFilters, setShowFilters] = useState(false)
//   const [availableCategories, setAvailableCategories] = useState<string[]>(["all"])
//   const [loading, setLoading] = useState(true)
//   const [copiedId, setCopiedId] = useState<string | null>(null)

//   // Fetch prompts from API
//   useEffect(() => {
//     const fetchMyPrompts = async () => {
//       setLoading(true)
//       const authorId = localStorage.getItem("userId")
//       if (!authorId) {
//         setMyPrompts([])
//         setFilteredPrompts([])
//         setLoading(false)
//         return
//       }
//       try {
//         const res = await fetch(`/prompts/author/${authorId}`)
//         if (!res.ok) throw new Error("Failed to fetch prompts")
//         const prompts: MyPrompt[] = await res.json()
//         setMyPrompts(prompts)
//         setFilteredPrompts(prompts)
//         const categories = ["all", ...new Set(prompts.map((p) => p.category))]
//         setAvailableCategories(categories)
//       } catch {
//         setMyPrompts([])
//         setFilteredPrompts([])
//       }
//       setLoading(false)
//     }
//     fetchMyPrompts()
//   }, [])

//   // Filtering logic
//   useEffect(() => {
//     if (myPrompts.length === 0) return

//     const filtered = myPrompts.filter((prompt) => {
//       // Search filter
//       const matchesSearch = searchQuery
//         ? prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
//         : true

//       // Category filter
//       const matchesCategory = selectedCategory === "all" ? true : prompt.category === selectedCategory

//       // Additional filters
//       const oneWeekAgo = new Date()
//       oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
//       const isRecent = new Date(prompt.updatedAt) > oneWeekAgo

//       const matchesFilter =
//         selectedFilter === "all" ||
//         (selectedFilter === "favorites" && prompt.isFavorite) ||
//         (selectedFilter === "private" && prompt.isPrivate) ||
//         (selectedFilter === "public" && !prompt.isPrivate) ||
//         (selectedFilter === "recent" && isRecent) ||
//         (selectedFilter === "popular" && prompt.uses > 30)

//       return matchesSearch && matchesCategory && matchesFilter
//     })

//     setFilteredPrompts(filtered)
//     setCurrentPage(1)
//   }, [searchQuery, selectedCategory, selectedFilter, myPrompts])

//   // Pagination
//   const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE)
//   const indexOfLastPrompt = currentPage * PROMPTS_PER_PAGE
//   const indexOfFirstPrompt = indexOfLastPrompt - PROMPTS_PER_PAGE
//   const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt)
//   const favoritePrompts = myPrompts.filter((prompt) => prompt.isFavorite).slice(0, 4)

//   const filters = [
//     { value: "all", label: "All" },
//     { value: "favorites", label: "Favorites" },
//     { value: "recent", label: "Recent" },
//     { value: "popular", label: "Popular" },
//     { value: "private", label: "Private" },
//     { value: "public", label: "Public" },
//   ]

//   const handleDeletePrompt = (id: string) => {
//     setMyPrompts((prev) => prev.filter((p) => p.id !== id))
//   }

//   const handleToggleFavorite = (id: string) => {
//     setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
//   }

//   const handleCopyPrompt = async (content: string, id: string) => {
//     try {
//       await navigator.clipboard.writeText(content)
//       setCopiedId(id)
//       setTimeout(() => setCopiedId(null), 2000)
//     } catch (err) {
//       setCopiedId(null)
//     }
//   }

//   const handleEditPrompt = (prompt: MyPrompt) => {
//     const editData = {
//       id: prompt.id,
//       title: prompt.title,
//       description: prompt.description,
//       category: prompt.category,
//       tags: prompt.tags,
//       promptText: prompt.content,
//       instructions: "",
//       expectedOutput: "",
//       useCase: "",
//       isPrivate: prompt.isPrivate
//     }
//     sessionStorage.setItem("editPromptData", JSON.stringify(editData))
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading your prompts...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex-1 flex flex-col w-full h-full">
//       <div className="flex">
//         {/* Sidebar */}
//         <div className="w-48 bg-muted border-r border-border p-4 hidden md:block">
//           <h3 className="text-xs font-medium uppercase text-muted-foreground mb-2">Filters</h3>
//           <div className="space-y-1">
//             {filters.map((filter) => (
//               <Button
//                 key={filter.value}
//                 variant="ghost"
//                 className={`w-full justify-start text-sm h-8 px-2 ${
//                   selectedFilter === filter.value ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
//                 }`}
//                 onClick={() => setSelectedFilter(filter.value)}
//               >
//                 {filter.label}
//               </Button>
//             ))}
//           </div>
//           <h3 className="text-xs font-medium uppercase text-muted-foreground mt-6 mb-2">Categories</h3>
//           <div className="space-y-1">
//             {availableCategories.map((category) => (
//               <Button
//                 key={category}
//                 variant="ghost"
//                 className={`w-full justify-start text-sm h-8 px-2 ${
//                   selectedCategory === category ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
//                 }`}
//                 onClick={() => setSelectedCategory(category)}
//               >
//                 {category === "all" ? "All" : category}
//               </Button>
//             ))}
//           </div>
//         </div>
//         {/* Main Content */}
//         <div className="flex-1 p-6">
//           <div className="max-w-6xl mx-auto">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//               <div>
//                 <h1 className="text-2xl font-bold mb-2">My Prompts</h1>
//                 <p className="text-muted-foreground">Manage and organize your AI prompts</p>
//               </div>
//               <div className="flex items-center space-x-2 mt-4 md:mt-0">
//                 <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
//                   <Filter className="h-4 w-4 mr-2" />
//                   Filters
//                 </Button>
//                 <Link to="/submit">
//                   <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
//                     <Plus className="h-4 w-4 mr-2" />
//                     New Prompt
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//             {/* Search Bar */}
//             <div className="mb-8">
//               <div className="relative">
//                 <Input
//                   placeholder="Search for prompts..."
//                   className="bg-muted border-muted pl-10"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 {!searchQuery && (
//                   <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                     <Search className="h-4 w-4 text-muted-foreground" />
//                   </div>
//                 )}
//               </div>
//             </div>
//             {/* Favorite Prompts */}
//             {selectedFilter === "all" && selectedCategory === "all" && !searchQuery && favoritePrompts.length > 0 && (
//               <div className="mb-8">
//                 <div className="flex items-center mb-4">
//                   <Star className="h-5 w-5 mr-2 text-yellow-400" />
//                   <h2 className="text-lg font-medium">Favorite Prompts</h2>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                   {favoritePrompts.map((prompt) => (
//                     <Card key={prompt.id} className="p-4 hover:shadow-md transition-shadow">
//                       <div className="flex items-start justify-between mb-2">
//                         <h3 className="font-medium text-sm truncate flex-1">{prompt.title}</h3>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-6 w-6 ml-2"
//                           onClick={() => handleToggleFavorite(prompt.id)}
//                         >
//                           <Star className={`h-3 w-3 ${prompt.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
//                         </Button>
//                       </div>
//                       <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{prompt.description}</p>
//                       <div className="flex items-center justify-between text-xs text-muted-foreground">
//                         <span>{prompt.uses} uses</span>
//                         <span>{prompt.category}</span>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {/* Results */}
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-medium">
//                 {searchQuery
//                   ? `Search Results for "${searchQuery}"`
//                   : selectedCategory !== "all"
//                     ? `${selectedCategory} Prompts`
//                     : selectedFilter !== "all"
//                       ? `${filters.find((f) => f.value === selectedFilter)?.label} Prompts`
//                       : "All Prompts"}
//               </h2>
//               <div className="text-sm text-muted-foreground">
//                 {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""} found
//               </div>
//             </div>
//             {/* Prompts Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
//               {currentPrompts.map((prompt) => (
//                 <Card key={prompt.id} className="p-4 hover:shadow-md transition-shadow">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex-1">
//                       <h3 className="font-medium mb-1">{prompt.title}</h3>
//                       <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{prompt.description}</p>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-6 w-6 ml-2"
//                       onClick={() => handleToggleFavorite(prompt.id)}
//                     >
//                       <Star className={`h-3 w-3 ${prompt.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
//                     </Button>
//                   </div>
//                   <div className="flex flex-wrap gap-1 mb-3">
//                     {prompt.tags.slice(0, 3).map((tag) => (
//                       <span key={tag} className="px-2 py-1 bg-muted text-xs rounded-md">
//                         {tag}
//                       </span>
//                     ))}
//                     {prompt.tags.length > 3 && (
//                       <span className="px-2 py-1 bg-muted text-xs rounded-md">+{prompt.tags.length - 3}</span>
//                     )}
//                   </div>
//                   <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
//                     <span>{prompt.category}</span>
//                     <span>{prompt.uses} uses</span>
//                     <div className="flex items-center">
//                       <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
//                       {prompt.rating}
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-1">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-6 w-6"
//                         onClick={() => handleCopyPrompt(prompt.content, prompt.id)}
//                         title="Copy prompt content"
//                       >
//                         {copiedId === prompt.id ? (
//                           <Check className="h-3 w-3 text-green-500" />
//                         ) : (
//                           <Copy className="h-3 w-3" />
//                         )}
//                       </Button>
//                       <Link to="/submit" onClick={() => handleEditPrompt(prompt)}>
//                         <Button variant="ghost" size="icon" className="h-6 w-6" title="Edit prompt">
//                           <Edit className="h-3 w-3" />
//                         </Button>
//                       </Link>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-6 w-6 text-red-500 hover:text-red-700"
//                         onClick={() => handleDeletePrompt(prompt.id)}
//                         title="Delete prompt"
//                       >
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       {prompt.isPrivate && (
//                         <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Private</span>
//                       )}
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//             {/* Empty State */}
//             {filteredPrompts.length === 0 && !loading && (
//               <div className="text-center py-12">
//                 <div className="text-muted-foreground mb-4">
//                   <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                   <h3 className="text-lg font-medium mb-2">
//                     {myPrompts.length === 0 ? "No prompts yet" : "No prompts found"}
//                   </h3>
//                   <p>
//                     {myPrompts.length === 0
//                       ? "Create your first prompt to get started"
//                       : "Try adjusting your search terms or filters"}
//                   </p>
//                 </div>
//                 {myPrompts.length === 0 ? (
//                   <Link to="/submit">
//                     <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
//                       <Plus className="h-4 w-4 mr-2" />
//                       Create Your First Prompt
//                     </Button>
//                   </Link>
//                 ) : (
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setSearchQuery("")
//                       setSelectedCategory("all")
//                       setSelectedFilter("all")
//                     }}
//                   >
//                     Clear Filters
//                   </Button>
//                 )}
//               </div>
//             )}
//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center space-x-2 mt-8">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                 >
//                   Previous
//                 </Button>
//                 {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
//                   let pageNumber
//                   if (totalPages <= 5) {
//                     pageNumber = i + 1
//                   } else if (currentPage <= 3) {
//                     pageNumber = i + 1
//                   } else if (currentPage >= totalPages - 2) {
//                     pageNumber = totalPages - 4 + i
//                   } else {
//                     pageNumber = currentPage - 2 + i
//                   }
//                   return (
//                     <Button
//                       key={pageNumber}
//                       variant={currentPage === pageNumber ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setCurrentPage(pageNumber)}
//                       className={currentPage === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""}
//                     >
//                       {pageNumber}
//                     </Button>
//                   )
//                 })}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                                     disabled={currentPage >= totalPages}
//                                   >
//                                     Next
//                                   </Button>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   }

/////////////////////////////////////////////////////////

"use client"

import { useEffect, useState } from "react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Star, Search, Filter, Plus, Edit, Trash2, Copy, Check } from "lucide-react"
import { Link } from "react-router-dom"
import { StandardPromptCard } from "../components/StandardPromptCard"

interface MyPrompt {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  rating: number
  uses: number
  featured: boolean
  price: number
  isPrivate: boolean
  isFavorite: boolean
}

const PROMPTS_PER_PAGE = 12

export default function MyPromptsPage() {
  const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<MyPrompt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>(["all"])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch prompts from API and map backend fields to frontend model
  useEffect(() => {
    const fetchMyPrompts = async () => {
      setLoading(true)
      const authorId = localStorage.getItem("userId")
      if (!authorId) {
        setMyPrompts([])
        setFilteredPrompts([])
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/prompts/author/${authorId}`)
        if (!res.ok) throw new Error("Failed to fetch prompts")
        
        let prompts = await res.json()
        if (!Array.isArray(prompts)) prompts = []
        
        // Map backend fields to frontend MyPrompt interface
        const mappedPrompts: MyPrompt[] = prompts.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          content: p.content || "",
          category: "General", // Default, backend does not provide
          tags: p.tagNames || [],
          createdAt: p.createdAt,
          updatedAt: p.publishedAt || p.createdAt,
          usageCount: 0,   // Default, backend does not provide
          rating: 0, // Default, backend does not provide
          isPrivate: p.visibility !== "public",
          isFavorite: false // Default, backend does not provide
        }))
        
        setMyPrompts(mappedPrompts)
        setFilteredPrompts(mappedPrompts)
        
        // Extract unique categories
        const categories = ["all", ...new Set(mappedPrompts.map((p) => p.category))]
        setAvailableCategories(categories)
      } catch (error) {
        console.error("Error fetching prompts:", error)
        setMyPrompts([])
        setFilteredPrompts([])
      }
      setLoading(false)
    }
    fetchMyPrompts()
  }, [])

  // Filtering logic
  useEffect(() => {
    if (myPrompts.length === 0) return

    const filtered = myPrompts.filter((prompt) => {
      // Search filter
      const matchesSearch = searchQuery
        ? prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true

      // Category filter
      const matchesCategory = selectedCategory === "all" ? true : prompt.category === selectedCategory

      // Additional filters
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const isRecent = new Date(prompt.updatedAt) > oneWeekAgo

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "favorites" && prompt.isFavorite) ||
        (selectedFilter === "private" && prompt.isPrivate) ||
        (selectedFilter === "public" && !prompt.isPrivate) ||
        (selectedFilter === "recent" && isRecent) ||
        (selectedFilter === "popular" && prompt.uses > 30)

      return matchesSearch && matchesCategory && matchesFilter
    })

    setFilteredPrompts(filtered)
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedFilter, myPrompts])

  // Pagination
  const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE)
  const indexOfLastPrompt = currentPage * PROMPTS_PER_PAGE
  const indexOfFirstPrompt = indexOfLastPrompt - PROMPTS_PER_PAGE
  const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt)
  const favoritePrompts = myPrompts.filter((prompt) => prompt.isFavorite).slice(0, 4)

  const filters = [
    { value: "all", label: "All" },
    { value: "favorites", label: "Favorites" },
    { value: "recent", label: "Recent" },
    { value: "popular", label: "Popular" },
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
  ]

  const handleDeletePrompt = async (id: string) => {
    try {
      const res = await fetch(`/prompts/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setMyPrompts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
    }
  }

  const handleToggleFavorite = (id: string) => {
    setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
  }

  const handleCopyPrompt = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      setCopiedId(null)
    }
  }

  const handleEditPrompt = (prompt: MyPrompt) => {
    const editData = {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      tags: prompt.tags,
      promptText: prompt.content,
      instructions: "",
      expectedOutput: "",
      useCase: "",
      isPrivate: prompt.isPrivate
    }
    sessionStorage.setItem("editPromptData", JSON.stringify(editData))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your prompts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-48 bg-muted border-r border-border p-4 hidden md:block">
          <h3 className="text-xs font-medium uppercase text-muted-foreground mb-2">Filters</h3>
          <div className="space-y-1">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant="ghost"
                className={`w-full justify-start text-sm h-8 px-2 ${
                  selectedFilter === filter.value ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                }`}
                onClick={() => setSelectedFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <h3 className="text-xs font-medium uppercase text-muted-foreground mt-6 mb-2">Categories</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {availableCategories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                className={`w-full justify-start text-sm h-8 px-2 ${
                  selectedCategory === category ? "bg-[#3ebb9e]/10 text-[#3ebb9e]" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="truncate">
                  {category === "all" ? "All" : category}
                </span>
              </Button>
            ))}
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">My Prompts</h1>
                  <p className="text-muted-foreground">Manage and organize your AI prompts</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Link to="/submit">
                    <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      New Prompt
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Input
                    placeholder="        Search for prompts..."
                    className="bg-muted border-muted pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {!searchQuery && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Favorite Prompts */}
              {selectedFilter === "all" && selectedCategory === "all" && !searchQuery && favoritePrompts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    <h2 className="text-lg font-medium">Favorite Prompts</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {favoritePrompts.map((prompt) => (
                      <StandardPromptCard
                        key={prompt.id}
                        id={prompt.id}
                        title={prompt.title}
                        description={prompt.description}
                        rating={prompt.rating}
                        usageCount={prompt.usageCount}
                        featured={false}
                        isPrivate={prompt.isPrivate}
                        isFavorite={prompt.isFavorite}
                        tags={prompt.tags}
                        category={prompt.category}
                        isOwned={true}
                        onEdit={handleEditPrompt}
                        onDelete={handleDeletePrompt}
                        onToggleFavorite={handleToggleFavorite}
                        onCopy={handleCopyPrompt}
                        copiedId={copiedId}
                        content={prompt.content}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : selectedCategory !== "all"
                      ? `${selectedCategory} Prompts`
                      : selectedFilter !== "all"
                        ? `${filters.find((f) => f.value === selectedFilter)?.label} Prompts`
                        : "All Prompts"}
                </h2>
                <div className="text-sm text-muted-foreground">
                  {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""} found
                </div>
              </div>

              {/* Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {currentPrompts.map((prompt) => (
                  <StandardPromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    description={prompt.description}
                    rating={prompt.rating}
                    usageCount={prompt.usageCount}
                    featured={false}
                    isPrivate={prompt.isPrivate}
                    isFavorite={prompt.isFavorite}
                    tags={prompt.tags}
                    category={prompt.category}
                    isOwned={true}
                    onEdit={handleEditPrompt}
                    onDelete={handleDeletePrompt}
                    onToggleFavorite={handleToggleFavorite}
                    onCopy={handleCopyPrompt}
                    copiedId={copiedId}
                    content={prompt.content}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredPrompts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      {myPrompts.length === 0 ? "No prompts yet" : "No prompts found"}
                    </h3>
                    <p>
                      {myPrompts.length === 0
                        ? "Create your first prompt to get started"
                        : "Try adjusting your search terms or filters"}
                    </p>
                  </div>
                  {myPrompts.length === 0 ? (
                    <Link to="/submit">
                      <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Prompt
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("all")
                        setSelectedFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={currentPage === pageNumber ? "bg-[#3ebb9e] hover:bg-[#00674f]" : ""}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
