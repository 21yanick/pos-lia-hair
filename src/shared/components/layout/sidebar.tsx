"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  BarChart4,
  ShoppingCart,
  Package,
  FileIcon,
  LogOut,
  Menu,
  X,
  BookOpen,
  Settings,
  CreditCard,
  FileText,
} from "lucide-react"
import { cn } from "@/shared/utils"
import { Button } from "@/shared/components/ui/button"
import { supabase } from "@/shared/lib/supabase/client"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart4 },
  { name: "Verkauf", href: "/pos", icon: ShoppingCart },
  { name: "Banking", href: "/banking", icon: CreditCard },
  { name: "Transaktionen", href: "/transactions", icon: FileText },
  { name: "Kassenbuch", href: "/cash-register", icon: BookOpen },
  { name: "Produkte", href: "/products", icon: Package },
  { name: "Ausgaben", href: "/expenses", icon: FileIcon },
  { name: "Einstellungen", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border h-20 relative">
        {!collapsed ? (
          <>
            <div className="flex items-center">
              <Image
                src="/logo_clean.svg"
                alt="Lia Hair Logo"
                width={120}
                height={60}
                className="mr-2"
                priority
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Collapse sidebar"
            >
              <X size={20} />
            </Button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <Image
              src="/logo_clean.svg"
              alt="Lia Hair Logo"
              width={48}
              height={48}
              className="mb-2"
              priority
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Expand sidebar"
            >
              <Menu size={20} />
            </Button>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href) || false
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center",
                  )}
                >
                  <Icon size={20} className={cn("flex-shrink-0", collapsed ? "" : "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center text-destructive hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center",
          )}
          onClick={async () => {
            const { error } = await supabase.auth.signOut()
            if (!error) {
              // Force refresh to apply the redirect in middleware
              window.location.href = "/login"
            }
          }}
        >
          <LogOut size={20} className={cn("flex-shrink-0", collapsed ? "" : "mr-2")} />
          {!collapsed && <span>Abmelden</span>}
        </Button>
      </div>
    </div>
  )
}

