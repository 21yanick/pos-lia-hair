// Organization Types for Multi-Tenant Architecture

export interface Organization {
  id: string
  name: string
  slug: string
  display_name?: string
  created_at: string
  updated_at: string
  active: boolean
  
  // Business Contact Info
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  email?: string
  website?: string
  uid?: string
  
  // Settings JSON
  settings: OrganizationSettings
}

export interface OrganizationSettings {
  tax_rate?: number
  default_currency?: string
  pdf_show_logo?: boolean
  pdf_show_company_details?: boolean
  custom_expense_categories?: Record<string, string>
}

export interface OrganizationUser {
  id: string
  organization_id: string
  user_id: string
  role: OrganizationRole
  invited_by?: string
  joined_at: string
  created_at: string
  active: boolean
}

export type OrganizationRole = 'owner' | 'admin' | 'staff'

export interface OrganizationMembership {
  organization: Organization
  role: OrganizationRole
  joined_at: string
  active: boolean
}

export interface CreateOrganizationData {
  name: string
  slug: string
  display_name?: string
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  email?: string
  website?: string
  uid?: string
  settings?: Partial<OrganizationSettings>
}

export interface UpdateOrganizationData {
  name?: string
  display_name?: string
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  email?: string
  website?: string
  uid?: string
  settings?: Partial<OrganizationSettings>
  active?: boolean
}

export interface InviteUserData {
  email: string
  role: OrganizationRole
}

// Permission System Types
export type Permission = 
  | 'pos.create_sale'
  | 'pos.view_sales'
  | 'pos.manage_items'
  | 'expenses.create'
  | 'expenses.view'
  | 'expenses.manage'
  | 'banking.view'
  | 'banking.reconcile'
  | 'banking.manage_accounts'
  | 'reports.view_basic'
  | 'reports.view_advanced'
  | 'reports.export'
  | 'settings.view'
  | 'settings.manage_business'
  | 'settings.manage_users'
  | 'cash.view_balance'
  | 'cash.manage_movements'
  | 'documents.view'
  | 'documents.manage'

export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  owner: [
    'pos.create_sale',
    'pos.view_sales',
    'pos.manage_items',
    'expenses.create',
    'expenses.view',
    'expenses.manage',
    'banking.view',
    'banking.reconcile',
    'banking.manage_accounts',
    'reports.view_basic',
    'reports.view_advanced',
    'reports.export',
    'settings.view',
    'settings.manage_business',
    'settings.manage_users',
    'cash.view_balance',
    'cash.manage_movements',
    'documents.view',
    'documents.manage',
  ],
  admin: [
    'pos.create_sale',
    'pos.view_sales',
    'pos.manage_items',
    'expenses.create',
    'expenses.view',
    'expenses.manage',
    'banking.view',
    'banking.reconcile',
    'reports.view_basic',
    'reports.view_advanced',
    'reports.export',
    'settings.view',
    'settings.manage_business',
    'cash.view_balance',
    'cash.manage_movements',
    'documents.view',
    'documents.manage',
  ],
  staff: [
    'pos.create_sale',
    'pos.view_sales',
    'expenses.create',
    'expenses.view',
    'reports.view_basic',
    'settings.view',
    'cash.view_balance',
    'documents.view',
  ],
}

// Organization Context Types
export interface OrganizationContextType {
  currentOrganization: Organization | null
  userOrganizations: OrganizationMembership[]
  userRole: OrganizationRole | null
  loading: boolean
  error: string | null
  
  // Actions
  switchOrganization: (organizationId: string) => Promise<void>
  refreshOrganizations: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  
  // Organization Management (for owners/admins)
  createOrganization?: (data: CreateOrganizationData) => Promise<Organization>
  updateOrganization?: (id: string, data: UpdateOrganizationData) => Promise<void>
  inviteUser?: (data: InviteUserData) => Promise<void>
}

// Auth Context Types (Enhanced)
export interface User {
  id: string
  email: string
  name?: string
  username?: string
}

export interface AuthContextType {
  user: User | null
  currentOrganization: Organization | null
  userRole: OrganizationRole | null
  loading: boolean
  isAuthenticated: boolean
  
  // Actions
  signOut: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
}

// Default Organization Settings
export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  tax_rate: 7.7,
  default_currency: 'CHF',
  pdf_show_logo: true,
  pdf_show_company_details: true,
  custom_expense_categories: {},
}

// URL/Route related types
export interface OrganizationRouteParams {
  slug: string
}

export interface OrganizationPageProps {
  params: OrganizationRouteParams
}