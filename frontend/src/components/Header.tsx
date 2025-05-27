"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "./ui/Button"
import { Moon, Sun, User, LogOut, Settings, Menu } from "lucide-react"
import { useTheme } from "./theme-provider"
import { cn } from "../lib/utils"
import { useState, useRef, useEffect } from "react"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Home", href: "/home" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Editor", href: "/editor" },
    { name: "My Prompts", href: "/my-prompts" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Community", href: "/community" },
  ]

  const handleLogout = () => {
    // Add any logout logic here (clear tokens, etc.)
    setDropdownOpen(false)
    navigate('/')
  }

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
          <Link to="/home" className="flex items-center space-x-2">
            <span className="font-bold text-lg">Prompt Forge</span>
          </Link>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-4 text-sm">
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
        {/* Hamburger for mobile */}
        <div className="flex md:hidden flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        {/* Theme/User controls */}
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
                    onClick={handleLogout}
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
      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-card border-t border-border px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "block py-2 text-base transition-colors hover:text-foreground",
                pathname === item.href ? "text-foreground font-medium" : "text-muted-foreground",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
