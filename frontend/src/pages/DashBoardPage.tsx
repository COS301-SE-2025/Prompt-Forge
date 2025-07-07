// import { DashboardCard } from '@/components/DashboardCard';
// import { RecentActivity } from '../components/RecentActivity';
// import { TopPrompt } from '../components/TopPrompt';
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../components/ui/Button";
// import { Card } from "../components/ui/Card";
// import { ArrowRight, Star, User, TrendingUp, Activity, Rocket } from "lucide-react";
// import { Link } from 'react-router-dom';
// import { StandardPromptCard } from "../components/StandardPromptCard";

// // Types matching your backend JSON
// type MyPrompt = {
//   id: string;
//   title: string;
//   description: string;
//   content: string;
//   category: string;
//   tags: string[];
//   createdAt: string;
//   updatedAt: string;
//   rating: number;
//   uses: number;
//   featured: boolean;
//   price: number;
//   isPrivate: boolean;
//   isFavorite: boolean;
// };

// type TopPromptType = {
//   id: string;
//   authorId: string;
//   featured: boolean;
//   title: string;
//   slug: string;
//   content: string;
//   description: string;
//   price: number;
//   visibility: string;
//   createdAt: string;
//   publishedAt: string;
//   tagIds: string[];
// };

// type DashboardData = {
//   monthlyUsage: number;
//   totalDownloads: number;
//   averageRating: number;
//   totalPrompts: number;
//   topPrompts: TopPromptType[];
// };

// type UserProfile = {
//   id: string;
//   username: string;
//   email: string;
//   profilePicture?: string;
//   bio?: string;
//   followers: number;
//   following: number;
// };

// export default function DashboardPage() {
//   const navigate = useNavigate();
  
//   // Authentication state
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [authLoading, setAuthLoading] = useState<boolean>(true);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   // Profile states
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [profileImage, setProfileImage] = useState<string>("/placeholder.svg?height=80&width=80");
//   const [userBio, setUserBio] = useState<string>("AI prompt engineer specializing in creative writing and technical documentation.");
//   const [username, setUsername] = useState<string>("theo_unknown");
//   const [followers, setFollowers] = useState<number>(0);
//   const [following, setFollowing] = useState<number>(0);

//   // Prompts data states
//   const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([]);
//   const [loadingPrompts, setLoadingPrompts] = useState(true);
//   const [copiedId, setCopiedId] = useState<string | null>(null);

//   // Dashboard data states
//   const [dashboard, setDashboard] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Check authentication status on component mount
//   useEffect(() => {
//     const checkAuth = () => {
//       const username = localStorage.getItem('username');
      
//       console.log("🔍 Dashboard auth check:");
//       console.log("  - username:", username);
      
//       // ✅ Simplified check - only require username for now
//       if (username && username !== 'Guest') {
//         setIsAuthenticated(true);
//         console.log("✅ User is authenticated with username:", username);
//       } else {
//         console.log("❌ User not authenticated, redirecting to login");
//         setIsAuthenticated(false);
//         navigate('/login');
//       }
//       setAuthLoading(false);
//     };

//     checkAuth();

//     // Listen for storage changes
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'username') {
//         checkAuth();
//       }
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, [navigate]);

//   // Fetch user profile
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (!isAuthenticated || !currentUserId) return;

//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`/api/users/${currentUserId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           const profile: UserProfile = await response.json();
//           setUserProfile(profile);
//           setUsername(profile.username);
//           setUserBio(profile.bio || "AI prompt engineer specializing in creative writing and technical documentation.");
//           setProfileImage(profile.profilePicture || "/placeholder.svg?height=80&width=80");
//           setFollowers(profile.followers);
//           setFollowing(profile.following);

//           // Update localStorage for consistency
//           localStorage.setItem('username', profile.username);
//           if (profile.bio) localStorage.setItem('userBio', profile.bio);
//           if (profile.profilePicture) localStorage.setItem('userProfileImage', profile.profilePicture);
//         } else if (response.status === 401) {
//           // Token expired or invalid
//           localStorage.removeItem('token');
//           localStorage.removeItem('userId');
//           setIsAuthenticated(false);
//           navigate('/login');
//         }
//       } catch (error) {
//         console.error("Failed to fetch user profile:", error);
//       }
//     };

//     fetchUserProfile();
//   }, [isAuthenticated, currentUserId, navigate]);

//   // Fetch user's prompts
//   useEffect(() => {
//     const fetchMyPrompts = async () => {
//       if (!isAuthenticated) {
//         setLoadingPrompts(false);
//         return;
//       }

//       setLoadingPrompts(true);
//       try {
//         // ✅ Get userId from localStorage (set during login)
//         const userId = localStorage.getItem('userId');
//         if (!userId) {
//           console.log("⚠️ No userId found in localStorage");
//           setMyPrompts([]);
//           setLoadingPrompts(false);
//           return;
//         }

//         console.log("🔍 Fetching prompts for userId:", userId);

//         // ✅ Use cookie-based auth (same as dashboard)
//         const response = await fetch(`http://localhost:8080/prompts/author/${userId}`, {
//           method: 'GET',
//           credentials: 'include', // ✅ Use cookies instead of Authorization header
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           let prompts = await response.json();
//           if (!Array.isArray(prompts)) prompts = [];
          
//           console.log(`✅ Fetched ${prompts.length} prompts for user`);

//           // Map backend fields to frontend MyPrompt interface
//           const mappedPrompts: MyPrompt[] = prompts.map((p: any) => ({
//             id: p.id,
//             title: p.title,
//             description: p.description || "",
//             content: p.content || "",
//             category: p.category || "General",
//             tags: p.tagNames || [],
//             createdAt: p.createdAt,
//             updatedAt: p.publishedAt || p.createdAt,
//             rating: p.rating || 0,
//             uses: p.uses || 0,
//             featured: p.featured || false,
//             price: p.price || 0,
//             isPrivate: p.visibility !== "public",
//             isFavorite: p.isFavorite || false
//           }));
          
//           setMyPrompts(mappedPrompts);
//         } else if (response.status === 401) {
//           console.log("❌ Unauthorized, redirecting to login");
//           localStorage.removeItem('username');
//           localStorage.removeItem('userId');
//           setIsAuthenticated(false);
//           navigate('/login');
//         } else {
//           console.error("Failed to fetch prompts:", response.status);
//           setMyPrompts([]);
//         }
//       } catch (error) {
//         console.error("Failed to fetch prompts:", error);
//         setMyPrompts([]);
//       }
//       setLoadingPrompts(false);
//     };

//     fetchMyPrompts();
//   }, [isAuthenticated, navigate]); // Remove currentUserId dependency since we're using localStorage

//   // Fetch dashboard data
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       if (!isAuthenticated) {
//         // Don't set loading to false here - let the auth check handle it
//         return;
//       }

//       setLoading(true); // ✅ Ensure loading is true when starting fetch
//       setError(null);   // ✅ Clear any previous errors

//       try {
//         console.log("🔍 Fetching dashboard data...");
        
//         const response = await fetch("http://localhost:8080/api/dashboard", {
//           method: 'GET',
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           const data = await response.json();
//           setDashboard(data);
//           console.log("✅ Dashboard data loaded:", data);
//         } else if (response.status === 401) {
//           console.log("❌ Unauthorized, redirecting to login");
//           localStorage.removeItem('username');
//           localStorage.removeItem('userId');
//           setIsAuthenticated(false);
//           navigate('/login');
//           return; // Don't set loading to false, let redirect handle it
//         } else {
//           throw new Error(`Failed to fetch dashboard data: ${response.status}`);
//         }
//       } catch (err) {
//         console.error("❌ Dashboard fetch error:", err);
//         setError(err instanceof Error ? err.message : "Failed to load dashboard");
//       } finally {
//         setLoading(false); // ✅ Always set loading to false when done
//       }
//     };

//     // Only fetch when authenticated
//     if (isAuthenticated) {
//       fetchDashboardData();
//     }
//   }, [isAuthenticated, navigate]);

//   // Load profile info from localStorage and listen for changes
//   useEffect(() => {
//     const savedImage = localStorage.getItem('userProfileImage');
//     if (savedImage) setProfileImage(savedImage);

//     const savedBio = localStorage.getItem('userBio');
//     if (savedBio) setUserBio(savedBio);

//     const savedUsername = localStorage.getItem('username');
//     if (savedUsername) setUsername(savedUsername);

//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'userProfileImage') setProfileImage(e.newValue || "/placeholder.svg?height=80&width=80");
//       if (e.key === 'userBio') setUserBio(e.newValue || "");
//       if (e.key === 'username') setUsername(e.newValue || "theo_unknown");
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Handlers for StandardPromptCard
//   const handleDeletePrompt = async (id: string) => {
//     try {
//       // ✅ Use cookie-based auth
//       const response = await fetch(`http://localhost:8080/prompts/${id}`, {
//         method: 'DELETE',
//         credentials: 'include', // ✅ Use cookies
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setMyPrompts((prev) => prev.filter((p) => p.id !== id));
//         console.log("✅ Prompt deleted successfully");
//       } else {
//         console.error("Failed to delete prompt:", response.status);
//       }
//     } catch (error) {
//       console.error("Error deleting prompt:", error);
//     }
//   };

//   const handleToggleFavorite = async (id: string) => {
//     try {
//       // ✅ Use cookie-based auth
//       const response = await fetch(`http://localhost:8080/prompts/${id}/favorite`, {
//         method: 'POST',
//         credentials: 'include', // ✅ Use cookies
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
//         console.log("✅ Favorite toggled");
//       }
//     } catch (error) {
//       console.error("Error toggling favorite:", error);
//       // Still update UI optimistically
//       setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
//     }
//   };

//   const handleCopyPrompt = async (content: string, id: string) => {
//     try {
//       await navigator.clipboard.writeText(content);
//       setCopiedId(id);
//       setTimeout(() => setCopiedId(null), 2000);
//     } catch (err) {
//       setCopiedId(null);
//     }
//   };

//   const handleEditPrompt = (prompt: MyPrompt) => {
//     const editData = {
//       id: prompt.id,
//       title: prompt.title,
//       description: prompt.description,
//       category: prompt.category,
//       promptText: prompt.content,
//       expectedOutput: "",
//       isPrivate: prompt.isPrivate
//     };
//     sessionStorage.setItem("editPromptData", JSON.stringify(editData));
//     navigate("/submit");
//   };

//   // Show loading state while checking authentication
//   if (authLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // Redirect will happen in useEffect if not authenticated
//   if (!isAuthenticated) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Redirecting to login...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while fetching dashboard data
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }
  
//   // Show error state
//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="text-red-500 mb-4">
//             <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
//           <p className="text-muted-foreground mb-4">{error}</p>
//           <Button 
//             onClick={() => window.location.reload()} 
//             className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
//           >
//             Try Again
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Show fallback if no dashboard data (shouldn't happen now)
//   if (!dashboard) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="text-muted-foreground mb-4">
//             <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium mb-2">No Dashboard Data</h3>
//           <p className="text-muted-foreground mb-4">Unable to load dashboard information</p>
//           <Button 
//             onClick={() => window.location.reload()} 
//             className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
//           >
//             Refresh Page
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Get first few prompts for dashboard display
//   const displayPrompts = myPrompts.slice(0, 4);

//   return (
//     <div className="flex-1 flex flex-col w-full h-full">
//       <div className="flex flex-col md:flex-row flex-1">
//         {/* Sidebar */}
//         <div className="w-full md:w-64 bg-card border-r border-border p-6">
//           <div className="flex flex-col items-center text-center mb-6">
//             <div className="relative mb-2">
//               <img
//                 src={profileImage}
//                 alt="Profile"
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//               <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-card"></div>
//             </div>
//             <h3 className="font-medium">{username}</h3>
//             <div className="grid grid-cols-3 gap-4 w-full mt-4">
//               <div className="text-center">
//                 <div className="font-semibold">{myPrompts.length}</div>
//                 <div className="text-xs text-muted-foreground">Prompts</div>
//               </div>
//               <div className="text-center">
//                 <div className="font-semibold">{followers}</div>
//                 <div className="text-xs text-muted-foreground">Followers</div>
//               </div>
//               <div className="text-center">
//                 <div className="font-semibold">{following}</div>
//                 <div className="text-xs text-muted-foreground">Following</div>
//               </div>
//             </div>
//             <div className="w-full mt-6">
//               <div className="flex items-center justify-between mb-1">
//                 <div className="font-medium">Badges</div>
//               </div>
//             </div>
//           </div>
//           <div className="space-y-4">
//             <p className="font-medium">Bio</p>
//             <p className="mt-0 max-h-[340px] overflow-auto text-muted-foreground">
//               {userBio}
//             </p>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 p-6">
//           <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//               <Card className="p-4">
//                 <DashboardCard heading='Total Prompts' headingIcon={<Rocket size={20} color="#60A5FA" />} value={dashboard.totalPrompts} change="gain" changeValue={12.5} />
//               </Card>
//               <Card className="p-4">
//                 <DashboardCard heading='Total Users' headingIcon={<User size={20} color="#60A5FA" />} value={dashboard.totalDownloads} change="none" changeValue={12.5} />
//               </Card>
//               <Card className="p-4">
//                 <DashboardCard heading='Average Rating' headingIcon={<Star size={20} color="#60A5FA" />} value={dashboard.averageRating} change="loss" changeValue={12.5} />
//               </Card>
//               <Card className="p-4">
//                 <DashboardCard heading='Monthly Usage' headingIcon={<TrendingUp size={20} color="#60A5FA" />} value={dashboard.monthlyUsage} change="gain" changeValue={12.5}/>
//               </Card>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//               <Card className="p-4">
//                 <div className="mb-2 flex justify-between items-center w-full">
//                   <p className="text-sm h-fit font-semibold">Top Performing Prompts</p>
//                   <div className="p-1 w-fit">
//                     <TrendingUp size={24} color="#60A5FA" />
//                   </div>
//                 </div>
//                 <div className="items-center text-xs">
//                   {dashboard.topPrompts.map(tp => (
//                     <TopPrompt
//                       key={tp.id}
//                       heading={tp.title}
//                       rating={dashboard.averageRating}
//                       usesCount={dashboard.monthlyUsage}
//                       promptId={tp.id}
//                     />
//                   ))}
//                 </div>
//               </Card>
//               <Card className="p-4">
//                 <div className="mb-2 flex justify-between items-center w-full">
//                   <p className="text-sm h-fit font-semibold">Recent Activity</p>
//                   <div className="p-1 w-fit">
//                     <Activity size={24} color="#60A5FA" />
//                   </div>
//                 </div>
//                 <div className="items-center text-xs">
//                   <RecentActivity username='Boityyyyy' activity='followed you' time='1.5h' />
//                   <RecentActivity username='Riri_ww' activity='followed you' time='1.5h' />
//                   <RecentActivity username='NavD' activity='rated your prompt' time='5h' />
//                   <RecentActivity username='MK' activity='rated your prompt' time='1 days'/>
//                 </div>
//               </Card>
//             </div>
//           </div>

//           <div>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-medium">My Prompts</h2>
//               <Link to="/my-prompts">
//                 <Button variant="outline" size="sm" className="flex items-center">
//                   View All
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               {loadingPrompts ? (
//                 <div className="flex justify-center items-center h-32 col-span-full">
//                   <div className="text-center">
//                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3ebb9e] mx-auto mb-2"></div>
//                     <p className="text-sm text-muted-foreground">Loading prompts...</p>
//                   </div>
//                 </div>
//               ) : myPrompts.length === 0 ? (
//                 <div className="col-span-full text-center py-8">
//                   <p className="text-muted-foreground mb-4">No prompts found.</p>
//                   <Link to="/submit">
//                     <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
//                       Create Your First Prompt
//                     </Button>
//                   </Link>
//                 </div>
//               ) : (
//                 displayPrompts.map((prompt) => (
//                   <StandardPromptCard
//                     key={prompt.id}
//                     id={prompt.id}
//                     title={prompt.title}
//                     description={prompt.description}
//                     rating={prompt.rating}
//                     uses={prompt.uses}
//                     price={prompt.price}
//                     featured={prompt.featured}
//                     isPrivate={prompt.isPrivate}
//                     isFavorite={prompt.isFavorite}
//                     tags={prompt.tags}
//                     category={prompt.category}
//                     authorName={username}
//                     isOwned={true}
//                     onEdit={handleEditPrompt}
//                     onDelete={handleDeletePrompt}
//                     onToggleFavorite={handleToggleFavorite}
//                     onCopy={handleCopyPrompt}
//                     copiedId={copiedId}
//                     content={prompt.content}
//                   />
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

///////////////////////////////////////////////////////////////////////////////////

// import { DashboardCard } from '@/components/DashboardCard';
// import { RecentActivity } from '../components/RecentActivity';
// import { TopPrompt } from '../components/TopPrompt';
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../components/ui/Button";
// import { Card } from "../components/ui/Card";
// import { ArrowRight, Star, User, TrendingUp, Activity, Rocket } from "lucide-react";
// import { Link } from 'react-router-dom';
// import { StandardPromptCard } from "../components/StandardPromptCard";

// // Types matching your backend JSON
// type MyPrompt = {
//   id: string;
//   title: string;
//   description: string;
//   content: string;
//   category: string;
//   tags: string[];
//   createdAt: string;
//   updatedAt: string;
//   rating: number;
//   uses: number;
//   featured: boolean;
//   price: number;
//   isPrivate: boolean;
//   isFavorite: boolean;
// };

// type TopPromptType = {
//   id: string;
//   authorId: string;
//   featured: boolean;
//   title: string;
//   slug: string;
//   content: string;
//   description: string;
//   price: number;
//   visibility: string;
//   createdAt: string;
//   publishedAt: string;
//   tagIds: string[];
// };

// type DashboardData = {
//   monthlyUsage: number;
//   totalDownloads: number;
//   averageRating: number;
//   totalPrompts: number;
//   topPrompts: TopPromptType[];
// };

// type UserProfile = {
//   id: string;
//   username: string;
//   email: string;
//   profilePicture?: string;
//   bio?: string;
//   followers: number;
//   following: number;
// };

// type TopRankingPrompt = {
//   promptId: string;
//   title: string;
//   avgRating: number;
// };

// export default function DashboardPage() {
//   const navigate = useNavigate();

//   // Authentication state
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [authLoading, setAuthLoading] = useState<boolean>(true);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   // Profile states
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [profileImage, setProfileImage] = useState<string>("/placeholder.svg?height=80&width=80");
//   const [userBio, setUserBio] = useState<string>("AI prompt engineer specializing in creative writing and technical documentation.");
//   const [username, setUsername] = useState<string>("theo_unknown");
//   const [followers, setFollowers] = useState<number>(0);
//   const [following, setFollowing] = useState<number>(0);

//   // Prompts data states
//   const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([]);
//   const [loadingPrompts, setLoadingPrompts] = useState(true);
//   const [copiedId, setCopiedId] = useState<string | null>(null);

//   // Dashboard data states
//   const [dashboard, setDashboard] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Top rankings from analytics endpoint
//   const [topRankings, setTopRankings] = useState<TopRankingPrompt[]>([]);
//   const [loadingTopRankings, setLoadingTopRankings] = useState(true);

//   // Ratings for my prompts
//   const [avgRatingMap, setAvgRatingMap] = useState<Record<string, number>>({});

//   // Check authentication status on component mount
//   useEffect(() => {
//     const checkAuth = () => {
//       const username = localStorage.getItem('username');
//       const userId = localStorage.getItem('userId');
//       if (username && username !== 'Guest' && userId) {
//         setIsAuthenticated(true);
//         setCurrentUserId(userId);
//       } else {
//         setIsAuthenticated(false);
//         navigate('/login');
//       }
//       setAuthLoading(false);
//     };

//     checkAuth();

//     // Listen for storage changes
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'username' || e.key === 'userId') {
//         checkAuth();
//       }
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, [navigate]);

//   // Fetch user profile
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (!isAuthenticated || !currentUserId) return;

//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`/api/users/${currentUserId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           const profile: UserProfile = await response.json();
//           setUserProfile(profile);
//           setUsername(profile.username);
//           setUserBio(profile.bio || "AI prompt engineer specializing in creative writing and technical documentation.");
//           setProfileImage(profile.profilePicture || "/placeholder.svg?height=80&width=80");
//           setFollowers(profile.followers);
//           setFollowing(profile.following);

//           // Update localStorage for consistency
//           localStorage.setItem('username', profile.username);
//           if (profile.bio) localStorage.setItem('userBio', profile.bio);
//           if (profile.profilePicture) localStorage.setItem('userProfileImage', profile.profilePicture);
//         } else if (response.status === 401) {
//           localStorage.removeItem('token');
//           localStorage.removeItem('userId');
//           setIsAuthenticated(false);
//           navigate('/login');
//         }
//       } catch (error) {
//         // ignore
//       }
//     };

//     fetchUserProfile();
//   }, [isAuthenticated, currentUserId, navigate]);

//   // Fetch user's prompts
//   useEffect(() => {
//     const fetchMyPrompts = async () => {
//       if (!isAuthenticated) {
//         setLoadingPrompts(false);
//         return;
//       }

//       setLoadingPrompts(true);
//       try {
//         const userId = localStorage.getItem('userId');
//         if (!userId) {
//           setMyPrompts([]);
//           setLoadingPrompts(false);
//           return;
//         }

//         const response = await fetch(`http://localhost:8080/prompts/author/${userId}`, {
//           method: 'GET',
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           let prompts = await response.json();
//           if (!Array.isArray(prompts)) prompts = [];

//           const mappedPrompts: MyPrompt[] = prompts.map((p: any) => ({
//             id: p.id,
//             title: p.title,
//             description: p.description || "",
//             content: p.content || "",
//             category: p.category || "General",
//             tags: p.tagNames || [],
//             createdAt: p.createdAt,
//             updatedAt: p.publishedAt || p.createdAt,
//             rating: 0, // will be replaced by avgRatingMap
//             uses: p.uses || 0,
//             featured: p.featured || false,
//             price: p.price || 0,
//             isPrivate: p.visibility !== "public",
//             isFavorite: p.isFavorite || false
//           }));

//           setMyPrompts(mappedPrompts);
//         } else if (response.status === 401) {
//           localStorage.removeItem('username');
//           localStorage.removeItem('userId');
//           setIsAuthenticated(false);
//           navigate('/login');
//         } else {
//           setMyPrompts([]);
//         }
//       } catch (error) {
//         setMyPrompts([]);
//       }
//       setLoadingPrompts(false);
//     };

//     fetchMyPrompts();
//   }, [isAuthenticated, navigate]);

//   // Fetch dashboard data
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       if (!isAuthenticated) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const response = await fetch("http://localhost:8080/api/dashboard", {
//           method: 'GET',
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           const data = await response.json();
//           setDashboard(data);
//         } else if (response.status === 401) {
//           localStorage.removeItem('username');
//           localStorage.removeItem('userId');
//           setIsAuthenticated(false);
//           navigate('/login');
//           return;
//         } else {
//           throw new Error(`Failed to fetch dashboard data: ${response.status}`);
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to load dashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isAuthenticated) {
//       fetchDashboardData();
//     }
//   }, [isAuthenticated, navigate]);

//   // Fetch top rankings from analytics endpoint
//   useEffect(() => {
//     const fetchTopRankings = async () => {
//       setLoadingTopRankings(true);
//       try {
//         const response = await fetch("http://localhost:8080/api/analytics/top-ranking", {
//           method: "GET",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           setTopRankings(data);
//         } else {
//           setTopRankings([]);
//         }
//       } catch {
//         setTopRankings([]);
//       }
//       setLoadingTopRankings(false);
//     };
//     fetchTopRankings();
//   }, []);

//   // Fetch avgRating for each prompt using the reviews endpoint (like PromptService)
//   useEffect(() => {
//     const fetchRatings = async () => {
//       if (!myPrompts.length) return;
//       const newMap: Record<string, number> = {};

//       await Promise.all(
//         myPrompts.map(async (prompt) => {
//           try {
//             const response = await fetch(`http://localhost:8080/store/prompts/${prompt.id}/reviews`, {
//               method: 'GET',
//               credentials: 'include',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//             });
//             if (response.ok) {
//               const data = await response.json();
//               const reviews = data?.content || [];
//               const avg =
//                 reviews.length > 0
//                   ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
//                   : 0;
//               newMap[prompt.id] = avg;
//             } else {
//               newMap[prompt.id] = 0;
//             }
//           } catch {
//             newMap[prompt.id] = 0;
//           }
//         })
//       );
//       setAvgRatingMap(newMap);
//     };

//     fetchRatings();
//   }, [myPrompts]);

//   // Load profile info from localStorage and listen for changes
//   useEffect(() => {
//     const savedImage = localStorage.getItem('userProfileImage');
//     if (savedImage) setProfileImage(savedImage);

//     const savedBio = localStorage.getItem('userBio');
//     if (savedBio) setUserBio(savedBio);

//     const savedUsername = localStorage.getItem('username');
//     if (savedUsername) setUsername(savedUsername);

//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'userProfileImage') setProfileImage(e.newValue || "/placeholder.svg?height=80&width=80");
//       if (e.key === 'userBio') setUserBio(e.newValue || "");
//       if (e.key === 'username') setUsername(e.newValue || "theo_unknown");
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Handlers for StandardPromptCard
//   const handleDeletePrompt = async (id: string) => {
//     try {
//       const response = await fetch(`http://localhost:8080/prompts/${id}`, {
//         method: 'DELETE',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setMyPrompts((prev) => prev.filter((p) => p.id !== id));
//       }
//     } catch (error) {}
//   };

//   const handleToggleFavorite = async (id: string) => {
//     try {
//       const response = await fetch(`http://localhost:8080/prompts/${id}/favorite`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
//       }
//     } catch (error) {
//       setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
//     }
//   };

//   const handleCopyPrompt = async (content: string, id: string) => {
//     try {
//       await navigator.clipboard.writeText(content);
//       setCopiedId(id);
//       setTimeout(() => setCopiedId(null), 2000);
//     } catch (err) {
//       setCopiedId(null);
//     }
//   };

//   const handleEditPrompt = (prompt: MyPrompt) => {
//     const editData = {
//       id: prompt.id,
//       title: prompt.title,
//       description: prompt.description,
//       category: prompt.category,
//       promptText: prompt.content,
//       expectedOutput: "",
//       isPrivate: prompt.isPrivate
//     };
//     sessionStorage.setItem("editPromptData", JSON.stringify(editData));
//     navigate("/submit");
//   };

//   // Show loading state while checking authentication
//   if (authLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // Redirect will happen in useEffect if not authenticated
//   if (!isAuthenticated) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Redirecting to login...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while fetching dashboard data
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="text-red-500 mb-4">
//             <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
//           <p className="text-muted-foreground mb-4">{error}</p>
//           <Button 
//             onClick={() => window.location.reload()} 
//             className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
//           >
//             Try Again
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Show fallback if no dashboard data
//   if (!dashboard) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="text-muted-foreground mb-4">
//             <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium mb-2">No Dashboard Data</h3>
//           <p className="text-muted-foreground mb-4">Unable to load dashboard information</p>
//           <Button 
//             onClick={() => window.location.reload()} 
//             className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
//           >
//             Refresh Page
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Get first few prompts for dashboard display
//   const displayPrompts = myPrompts.slice(0, 4);

//   return (
//     <div className="flex-1 flex flex-col w-full h-full">
//       <div className="flex flex-col md:flex-row flex-1">
//         {/* Sidebar */}
//         <div className="w-full md:w-64 bg-card border-r border-border p-6">
//           <div className="flex flex-col items-center text-center mb-6">
//             <div className="relative mb-2">
//               <img
//                 src={profileImage}
//                 alt="Profile"
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//               <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-card"></div>
//             </div>
//             <h3 className="font-medium">{username}</h3>
//             <div className="grid grid-cols-3 gap-4 w-full mt-4">
//               <div className="text-center">
//                 <div className="font-semibold">{myPrompts.length}</div>
//                 <div className="text-xs text-muted-foreground">Prompts</div>
//               </div>
//               <div className="text-center">
//                 <div className="font-semibold">{followers}</div>
//                 <div className="text-xs text-muted-foreground">Followers</div>
//               </div>
//               <div className="text-center">
//                 <div className="font-semibold">{following}</div>
//                 <div className="text-xs text-muted-foreground">Following</div>
//               </div>
//             </div>
//             <div className="w-full mt-6">
//               <div className="flex items-center justify-between mb-1">
//                 <div className="font-medium">Badges</div>
//               </div>
//             </div>
//           </div>
//           <div className="space-y-4">
//             <p className="font-medium">Bio</p>
//             <p className="mt-0 max-h-[340px] overflow-auto text-muted-foreground">
//               {userBio}
//             </p>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 p-6">
//           <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
          
//           {/* Dashboard Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <Card className="p-4">
//               <DashboardCard 
//                 heading='Total Prompts' 
//                 headingIcon={<Rocket size={20} color="#60A5FA" />} 
//                 value={dashboard.totalPrompts} 
//                 change="gain" 
//                 changeValue={12.5} 
//               />
//             </Card>
//             <Card className="p-4">
//               <DashboardCard 
//                 heading='Total Users' 
//                 headingIcon={<User size={20} color="#60A5FA" />} 
//                 value={dashboard.totalDownloads} 
//                 change="none" 
//                 changeValue={12.5} 
//               />
//             </Card>
//             <Card className="p-4">
//               <DashboardCard 
//                 heading='Average Rating' 
//                 headingIcon={<Star size={20} color="#60A5FA" />} 
//                 value={dashboard.averageRating} 
//                 change="loss" 
//                 changeValue={12.5} 
//               />
//             </Card>
//             <Card className="p-4">
//               <DashboardCard 
//                 heading='Monthly Usage' 
//                 headingIcon={<TrendingUp size={20} color="#60A5FA" />} 
//                 value={dashboard.monthlyUsage} 
//                 change="gain" 
//                 changeValue={12.5}
//               />
//             </Card>
//           </div>

//           {/* Top Rated Prompts and Recent Activity */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <Card className="p-4">
//               <div className="mb-2 flex justify-between items-center w-full">
//                 <p className="text-sm h-fit font-semibold">Top Rated Prompts</p>
//                 <div className="p-1 w-fit">
//                   <Star size={24} color="#60A5FA" />
//                 </div>
//               </div>
//               <div className="items-center text-xs">
//                 {loadingTopRankings ? (
//                   <div className="text-muted-foreground">Loading top rankings...</div>
//                 ) : topRankings.length === 0 ? (
//                   <div className="text-muted-foreground">No top rankings found.</div>
//                 ) : (
//                   topRankings.map(tp => (
//                     <div key={tp.promptId} className="flex justify-between items-center py-1">
//                       <span className="font-medium">{tp.title}</span>
//                       <span className="flex items-center">
//                         <Star className="h-4 w-4 text-yellow-400 mr-1" />
//                         {tp.avgRating?.toFixed(1)}
//                       </span>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </Card>
//             <Card className="p-4">
//               <div className="mb-2 flex justify-between items-center w-full">
//                 <p className="text-sm h-fit font-semibold">Recent Activity</p>
//                 <div className="p-1 w-fit">
//                   <Activity size={24} color="#60A5FA" />
//                 </div>
//               </div>
//               <div className="items-center text-xs">
//                 <RecentActivity username='Boityyyyy' activity='followed you' time='1.5h' />
//                 <RecentActivity username='Riri_ww' activity='followed you' time='1.5h' />
//                 <RecentActivity username='NavD' activity='rated your prompt' time='5h' />
//                 <RecentActivity username='MK' activity='rated your prompt' time='1 days'/>
//               </div>
//             </Card>
//           </div>

//           {/* My Prompts Section */}
//           <div>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-medium">My Prompts</h2>
//               <Link to="/my-prompts">
//                 <Button variant="outline" size="sm" className="flex items-center">
//                   View All
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               {loadingPrompts ? (
//                 <div className="flex justify-center items-center h-32 col-span-full">
//                   <div className="text-center">
//                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3ebb9e] mx-auto mb-2"></div>
//                     <p className="text-sm text-muted-foreground">Loading prompts...</p>
//                   </div>
//                 </div>
//               ) : myPrompts.length === 0 ? (
//                 <div className="col-span-full text-center py-8">
//                   <p className="text-muted-foreground mb-4">No prompts found.</p>
//                   <Link to="/submit">
//                     <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
//                       Create Your First Prompt
//                     </Button>
//                   </Link>
//                 </div>
//               ) : (
//                 displayPrompts.map((prompt) => (
//                   <StandardPromptCard
//                     key={prompt.id}
//                     id={prompt.id}
//                     title={prompt.title}
//                     description={prompt.description}
//                     rating={avgRatingMap[prompt.id] ?? 0}
//                     uses={prompt.uses}
//                     price={prompt.price}
//                     featured={prompt.featured}
//                     isPrivate={prompt.isPrivate}
//                     isFavorite={prompt.isFavorite}
//                     tags={prompt.tags}
//                     category={prompt.category}
//                     authorName={username}
//                     isOwned={true}
//                     onEdit={handleEditPrompt}
//                     onDelete={handleDeletePrompt}
//                     onToggleFavorite={handleToggleFavorite}
//                     onCopy={handleCopyPrompt}
//                     copiedId={copiedId}
//                     content={prompt.content}
//                   />
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

/////////////////////////////////////////////////////////////////////////////

// import { DashboardCard } from '@/components/DashboardCard';
// import { RecentActivity } from '../components/RecentActivity';
// import { TopPrompt } from '../components/TopPrompt';
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../components/ui/Button";
// import { Card } from "../components/ui/Card";
// import { ArrowRight, Star, User, TrendingUp, Activity, Rocket } from "lucide-react";
// import { Link } from 'react-router-dom';
// import { StandardPromptCard } from "../components/StandardPromptCard";

// type MyPrompt = {
//   id: string;
//   title: string;
//   description: string;
//   content: string;
//   category: string;
//   tags: string[];
//   createdAt: string;
//   updatedAt: string;
//   rating: number;
//   uses: number;
//   featured: boolean;
//   price: number;
//   isPrivate: boolean;
//   isFavorite: boolean;
// };

// type TopPromptType = {
//   id: string;
//   authorId: string;
//   featured: boolean;
//   title: string;
//   slug: string;
//   content: string;
//   description: string;
//   price: number;
//   visibility: string;
//   createdAt: string;
//   publishedAt: string;
//   tagIds: string[];
// };

// type DashboardData = {
//   monthlyUsage: number;
//   totalDownloads: number;
//   averageRating: number;
//   totalPrompts: number;
//   topPrompts: TopPromptType[];
// };

// type UserProfile = {
//   id: string;
//   username: string;
//   email: string;
//   profilePicture?: string;
//   bio?: string;
//   followers: number;
//   following: number;
// };

// type TopRankingPrompt = {
//   promptId: string;
//   title: string;
//   avgRating: number;
//   authorId?: string;
// };

// export default function DashboardPage() {
//   const navigate = useNavigate();

//   // Authentication state
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [authLoading, setAuthLoading] = useState<boolean>(true);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   // Profile states
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [profileImage, setProfileImage] = useState<string>("/placeholder.svg?height=80&width=80");
//   const [userBio, setUserBio] = useState<string>("AI prompt engineer specializing in creative writing and technical documentation.");
//   const [username, setUsername] = useState<string>("theo_unknown");
//   const [followers, setFollowers] = useState<number>(0);
//   const [following, setFollowing] = useState<number>(0);

//   // Prompts data states
//   const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([]);
//   const [loadingPrompts, setLoadingPrompts] = useState(true);
//   const [copiedId, setCopiedId] = useState<string | null>(null);

//   // Dashboard data states
//   const [dashboard, setDashboard] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Top user rankings
//   const [topUserPrompts, setTopUserPrompts] = useState<TopRankingPrompt[]>([]);
//   const [loadingTopUserPrompts, setLoadingTopUserPrompts] = useState(true);

//   // Ratings for my prompts
//   const [avgRatingMap, setAvgRatingMap] = useState<Record<string, number>>({});

//   // Check authentication status on component mount
//   useEffect(() => {
//     const checkAuth = () => {
//       const username = localStorage.getItem('username');
//       const userId = localStorage.getItem('userId');
//       if (username && username !== 'Guest' && userId) {
//         setIsAuthenticated(true);
//         setCurrentUserId(userId);
//       } else {
//         setIsAuthenticated(false);
//         navigate('/login');
//       }
//       setAuthLoading(false);
//     };

//     checkAuth();

//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'username' || e.key === 'userId') {
//         checkAuth();
//       }
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, [navigate]);

//   // Fetch user profile
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (!isAuthenticated || !currentUserId) return;

//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`/api/users/${currentUserId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           const profile: UserProfile = await response.json();
//           setUserProfile(profile);
//           setUsername(profile.username);
//           setUserBio(profile.bio || "AI prompt engineer specializing in creative writing and technical documentation.");
//           setProfileImage(profile.profilePicture || "/placeholder.svg?height=80&width=80");
//           setFollowers(profile.followers);
//           setFollowing(profile.following);

//           localStorage.setItem('username', profile.username);
//           if (profile.bio) localStorage.setItem('userBio', profile.bio);
//           if (profile.profilePicture) localStorage.setItem('userProfileImage', profile.profilePicture);
//         } else if (response.status === 401) {
//           localStorage.removeItem('token');
//           localStorage.removeItem('userId');
//           setIsAuthenticated(false);
//           navigate('/login');
//         }
//       } catch (error) {
//         // ignore
//       }
//     };

//     fetchUserProfile();
//   }, [isAuthenticated, currentUserId, navigate]);

//   // Fetch user's prompts
//   useEffect(() => {
//     const fetchMyPrompts = async () => {
//       if (!isAuthenticated) {
//         setLoadingPrompts(false);
//         return;
//       }

//       setLoadingPrompts(true);
//       try {
//         const userId = localStorage.getItem('userId');
//         if (!userId) {
//           setMyPrompts([]);
//           setLoadingPrompts(false);
//           return;
//         }

//         const response = await fetch(`http://localhost:8080/prompts/author/${userId}`, {
//           method: 'GET',
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           let prompts = await response.json();
//           if (!Array.isArray(prompts)) prompts = [];

//           const mappedPrompts: MyPrompt[] = prompts.map((p: any) => ({
//             id: p.id,
//             title: p.title,
//             description: p.description || "",
//             content: p.content || "",
//             category: p.category || "General",
//             tags: p.tagNames || [],
//             createdAt: p.createdAt,
//             updatedAt: p.publishedAt || p.createdAt,
//             rating: 0, // will be replaced by avgRatingMap
//             uses: p.uses || 0,
//             featured: p.featured || false,
//             price: p.price || 0,
//             isPrivate: p.visibility !== "public",
//             isFavorite: p.isFavorite || false
//           }));

//           setMyPrompts(mappedPrompts);
//         } else if (response.status === 401) {
//           localStorage.removeItem('username');
//           localStorage.removeItem('userId');
//           setIsAuthenticated(false);
//           navigate('/login');
//         } else {
//           setMyPrompts([]);
//         }
//       } catch (error) {
//         setMyPrompts([]);
//       }
//       setLoadingPrompts(false);
//     };

//     fetchMyPrompts();
//   }, [isAuthenticated, navigate]);

//   // Fetch dashboard data
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       if (!isAuthenticated) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const response = await fetch("http://localhost:8080/api/dashboard", {
//           method: 'GET',
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           const data = await response.json();
//           setDashboard(data);
//         } else if (response.status === 401) {
//           localStorage.removeItem('username');
//           localStorage.removeItem('userId');
//           setIsAuthenticated(false);
//           navigate('/login');
//           return;
//         } else {
//           throw new Error(`Failed to fetch dashboard data: ${response.status}`);
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to load dashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isAuthenticated) {
//       fetchDashboardData();
//     }
//   }, [isAuthenticated, navigate]);

//   // Fetch top ranking prompts for the logged-in user only
//   useEffect(() => {
//     const fetchTopUserPrompts = async () => {
//       setLoadingTopUserPrompts(true);
//       const userId = localStorage.getItem('userId');
//       if (!userId) {
//         setTopUserPrompts([]);
//         setLoadingTopUserPrompts(false);
//         return;
//       }
//       try {
//         const response = await fetch("http://localhost:8080/api/analytics/top-ranking", {
//           method: "GET",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           // Only include prompts where the authorId matches the logged-in user
//           const filtered = data.filter((item: TopRankingPrompt & { authorId?: string }) => item.authorId === userId);
//           setTopUserPrompts(filtered);
//         } else {
//           setTopUserPrompts([]);
//         }
//       } catch {
//         setTopUserPrompts([]);
//       }
//       setLoadingTopUserPrompts(false);
//     };
//     fetchTopUserPrompts();
//   }, [isAuthenticated]);

//   // Fetch avgRating for each prompt using the reviews endpoint (like PromptService)
//   useEffect(() => {
//     const fetchRatings = async () => {
//       if (!myPrompts.length) return;
//       const newMap: Record<string, number> = {};

//       await Promise.all(
//         myPrompts.map(async (prompt) => {
//           try {
//             const response = await fetch(`http://localhost:8080/store/prompts/${prompt.id}/reviews`, {
//               method: 'GET',
//               credentials: 'include',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//             });
//             if (response.ok) {
//               const data = await response.json();
//               const reviews = data?.content || [];
//               const avg =
//                 reviews.length > 0
//                   ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
//                   : 0;
//               newMap[prompt.id] = avg;
//             } else {
//               newMap[prompt.id] = 0;
//             }
//           } catch {
//             newMap[prompt.id] = 0;
//           }
//         })
//       );
//       setAvgRatingMap(newMap);
//     };

//     fetchRatings();
//   }, [myPrompts]);

//   // Load profile info from localStorage and listen for changes
//   useEffect(() => {
//     const savedImage = localStorage.getItem('userProfileImage');
//     if (savedImage) setProfileImage(savedImage);

//     const savedBio = localStorage.getItem('userBio');
//     if (savedBio) setUserBio(savedBio);

//     const savedUsername = localStorage.getItem('username');
//     if (savedUsername) setUsername(savedUsername);

//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === 'userProfileImage') setProfileImage(e.newValue || "/placeholder.svg?height=80&width=80");
//       if (e.key === 'userBio') setUserBio(e.newValue || "");
//       if (e.key === 'username') setUsername(e.newValue || "theo_unknown");
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Handlers for StandardPromptCard
//   const handleDeletePrompt = async (id: string) => {
//     try {
//       const response = await fetch(`http://localhost:8080/prompts/${id}`, {
//         method: 'DELETE',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setMyPrompts((prev) => prev.filter((p) => p.id !== id));
//       }
//     } catch (error) {}
//   };

//   const handleToggleFavorite = async (id: string) => {
//     try {
//       const response = await fetch(`http://localhost:8080/prompts/${id}/favorite`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
//       }
//     } catch (error) {
//       setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
//     }
//   };

//   const handleCopyPrompt = async (content: string, id: string) => {
//     try {
//       await navigator.clipboard.writeText(content);
//       setCopiedId(id);
//       setTimeout(() => setCopiedId(null), 2000);
//     } catch (err) {
//       setCopiedId(null);
//     }
//   };

//   const handleEditPrompt = (prompt: MyPrompt) => {
//     const editData = {
//       id: prompt.id,
//       title: prompt.title,
//       description: prompt.description,
//       category: prompt.category,
//       promptText: prompt.content,
//       expectedOutput: "",
//       isPrivate: prompt.isPrivate
//     };
//     sessionStorage.setItem("editPromptData", JSON.stringify(editData));
//     navigate("/submit");
//   };

//   if (authLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Redirecting to login...</p>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="text-red-500 mb-4">
//             <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
//           <p className="text-muted-foreground mb-4">{error}</p>
//           <Button 
//             onClick={() => window.location.reload()} 
//             className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
//           >
//             Try Again
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (!dashboard) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="text-muted-foreground mb-4">
//             <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium mb-2">No Dashboard Data</h3>
//           <p className="text-muted-foreground mb-4">Unable to load dashboard information</p>
//           <Button 
//             onClick={() => window.location.reload()} 
//             className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
//           >
//             Refresh Page
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const displayPrompts = myPrompts.slice(0, 4);

//   return (
//     <div className="flex-1 flex flex-col w-full h-full">
//       <div className="flex flex-col md:flex-row flex-1">
//         {/* Sidebar */}
//         <div className="w-full md:w-64 bg-card border-r border-border p-6">
//           <div className="flex flex-col items-center text-center mb-6">
//             <div className="relative mb-2">
//               <img
//                 src={profileImage}
//                 alt="Profile"
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//               <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-card"></div>
//             </div>
//             <h3 className="font-medium">{username}</h3>
//             <div className="grid grid-cols-3 gap-4 w-full mt-4">
//               <div className="text-center">
//                 <div className="font-semibold">{myPrompts.length}</div>
//                 <div className="text-xs text-muted-foreground">Prompts</div>
//               </div>
//               <div className="text-center">
//                 <div className="font-semibold">{followers}</div>
//                 <div className="text-xs text-muted-foreground">Followers</div>
//               </div>
//               <div className="text-center">
//                 <div className="font-semibold">{following}</div>
//                 <div className="text-xs text-muted-foreground">Following</div>
//               </div>
//             </div>
//             <div className="w-full mt-6">
//               <div className="flex items-center justify-between mb-1">
//                 <div className="font-medium">Badges</div>
//               </div>
//             </div>
//           </div>
//           <div className="space-y-4">
//             <p className="font-medium">Bio</p>
//             <p className="mt-0 max-h-[340px] overflow-auto text-muted-foreground">
//               {userBio}
//             </p>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 p-6">
//           <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <Card className="p-4">
//               <DashboardCard 
//                 heading='Total Prompts' 
//                 headingIcon={<Rocket size={20} color="#60A5FA" />} 
//                 value={dashboard.totalPrompts} 
//                 change="gain" 
//                 changeValue={12.5} 
//               />
//             </Card>
//             <Card className="p-4">
//               <DashboardCard 
//                 heading='Total Users' 
//                 headingIcon={<User size={20} color="#60A5FA" />} 
//                 value={dashboard.totalDownloads} 
//                 change="none" 
//                 changeValue={12.5} 
//               />
//             </Card>
//             <Card className="p-4">
//               <DashboardCard 
//                 heading='Average Rating' 
//                 headingIcon={<Star size={20} color="#60A5FA" />} 
//                 value={dashboard.averageRating} 
//                 change="loss" 
//                 changeValue={12.5} 
//               />
//             </Card>
//             <Card className="p-4">
//               <DashboardCard 
//                 heading='Monthly Usage' 
//                 headingIcon={<TrendingUp size={20} color="#60A5FA" />} 
//                 value={dashboard.monthlyUsage} 
//                 change="gain" 
//                 changeValue={12.5}
//               />
//             </Card>
//           </div>

//           {/* Top Rated Prompts and Recent Activity */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <Card className="p-4">
//               <div className="mb-2 flex justify-between items-center w-full">
//                 <p className="text-sm h-fit font-semibold">Your Top Rated Prompts</p>
//                 <div className="p-1 w-fit">
//                   <Star size={24} color="#60A5FA" />
//                 </div>
//               </div>
//               <div className="items-center text-xs">
//                 {loadingTopUserPrompts ? (
//                   <div className="text-muted-foreground">Loading top rankings...</div>
//                 ) : topUserPrompts.length === 0 ? (
//                   <div className="text-muted-foreground">No top rankings found.</div>
//                 ) : (
//                   topUserPrompts.map(tp => (
//                     <div key={tp.promptId} className="flex justify-between items-center py-1">
//                       <span className="font-medium">{tp.title}</span>
//                       <span className="flex items-center">
//                         <Star className="h-4 w-4 text-yellow-400 mr-1" />
//                         {tp.avgRating?.toFixed(1)}
//                       </span>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </Card>
//             <Card className="p-4">
//               <div className="mb-2 flex justify-between items-center w-full">
//                 <p className="text-sm h-fit font-semibold">Recent Activity</p>
//                 <div className="p-1 w-fit">
//                   <Activity size={24} color="#60A5FA" />
//                 </div>
//               </div>
//               <div className="items-center text-xs">
//                 <RecentActivity username='Boityyyyy' activity='followed you' time='1.5h' />
//                 <RecentActivity username='Riri_ww' activity='followed you' time='1.5h' />
//                 <RecentActivity username='NavD' activity='rated your prompt' time='5h' />
//                 <RecentActivity username='MK' activity='rated your prompt' time='1 days'/>
//               </div>
//             </Card>
//           </div>

//           {/* My Prompts Section */}
//           <div>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-medium">My Prompts</h2>
//               <Link to="/my-prompts">
//                 <Button variant="outline" size="sm" className="flex items-center">
//                   View All
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               {loadingPrompts ? (
//                 <div className="flex justify-center items-center h-32 col-span-full">
//                   <div className="text-center">
//                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3ebb9e] mx-auto mb-2"></div>
//                     <p className="text-sm text-muted-foreground">Loading prompts...</p>
//                   </div>
//                 </div>
//               ) : myPrompts.length === 0 ? (
//                 <div className="col-span-full text-center py-8">
//                   <p className="text-muted-foreground mb-4">No prompts found.</p>
//                   <Link to="/submit">
//                     <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
//                       Create Your First Prompt
//                     </Button>
//                   </Link>
//                 </div>
//               ) : (
//                 displayPrompts.map((prompt) => (
//                   <StandardPromptCard
//                     key={prompt.id}
//                     id={prompt.id}
//                     title={prompt.title}
//                     description={prompt.description}
//                     rating={avgRatingMap[prompt.id] ?? 0}
//                     uses={prompt.uses}
//                     price={prompt.price}
//                     featured={prompt.featured}
//                     isPrivate={prompt.isPrivate}
//                     isFavorite={prompt.isFavorite}
//                     tags={prompt.tags}
//                     category={prompt.category}
//                     authorName={username}
//                     isOwned={true}
//                     onEdit={handleEditPrompt}
//                     onDelete={handleDeletePrompt}
//                     onToggleFavorite={handleToggleFavorite}
//                     onCopy={handleCopyPrompt}
//                     copiedId={copiedId}
//                     content={prompt.content}
//                   />
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

///////////////////////////////////////////////////////////////////////////

import { DashboardCard } from '@/components/DashboardCard';
import { RecentActivity } from '../components/RecentActivity';
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ArrowRight, Star, User, TrendingUp, Activity, Rocket } from "lucide-react";
import { StandardPromptCard } from "../components/StandardPromptCard";

type MyPrompt = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  rating: number;
  uses: number;
  featured: boolean;
  price: number;
  isPrivate: boolean;
  isFavorite: boolean;
};

type DashboardData = {
  monthlyUsage: number;
  totalDownloads: number;
  averageRating: number;
  totalPrompts: number;
  topPrompts: any[];
};

type UserProfile = {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  followers: number;
  following: number;
};

export default function DashboardPage() {
  const navigate = useNavigate();

  // Auth and profile
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=80&width=80");
  const [userBio, setUserBio] = useState("AI prompt engineer specializing in creative writing and technical documentation.");
  const [username, setUsername] = useState("theo_unknown");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  // Prompts and ratings
  const [myPrompts, setMyPrompts] = useState<MyPrompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [avgRatingMap, setAvgRatingMap] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dashboard
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Top user prompts (by avgRating)
  const [topUserPrompts, setTopUserPrompts] = useState<(MyPrompt & { avgRating: number })[]>([]);
  const [loadingTopUserPrompts, setLoadingTopUserPrompts] = useState(true);

  // Auth check
  useEffect(() => {
    const checkAuth = () => {
      const username = localStorage.getItem('username');

      const userId = localStorage.getItem('userId');
      if (username && username !== 'Guest' && userId) {
        setIsAuthenticated(true);
        setCurrentUserId(userId);
      } else {

        setIsAuthenticated(false);
        navigate('/login');
      }
      setAuthLoading(false);
    };
    checkAuth();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'username' || e.key === 'userId') checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated || !currentUserId) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${currentUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const profile: UserProfile = await response.json();
          setUserProfile(profile);
          setUsername(profile.username);
          setUserBio(profile.bio || "AI prompt engineer specializing in creative writing and technical documentation.");
          setProfileImage(profile.profilePicture || "/placeholder.svg?height=80&width=80");
          setFollowers(profile.followers);
          setFollowing(profile.following);
          localStorage.setItem('username', profile.username);
          if (profile.bio) localStorage.setItem('userBio', profile.bio);
          if (profile.profilePicture) localStorage.setItem('userProfileImage', profile.profilePicture);
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
          navigate('/login');
        }
      } catch {}
    };
    fetchUserProfile();
  }, [isAuthenticated, currentUserId, navigate]);

  // Fetch user's prompts
  useEffect(() => {
    const fetchMyPrompts = async () => {
      if (!isAuthenticated) {
        setLoadingPrompts(false);
        return;
      }
      setLoadingPrompts(true);
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setMyPrompts([]);
          setLoadingPrompts(false);
          return;
        }

        const response = await fetch(`http://localhost:8080/prompts/author/${userId}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },

        });
        if (response.ok) {
          let prompts = await response.json();
          if (!Array.isArray(prompts)) prompts = [];

          const mappedPrompts: MyPrompt[] = prompts.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || "",
            content: p.content || "",
            category: p.category || "General",
            tags: p.tagNames || [],
            createdAt: p.createdAt,
            updatedAt: p.publishedAt || p.createdAt,
            rating: 0,
            uses: p.uses || 0,
            featured: p.featured || false,
            price: p.price || 0,
            isPrivate: p.visibility !== "public",
            isFavorite: p.isFavorite || false
          }));
          setMyPrompts(mappedPrompts);
        } else if (response.status === 401) {


          localStorage.removeItem('username');
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
          navigate('/login');
        } else {
          setMyPrompts([]);
        }
      } catch {
        setMyPrompts([]);
      }
      setLoadingPrompts(false);
    };
    fetchMyPrompts();
  }, [isAuthenticated, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {

      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);
      try {

        const response = await fetch("http://localhost:8080/api/dashboard", {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setDashboard(data);

        } else if (response.status === 401) {

          localStorage.removeItem('username');
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
          navigate('/login');
          return;
        } else {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
      } catch (err) {

        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);

      }
    };
    if (isAuthenticated) fetchDashboardData();
  }, [isAuthenticated, navigate]);

  // Fetch avgRating for each prompt
  useEffect(() => {
    const fetchRatings = async () => {
      if (!myPrompts.length) return;
      const newMap: Record<string, number> = {};
      await Promise.all(
        myPrompts.map(async (prompt) => {
          try {
            const response = await fetch(`http://localhost:8080/store/prompts/${prompt.id}/reviews`, {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
              const data = await response.json();
              const reviews = data?.content || [];
              const avg =
                reviews.length > 0
                  ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
                  : 0;
              newMap[prompt.id] = avg;
            } else {
              newMap[prompt.id] = 0;
            }
          } catch {
            newMap[prompt.id] = 0;
          }
        })
      );
      setAvgRatingMap(newMap);
    };
    fetchRatings();
  }, [myPrompts]);

  // Compute top user prompts (by avgRating, descending)
  useEffect(() => {
    setLoadingTopUserPrompts(true);
    if (!myPrompts.length) {
      setTopUserPrompts([]);
      setLoadingTopUserPrompts(false);
      return;
    }
    const promptsWithRating = myPrompts.map((p) => ({
      ...p,
      avgRating: avgRatingMap[p.id] ?? 0,
    }));
    const sorted = promptsWithRating
      .filter((p) => p.avgRating > 0)
      .sort((a, b) => b.avgRating - a.avgRating || b.uses - a.uses)
      .slice(0, 5);
    setTopUserPrompts(sorted);
    setLoadingTopUserPrompts(false);
  }, [myPrompts, avgRatingMap]);

  // Load profile info from localStorage and listen for changes
  useEffect(() => {
    const savedImage = localStorage.getItem('userProfileImage');
    if (savedImage) setProfileImage(savedImage);
    const savedBio = localStorage.getItem('userBio');
    if (savedBio) setUserBio(savedBio);
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) setUsername(savedUsername);
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfileImage') setProfileImage(e.newValue || "/placeholder.svg?height=80&width=80");
      if (e.key === 'userBio') setUserBio(e.newValue || "");
      if (e.key === 'username') setUsername(e.newValue || "theo_unknown");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handlers for StandardPromptCard
  const handleDeletePrompt = async (id: string) => {
    try {

      const response = await fetch(`http://localhost:8080/prompts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },

      });
      if (response.ok) {
        setMyPrompts((prev) => prev.filter((p) => p.id !== id));

      }
    } catch {}
  };

  const handleToggleFavorite = async (id: string) => {
    try {

      const response = await fetch(`http://localhost:8080/prompts/${id}/favorite`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));

      }
    } catch {
      setMyPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
    }
  };

  const handleCopyPrompt = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  const handleEditPrompt = (prompt: MyPrompt) => {
    const editData = {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      promptText: prompt.content,
      expectedOutput: "",
      isPrivate: prompt.isPrivate
    };
    sessionStorage.setItem("editPromptData", JSON.stringify(editData));
    navigate("/submit");
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Dashboard Data</h3>
          <p className="text-muted-foreground mb-4">Unable to load dashboard information</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-[#3ebb9e] hover:bg-[#00674f] text-white"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Top 4 for "My Prompts" section
  const displayPrompts = myPrompts.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-card border-r border-border p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-2">
              <img
                src={profileImage}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-card"></div>
            </div>
            <h3 className="font-medium">{username}</h3>
            <div className="grid grid-cols-3 gap-4 w-full mt-4">
              <div className="text-center">
                <div className="font-semibold">{myPrompts.length}</div>
                <div className="text-xs text-muted-foreground">Prompts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{followers}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{following}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>
            <div className="w-full mt-6">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">Badges</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-medium">Bio</p>
            <p className="mt-0 max-h-[340px] overflow-auto text-muted-foreground">
              {userBio}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-4">
              <DashboardCard 
                heading='Total Prompts' 
                headingIcon={<Rocket size={20} color="#60A5FA" />} 
                value={dashboard.totalPrompts} 
                change="gain" 
                changeValue={12.5} 
              />
            </Card>
            <Card className="p-4">
              <DashboardCard 
                heading='Total Users' 
                headingIcon={<User size={20} color="#60A5FA" />} 
                value={dashboard.totalDownloads} 
                change="none" 
                changeValue={12.5} 
              />
            </Card>
            <Card className="p-4">
              <DashboardCard 
                heading='Average Rating' 
                headingIcon={<Star size={20} color="#60A5FA" />} 
                value={dashboard.averageRating} 
                change="loss" 
                changeValue={12.5} 
              />
            </Card>
            <Card className="p-4">
              <DashboardCard 
                heading='Monthly Usage' 
                headingIcon={<TrendingUp size={20} color="#60A5FA" />} 
                value={dashboard.monthlyUsage} 
                change="gain" 
                changeValue={12.5}
              />
            </Card>
          </div>

          {/* Top Rated Prompts and Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-4">
              <div className="mb-2 flex justify-between items-center w-full">
                <p className="text-sm h-fit font-semibold">Your Top Rated Prompts</p>
                <div className="p-1 w-fit">
                  <Star size={24} color="#60A5FA" />
                </div>
              </div>
              <div className="items-center text-xs">
                {loadingTopUserPrompts ? (
                  <div className="text-muted-foreground">Loading top rankings...</div>
                ) : topUserPrompts.length === 0 ? (
                  <div className="text-muted-foreground">No top prompts found.</div>
                ) : (
                  topUserPrompts.map(tp => (
                    <div key={tp.id} className="flex justify-between items-center py-1">
                      <span className="font-medium">{tp.title}</span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {tp.avgRating?.toFixed(1)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-2 flex justify-between items-center w-full">
                <p className="text-sm h-fit font-semibold">Recent Activity</p>
                <div className="p-1 w-fit">
                  <Activity size={24} color="#60A5FA" />
                </div>
              </div>
              <div className="items-center text-xs">
                <RecentActivity username='Boityyyyy' activity='followed you' time='1.5h' />
                <RecentActivity username='Riri_ww' activity='followed you' time='1.5h' />
                <RecentActivity username='NavD' activity='rated your prompt' time='5h' />
                <RecentActivity username='MK' activity='rated your prompt' time='1 days'/>
              </div>
            </Card>
          </div>

          {/* My Prompts Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">My Prompts</h2>
              <Link to="/my-prompts">
                <Button variant="outline" size="sm" className="flex items-center">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loadingPrompts ? (
                <div className="flex justify-center items-center h-32 col-span-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3ebb9e] mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading prompts...</p>
                  </div>
                </div>
              ) : myPrompts.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground mb-4">No prompts found.</p>
                  <Link to="/submit">
                    <Button className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
                      Create Your First Prompt
                    </Button>
                  </Link>
                </div>
              ) : (
                displayPrompts.map((prompt) => (
                  <StandardPromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    description={prompt.description}
                    rating={avgRatingMap[prompt.id] ?? 0}
                    uses={prompt.uses}
                    price={prompt.price}
                    featured={prompt.featured}
                    isPrivate={prompt.isPrivate}
                    isFavorite={prompt.isFavorite}
                    tags={prompt.tags}
                    category={prompt.category}
                    authorName={username}
                    isOwned={true}
                    onEdit={handleEditPrompt}
                    onDelete={handleDeletePrompt}
                    onToggleFavorite={handleToggleFavorite}
                    onCopy={handleCopyPrompt}
                    copiedId={copiedId}
                    content={prompt.content}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}