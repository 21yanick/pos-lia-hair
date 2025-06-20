'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/shared/lib/supabase/client'
import {
  Organization,
  OrganizationMembership,
  OrganizationContextType,
  OrganizationRole,
  Permission,
  ROLE_PERMISSIONS,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteUserData,
} from '@/shared/types/organizations'

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

interface OrganizationProviderProps {
  children: React.ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [userOrganizations, setUserOrganizations] = useState<OrganizationMembership[]>([])
  const [userRole, setUserRole] = useState<OrganizationRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()

  // Extract organization slug from URL (stable reference)
  const getSlugFromPath = useCallback((): string | null => {
    const match = pathname.match(/^\/org\/([^\/]+)/)
    return match ? match[1] : null
  }, [pathname])

  // Session Recovery: Restore organization from session storage
  const recoverFromSessionStorage = useCallback((): boolean => {
    const storedOrgId = sessionStorage.getItem('currentOrganizationId')
    console.log('💾 SESSION RECOVERY - Checking stored org ID:', storedOrgId)
    
    if (storedOrgId && userOrganizations.length > 0) {
      const membership = userOrganizations.find(m => m.organization.id === storedOrgId)
      if (membership) {
        console.log('💾 SESSION RECOVERY - Restoring:', membership.organization.name)
        setCurrentOrganization(membership.organization)
        setUserRole(membership.role)
        return true
      } else {
        console.log('💾 SESSION RECOVERY - Stored org not found in user orgs')
        sessionStorage.removeItem('currentOrganizationId')
      }
    }
    return false
  }, [userOrganizations])

  // Stable reference for loadUserOrganizations to prevent unnecessary re-renders
  const loadUserOrganizationsRef = useRef<() => Promise<void>>()
  
  // Load user's organizations with AbortController for cleanup
  loadUserOrganizationsRef.current = async () => {
    try {
      setError(null) // Clear previous errors
      
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        setUserOrganizations([])
        return
      }

      const { data: memberships, error } = await supabase
        .from('organization_users')
        .select(`
          role,
          joined_at,
          active,
          organization:organizations!inner(
            id,
            name,
            slug,
            display_name,
            created_at,
            updated_at,
            active,
            address,
            city,
            postal_code,
            phone,
            email,
            website,
            uid,
            settings
          )
        `)
        .eq('user_id', userData.user.id)
        .eq('active', true)
        .eq('organization.active', true)

      if (error) {
        console.error('Error loading organizations:', error)
        setError('Fehler beim Laden der Organisationen')
        return
      }

      const organizationMemberships: OrganizationMembership[] = (memberships || []).map(membership => ({
        organization: membership.organization as Organization,
        role: membership.role as OrganizationRole,
        joined_at: membership.joined_at,
        active: membership.active,
      }))

      setUserOrganizations(organizationMemberships)
      console.log('🔍 LOAD ORGS - Loaded', organizationMemberships.length, 'organizations:', organizationMemberships.map(m => m.organization.slug))
    } catch (err) {
      console.error('Error in loadUserOrganizations:', err)
      setError('Fehler beim Laden der Organisationen')
    }
  }

  // Stable wrapper function
  const loadUserOrganizations = useCallback(async () => {
    await loadUserOrganizationsRef.current?.()
  }, [])

  // Switch to different organization (SIMPLIFIED - Single Source of Truth)
  const switchOrganization = useCallback(async (organizationId: string) => {
    console.log('🔄 SWITCH ORG START:', organizationId)
    
    const membership = userOrganizations.find(m => m.organization.id === organizationId)
    if (!membership) {
      console.error('❌ SWITCH ORG - Organization not found:', organizationId)
      return
    }
    
    console.log('🔄 SWITCH ORG - Target:', membership.organization.name, membership.organization.slug)
    
    // Update state
    setCurrentOrganization(membership.organization)
    setUserRole(membership.role)
    
    // Store in sessionStorage for persistence
    sessionStorage.setItem('currentOrganizationId', organizationId)
    
    // Navigate to organization (URL becomes source of truth)
    const newPath = `/org/${membership.organization.slug}/dashboard`
    console.log('🔄 SWITCH ORG - Navigating to:', newPath)
    router.push(newPath)
  }, [userOrganizations, router])

  // Refresh organizations list
  const refreshOrganizations = useCallback(async () => {
    setLoading(true)
    await loadUserOrganizations()
    setLoading(false)
  }, [loadUserOrganizations])

  // Check if user has specific permission
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!userRole) return false
    return ROLE_PERMISSIONS[userRole].includes(permission)
  }, [userRole])

  // Create new organization (owner only)
  const createOrganization = useCallback(async (data: CreateOrganizationData): Promise<Organization> => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      throw new Error('Nicht angemeldet')
    }

    // Check if slug is available
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', data.slug)
      .single()

    if (existingOrg) {
      throw new Error('Slug bereits vergeben')
    }

    // Create organization
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: data.name,
        slug: data.slug,
        display_name: data.display_name,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code,
        phone: data.phone,
        email: data.email,
        website: data.website,
        uid: data.uid,
        settings: data.settings || {},
      })
      .select()
      .single()

    if (orgError || !newOrg) {
      throw new Error('Fehler beim Erstellen der Organisation')
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('organization_users')
      .insert({
        organization_id: newOrg.id,
        user_id: userData.user.id,
        role: 'owner',
        active: true,
      })

    if (memberError) {
      // Cleanup - delete organization if membership creation failed
      await supabase.from('organizations').delete().eq('id', newOrg.id)
      throw new Error('Fehler beim Erstellen der Mitgliedschaft')
    }

    await refreshOrganizations()
    return newOrg as Organization
  }, [supabase, refreshOrganizations])

  // Update organization (owner/admin only)
  const updateOrganization = useCallback(async (id: string, data: UpdateOrganizationData) => {
    if (!hasPermission('settings.manage_business')) {
      throw new Error('Keine Berechtigung')
    }

    const { error } = await supabase
      .from('organizations')
      .update(data)
      .eq('id', id)

    if (error) {
      throw new Error('Fehler beim Aktualisieren der Organisation')
    }

    await refreshOrganizations()
  }, [hasPermission, supabase, refreshOrganizations])

  // Invite user (owner/admin only)
  const inviteUser = useCallback(async (data: InviteUserData) => {
    if (!hasPermission('settings.manage_users') || !currentOrganization) {
      throw new Error('Keine Berechtigung')
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single()

    if (userError && userError.code !== 'PGRST116') { // Not found is ok
      throw new Error('Fehler beim Suchen des Benutzers')
    }

    if (existingUser) {
      // Add existing user to organization
      const { error: memberError } = await supabase
        .from('organization_users')
        .insert({
          organization_id: currentOrganization.id,
          user_id: existingUser.id,
          role: data.role,
          active: true,
        })

      if (memberError) {
        throw new Error('Benutzer ist bereits Mitglied oder Fehler beim Hinzufügen')
      }
    } else {
      // TODO: Send invitation email for new users
      throw new Error('Benutzer-Einladungen per E-Mail sind noch nicht implementiert')
    }
  }, [hasPermission, currentOrganization, supabase])

  // Initialize on mount with error handling
  useEffect(() => {
    const initializeOrganizations = async () => {
      try {
        setLoading(true)
        setError(null)
        await loadUserOrganizations()
      } catch (error) {
        console.error('Error initializing organizations:', error)
        setError('Fehler beim Initialisieren der Organisationen')
      } finally {
        setLoading(false)
      }
    }

    initializeOrganizations()
  }, [loadUserOrganizations])

  // 1. URL-based organization selection (highest priority)
  useEffect(() => {
    if (loading || userOrganizations.length === 0) return

    const slug = getSlugFromPath()
    if (!slug) return

    console.log('🎯 URL ORG SELECTION - URL slug:', slug, 'currentOrg:', currentOrganization?.slug)
    
    const targetOrg = userOrganizations.find(m => m.organization.slug === slug)
    if (targetOrg) {
      if (!currentOrganization || currentOrganization.id !== targetOrg.organization.id) {
        console.log('🎯 URL ORG SELECTION - Setting org from URL:', targetOrg.organization.name)
        setCurrentOrganization(targetOrg.organization)
        setUserRole(targetOrg.role)
        sessionStorage.setItem('currentOrganizationId', targetOrg.organization.id)
      }
    } else {
      console.log('🎯 URL ORG SELECTION - Invalid slug in URL, redirecting to /organizations')
      router.push('/organizations')
    }
  }, [userOrganizations, loading, pathname, currentOrganization])

  // 2. Session recovery for non-org URLs
  useEffect(() => {
    if (loading || userOrganizations.length === 0) return
    if (getSlugFromPath()) return // Skip if we're on an org URL
    if (currentOrganization) return // Skip if already have org

    console.log('💾 SESSION RECOVERY - Attempting recovery')
    recoverFromSessionStorage()
  }, [userOrganizations, loading, pathname, currentOrganization])

  // 3. Auto-redirect for single organization (only on /organizations page)
  useEffect(() => {
    if (loading || userOrganizations.length !== 1) return
    if (pathname !== '/organizations') return
    if (currentOrganization) return

    const membership = userOrganizations[0]
    console.log('🎯 AUTO REDIRECT - Single org detected, redirecting to:', membership.organization.name)
    
    setCurrentOrganization(membership.organization)
    setUserRole(membership.role)
    sessionStorage.setItem('currentOrganizationId', membership.organization.id)
    router.replace(`/org/${membership.organization.slug}/dashboard`)
  }, [userOrganizations, loading, pathname, currentOrganization])

  // 4. Redirect to selector for multiple orgs
  useEffect(() => {
    if (loading || userOrganizations.length <= 1) return
    if (getSlugFromPath()) return // Skip if on org URL
    if (pathname === '/organizations') return // Skip if already on selector
    if (currentOrganization) return // Skip if org is selected

    console.log('🎯 MULTI ORG REDIRECT - Multiple orgs, redirecting to selector')
    router.push('/organizations')
  }, [userOrganizations, loading, pathname, currentOrganization])

  // Handle auth state changes with proper cleanup
  useEffect(() => {
    let mounted = true
    let isLoading = false
    let lastSessionId: string | null = null
    let debounceTimer: number | null = null
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('🔐 AUTH STATE CHANGE:', event, !!session, session?.user?.id)
      
      if (event === 'SIGNED_OUT') {
        // Clear everything on sign out
        lastSessionId = null
        setCurrentOrganization(null)
        setUserOrganizations([])
        setUserRole(null)
        setError(null)
        sessionStorage.removeItem('currentOrganizationId')
        
      } else if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session && !isLoading) {
        
        // 🎯 SMART SESSION HANDLING: Only reload if session actually changed
        const currentSessionId = session.access_token?.substring(0, 20) // Use token prefix as ID
        
        if (lastSessionId === currentSessionId) {
          console.log('🔐 AUTH STATE CHANGE - Session unchanged, skipping reload', event)
          return
        }
        
        // Clear any existing debounce timer
        if (debounceTimer) {
          window.clearTimeout(debounceTimer)
        }
        
        // 🔄 SMART LOAD STRATEGY
        const shouldLoad = () => {
          // First time (INITIAL_SESSION): Always load
          if (event === 'INITIAL_SESSION' && !lastSessionId) {
            return true
          }
          
          // SIGNED_IN with different session: Load
          if (event === 'SIGNED_IN' && lastSessionId !== currentSessionId) {
            return true
          }
          
          // All other cases: Skip
          return false
        }
        
        if (shouldLoad()) {
          // 🔄 DEBOUNCED RELOAD: Avoid rapid-fire reloads
          debounceTimer = window.setTimeout(async () => {
            if (!mounted || isLoading) return
            
            isLoading = true
            lastSessionId = currentSessionId
            console.log('🔐 AUTH STATE CHANGE - Loading organizations', event, 'session:', currentSessionId)
            
            try {
              setLoading(true)
              await loadUserOrganizations()
            } catch (error) {
              console.error('Error loading organizations after sign in:', error)
              if (mounted) setError('Fehler beim Laden der Organisationen nach Anmeldung')
            } finally {
              if (mounted) {
                setLoading(false)
                isLoading = false
              }
            }
          }, event === 'INITIAL_SESSION' ? 0 : 500) // No debounce for initial load
        } else {
          // Update session ID even if we don't reload
          lastSessionId = currentSessionId
          console.log('🔐 AUTH STATE CHANGE - Session tracking updated', event)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      
      // Clean up debounce timer
      if (debounceTimer) {
        window.clearTimeout(debounceTimer)
      }
    }
  }, [loadUserOrganizations])

  const value: OrganizationContextType = {
    currentOrganization,
    userOrganizations,
    userRole,
    loading,
    error,
    switchOrganization,
    refreshOrganizations,
    hasPermission,
    createOrganization,
    updateOrganization,
    inviteUser,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

// Hook to use organization context
export function useOrganization(): OrganizationContextType {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

// Hook for organization-aware operations
export function useOrganizationGuard() {
  const { currentOrganization, loading } = useOrganization()
  
  return {
    organization: currentOrganization,
    isReady: !loading && !!currentOrganization,
    requiresOrganization: !loading && !currentOrganization,
  }
}