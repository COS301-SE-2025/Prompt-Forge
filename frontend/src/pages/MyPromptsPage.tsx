import { Card } from "../components/ui/Card"

export default function MyPromptsPage() {
  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">My Prompts</h1>
        <Card className="p-6">
          <p>My Prompts content will be displayed here.</p>
        </Card>
      </div>
    </div>
  )
}
