"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart4,
  ShoppingCart,
  FileText,
  Package,
  FileIcon,
  FolderClosed,
  LogOut,
  Menu,
  X,
  BookOpen,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart4 },
  { name: "Verkauf", href: "/pos", icon: ShoppingCart },
  { name: "Tagesabschluss", href: "/reports/daily", icon: FileText },
  { name: "Kassenbuch", href: "/reports/cash-register", icon: BookOpen },
  { name: "Monatsabschlüsse", href: "/reports/monthly", icon: BarChart4 },
  { name: "Produkte", href: "/products", icon: Package },
  { name: "Lieferantenrechnungen", href: "/supplier-invoices", icon: FileIcon },
  { name: "Dokumente", href: "/documents", icon: FolderClosed },
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
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && <h1 className="text-xl font-semibold">Coiffeursalon</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
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

