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
import { debugLogger } from '@/shared/utils/debugLogger'
import { remoteDebugger } from '@/shared/utils/remoteDebug'

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
  
  // Debug state changes
  React.useEffect(() => {
    const state = {
      isAuthenticated,
      authLoading,
      isLoading,
      currentSlug,
      currentOrganization: currentOrganization?.slug,
      membershipsCount: memberships?.length,
      pathname
    }
    debugLogger.trackState('OrganizationProvider', state)
    remoteDebugger.log('OrganizationProvider', 'STATE_CHANGE', state)
  }, [isAuthenticated, authLoading, isLoading, currentSlug, currentOrganization, memberships, pathname])
  
  // Initialize PDF return handler FIRST (before any other effects)
  useEffect(() => {
    remoteDebugger.log('OrganizationProvider', 'MOUNT', 'Initializing PDF return handler')
    // Run PDF return check immediately on mount
    const wasRestored = pdfReturnHandler.checkAndRestore()
    remoteDebugger.log('OrganizationProvider', 'PDF_RETURN_CHECK', { wasRestored })
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
  
  // PDF Return restoration (highest priority)
  useEffect(() => {
    debugLogger.log('OrganizationProvider', 'PDF_RESTORE_EFFECT', {
      isAuthenticated,
      authLoading,
      isLoading,
      membershipsCount: memberships?.length
    })
    
    if (!isAuthenticated || authLoading || isLoading || !memberships) {
      debugLogger.log('OrganizationProvider', 'PDF_RESTORE_SKIP', 'Not ready yet')
      return
    }
    
    // Check for PDF return flag
    const pdfRestoreFlag = sessionStorage.getItem('pdf_restore_flag')
    const pdfRestoreOrg = sessionStorage.getItem('pdf_restore_organization')
    
    debugLogger.log('OrganizationProvider', 'PDF_RESTORE_FLAGS', {
      pdfRestoreFlag,
      hasPdfRestoreOrg: !!pdfRestoreOrg
    })
    
    if (pdfRestoreFlag === 'true' && pdfRestoreOrg) {
      debugLogger.log('OrganizationProvider', 'PDF_RESTORE_START', 'Processing PDF return restoration')
      try {
        const orgData = JSON.parse(pdfRestoreOrg)
        const membership = memberships.find(m => m.organization.id === orgData.id)
        
        debugLogger.log('OrganizationProvider', 'PDF_RESTORE_DATA', {
          orgData: orgData.slug,
          foundMembership: !!membership
        })
        
        if (membership) {
          debugLogger.log('OrganizationProvider', 'PDF_RESTORE_SUCCESS', membership.organization.slug)
          // Use the role from backup if available, otherwise from membership
          const role = orgData.userRole || membership.role
          setOrganization(membership.organization, role)
          
          // Clean up PDF restore flags
          sessionStorage.removeItem('pdf_restore_flag')
          sessionStorage.removeItem('pdf_restore_organization')
          
          // Also clean up PDF return info since we successfully restored
          pdfReturnHandler.clearReturnInfo()
          
          // Navigate to correct URL if needed
          if (!pathname.includes(`/org/${membership.organization.slug}`)) {
            debugLogger.log('OrganizationProvider', 'PDF_RESTORE_NAVIGATE', membership.organization.slug)
            navigateToOrganization(membership.organization.slug)
          }
          return
        }
      } catch (error) {
        debugLogger.log('OrganizationProvider', 'PDF_RESTORE_ERROR', error)
      }
      
      // Clean up even if failed
      debugLogger.log('OrganizationProvider', 'PDF_RESTORE_CLEANUP', 'Cleaning up after failed restore')
      sessionStorage.removeItem('pdf_restore_flag')
      sessionStorage.removeItem('pdf_restore_organization')
      pdfReturnHandler.clearReturnInfo()
    }
  }, [isAuthenticated, authLoading, isLoading, memberships, pathname])
  
  // Initial organization setup (separate effect, only when no slug in URL)
  useEffect(() => {
    if (!isAuthenticated || authLoading || isLoading || !memberships || currentSlug) {
      return // Skip if URL has slug (handled by URL effect above)
    }
    
    // Skip if PDF restoration is pending
    const pdfRestoreFlag = sessionStorage.getItem('pdf_restore_flag')
    if (pdfRestoreFlag === 'true') {
      return // PDF restoration will handle this
    }
    
    // If we have organization but no URL slug, navigate to it
    if (currentOrganization && pathname !== '/organizations') {
      navigateToOrganization(currentOrganization.slug)
      return
    }
    
    // No current organization - try to restore from persistence
    if (!currentOrganization) {
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