'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { AlertTriangle, Building2 } from 'lucide-react'

interface OrganizationGuardProps {
  children: React.ReactNode
  slug?: string
  requireOrganization?: boolean
  fallback?: React.ReactNode
}

/**
 * Organization Guard Component
 * Ensures user has access to the requested organization
 */
export function OrganizationGuard({
  children,
  slug,
  requireOrganization = true,
  fallback,
}: OrganizationGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const {
    currentOrganization,
    userOrganizations,
    loading: orgLoading,
    error,
    switchOrganization,
  } = useOrganization()

  // Extract slug from URL if not provided
  const urlSlug = slug || pathname.match(/^\/org\/([^\/]+)/)?.[1]

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Handle organization selection/validation
  useEffect(() => {
    if (authLoading || orgLoading || !isAuthenticated) return

    // If we have a slug in URL but no current organization, try to switch to it
    if (urlSlug && !currentOrganization) {
      const targetOrg = userOrganizations.find(org => org.organization.slug === urlSlug)
      if (targetOrg) {
        switchOrganization(targetOrg.organization.id)
        return
      }
    }

    // If slug doesn't match current organization, switch to it
    if (urlSlug && currentOrganization && currentOrganization.slug !== urlSlug) {
      const targetOrg = userOrganizations.find(org => org.organization.slug === urlSlug)
      if (targetOrg) {
        switchOrganization(targetOrg.organization.id)
        return
      } else {
        // Invalid slug - redirect to organization selector
        router.push('/organizations')
        return
      }
    }

    // If no organization selected and required, redirect to selector
    if (requireOrganization && !currentOrganization && userOrganizations.length > 1) {
      router.push('/organizations')
      return
    }

    // If user has only one organization, auto-select it
    if (requireOrganization && !currentOrganization && userOrganizations.length === 1) {
      const org = userOrganizations[0]
      switchOrganization(org.organization.id)
      return
    }

    // If no organizations at all, redirect to create organization
    if (requireOrganization && userOrganizations.length === 0) {
      router.push('/organizations/create')
      return
    }
  }, [
    authLoading,
    orgLoading,
    isAuthenticated,
    urlSlug,
    currentOrganization,
    userOrganizations,
    requireOrganization,
    switchOrganization,
    router,
  ])

  // Show loading state
  if (authLoading || orgLoading) {
    return fallback || <OrganizationGuardSkeleton />
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
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

  // Not authenticated
  if (!isAuthenticated) {
    return fallback || <div>Umleitung zur Anmeldung...</div>
  }

  // Organization required but not selected
  if (requireOrganization && !currentOrganization) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            Organisation wird geladen oder ausgewählt...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // All checks passed - render children
  return <>{children}</>
}

/**
 * Loading skeleton for organization guard
 */
function OrganizationGuardSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-[300px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Organization Route Guard Hook
 * For use in page components to ensure proper organization context
 */
export function useOrganizationRoute() {
  const router = useRouter()
  const pathname = usePathname()
  const { currentOrganization, userOrganizations } = useOrganization()

  // Get current org slug from URL
  const getCurrentSlug = () => {
    return pathname.match(/^\/org\/([^\/]+)/)?.[1] || null
  }

  // Navigate to organization-specific route
  const navigateToOrg = (orgSlug: string, path: string = '/dashboard') => {
    router.push(`/org/${orgSlug}${path}`)
  }

  // Navigate within current organization
  const navigateWithinOrg = (path: string) => {
    if (!currentOrganization) {
      throw new Error('No current organization')
    }
    navigateToOrg(currentOrganization.slug, path)
  }

  // Check if user can access organization by slug
  const canAccessOrganization = (slug: string) => {
    return userOrganizations.some(org => org.organization.slug === slug)
  }

  return {
    currentSlug: getCurrentSlug(),
    navigateToOrg,
    navigateWithinOrg,
    canAccessOrganization,
    currentOrganization,
    userOrganizations,
  }
}

/**
 * Organization Switcher Hook
 * For navigation and organization switching
 */
export function useOrganizationSwitcher() {
  const router = useRouter()
  const { currentOrganization, userOrganizations, switchOrganization } = useOrganization()

  const switchToOrganization = async (organizationId: string, targetPath?: string) => {
    const targetOrg = userOrganizations.find(org => org.organization.id === organizationId)
    if (!targetOrg) {
      throw new Error('Organization not found')
    }

    await switchOrganization(organizationId)
    
    const path = targetPath || '/dashboard'
    router.push(`/org/${targetOrg.organization.slug}${path}`)
  }

  const switchToOrganizationBySlug = async (slug: string, targetPath?: string) => {
    const targetOrg = userOrganizations.find(org => org.organization.slug === slug)
    if (!targetOrg) {
      throw new Error('Organization not found')
    }

    await switchToOrganization(targetOrg.organization.id, targetPath)
  }

  return {
    currentOrganization,
    userOrganizations,
    switchToOrganization,
    switchToOrganizationBySlug,
    hasMultipleOrganizations: userOrganizations.length > 1,
  }
}