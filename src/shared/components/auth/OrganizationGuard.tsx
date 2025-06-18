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

  // Access Validation ONLY (OrganizationContext handles all state management)
  useEffect(() => {
    if (authLoading || orgLoading || !isAuthenticated) return

    console.log('🛡️ ORG GUARD - Access validation. urlSlug:', urlSlug, 'currentOrg:', currentOrganization?.slug, 'userOrgs:', userOrganizations.length)

    // Only validate access, don't manipulate state
    if (urlSlug && userOrganizations.length > 0) {
      const hasAccess = userOrganizations.some(org => org.organization.slug === urlSlug)
      if (!hasAccess) {
        console.log('🛡️ ORG GUARD - ACCESS DENIED to', urlSlug, '- redirecting to /organizations')
        router.push('/organizations')
        return
      }
    }

    // Redirect to create if user has no organizations at all
    if (requireOrganization && userOrganizations.length === 0) {
      console.log('🛡️ ORG GUARD - No organizations, redirecting to create')
      router.push('/organizations/create')
      return
    }
  }, [authLoading, orgLoading, isAuthenticated, urlSlug, userOrganizations, requireOrganization, router])

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
    console.log('🔄 SWITCHER START:', organizationId, 'targetPath:', targetPath)
    const targetOrg = userOrganizations.find(org => org.organization.id === organizationId)
    if (!targetOrg) {
      console.log('❌ SWITCHER - Organization not found:', organizationId)
      throw new Error('Organization not found')
    }

    console.log('🔄 SWITCHER - Target org:', targetOrg.organization.name, targetOrg.organization.slug)
    
    // Context switchOrganization already handles router.push to /dashboard
    // Only override if targetPath is different from /dashboard
    if (targetPath && targetPath !== '/dashboard') {
      console.log('🔄 SWITCHER - Custom path, doing context switch first then custom navigation')
      await switchOrganization(organizationId)
      const customPath = `/org/${targetOrg.organization.slug}${targetPath}`
      console.log('🔄 SWITCHER - Custom router push:', customPath)
      router.push(customPath)
    } else {
      console.log('🔄 SWITCHER - Default path, letting context handle router.push')
      await switchOrganization(organizationId)
    }
    
    console.log('🔄 SWITCHER END')
  }

  const switchToOrganizationBySlug = async (slug: string, targetPath?: string) => {
    console.log('🔄 SWITCHER BY SLUG START:', slug, 'targetPath:', targetPath)
    const targetOrg = userOrganizations.find(org => org.organization.slug === slug)
    if (!targetOrg) {
      console.log('❌ SWITCHER BY SLUG - Organization not found:', slug)
      throw new Error('Organization not found')
    }

    console.log('🔄 SWITCHER BY SLUG - Found org:', targetOrg.organization.name, targetOrg.organization.id)
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