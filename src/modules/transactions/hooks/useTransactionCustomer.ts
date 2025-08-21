'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/shared/lib/supabase/client'
import type { Customer } from '@/shared/services/customerService'
import type { TransactionSearchQuery, UnifiedTransaction } from '../types/unifiedTransactions'

/**
 * Transaction Query Keys - matches useTransactionsQuery pattern
 */
const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (query: TransactionSearchQuery) => [...transactionKeys.lists(), query] as const,
}

/**
 * Customer Assignment Service
 * Assigns customers to sales transactions with optimistic updates
 */
export const assignCustomerToSale = async (
  saleId: string,
  customer: Customer | null,
  organizationId: string
): Promise<void> => {
  // Security: Verify the sale belongs to the organization
  const { data: sale, error: verifyError } = await supabase
    .from('sales')
    .select('id, organization_id')
    .eq('id', saleId)
    .eq('organization_id', organizationId)
    .single()

  if (verifyError || !sale) {
    throw new Error('Sale nicht gefunden oder keine Berechtigung')
  }

  // Update sale with customer information
  const { error: updateError } = await supabase
    .from('sales')
    .update({
      customer_id: customer?.id || null,
      customer_name: customer?.name || null,
    })
    .eq('id', saleId)
    .eq('organization_id', organizationId)

  if (updateError) {
    throw new Error(`Fehler beim Zuweisen des Kunden: ${updateError.message}`)
  }
}

/**
 * Hook for customer assignment to transactions
 * Provides optimistic updates and proper error handling
 */
export const useTransactionCustomer = (organizationId: string) => {
  const queryClient = useQueryClient()

  // Customer assignment mutation
  const assignCustomerMutation = useMutation({
    mutationFn: ({
      transactionId,
      customer,
    }: {
      transactionId: string
      customer: Customer | null
    }) => assignCustomerToSale(transactionId, customer, organizationId),

    onMutate: async ({ transactionId, customer }) => {
      // Cancel outgoing transaction queries
      await queryClient.cancelQueries({
        queryKey: transactionKeys.lists(),
      })

      // Snapshot previous transaction data
      const previousTransactions = queryClient.getQueryData(transactionKeys.lists()) as
        | UnifiedTransaction[]
        | undefined

      // Find and update the specific transaction optimistically
      if (previousTransactions) {
        const updatedTransactions = previousTransactions.map((transaction) => {
          if (transaction.id === transactionId && transaction.transaction_type === 'sale') {
            return {
              ...transaction,
              customer_id: customer?.id || null,
              customer_name: customer?.name || null,
            }
          }
          return transaction
        })

        // Optimistically update cache
        queryClient.setQueryData(transactionKeys.lists(), updatedTransactions)
      }

      return { previousTransactions }
    },

    onError: (error, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousTransactions) {
        queryClient.setQueryData(transactionKeys.lists(), context.previousTransactions)
      }

      // Show error toast
      toast.error(`Fehler beim Zuweisen des Kunden: ${error.message}`)
    },

    onSuccess: (_, { customer }) => {
      // Show success toast
      if (customer) {
        toast.success(`Kunde "${customer.name}" erfolgreich zugewiesen`)
      } else {
        toast.success('Kundenzuordnung erfolgreich entfernt')
      }

      // Invalidate transactions to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: transactionKeys.lists(),
      })
    },
  })

  return {
    assignCustomer: assignCustomerMutation.mutateAsync,
    isAssigning: assignCustomerMutation.isPending,
    error: assignCustomerMutation.error,
  }
}
