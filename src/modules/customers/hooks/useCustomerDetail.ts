'use client'

import { useQuery } from '@tanstack/react-query'
import { getCustomerWithNotes, getCustomerById } from '@/shared/services/customerService'
import { queryKeys } from '@/shared/lib/react-query/queryKeys'

/**
 * Hook for fetching single customer with notes
 */
export const useCustomerDetail = (customerId: string, organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.business.customers.withNotes(organizationId, customerId),
    queryFn: () => getCustomerWithNotes(customerId, organizationId),
    staleTime: 30 * 1000,       // 30 seconds
    gcTime: 5 * 60 * 1000,      // 5 minutes
    enabled: !!customerId && !!organizationId,
  })
}

/**
 * Hook for fetching single customer without notes (lighter query)
 */
export const useCustomer = (customerId: string, organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.business.customers.detail(organizationId, customerId),
    queryFn: () => getCustomerById(customerId, organizationId),
    staleTime: 2 * 60 * 1000,   // 2 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes
    enabled: !!customerId && !!organizationId,
  })
}