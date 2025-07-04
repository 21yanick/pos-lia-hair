'use client'

import { ReactNode, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from './queryClient'
import { QueryErrorBoundary } from './QueryErrorBoundary'
import { PageVisibilityHandler } from './PageVisibilityHandler'

interface QueryProviderProps {
  children: ReactNode
}

/**
 * React Query Provider with Error Boundary
 * 
 * Features:
 * - QueryClient management
 * - Development tools integration
 * - Global error handling
 * - Performance monitoring
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient instance once per provider
  // This ensures we don't recreate the client on every render
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundary>
        {/* 
        RE-ENABLED: Auth conflict resolved with smart session handling
        OrganizationContext now only reloads on actual session changes
        */}
        <PageVisibilityHandler />
        {children}
      </QueryErrorBoundary>
    </QueryClientProvider>
  )
}

/**
 * Hook to access QueryClient outside of components
 * Useful for imperative invalidation
 */
export { useQueryClient } from '@tanstack/react-query'

// Export for convenience
export default QueryProvider