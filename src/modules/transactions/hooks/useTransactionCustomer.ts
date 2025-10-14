'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/shared/lib/supabase/client'
import type { Customer } from '@/shared/services/customerService'
import { archiveOldPdf, linkPdfVersions } from '@/shared/services/pdfArchiveService'
import type { TransactionSearchQuery, UnifiedTransaction } from '../types/unifiedTransactions'
import {
  getWarningPromptMessage,
  needsRegeneration,
  shouldPromptBeforeRegeneration,
} from '../utils/customerAssignmentGuards'
import { usePdfActions } from './usePdfActions'

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
 * Includes automatic PDF regeneration with smart guards
 */
export const useTransactionCustomer = (organizationId: string) => {
  const queryClient = useQueryClient()
  const { generatePdf } = usePdfActions()

  // Helper: Silent PDF regeneration with archiving
  const regeneratePdfSilently = async (transactionId: string) => {
    try {
      // 1. Archive old PDF (if exists)
      const archivedDocId = await archiveOldPdf(
        transactionId,
        'sale',
        organizationId,
        'customer_changed'
      )

      if (!archivedDocId) {
        console.log('No existing PDF to archive, creating new one')
      }

      // 2. Regenerate PDF with updated customer info (uses ORIGINAL sale.created_at!)
      // Type assertion OK here - generatePdf only uses id and transaction_type internally
      const transaction = {
        id: transactionId,
        transaction_type: 'sale' as const,
      } as UnifiedTransaction
      const success = await generatePdf(transaction)

      if (!success) {
        throw new Error('Failed to generate PDF')
      }

      // 3. Link versions for audit trail (if old PDF existed)
      if (archivedDocId) {
        const { data: newDoc } = await supabase
          .from('documents')
          .select('id')
          .eq('reference_id', transactionId)
          .eq('type', 'receipt')
          .eq('organization_id', organizationId)
          .is('replacement_reason', null) // Only current/active PDF
          .single()

        if (newDoc) {
          await linkPdfVersions(archivedDocId, newDoc.id)
        }
      }

      toast.success('Rechnung wurde aktualisiert')
    } catch (error) {
      console.error('Failed to regenerate PDF:', error)
      toast.error('Fehler bei PDF-Generierung', {
        description:
          'Die Kundenzuweisung wurde gespeichert, aber die Rechnung konnte nicht aktualisiert werden.',
      })
    }
  }

  // Customer assignment mutation
  const assignCustomerMutation = useMutation({
    mutationFn: async ({
      transactionId,
      customer,
    }: {
      transactionId: string
      customer: Customer | null
    }) => {
      // 1. Get current sale data (for customer comparison)
      const { data: sale, error } = await supabase
        .from('sales')
        .select('customer_id, customer_name')
        .eq('id', transactionId)
        .eq('organization_id', organizationId)
        .single()

      if (error || !sale) {
        throw new Error('Sale nicht gefunden')
      }

      // 2. Assign customer to sale in database
      await assignCustomerToSale(transactionId, customer, organizationId)

      // 3. Determine if PDF regeneration needed
      const needsRegen = needsRegeneration(sale.customer_id, customer?.id || null)
      const needsPrompt = shouldPromptBeforeRegeneration(sale.customer_id, customer?.id || null)

      return {
        success: true,
        needsRegeneration: needsRegen,
        needsPrompt,
        oldCustomerId: sale.customer_id,
        oldCustomerName: sale.customer_name,
        newCustomer: customer,
        transactionId,
      }
    },

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

    onSuccess: async (result) => {
      // Show success toast
      if (result.newCustomer) {
        toast.success(`Kunde "${result.newCustomer.name}" zugewiesen`)
      } else {
        toast.success('Kunde entfernt')
      }

      // Handle PDF regeneration if needed
      if (result.needsRegeneration) {
        if (result.needsPrompt && result.oldCustomerName) {
          // ❌ DANGEROUS CHANGE: Prompt user (Customer A → Customer B)
          const confirmed = window.confirm(
            getWarningPromptMessage(result.oldCustomerName, result.newCustomer?.name || null)
          )

          if (confirmed) {
            await regeneratePdfSilently(result.transactionId)
          } else {
            toast.info('Rechnung wurde nicht aktualisiert', {
              description: 'Du kannst sie später manuell neu generieren',
            })
          }
        } else {
          // ✅ SAFE CHANGE: Silent regeneration (NULL → Customer or Customer → NULL)
          await regeneratePdfSilently(result.transactionId)
        }
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
