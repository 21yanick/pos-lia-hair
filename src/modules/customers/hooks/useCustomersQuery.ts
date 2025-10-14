'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/lib/react-query/queryKeys'
import { getCustomers, searchCustomers } from '@/shared/services/customerService'

/**
 * Hook for fetching customers list with optional search and filter
 */
export const useCustomersQuery = (
  organizationId: string,
  searchQuery?: string,
  filter: 'active' | 'archived' | 'all' = 'active'
) => {
  return useQuery({
    queryKey:
      searchQuery && searchQuery.length >= 2
        ? queryKeys.business.customers.search(organizationId, searchQuery, filter)
        : queryKeys.business.customers.list(organizationId, {
            active_only: filter === 'active' ? true : filter === 'archived' ? false : undefined,
          }),
    queryFn: async () => {
      if (searchQuery && searchQuery.length >= 2) {
        return searchCustomers(organizationId, searchQuery, filter)
      }

      const active_only = filter === 'active' ? true : filter === 'archived' ? false : undefined
      const result = await getCustomers(organizationId, { active_only })
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!organizationId,
  })
}

/**
 * Hook for fetching all customers (including inactive)
 */
export const useAllCustomersQuery = (organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.business.customers.list(organizationId, { active_only: false }),
    queryFn: async () => {
      const result = await getCustomers(organizationId, { active_only: false })
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!organizationId,
  })
}
