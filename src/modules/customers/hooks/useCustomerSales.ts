'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase/client'
import { queryKeys } from '@/shared/lib/react-query/queryKeys'
import { validateOrganizationId } from '@/shared/services/customerService'
import type { Sale } from '@/shared/services/salesService'

// Extended Sale type with items
export interface SaleWithItems extends Sale {
  sale_items: Array<{
    id: string
    price: string
    quantity: number
    notes: string | null
    item: {
      id: string
      name: string
      default_price: number
      type: string
    } | null
  }>
}

/**
 * Hook for fetching customer sales history with item details
 */
export const useCustomerSales = (customerId: string, organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.business.customers.sales(organizationId, customerId),
    queryFn: async () => {
      const validOrgId = validateOrganizationId(organizationId)
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            id,
            price,
            quantity,
            notes,
            item:items (
              id,
              name,
              default_price,
              type
            )
          )
        `)
        .eq('customer_id', customerId)
        .eq('organization_id', validOrgId)
        .eq('status', 'completed') // Only completed sales
        .order('created_at', { ascending: false })
        .limit(10) // Only show last 10 sales
      
      if (error) {
        throw new Error(`Error fetching customer sales: ${error.message}`)
      }
      
      return (data || []) as SaleWithItems[]
    },
    staleTime: 2 * 60 * 1000,   // 2 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes
    enabled: !!customerId && !!organizationId,
  })
}

/**
 * Hook for getting customer's last visit date
 */
export const useCustomerLastVisit = (customerId: string, organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.business.customers.lastVisit(organizationId, customerId),
    queryFn: async () => {
      const validOrgId = validateOrganizationId(organizationId)
      
      const { data, error } = await supabase
        .from('sales')
        .select('created_at')
        .eq('customer_id', customerId)
        .eq('organization_id', validOrgId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No sales found
          return null
        }
        throw new Error(`Error fetching last visit: ${error.message}`)
      }
      
      return data?.created_at || null
    },
    staleTime: 5 * 60 * 1000,   // 5 minutes  
    gcTime: 15 * 60 * 1000,     // 15 minutes
    enabled: !!customerId && !!organizationId,
  })
}

/**
 * Hook for getting customer sales statistics
 */
export const useCustomerSalesStats = (customerId: string, organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.business.customers.salesStats(organizationId, customerId),
    queryFn: async () => {
      const validOrgId = validateOrganizationId(organizationId)
      
      const { data, error } = await supabase
        .from('sales')
        .select('total_amount, created_at')
        .eq('customer_id', customerId)
        .eq('organization_id', validOrgId)
        .eq('status', 'completed')
      
      if (error) {
        throw new Error(`Error fetching customer sales stats: ${error.message}`)
      }
      
      const sales = data || []
      const totalSpent = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0)
      const visitCount = sales.length
      
      return {
        totalSpent,
        visitCount,
        sales
      }
    },
    staleTime: 10 * 60 * 1000,  // 10 minutes
    gcTime: 30 * 60 * 1000,     // 30 minutes 
    enabled: !!customerId && !!organizationId,
  })
}