// Auth Components Exports

export { OrganizationRoute } from './OrganizationRoute'
// 🔐 Permission & Role Guards
export {
  AdminGuard,
  FeatureGuard,
  OwnerGuard,
  PermissionGuard,
  RoleGuard,
  useConditionalRender,
} from './PermissionGuard'
export { ProtectedRoute } from './ProtectedRoute'
// 🛡️ NEW CLIENT-SIDE AUTH GUARDS
export { PublicRoute } from './PublicRoute'

// 🏢 Organization Components (simplified)
// OrganizationGuard replaced by URL-based routing

export { OrganizationSelector } from './OrganizationSelector'
