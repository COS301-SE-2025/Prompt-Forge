import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Star, Swords, Timer, User as UserIcon } from "lucide-react";
import React from "react";

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  price: number;
  authorId: string;
  authorName?: string;
  createdAt: string;
  rating?: number;
  totalRatings?: number;
}

interface SocialUser {
  userId: string;
  username: string;
  email?: string;
  profilePictureUrl?: string;
  bio?: string;
  followers: string[] | number;
  following: string[] | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: string;
  badges?: string[];
  prompts?: Prompt[];
  totalPrompts?: number;
  averageRating?: number;
  isOnline?: boolean;
  isPopular?: boolean;
  isFollowing?: boolean;
}

type UserCardProps = {
  user: SocialUser;
  handleFollow: (userId: string, isCurrentlyFollowing: boolean) => void;
  setSelectedOpponent: (user: SocialUser) => void;
  setShowChallengeModal: (show: boolean) => void;
  showNotification: (msg: string) => void;
};

export const UserCard: React.FC<UserCardProps> = ({ user, handleFollow, setSelectedOpponent, setShowChallengeModal, showNotification }) => {
  return <Card className="border-none overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col group ">
    <div className="p-4 flex-1 border-border border-red-900">
      <div className="flex items-start space-x-4 border-border border-green-900">
        <div className="relative">
          {user.profilePictureUrl ? (
            <img
              className="w-12 h-12 rounded-full object-cover border-2 border-border  transition-colors duration-300"
              src={user.profilePictureUrl}
              alt={user.username}
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-muted border-2 border-border group-hover:border-[#3ebb9e]/50 transition-colors duration-300">
              <UserIcon className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold truncate group-hover:text-[#3ebb9e] transition-colors duration-300">{user.username}</h3>
            {user.isPopular && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
          </div>
          <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{user.bio || "No bio available"}</p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <p className="text-white/50">{user.totalPrompts || 0} prompts</p>
            <span className="text-white/50">{Array.isArray(user.followers) ? user.followers.length : user.followers} followers</span>
          </div>
        </div>
        {user.isFollowing && <div className="flex space-x-2">
          <Button
            size="sm"
            variant={user.isFollowing ? "outline" : "default"}
            className={`flex-1 ${user.isFollowing
              ? "hover:border-[#3ebb9e] hover:text-[#3ebb9e]"
              : "bg-[#3ebb9e] hover:bg-[#00674f] text-white"
              } transition-colors duration-300`}
            onClick={() => handleFollow(user.userId, user.isFollowing || false)}
          >
            {user.isFollowing ? "Following" : "Follow"}
          </Button>
        </div>}
      </div>
    </div>

    {user.isFollowing && (
      <div className="border-border p-3 pt-0 bg-gradient-to-r from-transparent to-transparent transition-all duration-300">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (user.isOnline) {
              setSelectedOpponent(user);
              setShowChallengeModal(true);
            } else {
              showNotification(`${user.username} is currently offline. Try again when they're online!`);
            }
          }}
          className={`transition-all duration-300 w-full ${user.isOnline
            ? "bg-[#3ebb9e]/10 hover:bg-[#3ebb9e]/20 text-[#3ebb9e] border-[#3ebb9e]/30 "
            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
            }`}
          title={user.isOnline ? "Challenge to Prompt Wars" : "User is offline"}
        >
          {user.isOnline ? (
            <>
              <Swords className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
              Challenge
            </>
          ) : (
            <>
              <Timer className="h-4 w-4 mr-1" />
              Offline
            </>
          )}
        </Button>
      </div>

    )}

    {!user.isFollowing &&
      <div className="border-border p-3 pt-0 bg-gradient-to-r from-transparent to-transparent transition-all duration-300">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={user.isFollowing ? "outline" : "default"}
            className={`flex-1 ${user.isFollowing
              ? "hover:border-[#3ebb9e] hover:text-[#3ebb9e]"
              : "bg-[#3ebb9e] hover:bg-[#00674f] text-white"
              } transition-colors duration-300`}
            onClick={() => handleFollow(user.userId, user.isFollowing || false)}
          >
            {user.isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </div>}
  </Card>
};