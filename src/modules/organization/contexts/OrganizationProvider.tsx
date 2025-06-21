'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOrganizationStore } from '../hooks/useOrganizationStore'
import { useOrganizationsQuery } from '../hooks/useOrganizationsQuery'
import { useOrganizationNavigation } from '../hooks/useOrganizationNavigation'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { supabase } from '@/shared/lib/supabase/client'

interface OrganizationProviderProps {
  children: React.ReactNode
}

/**
 * 🏢 SIMPLIFIED ORGANIZATION PROVIDER - CLIENT-SIDE AUTH ARCHITECTURE
 * 
 * Was dieser Provider MACHT:
 * - Organization State Management
 * - Organization Selection Logic
 * - Auto-navigation zwischen Organizations
 * 
 * Was dieser Provider NICHT MEHR macht:
 * - Auth Redirects (handled by Auth Guards)
 * - Error Pages (handled by Auth Guards)
 * - Loading States für Full Page (handled by Auth Guards)
 * 
 * RESULTAT: Viel sauberer, einfacher, keine Race Conditions.
 */
export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { setOrganization, clearOrganization } = useOrganizationStore()
  const { data: memberships, isLoading, error } = useOrganizationsQuery(isAuthenticated, authLoading)
  const { currentSlug, navigateToOrganization, navigateToOrganizationSelection } = useOrganizationNavigation()
  
  // 🏢 ORGANIZATION LOGIC - Only runs if authenticated
  useEffect(() => {
    console.log('🏢 ORG PROVIDER - State:', {
      isAuthenticated,
      authLoading,
      isLoading,
      membershipsCount: memberships?.length,
      currentSlug,
      pathname
    })

    // Skip if auth is loading or user not authenticated
    if (authLoading || !isAuthenticated) {
      console.log('🏢 ORG PROVIDER - Skipping (auth loading or not authenticated)')
      return
    }
    
    // Skip if organizations are loading
    if (isLoading) {
      console.log('🏢 ORG PROVIDER - Loading organizations...')
      return
    }
    
    // Skip if error (Auth Guards will handle error states)
    if (error) {
      console.log('🏢 ORG PROVIDER - Error loading organizations:', error.message)
      return
    }
    
    // Skip if no data
    if (!memberships) {
      console.log('🏢 ORG PROVIDER - No memberships data')
      return
    }
    
    console.log('🏢 ORG PROVIDER - Processing org logic...')
    
    // Don't auto-navigate if user is already on create page
    // This prevents hot reload loops during development
    if (pathname === '/organizations/create') {
      console.log('🏢 ORG PROVIDER - Already on create page, not redirecting')
      return
    }
    
    // Case 1: URL has slug (org-specific page)
    if (currentSlug) {
      const membership = memberships.find(m => m.organization.slug === currentSlug)
      
      if (membership) {
        console.log('🏢 ORG PROVIDER - Setting organization:', membership.organization.name)
        setOrganization(membership.organization, membership.role)
      } else {
        console.log('🏢 ORG PROVIDER - Invalid slug, redirecting to selection')
        router.push('/organizations')
      }
      return
    }
    
    // Case 2: No URL slug, decide where to navigate
    if (pathname === '/') {
      // Only auto-redirect from root page
      if (memberships.length === 1) {
        console.log('🏢 ORG PROVIDER - Single org, auto-navigating from root')
        navigateToOrganization(memberships[0].organization.slug)
      } else {
        console.log('🏢 ORG PROVIDER - Multiple or no orgs, going to selection')
        router.push('/organizations')
      }
    } else if (pathname === '/organizations') {
      // On /organizations page, only auto-navigate if single org
      if (memberships.length === 1) {
        console.log('🏢 ORG PROVIDER - Single org, auto-navigating from organizations to:', memberships[0].organization.slug)
        navigateToOrganization(memberships[0].organization.slug)
      } else if (memberships.length === 0) {
        console.log('🏢 ORG PROVIDER - No organizations, should show create option')
      } else {
        console.log('🏢 ORG PROVIDER - Multiple orgs, staying on selection page')
      }
      // For 0 or multiple orgs: stay on /organizations (let user choose)
    }
  }, [
    isAuthenticated,
    authLoading,
    currentSlug,
    memberships,
    isLoading,
    error,
    pathname,
    setOrganization,
    router,
    navigateToOrganization
  ])
  
  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('🏢 ORG PROVIDER - Auth state change:', event)
      
      if (event === 'SIGNED_OUT') {
        clearOrganization()
      }
    })
    
    return () => subscription.unsubscribe()
  }, [clearOrganization])
  
  // Simple pass-through - Auth Guards handle loading/error states
  return <>{children}</>
}