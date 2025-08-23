'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { type CashMovement, useCashMovements } from '@/shared/hooks/core/useCashMovements'
import { cacheConfig, queryKeys } from '@/shared/lib/react-query'
import {
  type CartItem,
  type CreateSaleData,
  cancelSale as cancelSaleService,
  createReceiptPDF as createReceiptPDFService,
  createSale as createSaleService,
  getSalesForDateRange as getSalesForDateRangeService,
  getTodaySales,
  type Sale,
} from '@/shared/services/salesService'

/**
 * React Query-powered Sales Hook
 *
 * Features:
 * - Optimistic updates for instant POS feedback
 * - Automatic cache invalidation
 * - Background refetching for real-time data
 * - Multi-tenant security
 * - Legacy-compatible interface
 *
 * Performance Optimizations:
 * - Parallel queries where possible
 * - Smart cache strategies per data volatility
 * - Optimistic updates for create/cancel operations
 */

interface UseSalesQueryReturn {
  // State Management (Legacy Compatible)
  loading: boolean
  error: string | null
  sales: Sale[]
  currentSale: Sale | null

  // Core Operations (Legacy Compatible) - V6.1: Updated return types to match implementation
  createSale: (
    data: CreateSaleData
  ) => Promise<
    | { success: true; sale: Sale; receiptUrl?: string; change: number }
    | { success: boolean; error: string }
  >
  createReceiptPDF: (
    sale: Sale,
    items: CartItem[]
  ) => Promise<{ success: true; publicUrl: string } | { success: false; error: string }>

  // Query Operations (Legacy Compatible)
  loadTodaySales: () => Promise<Sale[]>
  getSalesForDateRange: (startDate: string, endDate: string) => Promise<Sale[]>
  loadSalesForDateRange: (startDate: string, endDate: string) => Promise<Sale[]>

  // Modification Operations (Legacy Compatible)
  cancelSale: (
    saleId: string
  ) => Promise<{ success: true; sale: Sale } | { success: false; error: string }>

  // Cash Movement Operations (V6.1: Aligned with useCashMovements actual return types)
  createSaleCashMovement: (saleId: string, amount: number) => Promise<CashMovement | null>
  reverseCashMovement: (
    referenceId: string,
    referenceType: 'expense' | 'sale'
  ) => Promise<CashMovement | null>
}

export function useSalesQuery(): UseSalesQueryReturn {
  const { currentOrganization } = useCurrentOrganization()
  const queryClient = useQueryClient()
  const { createSaleCashMovement, reverseCashMovement } = useCashMovements()

  // Local state for legacy compatibility
  const [currentSale, setCurrentSale] = useState<Sale | null>(null)
  const [error, setError] = useState<string | null>(null)

  const organizationId = currentOrganization?.id

  if (process.env.NODE_ENV === 'development') {
    // console.log('🟢 Using React Query Sales Hook')
  }

  // ========================================
  // Query: Today's Sales
  // ========================================
  const {
    data: sales = [],
    isLoading: isTodayLoading,
    error: todayError,
    refetch: refetchTodaySales,
  } = useQuery({
    queryKey: queryKeys.business.sales.list(organizationId || '', {
      type: 'today',
      date: new Date().toISOString().split('T')[0],
    }),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }
      return await getTodaySales(organizationId)
    },
    enabled: !!organizationId,
    staleTime: cacheConfig.sales.staleTime,
    gcTime: cacheConfig.sales.gcTime,
    meta: {
      errorMessage: 'Fehler beim Laden der heutigen Verkäufe',
    },
  })

  // ========================================
  // Mutation: Create Sale
  // ========================================
  const createSaleMutation = useMutation({
    mutationFn: async (data: CreateSaleData) => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const result = await createSaleService(data, organizationId, {
        createSaleCashMovement: adaptedCreateSaleCashMovement, // V6.1: Use service contract adapter
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      return result
    },
    onMutate: async (newSaleData) => {
      if (!organizationId) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.business.sales.list(organizationId, { type: 'today' }),
      })

      // Snapshot the previous value
      const previousSales = queryClient.getQueryData(
        queryKeys.business.sales.list(organizationId, {
          type: 'today',
          date: new Date().toISOString().split('T')[0],
        })
      ) as Sale[]

      // Create optimistic sale - V6.1: Complete Sale schema alignment
      const optimisticSale: Sale = {
        id: `temp-${Date.now()}`,
        total_amount: newSaleData.total_amount,
        payment_method: newSaleData.payment_method,
        status: 'completed',
        notes: newSaleData.notes || null,
        user_id: 'current-user',
        organization_id: organizationId,
        created_at: new Date().toISOString(),
        // V6.1: Add missing required Sale properties
        bank_transaction_id: null,
        banking_status: null,
        customer_id: null,
        customer_name: null,
        gross_amount: newSaleData.total_amount,
        net_amount: newSaleData.total_amount, // V6.1: Correct field name is net_amount, not tax_amount
        // V6.1: Removed discount_amount, item_count, receipt_url, canceled_at, processing_fee, and currency - not part of Sale schema
        receipt_number: null,
        // V6.1: Add missing provider/settlement fields for complete Sale schema
        provider_fee: null,
        provider_reference_id: null,
        provider_report_id: null,
        settlement_date: null,
        settlement_status: null,
      }

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.business.sales.list(organizationId, {
          type: 'today',
          date: new Date().toISOString().split('T')[0],
        }),
        (old: Sale[] = []) => [optimisticSale, ...old]
      )

      // Return context with the snapshotted value
      return { previousSales, optimisticSale }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousSales && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.sales.list(organizationId, {
            type: 'today',
            date: new Date().toISOString().split('T')[0],
          }),
          context.previousSales
        )
      }

      setError(error instanceof Error ? error.message : 'Fehler beim Erstellen des Verkaufs')
      toast.error(error instanceof Error ? error.message : 'Fehler beim Erstellen des Verkaufs')
    },
    onSuccess: (data) => {
      setCurrentSale(data.sale)
      setError(null)
      toast.success('Verkauf erfolgreich erstellt')

      if (process.env.NODE_ENV === 'development') {
        // console.log('🟢 React Query: Sale created:', data.sale.id)
      }
    },
    onSettled: () => {
      // Always refetch after mutation to ensure data consistency
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.sales.all(organizationId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.cash.balance(organizationId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.dashboard.todayStats(
            organizationId,
            new Date().toISOString().split('T')[0]
          ),
        })
      }
    },
  })

  // ========================================
  // Mutation: Cancel Sale
  // ========================================
  const cancelSaleMutation = useMutation({
    mutationFn: async (saleId: string) => {
      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const result = await cancelSaleService(saleId, organizationId, {
        reverseCashMovement: adaptedReverseCashMovement, // V6.1: Use service contract adapter
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      return result
    },
    onMutate: async (saleId) => {
      if (!organizationId) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.business.sales.list(organizationId),
      })

      // Snapshot the previous value
      const previousSales = queryClient.getQueryData(
        queryKeys.business.sales.list(organizationId, {
          type: 'today',
          date: new Date().toISOString().split('T')[0],
        })
      ) as Sale[]

      // Optimistically update the sale status
      queryClient.setQueryData(
        queryKeys.business.sales.list(organizationId, {
          type: 'today',
          date: new Date().toISOString().split('T')[0],
        }),
        (old: Sale[] = []) =>
          old.map((sale) => (sale.id === saleId ? { ...sale, status: 'cancelled' } : sale))
      )

      // Return context with the snapshotted value
      return { previousSales }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousSales && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.sales.list(organizationId, {
            type: 'today',
            date: new Date().toISOString().split('T')[0],
          }),
          context.previousSales
        )
      }

      setError(error instanceof Error ? error.message : 'Fehler beim Stornieren des Verkaufs')
      toast.error(error instanceof Error ? error.message : 'Fehler beim Stornieren des Verkaufs')
    },
    onSuccess: () => {
      setError(null)
      toast.success('Verkauf erfolgreich storniert')
    },
    onSettled: () => {
      // Always refetch after mutation
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.sales.all(organizationId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.cash.balance(organizationId),
        })
      }
    },
  })

  // ========================================
  // Legacy Compatible Functions
  // ========================================

  // Create Sale (Legacy Compatible)
  const createSale = async (data: CreateSaleData) => {
    try {
      const result = await createSaleMutation.mutateAsync(data)
      return result
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // Create Receipt PDF (Legacy Compatible)
  const createReceiptPDF = async (sale: Sale, items: CartItem[]) => {
    if (!organizationId) {
      return { success: false as const, error: 'No organization selected' }
    }

    try {
      const result = await createReceiptPDFService(sale, items, organizationId)
      // V6.1 Pattern 15: Ensure literal types for union type compatibility
      if (result.success) {
        return { success: true as const, publicUrl: result.publicUrl }
      } else {
        return { success: false as const, error: result.error }
      }
    } catch (error: unknown) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Load Today's Sales (Legacy Compatible)
  // V6.1 Pattern 15: Legacy Compatible - return data directly per interface
  const loadTodaySales = async (): Promise<Sale[]> => {
    try {
      setError(null)
      const data = await refetchTodaySales()
      return data.data || [] // Return data directly per interface expectation
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten')
      throw err // Throw error for Legacy Compatible pattern
    }
  }

  // Get Sales for Date Range (Legacy Compatible)
  // V6.1 Pattern 15: Legacy Compatible - return data directly per interface
  const getSalesForDateRange = async (startDate: string, endDate: string): Promise<Sale[]> => {
    try {
      setError(null)

      if (!organizationId) {
        throw new Error('No organization selected')
      }

      const salesData = await getSalesForDateRangeService(organizationId, startDate, endDate)
      return salesData // Return data directly per interface expectation
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Verkäufe')
      throw err // Throw error for Legacy Compatible pattern
    }
  }

  // Load Sales for Date Range (Legacy Compatible - with state update)
  const loadSalesForDateRange = async (startDate: string, endDate: string) => {
    const salesData = await getSalesForDateRange(startDate, endDate)

    // V6.1: Update query cache with direct array data (Legacy Compatible pattern)
    if (salesData && organizationId) {
      queryClient.setQueryData(
        queryKeys.business.sales.list(organizationId, {
          type: 'dateRange',
          startDate,
          endDate,
        }),
        salesData // Direct array instead of result.sales
      )
    }

    return salesData // V6.1: Return direct array data (Legacy Compatible)
  }

  // Cancel Sale (Legacy Compatible)
  const cancelSale = async (saleId: string) => {
    try {
      const result = await cancelSaleMutation.mutateAsync(saleId)
      // V6.1 Pattern 15: Ensure literal types for union type compatibility
      return { success: true as const, sale: result.sale }
    } catch (err: unknown) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  }

  // ========================================
  // Service Contract Adapters (V6.1: Bridge between useCashMovements and services)
  // ========================================
  const adaptedCreateSaleCashMovement = async (saleId: string, amount: number) => {
    try {
      const result = await createSaleCashMovement(saleId, amount)
      return { success: true, data: result }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  const adaptedReverseCashMovement = async (
    referenceId: string,
    referenceType: 'expense' | 'sale'
  ) => {
    try {
      const result = await reverseCashMovement(referenceId, referenceType)
      return { success: true, data: result }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  // ========================================
  // Combined Loading and Error States
  // ========================================
  const loading = isTodayLoading || createSaleMutation.isPending || cancelSaleMutation.isPending
  const combinedError = error || todayError?.message || null

  // ========================================
  // Return Interface (Legacy Compatible)
  // ========================================
  return {
    // State Management (Legacy Compatible)
    loading,
    error: combinedError,
    sales,
    currentSale,

    // Core Operations (Legacy Compatible)
    createSale,
    createReceiptPDF,

    // Query Operations (Legacy Compatible)
    loadTodaySales,
    getSalesForDateRange,
    loadSalesForDateRange,

    // Modification Operations (Legacy Compatible)
    cancelSale,

    // Cash Movement Operations (V6.1: Added missing functions)
    createSaleCashMovement,
    reverseCashMovement,
  }
}
