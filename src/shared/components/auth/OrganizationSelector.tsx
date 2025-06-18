'use client'

import React, { useState } from 'react'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
import { useOrganizationSwitcher } from './OrganizationGuard'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { 
  Building2, 
  Users, 
  Plus, 
  Crown, 
  Shield, 
  User,
  ArrowRight,
  AlertTriangle 
} from 'lucide-react'
import { OrganizationRole } from '@/shared/types/organizations'

interface OrganizationSelectorProps {
  title?: string
  description?: string
  showCreateButton?: boolean
  onCreateNew?: () => void
}

/**
 * Organization Selector Component
 * Displays available organizations for user to choose from
 */
export function OrganizationSelector({
  title = "Organisation auswählen",
  description = "Wählen Sie eine Organisation aus, um fortzufahren.",
  showCreateButton = true,
  onCreateNew,
}: OrganizationSelectorProps) {
  const { userOrganizations, loading, error } = useOrganization()
  const { switchToOrganization } = useOrganizationSwitcher()
  const [switching, setSwitching] = useState<string | null>(null)

  const handleSwitchOrganization = async (organizationId: string) => {
    try {
      console.log('📋 ORG SELECTOR - Switch requested:', organizationId)
      setSwitching(organizationId)
      await switchToOrganization(organizationId)
      console.log('📋 ORG SELECTOR - Switch completed')
    } catch (err) {
      console.error('❌ ORG SELECTOR - Error switching organization:', err)
    } finally {
      setSwitching(null)
    }
  }

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew()
    } else {
      // Default behavior - navigate to create organization page
      window.location.href = '/organizations/create'
    }
  }

  if (loading) {
    return <OrganizationSelectorSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => window.location.reload()}
            >
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      {userOrganizations.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Organisationen gefunden</h3>
          <p className="text-muted-foreground mb-6">
            Sie sind noch keiner Organisation zugeordnet. Erstellen Sie eine neue Organisation, um zu beginnen.
          </p>
          {showCreateButton && (
            <Button onClick={handleCreateNew} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Neue Organisation erstellen
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {userOrganizations.map(({ organization, role }) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                role={role}
                isLoading={switching === organization.id}
                onSelect={() => handleSwitchOrganization(organization.id)}
              />
            ))}
          </div>

          {showCreateButton && (
            <div className="text-center">
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-semibold mb-2">Neue Organisation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Erstellen Sie eine neue Organisation für Ihr Unternehmen.
                    </p>
                    <Button variant="outline" onClick={handleCreateNew}>
                      Organisation erstellen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Organization Card Component
 */
interface OrganizationCardProps {
  organization: any // From DB join, structure might be nested
  role: OrganizationRole
  isLoading?: boolean
  onSelect: () => void
}

function OrganizationCard({ organization, role, isLoading, onSelect }: OrganizationCardProps) {
  const getRoleIcon = (role: OrganizationRole) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4" />
      case 'admin': return <Shield className="h-4 w-4" />
      case 'staff': return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: OrganizationRole) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'staff': return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getRoleLabel = (role: OrganizationRole) => {
    switch (role) {
      case 'owner': return 'Inhaber'
      case 'admin': return 'Administrator'
      case 'staff': return 'Mitarbeiter'
    }
  }

  const orgName = organization.name || organization.display_name || 'Unbenannte Organisation'
  const orgInitials = orgName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onSelect}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {orgInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg leading-tight">{orgName}</CardTitle>
              {organization.city && (
                <CardDescription className="mt-1">
                  {organization.city}
                </CardDescription>
              )}
            </div>
          </div>
          <Badge variant="outline" className={getRoleColor(role)}>
            <span className="flex items-center gap-1">
              {getRoleIcon(role)}
              {getRoleLabel(role)}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          {organization.address && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="truncate">{organization.address}</span>
            </div>
          )}
          {organization.email && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="truncate">{organization.email}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Wechsle...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Auswählen
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Loading skeleton for organization selector
 */
function OrganizationSelectorSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="text-center mb-8">
        <Skeleton className="h-9 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-4">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}