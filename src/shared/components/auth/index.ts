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

// 🏢 Legacy Organization Guards (will be replaced by new system)
export { 
  OrganizationGuard, 
  useOrganizationRoute, 
  useOrganizationSwitcher 
} from './OrganizationGuard'

export { OrganizationSelector } from './OrganizationSelector'