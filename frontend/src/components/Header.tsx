"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "./ui/Button"
import { Moon, Sun, User, LogOut, Settings, Menu, ShoppingCart, HelpCircle, BrainCircuit } from "lucide-react"
import { useTheme } from "./theme-provider"
import { cn } from "../lib/utils"
import { useState, useRef, useEffect } from "react"
import { AuthService } from "@/services/authService";

export default function Header() {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { name: "Home", href: "/home" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Testing Ground", href: "/editor" },
    { name: "Comparison", href: "/comparison" },
    { name: "My Prompts", href: "/my-prompts" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Community", href: "/community" },
  ]

  const handleLogout = async () => {
    try {
      const authService = new AuthService();
      await authService.logout();
      localStorage.removeItem("userEmail");
      setDropdownOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      // Optional: Show toast or error message
    }
  };

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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="container mx-auto flex h-20 items-center px-6">
        <div className="mr-6 flex">
          <Link to="/home" className="flex items-center space-x-3">
            <div className="bg-[#00876e]/10 p-2 rounded-xl">
              <BrainCircuit className="w-8 h-8 text-[#3ebb9e]" />
            </div>
            <span className="font-bold text-2xl">Prompt Forge</span>
          </Link>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-8 text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "transition-colors hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted",
                pathname === item.href 
                  ? "text-[#3ebb9e] font-semibold bg-[#3ebb9e]/10" 
                  : "text-muted-foreground",
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
            className="rounded-full w-12 h-12"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-7 w-7" />
          </Button>
        </div>
        {/* Theme/User controls */}
        <div className="flex items-center space-x-3">
          <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full hover:rotate-180 transition-transform duration-500 w-12 h-12"
              >
                {theme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </Button>
          <Button variant="ghost" size="icon" className="rounded-full w-12 h-12">
            <Link
              to="/cart"
              className="rounded-full flex items-center justify-center w-full h-full"
            >
              <ShoppingCart className="h-6 w-6" />
            </Link>
          </Button>

          <div className="relative" ref={dropdownRef}>
            <Button variant="ghost" size="icon" className="rounded-full w-12 h-12" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <User className="h-6 w-6" />
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
                  <Link
                    to="/help"
                    className="flex items-center px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & FAQ</span>
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
        <nav className="md:hidden bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t border-border px-6 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "block py-3 text-lg transition-colors hover:text-foreground rounded-lg px-3 hover:bg-muted",
                pathname === item.href 
                  ? "text-[#3ebb9e] font-semibold bg-[#3ebb9e]/10"
                  : "text-muted-foreground",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            to="/help"
            className={cn(
              "block py-3 text-lg transition-colors hover:text-foreground rounded-lg px-3 hover:bg-muted",
              pathname === "/help" 
                ? "text-[#3ebb9e] font-semibold bg-[#3ebb9e]/10"
                : "text-muted-foreground",
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            Help & FAQ
          </Link>
        </nav>
      )}
    </header>
  )
}
