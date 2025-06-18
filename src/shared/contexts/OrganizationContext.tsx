'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
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

  // Extract organization slug from URL
  const getSlugFromPath = useCallback((): string | null => {
    const match = pathname.match(/^\/org\/([^\/]+)/)
    return match ? match[1] : null
  }, [pathname])

  // Load user's organizations
  const loadUserOrganizations = useCallback(async () => {
    try {
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
      
      // Auto-select organization based on URL slug
      const slug = getSlugFromPath()
      console.log('🔍 DEBUG OrganizationContext - URL slug:', slug)
      console.log('🔍 DEBUG OrganizationContext - Available orgs:', organizationMemberships.map(m => m.organization.slug))
      
      if (slug) {
        const targetOrg = organizationMemberships.find(m => m.organization.slug === slug)
        console.log('🔍 DEBUG OrganizationContext - Target org found:', targetOrg?.organization.name)
        
        if (targetOrg) {
          setCurrentOrganization(targetOrg.organization)
          setUserRole(targetOrg.role)
          console.log('🔍 DEBUG OrganizationContext - Current org set to:', targetOrg.organization.name, targetOrg.organization.id)
        } else {
          // Invalid slug - redirect to organization selector
          router.push('/organizations')
        }
      } else if (organizationMemberships.length === 1) {
        // Auto-select if user has only one organization
        const membership = organizationMemberships[0]
        setCurrentOrganization(membership.organization)
        setUserRole(membership.role)
      }
    } catch (err) {
      console.error('Error in loadUserOrganizations:', err)
      setError('Fehler beim Laden der Organisationen')
    }
  }, [getSlugFromPath, router, supabase])

  // Switch to different organization
  const switchOrganization = useCallback(async (organizationId: string) => {
    try {
      setLoading(true)
      
      const membership = userOrganizations.find(m => m.organization.id === organizationId)
      if (!membership) {
        throw new Error('Organization not found')
      }

      setCurrentOrganization(membership.organization)
      setUserRole(membership.role)
      
      // Update URL to reflect organization change
      const newPath = `/org/${membership.organization.slug}/dashboard`
      router.push(newPath)
      
      // Store in sessionStorage for persistence
      sessionStorage.setItem('currentOrganizationId', organizationId)
    } catch (err) {
      console.error('Error switching organization:', err)
      setError('Fehler beim Wechseln der Organisation')
    } finally {
      setLoading(false)
    }
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

  // Initialize on mount
  useEffect(() => {
    const initializeOrganizations = async () => {
      setLoading(true)
      await loadUserOrganizations()
      setLoading(false)
    }

    initializeOrganizations()
  }, [loadUserOrganizations])

  // Clear organization context on auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setCurrentOrganization(null)
        setUserOrganizations([])
        setUserRole(null)
        sessionStorage.removeItem('currentOrganizationId')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

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