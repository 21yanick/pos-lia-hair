'use client'

import type React from 'react'
import { useOrganizationPermissions } from '@/shared/hooks/auth/useOrganizationPermissions'
import type { OrganizationRole, Permission } from '@/shared/types/organizations'

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  role?: OrganizationRole
  roles?: OrganizationRole[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions or roles
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { can, role: userRole } = useOrganizationPermissions()

  // Check single permission
  if (permission && !can(permission)) {
    return <>{fallback}</>
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasPermissions = requireAll
      ? permissions.every((p) => can(p))
      : permissions.some((p) => can(p))

    if (!hasPermissions) {
      return <>{fallback}</>
    }
  }

  // Check single role
  if (role && userRole !== role) {
    return <>{fallback}</>
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    if (!userRole || !roles.includes(userRole)) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * Role-based Guard Component
 */
interface RoleGuardProps {
  children: React.ReactNode
  minRole: OrganizationRole
  fallback?: React.ReactNode
}

export function RoleGuard({ children, minRole, fallback = null }: RoleGuardProps) {
  const { role } = useOrganizationPermissions()

  const roleHierarchy: Record<OrganizationRole, number> = {
    staff: 1,
    admin: 2,
    owner: 3,
  }

  const userLevel = role ? roleHierarchy[role] : 0
  const requiredLevel = roleHierarchy[minRole]

  if (userLevel < requiredLevel) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Owner Only Guard
 */
interface OwnerGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function OwnerGuard({ children, fallback = null }: OwnerGuardProps) {
  const { isOwner } = useOrganizationPermissions()

  if (!isOwner) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Admin Guard (Admin or Owner)
 */
interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  const { isAdmin } = useOrganizationPermissions()

  if (!isAdmin) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Feature Flag Component
 */
interface FeatureGuardProps {
  children: React.ReactNode
  feature: string
  fallback?: React.ReactNode
}

export function FeatureGuard({ children, feature, fallback = null }: FeatureGuardProps) {
  // This could be extended to work with actual feature flags
  // For now, it's a placeholder for future feature flag implementation

  // Example feature flags based on role/organization
  const featureMap: Record<string, Permission[]> = {
    'advanced-banking': ['banking.reconcile', 'banking.manage_accounts'],
    'user-management': ['settings.manage_users'],
    'advanced-reports': ['reports.view_advanced', 'reports.export'],
    'multi-location': ['settings.manage_business'], // Future feature
  }

  const requiredPermissions = featureMap[feature]
  if (!requiredPermissions) {
    return <>{children}</>
  }

  return (
    <PermissionGuard permissions={requiredPermissions} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Conditional Render Hook
 */
export function useConditionalRender() {
  const { can, isOwner, isAdmin, isStaff, role } = useOrganizationPermissions()

  const renderIf = (condition: boolean, component: React.ReactNode, fallback?: React.ReactNode) => {
    return condition ? component : fallback || null
  }

  const renderForPermission = (
    permission: Permission,
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return renderIf(can(permission), component, fallback)
  }

  const renderForRole = (
    requiredRole: OrganizationRole,
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return renderIf(role === requiredRole, component, fallback)
  }

  const renderForOwner = (component: React.ReactNode, fallback?: React.ReactNode) => {
    return renderIf(isOwner, component, fallback)
  }

  const renderForAdmin = (component: React.ReactNode, fallback?: React.ReactNode) => {
    return renderIf(isAdmin, component, fallback)
  }

  return {
    renderIf,
    renderForPermission,
    renderForRole,
    renderForOwner,
    renderForAdmin,
    can,
    isOwner,
    isAdmin,
    isStaff,
    role,
  }
}
