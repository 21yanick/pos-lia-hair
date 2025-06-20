'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
import { useCashMovements } from '@/shared/hooks/core/useCashMovements'
import { queryKeys, cacheConfig } from '@/shared/lib/react-query'
import {
  createSale as createSaleService,
  cancelSale as cancelSaleService,
  getTodaySales,
  getSalesForDateRange as getSalesForDateRangeService,
  createReceiptPDF as createReceiptPDFService,
  type Sale,
  type CreateSaleData,
  type CartItem
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
  
  // Core Operations (Legacy Compatible)
  createSale: (data: CreateSaleData) => Promise<any>
  createReceiptPDF: (sale: Sale, items: CartItem[]) => Promise<any>
  
  // Query Operations (Legacy Compatible) 
  loadTodaySales: () => Promise<any>
  getSalesForDateRange: (startDate: string, endDate: string) => Promise<any>
  loadSalesForDateRange: (startDate: string, endDate: string) => Promise<any>
  
  // Modification Operations (Legacy Compatible)
  cancelSale: (saleId: string) => Promise<any>
}

export function useSalesQuery(): UseSalesQueryReturn {
  const { currentOrganization } = useOrganization()
  const queryClient = useQueryClient()
  const { createSaleCashMovement, reverseCashMovement } = useCashMovements()
  
  // Local state for legacy compatibility
  const [currentSale, setCurrentSale] = useState<Sale | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const organizationId = currentOrganization?.id

  if (process.env.NODE_ENV === 'development') {
    console.log('🟢 Using React Query Sales Hook')
  }

  // ========================================
  // Query: Today's Sales
  // ========================================
  const {
    data: sales = [],
    isLoading: isTodayLoading,
    error: todayError,
    refetch: refetchTodaySales
  } = useQuery({
    queryKey: queryKeys.business.sales.list(organizationId || '', { 
      type: 'today',
      date: new Date().toISOString().split('T')[0]
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
      errorMessage: 'Fehler beim Laden der heutigen Verkäufe'
    }
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
        createSaleCashMovement
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
        queryKey: queryKeys.business.sales.list(organizationId, { type: 'today' })
      })

      // Snapshot the previous value
      const previousSales = queryClient.getQueryData(
        queryKeys.business.sales.list(organizationId, { 
          type: 'today',
          date: new Date().toISOString().split('T')[0]
        })
      ) as Sale[]

      // Create optimistic sale
      const optimisticSale: Sale = {
        id: `temp-${Date.now()}`,
        total_amount: newSaleData.total_amount.toString(),
        payment_method: newSaleData.payment_method,
        status: 'completed',
        notes: newSaleData.notes || null,
        user_id: 'current-user',
        organization_id: organizationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.business.sales.list(organizationId, { 
          type: 'today',
          date: new Date().toISOString().split('T')[0]
        }),
        (old: Sale[] = []) => [optimisticSale, ...old]
      )

      // Return context with the snapshotted value
      return { previousSales, optimisticSale }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousSales && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.sales.list(organizationId, { 
            type: 'today',
            date: new Date().toISOString().split('T')[0]
          }),
          context.previousSales
        )
      }
      
      setError(error.message || 'Fehler beim Erstellen des Verkaufs')
      toast.error(error.message || 'Fehler beim Erstellen des Verkaufs')
    },
    onSuccess: (data) => {
      setCurrentSale(data.sale)
      setError(null)
      toast.success('Verkauf erfolgreich erstellt')
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🟢 React Query: Sale created:', data.sale.id)
      }
    },
    onSettled: () => {
      // Always refetch after mutation to ensure data consistency
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.sales.all(organizationId)
        })
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.cash.balance(organizationId)
        })
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.dashboard.todayStats(organizationId, new Date().toISOString().split('T')[0])
        })
      }
    }
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
        reverseCashMovement
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
        queryKey: queryKeys.business.sales.list(organizationId)
      })

      // Snapshot the previous value
      const previousSales = queryClient.getQueryData(
        queryKeys.business.sales.list(organizationId, { 
          type: 'today',
          date: new Date().toISOString().split('T')[0]
        })
      ) as Sale[]

      // Optimistically update the sale status
      queryClient.setQueryData(
        queryKeys.business.sales.list(organizationId, { 
          type: 'today',
          date: new Date().toISOString().split('T')[0]
        }),
        (old: Sale[] = []) => 
          old.map(sale => 
            sale.id === saleId ? { ...sale, status: 'cancelled' } : sale
          )
      )

      // Return context with the snapshotted value
      return { previousSales }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousSales && organizationId) {
        queryClient.setQueryData(
          queryKeys.business.sales.list(organizationId, { 
            type: 'today',
            date: new Date().toISOString().split('T')[0]
          }),
          context.previousSales
        )
      }
      
      setError(error.message || 'Fehler beim Stornieren des Verkaufs')
      toast.error(error.message || 'Fehler beim Stornieren des Verkaufs')
    },
    onSuccess: () => {
      setError(null)
      toast.success('Verkauf erfolgreich storniert')
    },
    onSettled: () => {
      // Always refetch after mutation
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.sales.all(organizationId)
        })
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.cash.balance(organizationId)
        })
      }
    }
  })

  // ========================================
  // Legacy Compatible Functions
  // ========================================

  // Create Sale (Legacy Compatible)
  const createSale = async (data: CreateSaleData) => {
    try {
      const result = await createSaleMutation.mutateAsync(data)
      return result
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Create Receipt PDF (Legacy Compatible)
  const createReceiptPDF = async (sale: Sale, items: CartItem[]) => {
    if (!organizationId) {
      return { success: false, error: 'No organization selected' }
    }
    
    try {
      return await createReceiptPDFService(sale, items, organizationId)
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Load Today's Sales (Legacy Compatible)
  const loadTodaySales = async () => {
    try {
      setError(null)
      const data = await refetchTodaySales()
      return { success: true, data: data.data }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Daten')
      return { success: false, error: err.message }
    }
  }

  // Get Sales for Date Range (Legacy Compatible)
  const getSalesForDateRange = async (startDate: string, endDate: string) => {
    try {
      setError(null)
      
      if (!organizationId) {
        throw new Error('No organization selected')
      }
      
      const salesData = await getSalesForDateRangeService(organizationId, startDate, endDate)
      return { success: true, sales: salesData }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Verkäufe')
      return { success: false, error: err.message, sales: [] }
    }
  }

  // Load Sales for Date Range (Legacy Compatible - with state update)
  const loadSalesForDateRange = async (startDate: string, endDate: string) => {
    const result = await getSalesForDateRange(startDate, endDate)
    
    // Update query cache with the loaded data
    if (result.success && organizationId) {
      queryClient.setQueryData(
        queryKeys.business.sales.list(organizationId, { 
          type: 'dateRange',
          startDate,
          endDate
        }),
        result.sales
      )
    }
    
    return result
  }

  // Cancel Sale (Legacy Compatible)
  const cancelSale = async (saleId: string) => {
    try {
      const result = await cancelSaleMutation.mutateAsync(saleId)
      return result
    } catch (err: any) {
      return { success: false, error: err.message }
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
    cancelSale
  }
}