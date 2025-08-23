'use client'

import { useQuery } from '@tanstack/react-query'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { supabase } from '@/shared/lib/supabase/client'

export interface TeamMember {
  // V6.1 Pattern: Export interface for cross-module usage
  id: string
  user_id: string
  role: 'owner' | 'admin' | 'staff'
  joined_at: string
  active: boolean
  user: {
    id: string
    name: string
    email: string
    username: string
  }
}

// Query Key Factory
export const getTeamMembersQueryKey = (organizationId: string) =>
  ['team-members', organizationId] as const

// Fetch function
async function fetchTeamMembers(organizationId: string): Promise<TeamMember[]> {
  if (!organizationId) {
    return []
  }

  const { data, error } = await supabase
    .from('organization_users')
    .select(`
      id,
      user_id,
      role,
      joined_at,
      active,
      user:users!organization_users_user_id_fkey(
        id,
        name,
        email,
        username
      )
    `)
    .eq('organization_id', organizationId)
    .eq('active', true)
    .order('joined_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to load team members: ${error.message}`)
  }

  // V6.1 Pattern 19: Schema Property Alignment + Pattern 17: Null Safety
  return (data || []).map((member) => ({
    ...member,
    role: member.role as 'owner' | 'admin' | 'staff', // V6.1 Pattern 19: Cast database string to union type
    joined_at: member.joined_at || '', // V6.1 Pattern 17: Null Safety - handle null joined_at
    active: member.active ?? true, // V6.1 Pattern 17: Null Safety - handle null active
  }))
}

// Hook
export function useTeamMembersQuery() {
  const { currentOrganization } = useCurrentOrganization()
  const organizationId = currentOrganization?.id

  return useQuery({
    queryKey: getTeamMembersQueryKey(organizationId || ''),
    queryFn: () => fetchTeamMembers(organizationId || ''),
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes - team data changes less frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
  })
}
