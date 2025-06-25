// Organization Module - Simplified after refactoring

// React Query hooks (still used)
export { useOrganizationsQuery, useRefreshOrganizations, ORGANIZATIONS_QUERY_KEY } from './hooks/useOrganizationsQuery'

// Services (still used)
export { organizationService } from './services/organizationService'

// Legacy hooks removed:
// - OrganizationProvider → replaced by URL-based selection
// - useOrganizationStore → replaced by useCurrentOrganization  
// - useOrganizationNavigation → replaced by simple router.push
// - useOrganization → replaced by useCurrentOrganization
// - useOrganizationPermissions → moved to shared/hooks/auth/