'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase/client'
import { OrganizationMembership } from '@/shared/types/organizations'

// Query Key als Konstante für Konsistenz
export const ORGANIZATIONS_QUERY_KEY = ['organizations', 'user'] as const

// Typsichere Funktion zum Laden der Organisationen
async function fetchUserOrganizations(): Promise<OrganizationMembership[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  if (userError || !userData?.user) {
    return []
  }

  const { data, error } = await supabase
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
    .order('joined_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to load organizations: ${error.message}`)
  }

  // Type-sichere Transformation
  return (data || []).map(membership => ({
    ...membership,
    organization: membership.organization as any // Supabase Typing Issue
  }))
}

// Hook mit optimalen React Query Settings
export function useOrganizationsQuery(isAuthenticated?: boolean, authLoading?: boolean) {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEY,
    queryFn: fetchUserOrganizations,
    enabled: isAuthenticated && !authLoading, // Only run when user is authenticated
    staleTime: 5 * 60 * 1000, // 5 Minuten - Daten sind 5 Min gültig
    gcTime: 10 * 60 * 1000,   // 10 Minuten - Cache bleibt 10 Min erhalten
    retry: 1,                  // Nur 1 Retry bei Fehler
    refetchOnWindowFocus: false, // Kein Refetch bei Tab-Wechsel
  })
}

// Utility Hook zum manuellen Refetch
export function useRefreshOrganizations() {
  const queryClient = useQueryClient()
  
  return () => {
    return queryClient.invalidateQueries({ 
      queryKey: ORGANIZATIONS_QUERY_KEY 
    })
  }
}