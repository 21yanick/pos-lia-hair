'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { useOrganizationsQuery } from '@/modules/organization/hooks/useOrganizationsQuery'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import type {
  Organization,
  OrganizationMembership,
  OrganizationRole,
} from '@/shared/types/organizations'

interface CurrentOrganizationReturn {
  // Current state
  currentOrganization: Organization | null
  userRole: OrganizationRole | null
  memberships: OrganizationMembership[]

  // Loading states
  loading: boolean
  error: string | null

  // Utility
  hasAccess: boolean
  isReady: boolean
}

/**
 * URL-Based Organization Selection Hook
 *
 * BEFORE: Complex OrganizationProvider with 15+ useEffect dependencies
 * AFTER:  Simple URL-based selection with React Query caching
 *
 * How it works:
 * 1. Extract organization slug from URL params (/org/[slug]/...)
 * 2. Load user's organization memberships via React Query
 * 3. Find matching organization by slug
 * 4. Return organization + role + access state
 *
 * Benefits:
 * - URL is single source of truth
 * - No complex state management
 * - Automatic caching via React Query
 * - No useEffect loops or race conditions
 */
export function useCurrentOrganization(): CurrentOrganizationReturn {
  // Get organization slug from URL
  const params = useParams()
  const slug = params?.slug as string | undefined

  // Get auth state
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // Load user's organization memberships
  const {
    data: memberships = [],
    isLoading: orgsLoading,
    error: orgsError,
  } = useOrganizationsQuery(isAuthenticated, authLoading)

  // Find current organization by URL slug
  const { currentOrganization, userRole, hasAccess } = useMemo(() => {
    if (!slug || !memberships.length) {
      return {
        currentOrganization: null,
        userRole: null,
        hasAccess: false,
      }
    }

    // Find matching membership by organization slug
    const membership = memberships.find((m) => m.organization.slug === slug)

    if (!membership) {
      return {
        currentOrganization: null,
        userRole: null,
        hasAccess: false,
      }
    }

    return {
      currentOrganization: membership.organization,
      userRole: membership.role,
      hasAccess: true,
    }
  }, [slug, memberships])

  // Combined loading state
  const loading = authLoading || orgsLoading

  // Error handling
  const error = orgsError?.message || null

  // Ready state - auth done, orgs loaded, and organization resolved
  const isReady =
    !loading &&
    isAuthenticated &&
    (!slug || // No slug required (e.g. /organizations page)
      hasAccess) // Has access to the requested organization

  return {
    // Current state
    currentOrganization,
    userRole,
    memberships,

    // Loading states
    loading,
    error,

    // Utility
    hasAccess,
    isReady,
  }
}

/**
 * Simple Organization Switching Hook
 *
 * Replaces complex OrganizationSwitcher with URL-based navigation
 */
export function useOrganizationSwitcher() {
  const { memberships } = useCurrentOrganization()

  const switchToOrganization = (organizationId: string, targetPath = '/dashboard') => {
    const membership = memberships.find((m) => m.organization.id === organizationId)
    if (!membership) {
      throw new Error('Organization not found or no access')
    }

    // Simple navigation - URL update triggers automatic organization change
    const newPath = `/org/${membership.organization.slug}${targetPath}`
    window.location.href = newPath
  }

  const switchToOrganizationBySlug = (slug: string, targetPath = '/dashboard') => {
    const membership = memberships.find((m) => m.organization.slug === slug)
    if (!membership) {
      throw new Error('Organization not found or no access')
    }

    return switchToOrganization(membership.organization.id, targetPath)
  }

  return {
    memberships,
    switchToOrganization,
    switchToOrganizationBySlug,
    hasMultipleOrganizations: memberships.length > 1,
  }
}
