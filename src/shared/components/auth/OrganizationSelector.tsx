'use client'

import React, { useState, useEffect } from 'react'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { organizationPersistence } from '@/shared/services/organizationPersistence'

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
  const { memberships, loading, error } = useCurrentOrganization()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [switching, setSwitching] = useState<string | null>(null)
  
  // Check for returnTo parameter to determine destination after selection
  const returnTo = searchParams.get('returnTo')

  // Simple organization switching - URL-based (PLANNED APPROACH)
  const handleSwitchOrganization = (orgSlug: string) => {
    setSwitching(orgSlug)
    
    // Save organization to persistence for PWA shortcuts
    const membership = memberships.find(m => m.organization.slug === orgSlug)
    if (membership) {
      organizationPersistence.save(membership.organization.id, orgSlug)
    }
    
    // Navigate to returnTo destination or default to dashboard
    const destination = returnTo 
      ? `/org/${orgSlug}/${returnTo}` 
      : `/org/${orgSlug}/dashboard`
    
    router.push(destination)
  }

  // Auto-redirect is now handled by OrganizationContext for better performance
  // This component is now a pure display component

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew()
    } else {
      // Default behavior - navigate to create organization page
      window.location.href = '/organizations/create'
    }
  }

  // Show loading skeleton while loading organizations
  if (loading && memberships.length !== 1) {
    return <OrganizationSelectorSkeleton />
  }
  
  // Show loading skeleton only when explicitly switching (clicking a card)
  if (switching) {
    return <OrganizationSelectorSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div>{error}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Erneut versuchen
                </Button>
                <span className="text-sm">oder</span>
                <a href="/login" className="text-sm text-primary hover:underline">
                  Anmelden
                </a>
              </div>
            </div>
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

      {memberships.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Organisationen gefunden</h3>
          <p className="text-muted-foreground mb-6">
            Sie sind noch keiner Organisation zugeordnet. Erstellen Sie eine neue Organisation, um zu beginnen.
          </p>
          <div className="space-y-4">
            {showCreateButton && (
              <Button onClick={handleCreateNew} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Neue Organisation erstellen
              </Button>
            )}
            <div className="text-sm text-muted-foreground">
              Noch nicht angemeldet?{" "}
              <a href="/login" className="text-primary hover:underline font-medium">
                Hier anmelden
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {memberships.map(({ organization, role }) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                role={role}
                isLoading={switching === organization.slug}
                onSelect={() => handleSwitchOrganization(organization.slug)}
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
                      Erstelle eine neue Organisation für dein Unternehmen.
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