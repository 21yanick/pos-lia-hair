'use client'

import { useMemo } from 'react'
import {
  type OrganizationRole,
  type Permission,
  ROLE_PERMISSIONS,
} from '@/shared/types/organizations'
import { useCurrentOrganization } from './useCurrentOrganization'

interface OrganizationPermissionsReturn {
  // Permission checks
  can: (permission: Permission) => boolean

  // Role checks
  isOwner: boolean
  isAdmin: boolean
  isStaff: boolean

  // Current state
  role: OrganizationRole | null
  organization: any // Current organization

  // Loading state
  loading: boolean
}

/**
 * Organization-Scoped Permissions Hook
 *
 * BEFORE: Global permissions via complex OrganizationProvider
 * AFTER:  URL-based organization permissions via useCurrentOrganization
 *
 * How it works:
 * 1. Get current organization + user role from URL
 * 2. Map role to permissions using ROLE_PERMISSIONS
 * 3. Provide simple permission check functions
 *
 * Benefits:
 * - Permissions are always scoped to current organization
 * - No global state complexity
 * - Automatic permission updates on organization switch
 * - Consistent with URL-based architecture
 */
export function useOrganizationPermissions(): OrganizationPermissionsReturn {
  const { currentOrganization, userRole, loading } = useCurrentOrganization()

  // Calculate permissions based on user role
  const permissions = useMemo(() => {
    if (!userRole) return []
    return ROLE_PERMISSIONS[userRole] || []
  }, [userRole])

  // Permission check function
  const can = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!userRole || !currentOrganization) return false
      return permissions.includes(permission)
    }
  }, [permissions, userRole, currentOrganization])

  // Role flags
  const roleFlags = useMemo(
    () => ({
      isOwner: userRole === 'owner',
      isAdmin: userRole === 'admin' || userRole === 'owner', // Owner has admin rights
      isStaff: userRole === 'staff' || userRole === 'admin' || userRole === 'owner',
    }),
    [userRole]
  )

  return {
    // Permission checks
    can,

    // Role checks
    isOwner: roleFlags.isOwner,
    isAdmin: roleFlags.isAdmin,
    isStaff: roleFlags.isStaff,

    // Current state
    role: userRole,
    organization: currentOrganization,

    // Loading state
    loading,
  }
}
