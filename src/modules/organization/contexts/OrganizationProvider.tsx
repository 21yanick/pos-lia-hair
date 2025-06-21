'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganizationStore } from '../hooks/useOrganizationStore'
import { useOrganizationsQuery } from '../hooks/useOrganizationsQuery'
import { useOrganizationNavigation } from '../hooks/useOrganizationNavigation'
import { supabase } from '@/shared/lib/supabase/client'

interface OrganizationProviderProps {
  children: React.ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const router = useRouter()
  const { setOrganization, clearOrganization } = useOrganizationStore()
  const { data: memberships, isLoading, error } = useOrganizationsQuery()
  const { currentSlug, navigateToOrganization, navigateToOrganizationSelection } = useOrganizationNavigation()
  
  // Handle organization selection based on URL and available organizations
  useEffect(() => {
    // Warte bis Daten geladen sind
    if (isLoading) return
    
    // Error State - zeige Fehler
    if (error) {
      console.error('Error loading organizations:', error)
      return
    }
    
    // Keine Memberships vorhanden (sollte nicht passieren bei geladenen Daten)
    if (!memberships) return
    
    // Fall 1: URL hat einen Slug
    if (currentSlug) {
      const membership = memberships.find(m => m.organization.slug === currentSlug)
      
      if (membership) {
        // Organisation gefunden - State setzen
        setOrganization(membership.organization, membership.role)
      } else {
        // Ungültiger Slug - zur Auswahl navigieren
        navigateToOrganizationSelection()
      }
      return
    }
    
    // Fall 2: Keine URL, aber Organisationen vorhanden
    if (memberships.length === 1) {
      // Nur eine Organisation - automatisch dorthin navigieren
      navigateToOrganization(memberships[0].organization.slug)
    } else if (memberships.length > 1) {
      // Mehrere Organisationen - zur Auswahl
      navigateToOrganizationSelection()
    } else {
      // Keine Organisationen - zur Erstellung
      clearOrganization()
      router.push('/organizations/create')
    }
  }, [
    currentSlug, 
    memberships, 
    isLoading, 
    error,
    setOrganization, 
    clearOrganization,
    navigateToOrganization,
    navigateToOrganizationSelection,
    router
  ])
  
  // Auth State Change Handler
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearOrganization()
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [clearOrganization])
  
  // Loading State anzeigen
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Organisation wird geladen...</span>
        </div>
      </div>
    )
  }
  
  // Error State anzeigen
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Fehler beim Laden der Organisationen</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}