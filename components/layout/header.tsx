"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Bell, User } from "lucide-react"
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
    <header className="bg-white border-b border-gray-200 py-3 px-4 md:px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">{getPageTitle()}</h1>

      <div className="flex items-center space-x-3">
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
            <DropdownMenuItem>Einstellungen</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
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

