'use client'

import { useMemo } from 'react'
import { useOrganizationStore } from './useOrganizationStore'
import { Permission, ROLE_PERMISSIONS } from '@/shared/types/organizations'

// Hook für Permissions-Checks mit memoization für Performance
export function useOrganizationPermissions() {
  const { userRole } = useOrganizationStore()
  
  // Memoize permission checks für bessere Performance
  const permissions = useMemo(() => {
    if (!userRole) return []
    return ROLE_PERMISSIONS[userRole] || []
  }, [userRole])
  
  // Single permission check
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission)
  }
  
  // Check für mehrere Permissions (OR)
  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(p => permissions.includes(p))
  }
  
  // Check für alle Permissions (AND)
  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(p => permissions.includes(p))
  }
  
  // Convenience Flags (memoized)
  const roleFlags = useMemo(() => ({
    isOwner: userRole === 'owner',
    isAdmin: userRole === 'owner' || userRole === 'admin',
    isMember: userRole === 'owner' || userRole === 'admin' || userRole === 'member',
    isGuest: userRole === 'guest',
  }), [userRole])
  
  return {
    userRole,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    ...roleFlags
  }
}