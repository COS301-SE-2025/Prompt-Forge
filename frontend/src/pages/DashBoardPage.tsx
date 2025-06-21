

import { DashboardCard } from '@/components/DashboardCard';
import { RecentActivity } from '../components/RecentActivity';
import { TopPrompt } from '../components/TopPrompt';
import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ArrowRight, Star, User, TrendingUp, Activity, Rocket } from "lucide-react";

// Types matching your backend JSON
type Prompt = {
  id: string;
  title: string;
  description: string;
  rating: number;
  uses: number;
  price: number;
  featured: boolean;
};

type TopPromptType = {
  id: string;
  authorId: string;
  featured: boolean;
  title: string;
  slug: string;
  content: string;
  description: string;
  price: number;
  visibility: string;
  createdAt: string;
  publishedAt: string;
  tagIds: string[];
};

type DashboardData = {
  monthlyUsage: number;
  totalDownloads: number;
  averageRating: number;
  totalPrompts: number;
  topPrompts: TopPromptType[];
};

export default function DashboardPage() {
  // Profile states
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg?height=80&width=80");
  const [userBio, setUserBio] = useState<string>(() => {
    return localStorage.getItem('userBio') || "AI prompt engineer specializing in creative writing and technical documentation.";
  });
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('username') || "theo_unknown";
  });

  //Prompts data states
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  useEffect(() => {
    const authorId = localStorage.getItem("userId"); // or get from auth context
    console.log("Author ID:", authorId);
    if (!authorId) return;
    console.log(authorId);
    fetch(`/prompts/author/${authorId}`)
      .then(res => res.json())
      .then(setMyPrompts)
      .finally(() => setLoadingPrompts(false));
  }, []);

  // Dashboard data states
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch dashboard data from backend
  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then(setDashboard)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dashboard) return <div>No data</div>;

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
                <div className="font-semibold">2</div>
                <div className="text-xs text-muted-foreground">Prompts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">1</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">4</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>
            <div className="w-full mt-6">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">Badges</div>
                {/* <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{dashboard.averageRating}</span>
                </div> */}
              </div>
              {/* <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#3ebb9e] rounded-full" style={{ width: `${Math.min(100, (dashboard.averageRating / 5) * 100)}%` }}></div>
              </div> */}
              {/* <div className="flex justify-between text-xs mt-1">
                <span className="text-green-500">+0.2 this week</span>
                <span className="text-muted-foreground">Last month</span>
              </div> */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-4">
                <DashboardCard heading='Total Prompts' headingIcon={<Rocket size={20} color="#60A5FA" />} value={dashboard.totalPrompts} change="gain" changeValue={12.5} />
              </Card>
              <Card className="p-4">
                <DashboardCard heading='Total Users' headingIcon={<User size={20} color="#60A5FA" />} value={dashboard.totalDownloads} change="none" changeValue={12.5} />
              </Card>
              <Card className="p-4">
                <DashboardCard heading='Average Rating' headingIcon={<Star size={20} color="#60A5FA" />} value={dashboard.averageRating} change="loss" changeValue={12.5} />
              </Card>
              <Card className="p-4">
                <DashboardCard heading='Monthly Usage' headingIcon={<TrendingUp size={20} color="#60A5FA" />} value={dashboard.monthlyUsage} change="gain" changeValue={12.5}/>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-4">
                <div className="mb-2 flex justify-between items-center w-full">
                  <p className="text-sm h-fit font-semibold">Top Performing Prompts</p>
                  <div className="p-1 w-fit">
                    <TrendingUp size={24} color="#60A5FA" />
                  </div>
                </div>
                <div className="items-center text-xs">
                  {dashboard.topPrompts.map(tp => (
                    <TopPrompt
                      key={tp.id}
                      heading={tp.title}
                      rating={dashboard.averageRating}
                      usesCount={dashboard.monthlyUsage}
                      promptId={tp.id}
                    />
                  ))}
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
                  <RecentActivity  username='Boityyyyy' activity='followed you' time='1.5h'   />
                  <RecentActivity  username='Riri_ww' activity='followed you' time='1.5h'   />
                  <RecentActivity  username='NavD' activity='rated your prompt' time='5h'   />
                  <RecentActivity  username='MK' activity='rated your prompt' time='1 days'/>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">My Prompts</h2>
              <Button variant="outline" size="sm" className="h-8">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loadingPrompts ? (
                <div>Loading prompts...</div>
              ) : myPrompts.length === 0 ? (
                <div>No prompts found.</div>
              ) : (
                myPrompts.map((prompt) => (
                  <Card key={prompt.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        {prompt.featured && (
                          <div className="bg-green-500/20 text-green-500 text-xs font-medium px-2 py-1 rounded">
                            Featured
                          </div>
                        )}
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs ml-1">{prompt.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-medium mb-1">{prompt.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {prompt.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-xs ml-1 text-muted-foreground">@{username}</span>
                        </div>
                        <div className="text-xs font-medium">${prompt.price}</div>
                      </div>
                    </div>
                    <div className="border-t border-border flex">
                      <div className="flex-1 py-2 text-center text-xs text-muted-foreground">
                        <span>{prompt.uses} uses</span>
                      </div>
                      <div className="border-l border-border">
                        <Button className="h-full rounded-none bg-[#3ebb9e] hover:bg-[#00674f] text-xs px-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          <span className="ml-1">Add to store</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}