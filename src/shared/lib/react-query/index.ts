/**
 * React Query Library Exports
 *
 * Centralized exports for React Query setup and utilities
 */

// Re-export commonly used React Query hooks and utilities
export {
  MutationCache,
  QueryCache,
  useInfiniteQuery,
  useIsFetching,
  useIsMutating,
  useMutation,
  useMutationState,
  useQueries,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
// Error Handling
export { QueryErrorBoundary, QueryErrorWrapper } from './QueryErrorBoundary'
// Core React Query setup
export { default as QueryProvider, QueryProvider as QueryProviderComponent } from './QueryProvider'
export { cacheConfig, createQueryClient, queryClient } from './queryClient'
export type { AuthQueryKey, BusinessQueryKey, OrganizationQueryKey, QueryKey } from './queryKeys'
// Query Keys and utilities
export { default as queryKeys, queryKeys as queryKeyFactory, queryKeyUtils } from './queryKeys'

// Custom hooks and utilities will be added here as we build them
// export { useBusinessSettings } from './hooks/useBusinessSettings'
// export { useCashMovements } from './hooks/useCashMovements'
// export { useSales } from './hooks/useSales'
