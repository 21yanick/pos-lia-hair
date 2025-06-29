'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  createCustomerNote,
  updateCustomerNote,
  deleteCustomerNote
} from '@/shared/services/customerService'
import { queryKeys } from '@/shared/lib/react-query/queryKeys'
import type { CustomerFormData, Customer, CustomerNote } from '@/shared/services/customerService'

/**
 * Hook for customer CRUD operations with optimistic updates
 */
export const useCustomerActions = (organizationId: string) => {
  const queryClient = useQueryClient()

  // Create new customer
  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => createCustomer(organizationId, data),
    onSuccess: (newCustomer) => {
      // Invalidate customers list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.business.customers.all(organizationId) 
      })
      
      // Optimistically add to cache
      queryClient.setQueryData(
        queryKeys.business.customers.detail(organizationId, newCustomer.id),
        newCustomer
      )
    }
  })

  // Update customer
  const updateMutation = useMutation({
    mutationFn: ({ customerId, data }: { customerId: string, data: Partial<CustomerFormData> }) => 
      updateCustomer(customerId, data, organizationId),
    onMutate: async ({ customerId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.business.customers.detail(organizationId, customerId) 
      })

      // Snapshot previous value
      const previousCustomer = queryClient.getQueryData(
        queryKeys.business.customers.detail(organizationId, customerId)
      )

      // Optimistically update cache
      queryClient.setQueryData(
        queryKeys.business.customers.detail(organizationId, customerId),
        (old: Customer | undefined) => old ? { ...old, ...data } : old
      )

      return { previousCustomer }
    },
    onError: (err, { customerId }, context) => {
      // Rollback on error
      if (context?.previousCustomer) {
        queryClient.setQueryData(
          queryKeys.business.customers.detail(organizationId, customerId),
          context.previousCustomer
        )
      }
    },
    onSettled: (data, error, { customerId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.business.customers.detail(organizationId, customerId)
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.business.customers.all(organizationId) 
      })
    }
  })

  // Soft delete customer
  const deleteMutation = useMutation({
    mutationFn: (customerId: string) => deleteCustomer(customerId, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.business.customers.all(organizationId) 
      })
    }
  })

  // Create customer note
  const createNoteMutation = useMutation({
    mutationFn: ({ customerId, blockName, content }: { 
      customerId: string, 
      blockName: string, 
      content: string 
    }) => createCustomerNote(customerId, blockName, content, organizationId),
    onSuccess: (newNote, { customerId }) => {
      // Invalidate customer details to refetch with new note
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.business.customers.withNotes(organizationId, customerId)
      })
    }
  })

  // Update customer note
  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, data, customerId }: { 
      noteId: string, 
      data: { block_name?: string; content?: string },
      customerId: string
    }) => updateCustomerNote(noteId, data, organizationId),
    onSuccess: (updatedNote, { customerId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.business.customers.withNotes(organizationId, customerId)
      })
    }
  })

  // Delete customer note
  const deleteNoteMutation = useMutation({
    mutationFn: ({ noteId, customerId }: { noteId: string, customerId: string }) => 
      deleteCustomerNote(noteId, organizationId),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.business.customers.withNotes(organizationId, customerId)
      })
    }
  })

  return {
    createCustomer: createMutation,
    updateCustomer: updateMutation,
    deleteCustomer: deleteMutation,
    createNote: createNoteMutation,
    updateNote: updateNoteMutation,
    deleteNote: deleteNoteMutation,
  }
}