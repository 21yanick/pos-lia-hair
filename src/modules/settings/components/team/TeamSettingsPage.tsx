'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  User, 
  Mail
} from 'lucide-react'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useOrganizationPermissions } from '@/shared/hooks/auth/useOrganizationPermissions'
import { SettingsHeader } from '@/shared/components/settings/SettingsHeader'
import { InviteMemberDialog } from './InviteMemberDialog'
import { TeamMembersList } from './TeamMembersList'

export function TeamSettingsPage() {
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const { currentOrganization, memberships } = useCurrentOrganization()
  const { can, role, isAdmin, isOwner } = useOrganizationPermissions()

  // Permission check - only admins and owners can manage team
  const canManageTeam = can('settings.manage_users') || isAdmin || isOwner

  if (!currentOrganization) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-full overflow-hidden">
        <div className="text-center text-muted-foreground">
          Organisation wird geladen...
        </div>
      </div>
    )
  }

  if (!canManageTeam) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
        <SettingsHeader
          title="Team Verwaltung"
          description="Team-Mitglieder und Berechtigungen verwalten"
        />
        
        <Card className="border-l-4 border-l-destructive">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-destructive" />
              <CardTitle>Keine Berechtigung</CardTitle>
            </div>
            <CardDescription>
              Sie haben keine Berechtigung zur Team-Verwaltung. Kontaktieren Sie einen Administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <SettingsHeader
        title="Team Verwaltung"
        description={`Team-Mitglieder und Berechtigungen für ${currentOrganization.name} verwalten`}
      />

      {/* Team Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Mitglieder
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberships?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aktive Mitglieder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rollen Verteilung
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              {memberships?.filter(m => m.role === 'owner').length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  {memberships.filter(m => m.role === 'owner').length}
                </Badge>
              )}
              {memberships?.filter(m => m.role === 'admin').length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {memberships.filter(m => m.role === 'admin').length}
                </Badge>
              )}
              {memberships?.filter(m => m.role === 'staff').length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {memberships.filter(m => m.role === 'staff').length}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktionen
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Team-Mitglieder verwalten und neue Mitglieder einladen
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Team Mitglieder</CardTitle>
            </div>
            <Button 
              onClick={() => setShowInviteDialog(true)}
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Mitglied einladen
            </Button>
          </div>
          <CardDescription>
            Alle aktiven Team-Mitglieder und ihre Rollen
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <TeamMembersList />
        </CardContent>
      </Card>


      {/* Invite Member Dialog */}
      <InviteMemberDialog 
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  )
}