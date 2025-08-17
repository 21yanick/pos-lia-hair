'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/lib/react-query/queryKeys'
import { getCustomers, searchCustomers } from '@/shared/services/customerService'

/**
 * Hook for fetching customers list with optional search
 */
export const useCustomersQuery = (organizationId: string, searchQuery?: string) => {
  return useQuery({
    queryKey:
      searchQuery && searchQuery.length >= 2
        ? queryKeys.business.customers.search(organizationId, searchQuery)
        : queryKeys.business.customers.list(organizationId, { active_only: true }),
    queryFn: async () => {
      if (searchQuery && searchQuery.length >= 2) {
        return searchCustomers(organizationId, searchQuery)
      }
      const result = await getCustomers(organizationId, { active_only: true })
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
