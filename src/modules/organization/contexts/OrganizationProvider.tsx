'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOrganizationStore } from '../hooks/useOrganizationStore'
import { useOrganizationsQuery } from '../hooks/useOrganizationsQuery'
import { useOrganizationNavigation } from '../hooks/useOrganizationNavigation'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { supabase } from '@/shared/lib/supabase/client'
import { organizationPersistence } from '@/shared/services/organizationPersistence'

interface OrganizationProviderProps {
  children: React.ReactNode
}

/**
 * FIXED ORGANIZATION PROVIDER
 * 
 * Klare Trennung der Verantwortlichkeiten:
 * 1. Organization Selection aus URL
 * 2. State Persistence
 * 3. Navigation Logic
 */
export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { setOrganization, clearOrganization, currentOrganization } = useOrganizationStore()
  const { data: memberships, isLoading } = useOrganizationsQuery(isAuthenticated, authLoading)
  const { currentSlug, navigateToOrganization } = useOrganizationNavigation()
  
  // Save organization state when it changes
  useEffect(() => {
    if (currentOrganization) {
      console.log('[OrganizationProvider] Saving organization:', currentOrganization.slug)
      organizationPersistence.save(currentOrganization.id, currentOrganization.slug)
    }
  }, [currentOrganization])
  
  // Main organization selection logic
  useEffect(() => {
    // Skip if still loading
    if (authLoading || !isAuthenticated || isLoading || !memberships) {
      return
    }
    
    // Special case: organization create page
    if (pathname === '/organizations/create') {
      return
    }
    
    // PRIORITY 1: URL has organization slug
    if (currentSlug) {
      // Check if we need to set/update the organization
      if (currentOrganization?.slug !== currentSlug) {
        const membership = memberships.find(m => m.organization.slug === currentSlug)
        if (membership) {
          console.log('[OrganizationProvider] Setting organization from URL:', currentSlug)
          setOrganization(membership.organization, membership.role)
        } else {
          // Invalid slug - redirect to selection
          console.log('[OrganizationProvider] Invalid slug, redirecting to /organizations')
          router.push('/organizations')
        }
      }
      return
    }
    
    // PRIORITY 2: No URL slug - need to handle navigation
    
    // If we already have an organization selected, navigate to it
    if (currentOrganization) {
      console.log('[OrganizationProvider] Navigating to current organization:', currentOrganization.slug)
      navigateToOrganization(currentOrganization.slug)
      return
    }
    
    // No organization selected - try to restore from persistence
    const persisted = organizationPersistence.load()
    if (persisted) {
      const membership = memberships.find(m => m.organization.id === persisted.id)
      if (membership) {
        console.log('[OrganizationProvider] Restored from persistence:', membership.organization.slug)
        setOrganization(membership.organization, membership.role)
        navigateToOrganization(membership.organization.slug)
        return
      }
    }
    
    // No persistence or invalid - handle auto-selection
    if (memberships.length === 1) {
      // Single organization - auto select and navigate
      const { organization, role } = memberships[0]
      console.log('[OrganizationProvider] Auto-selecting single organization:', organization.slug)
      setOrganization(organization, role)
      navigateToOrganization(organization.slug)
    } else if (memberships.length > 1 && pathname === '/') {
      // Multiple organizations and on root - go to selection
      console.log('[OrganizationProvider] Multiple organizations, redirecting to selection')
      router.push('/organizations')
    }
    // If already on /organizations, let user choose
  }, [
    // Dependencies
    authLoading,
    isAuthenticated,
    isLoading,
    memberships,
    currentSlug,
    currentOrganization,
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
        organizationPersistence.clear()
      }
    })
    
    return () => subscription.unsubscribe()
  }, [clearOrganization])
  
  return <>{children}</>
}