'use client'

import { useOrganizationStore } from './useOrganizationStore'
import { useOrganizationsQuery, useRefreshOrganizations } from './useOrganizationsQuery'
import { organizationService } from '../services/organizationService'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { 
  CreateOrganizationData, 
  UpdateOrganizationData, 
  InviteUserData,
  Permission,
  ROLE_PERMISSIONS
} from '@/shared/types/organizations'

// Kompatibilitäts-Hook der die alte API nachbildet
// Macht die Migration einfacher - kann später entfernt werden
export function useOrganization() {
  const { currentOrganization, userRole, setOrganization } = useOrganizationStore()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { data: memberships = [], isLoading, error } = useOrganizationsQuery(isAuthenticated, authLoading)
  const refreshOrganizations = useRefreshOrganizations()
  
  // Wrapper Funktionen die nach dem Service Call refreshen
  const createOrganization = async (data: CreateOrganizationData) => {
    const org = await organizationService.createOrganization(data)
    await refreshOrganizations()
    return org
  }
  
  const updateOrganization = async (id: string, data: UpdateOrganizationData) => {
    const org = await organizationService.updateOrganization(id, data)
    await refreshOrganizations()
    return org
  }
  
  const deleteOrganization = async (id: string) => {
    await organizationService.deleteOrganization(id)
    await refreshOrganizations()
  }
  
  const inviteUser = async (data: InviteUserData) => {
    await organizationService.inviteUser(data)
    // Kein Refresh nötig - betrifft nur andere User
  }
  
  const removeUser = async (organizationId: string, userId: string) => {
    await organizationService.removeUser(organizationId, userId)
    // Refresh nur wenn man sich selbst entfernt
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user?.id === userId) {
      await refreshOrganizations()
    }
  }
  
  // Switch to a different organization
  const switchOrganization = async (organizationId: string) => {
    const membership = memberships.find(m => m.organization.id === organizationId)
    if (!membership) {
      throw new Error('Organization not found or access denied')
    }
    setOrganization(membership.organization, membership.role)
  }
  
  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false
    const permissions = ROLE_PERMISSIONS[userRole]
    return permissions.includes(permission)
  }
  
  return {
    // State
    currentOrganization,
    userOrganizations: memberships,
    userRole,
    loading: isLoading,
    error: error?.message || null,
    
    // Actions
    switchOrganization,
    refreshOrganizations,
    hasPermission,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    inviteUser,
    removeUser,
  }
}

// Import für Supabase fehlte
import { supabase } from '@/shared/lib/supabase/client'