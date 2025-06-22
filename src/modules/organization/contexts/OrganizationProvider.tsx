'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOrganizationStore } from '../hooks/useOrganizationStore'
import { useOrganizationsQuery } from '../hooks/useOrganizationsQuery'
import { useOrganizationNavigation } from '../hooks/useOrganizationNavigation'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { supabase } from '@/shared/lib/supabase/client'
import { organizationPersistence } from '@/shared/services/organizationPersistence'
import { pdfReturnHandler } from '@/shared/utils/pdfReturnHandler'

interface OrganizationProviderProps {
  children: React.ReactNode
}

/**
 * SIMPLIFIED ORGANIZATION PROVIDER
 * Reduces race conditions by separating concerns
 */
export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { setOrganization, clearOrganization, currentOrganization } = useOrganizationStore()
  const { data: memberships, isLoading } = useOrganizationsQuery(isAuthenticated, authLoading)
  const { currentSlug, navigateToOrganization } = useOrganizationNavigation()
  
  // Initialize PDF return handler
  useEffect(() => {
    pdfReturnHandler.initialize()
  }, [])
  
  // Handle auth state changes (separate effect)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearOrganization()
        organizationPersistence.clear()
      }
    })
    
    return () => subscription.unsubscribe()
  }, [clearOrganization])
  
  // Save organization when it changes (separate effect)
  useEffect(() => {
    if (currentOrganization) {
      organizationPersistence.save(currentOrganization.id, currentOrganization.slug)
    }
  }, [currentOrganization])
  
  // URL-based organization selection (separate effect, only when URL changes)
  useEffect(() => {
    if (!isAuthenticated || authLoading || isLoading || !memberships || !currentSlug) {
      return
    }
    
    // Skip organization create page
    if (pathname === '/organizations/create') {
      return
    }
    
    // Only update if URL slug differs from current organization
    if (currentOrganization?.slug !== currentSlug) {
      const membership = memberships.find(m => m.organization.slug === currentSlug)
      if (membership) {
        setOrganization(membership.organization, membership.role)
      } else {
        // Invalid slug
        router.push('/organizations')
      }
    }
  }, [currentSlug, pathname, isAuthenticated, authLoading, isLoading, memberships]) // Removed currentOrganization to prevent loops
  
  // Initial organization setup (separate effect, only when no slug in URL)
  useEffect(() => {
    if (!isAuthenticated || authLoading || isLoading || !memberships || currentSlug) {
      return // Skip if URL has slug (handled by URL effect above)
    }
    
    // If we have organization but no URL slug, navigate to it
    if (currentOrganization && pathname !== '/organizations') {
      navigateToOrganization(currentOrganization.slug)
      return
    }
    
    // No current organization - try to restore from persistence
    if (!currentOrganization) {
      // First check for PDF return restoration
      const pdfRestored = sessionStorage.getItem('restored_organization')
      if (pdfRestored) {
        try {
          const orgData = JSON.parse(pdfRestored)
          const membership = memberships.find(m => m.organization.id === orgData.id)
          if (membership) {
            setOrganization(membership.organization, membership.role)
            sessionStorage.removeItem('restored_organization')
            return
          }
        } catch (error) {
          console.error('Failed to restore from PDF return:', error)
        }
      }
      
      // Try normal persistence
      const persisted = organizationPersistence.load()
      if (persisted) {
        const membership = memberships.find(m => m.organization.id === persisted.id)
        if (membership) {
          setOrganization(membership.organization, membership.role)
          navigateToOrganization(membership.organization.slug)
          return
        }
      }
      
      // Auto-select single organization
      if (memberships.length === 1) {
        const { organization, role } = memberships[0]
        setOrganization(organization, role)
        navigateToOrganization(organization.slug)
      } else if (memberships.length > 1 && pathname === '/') {
        router.push('/organizations')
      }
    }
  }, [isAuthenticated, authLoading, isLoading, memberships, currentSlug, pathname]) // Excluded currentOrganization and navigation functions
  
  return <>{children}</>
}