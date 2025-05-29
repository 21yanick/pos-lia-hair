"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Bell, User, Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase/client"

export function Header() {
  const pathname = usePathname()
  const [user] = useState({ name: "Admin User", role: "admin" })
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

  // Get page title based on pathname
  const getPageTitle = () => {
    const path = pathname?.split("/")[1] || ""
    switch (path) {
      case "dashboard":
        return "Dashboard"
      case "pos":
        return "Verkauf"
      case "reports":
        return "Abschlüsse"
      case "products":
        return "Produkte"
      case "supplier-invoices":
        return "Lieferantenrechnungen"
      case "documents":
        return "Dokumente"
      default:
        return "Coiffeursalon POS"
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
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700"
            style={{
              backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
              transition: 'background-color 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
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
              <span className="hidden md:inline-block">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Einstellungen</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={async () => {
                const { error } = await supabase.auth.signOut()
                if (!error) {
                  // Force refresh to apply the redirect in middleware
                  window.location.href = "/login"
                }
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

