"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "./ui/Button"
import { Moon, Sun, User, LogOut, Settings, Menu, ShoppingCart, HelpCircle, BrainCircuit, X } from "lucide-react"
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
    { name: "Dashboard", href: "/dashboard" },
    { name: "Testing Ground", href: "/editor", shortName: "Editor" },
    { name: "Comparison", href: "/comparison" },
    { name: "Prompt Builder", href: "/builder", shortName: "Builder" },
    { name: "My Prompts", href: "/my-prompts" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Community", href: "/community" },
    { name: "Social Hub", href: "/social", shortName: "Social" },
    { name: "Prompt Wars", href: "/war", shortName: "Wars" },
  ]

  const handleLogout = async () => {
    try {
      const authService = new AuthService();
      await authService.logout();
      localStorage.removeItem("userEmail");
      setDropdownOpen(false);

      // Remove any non-HTTP-only cookies
      document.cookie = "token=; Max-Age=0; path=/; domain=" + window.location.hostname;
      document.cookie = "jwt=; Max-Age=0; path=/; domain=" + window.location.hostname;

      localStorage.clear();
      sessionStorage.clear();

      // Force a full reload to clear all React state and cached data
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1536) { // 2xl breakpoint
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border w-full">
        <div className="w-full flex h-16 sm:h-20 items-center px-3 sm:px-4 lg:px-6">
          {/* Logo */}
          <div className="mr-4 sm:mr-6 flex flex-shrink-0">
            <Link to="/home" className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-[#00876e]/10 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 text-[#3ebb9e]" />
              </div>
              <span className="font-bold text-lg sm:text-xl lg:text-2xl whitespace-nowrap">
                Prompt Forge
              </span>
            </Link>
          </div>

          {/* Desktop nav - Only show on very large screens */}
          <nav className="hidden 2xl:flex flex-1 items-center justify-center space-x-6 text-base min-w-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "transition-colors hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted whitespace-nowrap flex-shrink-0",
                  pathname === item.href 
                    ? "text-[#3ebb9e] font-semibold bg-[#3ebb9e]/10" 
                    : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Hamburger menu for everything except 2xl screens */}
          <div className="flex 2xl:hidden flex-1 justify-end mr-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>
          </div>

          {/* Theme/User controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:rotate-180 transition-transform duration-500 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0">
              <Link
                to="/cart"
                className="rounded-full flex items-center justify-center w-full h-full"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </Link>
            </Button>

            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </Button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-md shadow-lg bg-card border border-border z-10">
                  <div className="py-1">
                    <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b border-border">
                      My Account
                    </div>
                    <Link
                      to="/profile-settings"
                      className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-muted"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-muted"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <HelpCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Help & FAQ</span>
                    </Link>
                    <button
                      className="flex w-full items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-500 hover:bg-muted"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay - Now shows for all screens except 2xl */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 2xl:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile menu */}
          <nav className="fixed top-16 sm:top-20 left-0 right-0 bg-card/98 backdrop-blur supports-[backdrop-filter]:bg-card/95 border-b border-border z-50 2xl:hidden max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
            <div className="px-4 sm:px-6 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "block py-3 px-3 text-base sm:text-lg transition-colors hover:text-foreground rounded-lg hover:bg-muted",
                    pathname === item.href 
                      ? "text-[#3ebb9e] font-semibold bg-[#3ebb9e]/10"
                      : "text-muted-foreground",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <Link
                  to="/help"
                  className={cn(
                    "block py-3 px-3 text-base sm:text-lg transition-colors hover:text-foreground rounded-lg hover:bg-muted",
                    pathname === "/help" 
                      ? "text-[#3ebb9e] font-semibold bg-[#3ebb9e]/10"
                      : "text-muted-foreground",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Help & FAQ
                </Link>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
