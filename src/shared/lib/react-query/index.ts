/**
 * React Query Library Exports
 * 
 * Centralized exports for React Query setup and utilities
 */

// Core React Query setup
export { default as QueryProvider } from './QueryProvider'
export { QueryProvider as QueryProviderComponent } from './QueryProvider'
export { createQueryClient, queryClient, cacheConfig } from './queryClient'

// Query Keys and utilities
export { default as queryKeys } from './queryKeys'
export { queryKeys as queryKeyFactory, queryKeyUtils } from './queryKeys'
export type { QueryKey, BusinessQueryKey, AuthQueryKey, OrganizationQueryKey } from './queryKeys'

// Error Handling
export { QueryErrorBoundary, QueryErrorWrapper } from './QueryErrorBoundary'

// Re-export commonly used React Query hooks and utilities
export {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useSuspenseQuery,
  useQueries,
  useMutationState,
  useIsFetching,
  useIsMutating,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'

// Custom hooks and utilities will be added here as we build them
// export { useBusinessSettings } from './hooks/useBusinessSettings'
// export { useCashMovements } from './hooks/useCashMovements'
// export { useSales } from './hooks/useSales'