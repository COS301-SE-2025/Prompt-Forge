interface RecentActivityProps{
  username:string,
  activity:string,
  time:string
}
export function RecentActivity({username, activity, time}:RecentActivityProps) {
  return <div className="mb-2 flex text-muted-foreground justify-between items-center w-full">
    <div className="flex items-center">
        <span className="text-[#0066e2] pr-1">{username} <span className="text-muted-foreground">{activity}</span></span>
    </div>
    <div>{time} ago</div>
    </div>;
}
  