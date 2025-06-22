import { DashboardCard } from '@/components/DashboardCard';
import { RecentActivity } from '../components/RecentActivity';
import { TopPrompt } from '../components/TopPrompt';
import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ArrowRight, Star, User, TrendingUp, Activity, Rocket } from "lucide-react";
import { Link } from 'react-router-dom';
import { StandardPromptCard } from "../components/StandardPromptCard"

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ebb9e] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  
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
                <div>No prompts found.</div>
              ) : (
                myPrompts.map((prompt) => (
                  <StandardPromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    description={prompt.description}
                    rating={prompt.rating}
                    uses={prompt.uses}
                    price={prompt.price}
                    featured={prompt.featured}
                    authorName={username}
                    isOwned={true}
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