import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-forge-dark border-b border-forge-card">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">Prompt Forge</span>
          </Link>
        </div>
        <nav className="flex-1 flex items-center justify-center space-x-4 text-sm">
          <Link href="/editor" className="text-white/70 hover:text-white transition-colors">
            Editor
          </Link>
          <Link href="/my-prompts" className="text-white/70 hover:text-white transition-colors">
            My Prompts
          </Link>
          <Link href="/marketplace" className="text-white/70 hover:text-white transition-colors">
            Marketplace
          </Link>
          <Link href="/community" className="text-white/70 hover:text-white transition-colors">
            Community
          </Link>
        </nav>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
