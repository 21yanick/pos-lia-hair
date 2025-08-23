'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { supabase } from '@/shared/lib/supabase/client'
import type {
  PdfRequirement,
  PdfStatus,
  TransactionSearchQuery,
  UnifiedTransaction,
} from '../types/unifiedTransactions'

/**
 * Calculate PDF status for a transaction
 */
function calculatePdfStatus(tx: UnifiedTransaction): {
  status: PdfStatus
  requirement: PdfRequirement
} {
  // Cash Movements and Bank Transactions don't need PDFs
  if (tx.transaction_type === 'cash_movement' || tx.transaction_type === 'bank_transaction') {
    return {
      status: 'not_needed',
      requirement: 'not_applicable',
    }
  }

  // Sales and Expenses need PDFs
  if (tx.transaction_type === 'sale' || tx.transaction_type === 'expense') {
    if (tx.has_pdf || tx.document_id) {
      return {
        status: 'available',
        requirement: 'required',
      }
    } else {
      return {
        status: 'missing',
        requirement: 'required',
      }
    }
  }

  // Fallback
  return {
    status: 'not_needed',
    requirement: 'optional',
  }
}

/**
 * React Query key factory for transactions
 */
const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (query: TransactionSearchQuery) => [...transactionKeys.lists(), query] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
}

/**
 * Hook for fetching transactions with React Query
 */
export function useTransactionsQuery(query: TransactionSearchQuery = {}) {
  const { currentOrganization } = useCurrentOrganization()

  return useQuery({
    queryKey: transactionKeys.list(query),
    queryFn: async () => {
      if (!currentOrganization) {
        throw new Error('No organization selected')
      }

      // Build query
      let dbQuery = supabase
        .from('unified_transactions_view')
        .select('*')
        .eq('organization_id', currentOrganization.id)

      // Apply filters
      if (query.receiptNumber) {
        dbQuery = dbQuery.ilike('receipt_number_lower', `%${query.receiptNumber.toLowerCase()}%`)
      }
      if (query.description) {
        dbQuery = dbQuery.ilike('description_lower', `%${query.description.toLowerCase()}%`)
      }
      if (query.dateFrom) {
        dbQuery = dbQuery.gte('date_only', query.dateFrom)
      }
      if (query.dateTo) {
        dbQuery = dbQuery.lte('date_only', query.dateTo)
      }
      if (query.transactionTypes?.length) {
        dbQuery = dbQuery.in('transaction_type', query.transactionTypes)
      }
      if (query.hasPdf !== undefined) {
        dbQuery = dbQuery.eq('has_pdf', query.hasPdf)
      }

      // Default sorting
      dbQuery = dbQuery.order('transaction_date', { ascending: false })

      const { data, error } = await dbQuery

      if (error) throw error

      // V6.1 Pattern 19: Schema Property Alignment - database view data structure
      const typedData = (data || []) as Omit<UnifiedTransaction, 'pdf_status' | 'pdf_requirement'>[]

      // V6.1 Pattern 19: Schema Property Alignment - add calculated PDF properties
      const transactionsWithPdfStatus = typedData.map((tx) => {
        const pdfStatus = calculatePdfStatus(tx as UnifiedTransaction) // V6.1 Pattern 19: Safe casting for calculation
        return {
          ...tx,
          pdf_status: pdfStatus.status,
          pdf_requirement: pdfStatus.requirement,
        } as UnifiedTransaction
      })

      return transactionsWithPdfStatus
    },
    enabled: !!currentOrganization,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes

    // Mobile optimization: refetch when window regains focus
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,

    // Keep previous data while fetching (React Query v5 migration)
    placeholderData: (previousData) => previousData, // V6.1 Pattern 20: Library API Compatibility - React Query v5 migration
  })
}

/**
 * Hook for updating a single transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { currentOrganization } = useCurrentOrganization()

  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (!currentOrganization) {
        throw new Error('No organization selected')
      }

      const { data, error } = await supabase
        .from('unified_transactions_view')
        .select('*')
        .eq('id', transactionId)
        .eq('organization_id', currentOrganization.id)
        .single()

      if (error) throw error

      // V6.1 Pattern 19: Schema Property Alignment - calculate PDF status for updated transaction
      const baseTransaction = data as Omit<UnifiedTransaction, 'pdf_status' | 'pdf_requirement'> // V6.1 Pattern 19: Safe partial casting
      const pdfStatus = calculatePdfStatus(baseTransaction as UnifiedTransaction) // V6.1 Pattern 19: Safe casting for calculation
      return {
        ...baseTransaction,
        pdf_status: pdfStatus.status,
        pdf_requirement: pdfStatus.requirement,
      } as UnifiedTransaction
    },
    onSuccess: (updatedTransaction) => {
      // Update all queries that might contain this transaction
      queryClient.setQueriesData(
        { queryKey: transactionKeys.lists() },
        (oldData: UnifiedTransaction[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map((tx) => (tx.id === updatedTransaction.id ? updatedTransaction : tx))
        }
      )

      // Update specific transaction detail
      queryClient.setQueryData(transactionKeys.detail(updatedTransaction.id), updatedTransaction)
    },
  })
}

/**
 * Hook for generating a PDF (updates transaction after success)
 */
export function useGeneratePdf() {
  const _queryClient = useQueryClient()
  const updateTransaction = useUpdateTransaction()

  return useMutation({
    mutationFn: async (transactionId: string) => {
      // This will be called by the PDF generation logic
      // For now, just trigger a transaction update after PDF generation
      return transactionId
    },
    onSuccess: async (transactionId) => {
      // Refetch the specific transaction to get updated PDF status
      await updateTransaction.mutateAsync(transactionId)
    },
  })
}

/**
 * Hook to invalidate transaction queries
 */
export function useInvalidateTransactions() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: transactionKeys.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) }),
  }
}
