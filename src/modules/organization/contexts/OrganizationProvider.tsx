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
    // Skip if auth is loading or user not authenticated
    if (authLoading || !isAuthenticated) {
      return
    }
    
    // Skip if organizations are loading
    if (isLoading) {
      return
    }
    
    // Skip if error (Auth Guards will handle error states)
    if (error) {
      return
    }
    
    // Skip if no data
    if (!memberships) {
      return
    }
    
    // Don't auto-navigate if user is already on create page
    // This prevents hot reload loops during development
    if (pathname === '/organizations/create') {
      return
    }
    
    // Case 1: URL has slug (org-specific page)
    if (currentSlug) {
      const membership = memberships.find(m => m.organization.slug === currentSlug)
      
      if (membership) {
        setOrganization(membership.organization, membership.role)
      } else {
        router.push('/organizations')
      }
      return
    }
    
    // Case 2: No URL slug, decide where to navigate
    if (pathname === '/') {
      // Only auto-redirect from root page
      if (memberships.length === 1) {
        navigateToOrganization(memberships[0].organization.slug)
      } else {
        router.push('/organizations')
      }
    } else if (pathname === '/organizations') {
      // On /organizations page, only auto-navigate if single org
      if (memberships.length === 1) {
        navigateToOrganization(memberships[0].organization.slug)
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
      if (event === 'SIGNED_OUT') {
        clearOrganization()
      }
    })
    
    return () => subscription.unsubscribe()
  }, [clearOrganization])
  
  // Simple pass-through - Auth Guards handle loading/error states
  return <>{children}</>
}