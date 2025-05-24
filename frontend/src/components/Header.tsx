"use client"

import { Link, useLocation } from "react-router-dom"
import { Button } from "./ui/Button"
import { Moon, Sun, User, LogOut, Settings } from "lucide-react"
import { useTheme } from "./theme-provider"
import { cn } from "../lib/utils"
import { useState, useRef, useEffect } from "react"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const pathname = location.pathname
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { name: "Home", href: "/home" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Editor", href: "/editor" },
    { name: "My Prompts", href: "/my-prompts" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Community", href: "/community" },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">Prompt Forge</span>
          </Link>
        </div>
        <nav className="flex-1 flex items-center justify-center space-x-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "transition-colors hover:text-foreground",
                pathname === item.href ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <div className="relative" ref={dropdownRef}>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <User className="h-5 w-5" />
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm font-medium border-b border-border">My Account</div>
                  <Link
                    to="/profile-settings"
                    className="flex items-center px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-muted"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
