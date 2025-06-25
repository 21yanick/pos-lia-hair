// Auth Components Exports

// 🛡️ NEW CLIENT-SIDE AUTH GUARDS
export { PublicRoute } from './PublicRoute'
export { ProtectedRoute } from './ProtectedRoute'  
export { OrganizationRoute } from './OrganizationRoute'

// 🔐 Permission & Role Guards
export { 
  PermissionGuard, 
  RoleGuard, 
  OwnerGuard, 
  AdminGuard, 
  FeatureGuard,
  useConditionalRender 
} from './PermissionGuard'

// 🏢 Organization Components (simplified)
// OrganizationGuard replaced by URL-based routing

export { OrganizationSelector } from './OrganizationSelector'