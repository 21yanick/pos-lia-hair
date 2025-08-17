'use client'

import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Crown, Mail, MoreVertical, Shield, User, UserMinus, Users } from 'lucide-react'
import { useState } from 'react'
import { type TeamMember, useTeamMembersQuery } from '@/modules/settings/hooks/useTeamMembersQuery'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useOrganizationPermissions } from '@/shared/hooks/auth/useOrganizationPermissions'

type Role = 'owner' | 'admin' | 'staff'

const ROLE_CONFIG = {
  owner: {
    label: 'Inhaber',
    icon: Crown,
    variant: 'destructive',
    description: 'Vollzugriff',
  },
  admin: {
    label: 'Administrator',
    icon: Shield,
    variant: 'secondary',
    description: 'Business-Funktionen',
  },
  staff: {
    label: 'Mitarbeiter',
    icon: User,
    variant: 'default',
    description: 'Grundfunktionen',
  },
} as const

export function TeamMembersList() {
  const [memberToRemove, setMemberToRemove] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { currentOrganization } = useCurrentOrganization()
  const { user } = useAuth()
  const { role: userRole } = useOrganizationPermissions()

  // Load team members with user details
  const { data: teamMembers = [], isLoading: teamLoading, error } = useTeamMembersQuery()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const canManageMember = (member: TeamMember) => {
    // Can't manage yourself
    if (member.user_id === user?.id) return false

    // Owner can manage everyone except other owners
    if (userRole === 'owner' && member.role !== 'owner') return true

    // Admin can manage staff only
    if (userRole === 'admin' && member.role === 'staff') return true

    return false
  }

  const handleRemoveMember = async (member: TeamMember) => {
    if (!currentOrganization) return

    setIsLoading(true)

    try {
      // TODO: Implement remove member API call
      const response = await fetch(
        `/api/organizations/${currentOrganization.id}/members/${member.user_id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        // Refresh the page or update local state
        window.location.reload()
      } else {
        console.error('Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
    } finally {
      setIsLoading(false)
      setMemberToRemove(null)
    }
  }

  const handleChangeRole = async (member: TeamMember, newRole: Role) => {
    if (!currentOrganization) return

    try {
      // TODO: Implement change role API call
      const response = await fetch(
        `/api/organizations/${currentOrganization.id}/members/${member.user_id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        }
      )

      if (response.ok) {
        // Refresh the page or update local state
        window.location.reload()
      } else {
        console.error('Failed to change role')
      }
    } catch (error) {
      console.error('Error changing role:', error)
    }
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Noch keine Team-Mitglieder</p>
        <p className="text-sm">Laden Sie Ihr erstes Team-Mitglied ein!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 w-full max-w-full overflow-hidden">
        {teamMembers.map((member) => {
          const roleConfig = ROLE_CONFIG[member.role]
          const RoleIcon = roleConfig.icon
          const canManage = canManageMember(member)
          const isCurrentUser = member.user_id === user?.id

          return (
            <Card key={member.id} className="w-full max-w-full overflow-hidden">
              <CardContent className="p-4 w-full max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 w-full max-w-full overflow-hidden">
                  {/* Member Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 max-w-full overflow-hidden">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="text-sm">
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1 min-w-0 max-w-full overflow-hidden">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        <span
                          className="break-words"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {member.user.name}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            Sie
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 max-w-full overflow-hidden">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span
                          className="break-words min-w-0"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {member.user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role, Status & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-shrink-0 min-w-0">
                    {/* Role and Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={roleConfig.variant as any}
                        className="flex items-center gap-1 text-xs flex-shrink-0"
                      >
                        <RoleIcon className="h-3 w-3" />
                        {roleConfig.label}
                      </Badge>
                      <Badge
                        variant={member.active ? 'default' : 'secondary'}
                        className="text-xs flex-shrink-0"
                      >
                        {member.active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>

                    {/* Join Date and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {format(new Date(member.joined_at), 'dd.MM.yyyy', { locale: de })}
                      </div>

                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member, 'admin')}
                              disabled={member.role === 'admin'}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Zu Administrator machen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member, 'staff')}
                              disabled={member.role === 'staff'}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Zu Mitarbeiter machen
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setMemberToRemove(member)}
                              className="text-destructive"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Aus Team entfernen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitglied entfernen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie <strong>{memberToRemove?.user?.name}</strong> aus dem Team
              entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Wird entfernt...' : 'Entfernen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
