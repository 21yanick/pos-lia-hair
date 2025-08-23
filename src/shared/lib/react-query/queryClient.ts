import { type NetworkMode, QueryClient } from '@tanstack/react-query' // V6.1 Pattern 21: Library API Compatibility - Import NetworkMode and QueryStatus types

/**
 * React Query Configuration for POS System
 *
 * Optimized for:
 * - Multi-tenant architecture
 * - Real-time data requirements
 * - Offline-first approach
 * - Performance optimization
 */

// Default query options optimized for POS system
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale time: How long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes default

      // Cache time: How long inactive data stays in cache
      gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime in v5)

      // Retry configuration
      retry: (failureCount: number, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Background refetch configuration
      refetchOnWindowFocus: true, // Refresh when user comes back to app
      refetchOnReconnect: true, // Refresh when network reconnects
      refetchOnMount: true, // Refresh when component mounts

      // Only refetch if data is stale
      refetchIntervalInBackground: false,

      // Performance: Throw errors to error boundaries
      throwOnError: false,

      // Network mode
      networkMode: 'online' as NetworkMode, // V6.1 Pattern 21: Library API Compatibility - Explicit NetworkMode type cast
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,

      // Don't retry mutations on network error to avoid duplicates
      networkMode: 'online' as NetworkMode, // V6.1 Pattern 21: Library API Compatibility - Explicit NetworkMode type cast

      // Throw errors to error boundaries for mutations
      throwOnError: false,
    },
  },
}

/**
 * Data-specific cache configurations
 * Different data types need different caching strategies
 */
export const cacheConfig = {
  // Business settings: Changes rarely, cache longer
  businessSettings: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },

  // Cash movements: Real-time data, cache shorter
  cashMovements: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  },

  // Sales data: Important for reporting, medium cache
  sales: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  },

  // Product catalog: Changes occasionally, cache longer
  items: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },

  // Expense data: Changes moderately, medium cache
  expenses: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  },

  // User data: Changes rarely, cache very long
  user: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },

  // Organization data: Changes rarely, cache very long
  organization: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },

  // Dashboard-specific cache strategies
  dashboard: {
    // Real-time data (high volatility)
    balance: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchInterval: 1000 * 60, // Auto-refresh every minute
    },
    todayStats: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: true,
    },
    recentTransactions: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
    },

    // Medium volatility data
    weekStats: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
    },
    monthStats: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
    },
    recentActivities: {
      staleTime: 1000 * 60 * 3, // 3 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },

    // Low volatility / Historical data
    monthlyTrends: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
    productCount: {
      staleTime: 1000 * 60 * 15, // 15 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
    },
    yearTotal: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
} as const

/**
 * Create and configure QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig)
}

/**
 * Global QueryClient instance
 * Use this for the main app
 */
export const queryClient = createQueryClient()

/**
 * Development helpers
 */
if (process.env.NODE_ENV === 'development') {
  // Enable query debugging
  queryClient.setQueryDefaults(['debug'], {
    staleTime: 0, // Always refetch in debug mode
    gcTime: 0, // Don't cache in debug mode
  })

  // Log query events
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'added') {
      // console.log('🔵 React Query: Query added:', event.query.queryKey)
    } else if (event.type === 'removed') {
      // console.log('🔴 React Query: Query removed:', event.query.queryKey)
    } else if (event.type === 'updated') {
      const query = event.query
      if (query.state.status === 'pending') {
        // V6.1 Pattern 21: Library API Compatibility - React Query v5 uses 'pending' instead of 'loading'
        // console.log('🟡 React Query: Query pending:', query.queryKey)
      } else if (query.state.status === 'success') {
        // console.log('🟢 React Query: Query success:', query.queryKey)
      } else if (query.state.status === 'error') {
        // console.log('🔴 React Query: Query error:', query.queryKey, query.state.error)
      }
    }
  })
}

// Export default for convenience
export default queryClient
