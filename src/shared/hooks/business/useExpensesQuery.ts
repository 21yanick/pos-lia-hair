'use client'

import { useState, useMemo, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useOrganization } from '@/modules/organization'
import { useCashMovements } from '@/shared/hooks/core/useCashMovements'
import { queryKeys, cacheConfig } from '@/shared/lib/react-query'
import {
  getExpenses,
  getExpensesByDateRange,
  getCurrentMonthExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadExpenseReceipt,
  replaceExpenseReceipt,
  generatePlaceholderReceipt,
  calculateExpenseStats,
  groupExpensesByCategory,
  EXPENSE_CATEGORIES,
  type ExpenseWithSupplier,
  type ExpenseInsert,
  type ExpenseUpdate,
  type ExpenseCategory,
  type ExpenseStats
} from '@/shared/services/expensesService'

/**
 * React Query-powered Expenses Hook
 * 
 * Features:
 * - Smart caching for expense data (5min stale time)
 * - Optimistic updates for instant CRUD feedback
 * - Automatic cache invalidation and synchronization
 * - Multi-tenant security
 * - Legacy-compatible interface
 * - Document/receipt management
 * - Advanced analytics and statistics
 * 
 * Performance Optimizations:
 * - Medium cache potential (expenses change moderately)
 * - Parallel queries for different time ranges
 * - Smart invalidation strategies
 * - Background refetching for data freshness
 */

interface UseExpensesQueryReturn {
  // State Management (Legacy Compatible)
  expenses: ExpenseWithSupplier[]
  loading: boolean
  error: string | null
  currentExpense: ExpenseWithSupplier | null
  
  // CRUD Operations (Legacy Compatible)
  createExpense: (data: ExpenseInsert, receiptFile?: File) => Promise<{ success: boolean; expense?: any; document?: any; error?: string }>
  loadExpenses: (limit?: number) => Promise<{ success: boolean; expenses?: ExpenseWithSupplier[]; error?: string }>
  loadExpensesByDateRange: (startDate: string, endDate: string) => Promise<{ success: boolean; expenses?: ExpenseWithSupplier[]; error?: string }>
  loadCurrentMonthExpenses: () => Promise<{ success: boolean; expenses?: ExpenseWithSupplier[]; error?: string }>
  updateExpense: (id: string, updates: Partial<ExpenseUpdate>) => Promise<{ success: boolean; expense?: any; error?: string }>
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>
  
  // Analytics & Statistics (Legacy Compatible)
  calculateExpenseStats: () => ExpenseStats
  getExpensesByCategory: () => Record<ExpenseCategory, ExpenseWithSupplier[]>
  
  // Document Management (Legacy Compatible)
  uploadExpenseReceipt: (expenseId: string, file: File) => Promise<{ success: boolean; document?: any; error?: string }>
  replaceExpenseReceipt: (expenseId: string, newFile: File) => Promise<{ success: boolean; document?: any; error?: string }>
  generatePlaceholderReceipt: (expenseId: string, archiveLocation?: string) => Promise<{ success: boolean; document?: any; error?: string }>
  
  // Constants (Legacy Compatible)
  EXPENSE_CATEGORIES: Record<ExpenseCategory, string>
}

export function useExpensesQuery(): UseExpensesQueryReturn {
  // ========================================
  // Organization Context & State
  // ========================================
  
  const { currentOrganization } = useOrganization()
  const queryClient = useQueryClient()
  const { createExpenseCashMovement } = useCashMovements()
  const [currentExpense, setCurrentExpense] = useState<ExpenseWithSupplier | null>(null)
  
  const organizationId = currentOrganization?.id
  
  // ========================================
  // Query Keys
  // ========================================
  
  const queryKey = organizationId ? queryKeys.business.expenses.list(organizationId) : null
  const statsQueryKey = organizationId ? queryKeys.business.expenses.stats(organizationId) : null
  const groupedQueryKey = organizationId ? queryKeys.business.expenses.grouped(organizationId) : null
  
  // ========================================
  // Main Expenses Query (5min cache)
  // ========================================
  
  // REACT QUERY FIX: Stabilize query with useMemo and better error handling
  const stableQueryKey = useMemo(() => {
    return organizationId ? queryKeys.business.expenses.list(organizationId) : ['expenses', 'disabled']
  }, [organizationId])
  
  const queryFunction = useCallback(async () => {
    if (!organizationId) {
      throw new Error('Organization ID erforderlich')
    }
    
    const result = await getExpenses(organizationId)
    
    // CRITICAL: Return data directly, not wrapped result
    if (result.success && Array.isArray(result.data)) {
      return result.data
    } else {
      throw new Error(result.error || 'Fehler beim Laden der Ausgaben')
    }
  }, [organizationId])
  
  const {
    data: expenses = [],
    isLoading: loading,
    error: queryError,
    isFetching,
    isStale
  } = useQuery({
    queryKey: stableQueryKey,
    queryFn: queryFunction,
    enabled: !!organizationId,
    staleTime: cacheConfig.expenses.staleTime, // 5 minutes
    gcTime: cacheConfig.expenses.gcTime, // 10 minutes
    retry: (failureCount, error) => {
      // console.log('Query retry:', failureCount, error.message)
      return failureCount < 3
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: 'Fehler beim Laden der Ausgaben'
    }
  })
  
  // Error state
  const error = queryError?.message || null
  
  // ========================================
  // Optimistic Mutations
  // ========================================
  
  // Create Expense Mutation
  const createExpenseMutation = useMutation({
    mutationFn: async ({ data, receiptFile }: { data: ExpenseInsert; receiptFile?: File }) => {
      if (!organizationId) throw new Error('Organization ID erforderlich')
      const result = await createExpense(data, organizationId, receiptFile)
      if (!result.success) throw new Error(result.error)
      
      // Create cash movement for cash expenses (Business Logic Integration)
      if (data.payment_method === 'cash') {
        try {
          await createExpenseCashMovement(
            result.data.id,
            data.amount,
            EXPENSE_CATEGORIES[data.category as ExpenseCategory] || 'Sonstiges',
            data.description
          )
        } catch (cashError) {
          console.error('Fehler beim Erstellen der Bargeld-Bewegung:', cashError)
          // Don't throw - expense was created successfully
        }
      }
      
      return result
    },
    onMutate: async ({ data }) => {
      if (!queryKey) return
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })
      
      // Snapshot previous value
      const previousExpenses = queryClient.getQueryData(queryKey) as ExpenseWithSupplier[]
      
      // Optimistically update
      const optimisticExpense: ExpenseWithSupplier = {
        id: `temp-${Date.now()}`,
        ...data,
        organization_id: organizationId!,
        created_at: new Date().toISOString(),
        supplier: null
      }
      
      queryClient.setQueryData(queryKey, (old: ExpenseWithSupplier[] = []) => [
        optimisticExpense,
        ...old
      ])
      
      return { previousExpenses }
    },
    onError: (err, _variables, context) => {
      if (queryKey && context?.previousExpenses) {
        queryClient.setQueryData(queryKey, context.previousExpenses)
      }
      toast.error('Fehler beim Erstellen der Ausgabe', {
        description: err.message
      })
    },
    onSuccess: (result) => {
      // Invalidate and refetch related queries
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.expenses.lists(organizationId) 
        })
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.cash.all(organizationId) 
        })
      }
      
      setCurrentExpense(result.data)
      
      toast.success('Ausgabe erfolgreich erstellt', {
        description: result.document ? 'Mit Beleg hochgeladen' : 'Ohne Beleg'
      })
    }
  })
  
  // Update Expense Mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ updates }: { updates: ExpenseUpdate }) => {
      if (!organizationId) throw new Error('Organization ID erforderlich')
      const result = await updateExpense(updates, organizationId)
      if (!result.success) throw new Error(result.error)
      return result
    },
    onMutate: async ({ updates }) => {
      if (!queryKey) return
      
      await queryClient.cancelQueries({ queryKey })
      const previousExpenses = queryClient.getQueryData(queryKey) as ExpenseWithSupplier[]
      
      // Optimistically update
      queryClient.setQueryData(queryKey, (old: ExpenseWithSupplier[] = []) => 
        old.map(expense => 
          expense.id === updates.id 
            ? { ...expense, ...updates }
            : expense
        )
      )
      
      return { previousExpenses }
    },
    onError: (err, _variables, context) => {
      if (queryKey && context?.previousExpenses) {
        queryClient.setQueryData(queryKey, context.previousExpenses)
      }
      toast.error('Fehler beim Aktualisieren der Ausgabe', {
        description: err.message
      })
    },
    onSuccess: (result) => {
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.expenses.lists(organizationId) 
        })
      }
      
      if (currentExpense?.id === result.data.id) {
        setCurrentExpense({ ...currentExpense, ...result.data })
      }
      
      toast.success('Ausgabe erfolgreich aktualisiert')
    }
  })
  
  // Delete Expense Mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!organizationId) throw new Error('Organization ID erforderlich')
      const result = await deleteExpense(expenseId, organizationId)
      if (!result.success) throw new Error(result.error)
      return { expenseId }
    },
    onMutate: async (expenseId) => {
      if (!queryKey) return
      
      await queryClient.cancelQueries({ queryKey })
      const previousExpenses = queryClient.getQueryData(queryKey) as ExpenseWithSupplier[]
      
      // Optimistically remove
      queryClient.setQueryData(queryKey, (old: ExpenseWithSupplier[] = []) =>
        old.filter(expense => expense.id !== expenseId)
      )
      
      return { previousExpenses }
    },
    onError: (err, _expenseId, context) => {
      if (queryKey && context?.previousExpenses) {
        queryClient.setQueryData(queryKey, context.previousExpenses)
      }
      toast.error('Fehler beim Löschen der Ausgabe', {
        description: err.message
      })
    },
    onSuccess: ({ expenseId }) => {
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.expenses.lists(organizationId) 
        })
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.business.cash.all(organizationId) 
        })
      }
      
      if (currentExpense?.id === expenseId) {
        setCurrentExpense(null)
      }
      
      toast.success('Ausgabe erfolgreich gelöscht')
    }
  })
  
  // ========================================
  // Document Management Mutations
  // ========================================
  
  // Upload Receipt Mutation
  const uploadReceiptMutation = useMutation({
    mutationFn: async ({ expenseId, file }: { expenseId: string; file: File }) => {
      if (!organizationId) throw new Error('Organization ID erforderlich')
      const result = await uploadExpenseReceipt(expenseId, file, organizationId)
      if (!result.success) throw new Error(result.error)
      return result
    },
    onError: (err) => {
      toast.error('Fehler beim Hochladen des Belegs', {
        description: err.message
      })
    },
    onSuccess: () => {
      toast.success('Beleg erfolgreich hochgeladen')
    }
  })
  
  // Replace Receipt Mutation
  const replaceReceiptMutation = useMutation({
    mutationFn: async ({ expenseId, newFile }: { expenseId: string; newFile: File }) => {
      if (!organizationId) throw new Error('Organization ID erforderlich')
      const result = await replaceExpenseReceipt(expenseId, newFile, organizationId)
      if (!result.success) throw new Error(result.error)
      return result
    },
    onError: (err) => {
      toast.error('Fehler beim Ersetzen des Belegs', {
        description: err.message
      })
    },
    onSuccess: () => {
      toast.success('Beleg erfolgreich ersetzt')
    }
  })
  
  // Generate Placeholder Receipt Mutation
  const generatePlaceholderMutation = useMutation({
    mutationFn: async ({ expenseId, archiveLocation }: { expenseId: string; archiveLocation?: string }) => {
      if (!organizationId) throw new Error('Organization ID erforderlich')
      const result = await generatePlaceholderReceipt(expenseId, organizationId, archiveLocation)
      if (!result.success) throw new Error(result.error)
      return result
    },
    onError: (err) => {
      toast.error('Fehler beim Erstellen des Platzhalter-Belegs', {
        description: err.message
      })
    },
    onSuccess: () => {
      toast.success('Platzhalter-Beleg erfolgreich erstellt')
    }
  })
  
  // ========================================
  // Legacy-Compatible Interface Functions
  // ========================================
  
  const createExpenseWrapper = async (data: ExpenseInsert, receiptFile?: File) => {
    try {
      const result = await createExpenseMutation.mutateAsync({ data, receiptFile })
      return {
        success: true,
        expense: result.data,
        document: result.document || null
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      }
    }
  }
  
  const loadExpensesWrapper = async (limit?: number) => {
    try {
      if (!organizationId) throw new Error('Organization ID erforderlich')
      const result = await getExpenses(organizationId, limit)
      if (!result.success) throw new Error(result.error)
      
      // Update query cache
      if (queryKey) {
        queryClient.setQueryData(queryKey, result.data)
      }
      
      return {
        success: true,
        expenses: result.data
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      }
    }
  }
  
  const loadExpensesByDateRangeWrapper = async (startDate: string, endDate: string) => {
    try {
      if (!organizationId) throw new Error('Organization ID erforderlich')
      const result = await getExpensesByDateRange(organizationId, startDate, endDate)
      if (!result.success) throw new Error(result.error)
      
      // Cache date range query separately
      const dateRangeQueryKey = queryKeys.business.expenses.dateRange(organizationId, startDate, endDate)
      queryClient.setQueryData(dateRangeQueryKey, result.data)
      
      return {
        success: true,
        expenses: result.data
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      }
    }
  }
  
  const loadCurrentMonthExpensesWrapper = async () => {
    try {
      if (!organizationId) throw new Error('Organization ID erforderlich')
      const result = await getCurrentMonthExpenses(organizationId)
      if (!result.success) throw new Error(result.error)
      
      // Cache current month query separately
      const currentMonthQueryKey = queryKeys.business.expenses.currentMonth(organizationId)
      queryClient.setQueryData(currentMonthQueryKey, result.data)
      
      return {
        success: true,
        expenses: result.data
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      }
    }
  }
  
  const updateExpenseWrapper = async (id: string, updates: Partial<ExpenseUpdate>) => {
    try {
      const result = await updateExpenseMutation.mutateAsync({ 
        updates: { ...updates, id } 
      })
      return {
        success: true,
        expense: result.data
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      }
    }
  }
  
  const deleteExpenseWrapper = async (id: string) => {
    try {
      await deleteExpenseMutation.mutateAsync(id)
      return {
        success: true
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      }
    }
  }
  
  const uploadExpenseReceiptWrapper = async (expenseId: string, file: File) => {
    try {
      const result = await uploadReceiptMutation.mutateAsync({ expenseId, file })
      return {
        success: true,
        document: result.document
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      }
    }
  }
  
  const replaceExpenseReceiptWrapper = async (expenseId: string, newFile: File) => {
    try {
      const result = await replaceReceiptMutation.mutateAsync({ expenseId, newFile })
      return {
        success: true,
        document: result.document
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      }
    }
  }
  
  const generatePlaceholderReceiptWrapper = async (expenseId: string, archiveLocation?: string) => {
    try {
      const result = await generatePlaceholderMutation.mutateAsync({ expenseId, archiveLocation })
      return {
        success: true,
        document: result.document
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      }
    }
  }
  
  // ========================================
  // Analytics Functions
  // ========================================
  
  const calculateStatsWrapper = () => {
    return calculateExpenseStats(expenses as ExpenseWithSupplier[])
  }
  
  const getExpensesByCategoryWrapper = () => {
    return groupExpensesByCategory(expenses as ExpenseWithSupplier[])
  }
  
  // ========================================
  // Return Interface
  // ========================================
  
  return {
    // State Management (Legacy Compatible)
    expenses: expenses as ExpenseWithSupplier[],
    loading,
    error,
    currentExpense,
    
    // CRUD Operations (Legacy Compatible)
    createExpense: createExpenseWrapper,
    loadExpenses: loadExpensesWrapper,
    loadExpensesByDateRange: loadExpensesByDateRangeWrapper,
    loadCurrentMonthExpenses: loadCurrentMonthExpensesWrapper,
    updateExpense: updateExpenseWrapper,
    deleteExpense: deleteExpenseWrapper,
    
    // Analytics & Statistics (Legacy Compatible)
    calculateExpenseStats: calculateStatsWrapper,
    getExpensesByCategory: getExpensesByCategoryWrapper,
    
    // Document Management (Legacy Compatible)
    uploadExpenseReceipt: uploadExpenseReceiptWrapper,
    replaceExpenseReceipt: replaceExpenseReceiptWrapper,
    generatePlaceholderReceipt: generatePlaceholderReceiptWrapper,
    
    // Constants (Legacy Compatible)
    EXPENSE_CATEGORIES
  }
}

// ========================================
// Re-export types for convenience
// ========================================

export type { ExpenseWithSupplier, ExpenseInsert, ExpenseUpdate, ExpenseCategory, ExpenseStats }
export { EXPENSE_CATEGORIES }