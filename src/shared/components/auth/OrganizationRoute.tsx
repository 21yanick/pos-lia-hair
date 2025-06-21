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
  const { userOrganizations, loading: orgLoading } = useOrganization()
  const router = useRouter()
  const params = useParams()
  
  const slug = params?.slug as string
  const loading = authLoading || orgLoading

  useEffect(() => {
    console.log('🏢 ORG ROUTE - Check:', { 
      isAuthenticated, 
      authLoading, 
      orgLoading, 
      slug,
      orgsCount: userOrganizations?.length 
    })
    
    // Step 1: Check authentication first
    if (!authLoading && !isAuthenticated) {
      console.log('🏢 ORG ROUTE - Not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    // Step 2: If authenticated, check organization access
    if (!orgLoading && isAuthenticated && userOrganizations && slug) {
      const hasAccess = userOrganizations.some(
        membership => membership.organization.slug === slug
      )
      
      if (!hasAccess) {
        console.log('🏢 ORG ROUTE - No access to org:', slug, 'redirecting to /organizations')
        router.push('/organizations')
        return
      }
      
      console.log('🏢 ORG ROUTE - Access granted to org:', slug)
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
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Organisation wird geladen...</span>
        </div>
      </div>
    )
  }

  // Show content only if all checks pass
  if (isAuthenticated && userOrganizations && slug) {
    const hasAccess = userOrganizations.some(
      membership => membership.organization.slug === slug
    )
    
    if (hasAccess) {
      console.log('🏢 ORG ROUTE - Rendering org content for:', slug)
      return <>{children}</>
    }
  }

  // Will redirect via useEffect
  return null
}