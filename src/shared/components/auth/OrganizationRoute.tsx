'use client'

import React, { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { useOrganization } from '@/modules/organization'

interface OrganizationRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * 🏢 ORGANIZATION ROUTE GUARD
 * 
 * Für organization-spezifische Seiten (/org/[slug]/...).
 * 
 * Verhalten:
 * 1. Wenn USER NOT AUTHENTICATED → Redirect zu /login
 * 2. Wenn USER AUTHENTICATED aber NO ORG ACCESS → Redirect zu /organizations  
 * 3. Wenn USER HAS ORG ACCESS → Zeige Content
 * 
 * Use Cases:
 * - /org/[slug]/dashboard
 * - /org/[slug]/pos
 * - /org/[slug]/settings
 * - etc.
 */
export function OrganizationRoute({ 
  children,
  fallback
}: OrganizationRouteProps) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { userOrganizations, loading: orgLoading, currentOrganization } = useOrganization()
  const router = useRouter()
  const params = useParams()
  
  const slug = params?.slug as string
  
  // Only show loading if:
  // 1. Auth is still loading
  // 2. Organizations are being fetched for the first time
  // 3. We have organizations but none selected yet (while provider is setting it)
  const loading = authLoading || (orgLoading && !userOrganizations)
  
  // Debug state changes
  React.useEffect(() => {
  }, [isAuthenticated, authLoading, orgLoading, userOrganizations, currentOrganization, slug, loading])

  useEffect(() => {
    // Step 1: Check authentication first
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    // Step 2: If authenticated, check organization access
    if (!orgLoading && isAuthenticated && userOrganizations && slug) {
      const hasAccess = userOrganizations.some(
        membership => membership.organization.slug === slug
      )
      
      if (!hasAccess) {
        router.push('/organizations')
        return
      }
    }
  }, [
    isAuthenticated, 
    authLoading, 
    orgLoading, 
    userOrganizations, 
    slug, 
    router
  ])

  // Show loading while checking auth + org access
  if (loading) {
    const loadingInfo = {
      authLoading,
      orgLoading,
      userOrganizations: !!userOrganizations,
      reason: authLoading ? 'auth' : (orgLoading && !userOrganizations ? 'org' : 'unknown')
    }
  
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Organisation wird geladen...</span>
        </div>
      </div>
    )
  }

  // Show content if:
  // 1. User is authenticated
  // 2. We have organizations loaded
  // 3. Current organization matches the URL slug OR organization is being set
  if (isAuthenticated && userOrganizations && slug) {
    const hasAccess = userOrganizations.some(
      membership => membership.organization.slug === slug
    )
      
    // If user has access and either:
    // - Organization is already set correctly
    // - Organization is being set (provider will handle it)
    if (hasAccess) {
      if (currentOrganization?.slug === slug || !currentOrganization) {
        return <>{children}</>
      }
    }
  }

  // Will redirect via useEffect
  return null
}