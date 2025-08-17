// Permission System Utilities

import {
  type OrganizationRole,
  type Permission,
  ROLE_PERMISSIONS,
} from '@/shared/types/organizations'

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: OrganizationRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: OrganizationRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

/**
 * Check if a role can access a specific module
 */
export function canAccessModule(role: OrganizationRole, module: string): boolean {
  const modulePermissions: Record<string, Permission[]> = {
    pos: ['pos.create_sale', 'pos.view_sales'],
    expenses: ['expenses.create', 'expenses.view'],
    banking: ['banking.view', 'banking.reconcile'],
    reports: ['reports.view_basic', 'reports.view_advanced'],
    settings: ['settings.view', 'settings.manage_business'],
    users: ['settings.manage_users'],
    cash: ['cash.view_balance', 'cash.manage_movements'],
    documents: ['documents.view', 'documents.manage'],
  }

  const requiredPermissions = modulePermissions[module]
  if (!requiredPermissions) return false

  return requiredPermissions.some((permission) => roleHasPermission(role, permission))
}

/**
 * Get the minimum role required for a permission
 */
export function getMinimumRoleForPermission(permission: Permission): OrganizationRole | null {
  const roles: OrganizationRole[] = ['staff', 'admin', 'owner']

  for (const role of roles) {
    if (roleHasPermission(role, permission)) {
      return role
    }
  }

  return null
}

/**
 * Permission groups for UI organization
 */
export const PERMISSION_GROUPS = {
  'POS & Verkauf': ['pos.create_sale', 'pos.view_sales', 'pos.manage_items'],
  Ausgaben: ['expenses.create', 'expenses.view', 'expenses.manage'],
  Banking: ['banking.view', 'banking.reconcile', 'banking.manage_accounts'],
  Kasse: ['cash.view_balance', 'cash.manage_movements'],
  Berichte: ['reports.view_basic', 'reports.view_advanced', 'reports.export'],
  Dokumente: ['documents.view', 'documents.manage'],
  Einstellungen: ['settings.view', 'settings.manage_business', 'settings.manage_users'],
} as const

/**
 * Get human-readable permission descriptions
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'pos.create_sale': 'Verkäufe erstellen',
  'pos.view_sales': 'Verkäufe anzeigen',
  'pos.manage_items': 'Artikel verwalten',
  'expenses.create': 'Ausgaben erfassen',
  'expenses.view': 'Ausgaben anzeigen',
  'expenses.manage': 'Ausgaben verwalten',
  'banking.view': 'Banking anzeigen',
  'banking.reconcile': 'Banking abgleichen',
  'banking.manage_accounts': 'Bankkonten verwalten',
  'reports.view_basic': 'Grundberichte anzeigen',
  'reports.view_advanced': 'Erweiterte Berichte anzeigen',
  'reports.export': 'Berichte exportieren',
  'settings.view': 'Einstellungen anzeigen',
  'settings.manage_business': 'Geschäftseinstellungen verwalten',
  'settings.manage_users': 'Benutzer verwalten',
  'cash.view_balance': 'Kassensaldo anzeigen',
  'cash.manage_movements': 'Kassenbewegungen verwalten',
  'documents.view': 'Dokumente anzeigen',
  'documents.manage': 'Dokumente verwalten',
}

/**
 * Get human-readable role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<OrganizationRole, string> = {
  owner: 'Inhaber - Vollzugriff auf alle Funktionen',
  admin: 'Administrator - Geschäftsoperationen und Einstellungen',
  staff: 'Mitarbeiter - Tägliche Operationen (POS, Grundfunktionen)',
}

/**
 * Permission validation utilities
 */
export class PermissionValidator {
  public readonly role: OrganizationRole

  constructor(role: OrganizationRole) {
    this.role = role
  }

  can(permission: Permission): boolean {
    return roleHasPermission(this.role, permission)
  }

  canAny(permissions: Permission[]): boolean {
    return permissions.some((permission) => this.can(permission))
  }

  canAll(permissions: Permission[]): boolean {
    return permissions.every((permission) => this.can(permission))
  }

  accessLevel(): 'full' | 'business' | 'limited' {
    if (this.role === 'owner') return 'full'
    if (this.role === 'admin') return 'business'
    return 'limited'
  }

  getAvailableModules(): string[] {
    const modules = [
      'pos',
      'expenses',
      'banking',
      'reports',
      'settings',
      'users',
      'cash',
      'documents',
    ]
    return modules.filter((module) => canAccessModule(this.role, module))
  }
}

/**
 * Feature flags based on permissions
 */
export function getFeatureFlags(role: OrganizationRole) {
  const validator = new PermissionValidator(role)

  return {
    canCreateSales: validator.can('pos.create_sale'),
    canManageItems: validator.can('pos.manage_items'),
    canManageExpenses: validator.can('expenses.manage'),
    canAccessBanking: validator.can('banking.view'),
    canReconcileBanking: validator.can('banking.reconcile'),
    canViewAdvancedReports: validator.can('reports.view_advanced'),
    canExportReports: validator.can('reports.export'),
    canManageBusinessSettings: validator.can('settings.manage_business'),
    canManageUsers: validator.can('settings.manage_users'),
    canManageCash: validator.can('cash.manage_movements'),
    canManageDocuments: validator.can('documents.manage'),

    // Computed flags
    isBusinessManager: validator.canAny(['settings.manage_business', 'reports.view_advanced']),
    isFullAdmin: validator.role === 'owner',
    hasLimitedAccess: validator.role === 'staff',
  }
}
