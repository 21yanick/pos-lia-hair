'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Settings, LogOut, Building2, User } from 'lucide-react'
import { cn } from '@/shared/utils'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { ProfileAvatar } from './ProfileAvatar'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
import { useOrganizationSwitcher } from '@/shared/components/auth/OrganizationGuard'
import type { OrganizationRole } from '@/shared/types/organizations'

// Role display configuration
const roleConfig: Record<OrganizationRole, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  owner: { label: 'Inhaber', variant: 'default' },
  admin: { label: 'Admin', variant: 'secondary' },
  staff: { label: 'Mitarbeiter', variant: 'outline' }
}

interface ProfileMenuProps {
  className?: string
}

export function ProfileMenu({ className }: ProfileMenuProps) {
  const { user, userRole, signOut } = useAuth()
  const { currentOrganization, userOrganizations } = useOrganization()
  const { switchToOrganization } = useOrganizationSwitcher()
  const [isOpen, setIsOpen] = useState(false)

  if (!user || !currentOrganization) {
    return null
  }

  const hasMultipleOrganizations = userOrganizations.length > 1
  const roleDisplay = userRole ? roleConfig[userRole] : null

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
  }

  const handleOrganizationSwitch = async (orgId: string) => {
    console.log('📺 PROFILE MENU - Organization switch requested:', orgId)
    setIsOpen(false)
    await switchToOrganization(orgId)
    console.log('📺 PROFILE MENU - Organization switch completed')
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            'flex items-center space-x-2 px-2 py-1.5 h-auto',
            'hover:bg-accent hover:text-accent-foreground',
            'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
            className
          )}
        >
          <ProfileAvatar 
            name={user.name} 
            email={user.email} 
            size="md"
            showOnlineStatus
          />
          <div className="hidden md:flex flex-col items-start text-left min-w-0">
            <span className="text-sm font-medium truncate max-w-32">
              {user.name || user.email?.split('@')[0] || 'User'}
            </span>
            {roleDisplay && (
              <span className="text-xs text-muted-foreground truncate max-w-32">
                {roleDisplay.label} • {currentOrganization.display_name || currentOrganization.name}
              </span>
            )}
          </div>
          <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
        {/* User Information Header */}
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center space-x-3">
            <ProfileAvatar 
              name={user.name} 
              email={user.email} 
              size="lg"
              showOnlineStatus
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">
                {user.name || 'Unbenannter Benutzer'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {roleDisplay && (
                  <Badge variant={roleDisplay.variant} className="text-xs">
                    {roleDisplay.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Organization Section */}
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate">
              {currentOrganization.display_name || currentOrganization.name}
            </span>
          </div>
          
          {hasMultipleOrganizations && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="mt-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                Organisation wechseln...
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                {userOrganizations
                  .filter(membership => membership.organization.id !== currentOrganization.id)
                  .map(membership => (
                    <DropdownMenuItem
                      key={membership.organization.id}
                      onClick={() => handleOrganizationSwitch(membership.organization.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">
                            {membership.organization.display_name || membership.organization.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {roleConfig[membership.role]?.label}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Quick Actions */}
        <DropdownMenuItem asChild>
          <Link 
            href={currentOrganization ? `/org/${currentOrganization.slug}/settings/profile` : "/settings/profile"}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4" />
            <span>Profil bearbeiten</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link 
            href={currentOrganization ? `/org/${currentOrganization.slug}/settings` : "/settings"}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4" />
            <span>Einstellungen</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center space-x-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Abmelden</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}