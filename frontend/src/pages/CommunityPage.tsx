import { Card } from "../components/ui/Card"

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Community</h1>
        <Card className="p-6">
          <p>Community content will be displayed here.</p>
        </Card>
      </div>
    </div>
  )
}
