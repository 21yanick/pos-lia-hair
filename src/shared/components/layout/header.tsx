"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Bell, User, Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { useAuth } from "@/shared/hooks/auth/useAuth"
import { useOrganization } from "@/shared/contexts/OrganizationContext"

export function Header() {
  const pathname = usePathname()
  const { user, signOut, userRole } = useAuth()
  const { currentOrganization } = useOrganization()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if dark mode is active
  const isDarkMode = theme === 'dark'
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark')
  }

  // Get page title based on pathname (organization-aware)
  const getPageTitle = () => {
    // Handle organization routes: /org/[slug]/page
    const pathParts = pathname?.split("/") || []
    const path = pathParts.length >= 4 && pathParts[1] === "org" 
      ? pathParts[3] // For /org/slug/dashboard -> "dashboard"
      : pathParts[1] // For legacy routes

    switch (path) {
      case "dashboard":
        return "Dashboard"
      case "pos":
        return "Verkauf"
      case "cash-register":
        return "Kassenbuch"
      case "products":
        return "Produkte"
      case "expenses":
        return "Ausgaben"
      case "transactions":
        return "Transaktionen"
      case "banking":
        return "Banking"
      case "settings":
        // Check for settings sub-pages
        const subPath = pathParts[pathParts.length - 1]
        switch (subPath) {
          case "business":
            return "Geschäfts-Einstellungen"
          case "import":
            return "Import Center"
          case "suppliers":
            return "Lieferanten"
          default:
            return "Einstellungen"
        }
      case "organizations":
        return "Organisation wählen"
      default:
        return currentOrganization?.display_name || currentOrganization?.name || "POS System"
    }
  }

  return (
    <header className="bg-background border-b border-border py-3 px-4 md:px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">{getPageTitle()}</h1>

      <div className="flex items-center space-x-3">
        {/* Theme Toggle Switch */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700"
          >
            {/* Fixed Sun Icon - Left */}
            <Sun 
              className="absolute left-1 h-3 w-3 text-yellow-500"
              style={{
                opacity: isDarkMode ? 0.3 : 0.8,
                transition: 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            
            {/* Fixed Moon Icon - Right */}
            <Moon 
              className="absolute right-1 h-3 w-3 text-blue-300"
              style={{
                opacity: isDarkMode ? 0.8 : 0.3,
                transition: 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            
            {/* Moving Circle */}
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
              style={{
                transform: isDarkMode ? 'translateX(24px)' : 'translateX(2px)',
                transition: 'transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            />
          </button>
        )}

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell size={20} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <User size={20} />
              <span className="hidden md:inline-block">
                {user?.name || user?.email || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userRole && `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`}
                </p>
                {currentOrganization && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentOrganization.name}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={currentOrganization ? `/org/${currentOrganization.slug}/settings` : "/settings"}>
                Einstellungen
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => {
                signOut() // Uses enhanced auth hook with organization context clearing
              }}
            >
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

