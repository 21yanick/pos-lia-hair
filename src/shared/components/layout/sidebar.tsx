'use client'

import {
  BarChart4,
  BookOpen,
  CreditCard,
  FileIcon,
  FileText,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { SmartAppLogo } from '@/shared/components/ui/SmartAppLogo'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { cn } from '@/shared/utils'

const navItemsTemplate = [
  { name: 'Dashboard', path: '/dashboard', icon: BarChart4 },
  { name: 'Verkauf', path: '/pos', icon: ShoppingCart },
  { name: 'Banking', path: '/banking', icon: CreditCard },
  { name: 'Transaktionen', path: '/transactions', icon: FileText },
  { name: 'Kassenbuch', path: '/cash-register', icon: BookOpen },
  { name: 'Produkte', path: '/products', icon: Package },
  { name: 'Ausgaben', path: '/expenses', icon: FileIcon },
  { name: 'Einstellungen', path: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { signOut } = useAuth()
  const { currentOrganization } = useCurrentOrganization()

  // Create organization-aware navigation items
  const navItems = navItemsTemplate.map((item) => ({
    ...item,
    href: currentOrganization ? `/org/${currentOrganization.slug}${item.path}` : item.path, // Fallback for organization-less routes
  }))

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-background border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border h-20 relative">
        {!collapsed ? (
          <>
            <div className="flex items-center">
              <SmartAppLogo
                size="lg"
                alt="Lia Hair Logo"
                className="w-20 h-10 mr-2"
                fallback={
                  <div className="w-20 h-10 flex items-center justify-center bg-muted rounded border border-border mr-2">
                    <span className="text-xs font-bold text-muted-foreground">Logo</span>
                  </div>
                }
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
            <SmartAppLogo
              size="sm"
              alt="Lia Hair Logo"
              className="w-8 h-8 mb-2"
              fallback={
                <div className="w-8 h-8 flex items-center justify-center bg-muted rounded border border-border mb-2">
                  <span className="text-xs font-bold text-muted-foreground">L</span>
                </div>
              }
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
            // Enhanced active state detection for organization routes
            const isActive =
              pathname?.includes(item.path) || pathname?.startsWith(item.href) || false
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    collapsed && 'justify-center'
                  )}
                >
                  <Icon size={20} className={cn('flex-shrink-0', collapsed ? '' : 'mr-3')} />
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
            'w-full flex items-center text-destructive hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center'
          )}
          onClick={() => {
            signOut() // Uses enhanced auth hook with organization context clearing
          }}
        >
          <LogOut size={20} className={cn('flex-shrink-0', collapsed ? '' : 'mr-2')} />
          {!collapsed && <span>Abmelden</span>}
        </Button>
      </div>
    </div>
  )
}
