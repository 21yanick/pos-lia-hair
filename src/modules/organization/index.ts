// Zentrale Export-Datei für das Organization Module

// Provider
export { OrganizationProvider } from './contexts/OrganizationProvider'

// Hooks
export { useOrganizationStore } from './hooks/useOrganizationStore'
export { useOrganizationsQuery, useRefreshOrganizations, ORGANIZATIONS_QUERY_KEY } from './hooks/useOrganizationsQuery'
export { useOrganizationNavigation } from './hooks/useOrganizationNavigation'
export { useOrganizationPermissions } from './hooks/useOrganizationPermissions'

// Services
export { organizationService } from './services/organizationService'

// Kompatibilitäts-Hook für einfache Migration
export { useOrganization } from './hooks/useOrganization'