"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart4,
  ShoppingCart,
  Package,
  FileIcon,
  LogOut,
  BookOpen,
  Settings,
  CreditCard,
  FileText,
} from "lucide-react"

import { cn } from "@/shared/utils"
import { useAuth } from "@/shared/hooks/auth/useAuth"
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { SmartAppLogo } from "@/shared/components/ui/SmartAppLogo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar"

// Navigation configuration
const navItemsTemplate = [
  { name: "Dashboard", path: "/dashboard", icon: BarChart4 },
  { name: "Verkauf", path: "/pos", icon: ShoppingCart },
  { name: "Banking", path: "/banking", icon: CreditCard },
  { name: "Transaktionen", path: "/transactions", icon: FileText },
  { name: "Kassenbuch", path: "/cash-register", icon: BookOpen },
  { name: "Produkte", path: "/products", icon: Package },  
  { name: "Ausgaben", path: "/expenses", icon: FileIcon },
  { name: "Einstellungen", path: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { currentOrganization } = useCurrentOrganization()
  const { state } = useSidebar()

  // Create organization-aware navigation items
  const navItems = navItemsTemplate.map(item => ({
    ...item,
    href: currentOrganization 
      ? `/org/${currentOrganization.slug}${item.path}`
      : item.path
  }))

  // Enhanced active state detection for organization routes
  const isActive = (item: typeof navItems[0]) => {
    return pathname?.includes(item.path) || 
           pathname?.startsWith(item.href) || 
           false
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border bg-card">
        <div className="flex items-center gap-2 text-card-foreground">
          <SmartAppLogo 
            size={state === "collapsed" ? "sm" : "lg"}
            alt="Lia Hair Logo"
            className={cn(
              "transition-all duration-200",
              state === "collapsed" ? "w-8 h-8" : "w-20 h-10"
            )}
            fallback={
              <div className={cn(
                "flex items-center justify-center bg-muted rounded border border-border",
                state === "collapsed" ? "w-8 h-8" : "w-20 h-10"
              )}>
                <span className={cn(
                  "font-bold text-muted-foreground",
                  state === "collapsed" ? "text-xs" : "text-xs"
                )}>
                  {state === "collapsed" ? "L" : "Logo"}
                </span>
              </div>
            }
          />
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-card-foreground">
                {currentOrganization?.display_name || currentOrganization?.name || "POS System"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item)
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                      className={cn(
                        "text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                        active && "bg-primary text-primary-foreground font-medium shadow-sm"
                      )}
                    >
                      <Link href={item.href}>
                        <Icon className="!size-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-card">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              tooltip="Abmelden"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
            >
              <LogOut className="!size-4" />
              <span>Abmelden</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}