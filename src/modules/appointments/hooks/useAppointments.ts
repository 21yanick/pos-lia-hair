'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/lib/react-query/queryKeys'
import {
  type AppointmentInsert,
  type AppointmentUpdate,
  cancelAppointment,
  checkTimeSlotAvailable,
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  getAppointmentsForDateRange,
  getCustomerAppointments,
  updateAppointment,
} from '@/shared/services/appointmentService'
import { formatDateForAPI } from '@/shared/utils/dateUtils'

/**
 * Hook for fetching appointments by date
 */
export const useAppointmentsByDate = (organizationId: string, date: Date) => {
  const dateStr = formatDateForAPI(date)

  return useQuery({
    queryKey: queryKeys.business.appointments.byDate(organizationId, dateStr),
    queryFn: async () => {
      return getAppointments(organizationId, date)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!organizationId,
    refetchOnWindowFocus: false, // Disabled: was causing excessive re-renders
  })
}

/**
 * Hook for fetching appointments by date range (for week/month views)
 */
export const useAppointmentsByDateRange = (
  organizationId: string,
  startDate: Date,
  endDate: Date
) => {
  const startDateStr = formatDateForAPI(startDate)
  const endDateStr = formatDateForAPI(endDate)

  return useQuery({
    queryKey: queryKeys.business.appointments.byDateRange(organizationId, startDateStr, endDateStr),
    queryFn: async () => {
      return getAppointmentsForDateRange(organizationId, startDate, endDate)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!organizationId && !!startDate && !!endDate,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook for fetching a single appointment by ID
 */
export const useAppointment = (appointmentId: string, organizationId: string) => {
  return useQuery({
    queryKey: queryKeys.business.appointments.detail(organizationId, appointmentId),
    queryFn: async () => {
      return getAppointmentById(appointmentId, organizationId)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!organizationId && !!appointmentId,
  })
}

/**
 * Hook for fetching customer appointments
 */
export const useCustomerAppointments = (
  customerId: string,
  organizationId: string,
  limit?: number
) => {
  return useQuery({
    queryKey: queryKeys.business.appointments.byCustomer(organizationId, customerId),
    queryFn: async () => {
      return getCustomerAppointments(customerId, organizationId, limit)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!organizationId && !!customerId,
  })
}

/**
 * Hook for checking time slot availability
 */
export const useTimeSlotAvailability = (
  organizationId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
) => {
  return useQuery({
    queryKey: queryKeys.business.appointments.conflicts(
      organizationId,
      date,
      startTime,
      endTime,
      excludeAppointmentId
    ),
    queryFn: async () => {
      return checkTimeSlotAvailable(organizationId, date, startTime, endTime, excludeAppointmentId)
    },
    staleTime: 1 * 60 * 1000, // 1 minute (short because conflicts change quickly)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!organizationId && !!date && !!startTime && !!endTime,
  })
}

/**
 * Mutation hook for creating appointments
 */
export const useCreateAppointment = (organizationId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentData: AppointmentInsert) => {
      const result = await createAppointment(appointmentData, organizationId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (newAppointment) => {
      // Invalidate specific date query for immediate update
      const appointmentDate = newAppointment.appointment_date
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.appointments.byDate(organizationId, appointmentDate),
      })

      // Invalidate customer appointments if customer linked
      if (newAppointment.customer_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.appointments.byCustomer(
            organizationId,
            newAppointment.customer_id
          ),
        })
      }
    },
    onError: (_error) => {
      // Error handling delegated to UI layer
    },
  })
}

/**
 * Mutation hook for updating appointments
 */
export const useUpdateAppointment = (organizationId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentUpdate: AppointmentUpdate) => {
      const result = await updateAppointment(appointmentUpdate, organizationId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (updatedAppointment) => {
      // Invalidate specific date query for immediate update
      const appointmentDate = updatedAppointment.appointment_date
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.appointments.byDate(organizationId, appointmentDate),
      })

      // Update specific appointment in cache
      queryClient.setQueryData(
        queryKeys.business.appointments.detail(organizationId, updatedAppointment.id),
        updatedAppointment
      )

      // Invalidate customer appointments if customer linked
      if (updatedAppointment.customer_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.appointments.byCustomer(
            organizationId,
            updatedAppointment.customer_id
          ),
        })
      }
    },
    onError: (_error) => {
      // Error handling delegated to UI layer
    },
  })
}

/**
 * Mutation hook for cancelling appointments
 */
export const useCancelAppointment = (organizationId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const result = await cancelAppointment(appointmentId, organizationId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (cancelledAppointment) => {
      // Invalidate specific date query for immediate update
      const appointmentDate = cancelledAppointment.appointment_date
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.appointments.byDate(organizationId, appointmentDate),
      })

      // Update specific appointment in cache
      queryClient.setQueryData(
        queryKeys.business.appointments.detail(organizationId, cancelledAppointment.id),
        cancelledAppointment
      )

      // Invalidate customer appointments if customer linked
      if (cancelledAppointment.customer_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.appointments.byCustomer(
            organizationId,
            cancelledAppointment.customer_id
          ),
        })
      }
    },
    onError: (_error) => {
      // Error handling delegated to UI layer
    },
  })
}

/**
 * Mutation hook for deleting appointments
 */
export const useDeleteAppointment = (organizationId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const result = await deleteAppointment(appointmentId, organizationId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return appointmentId
    },
    onSuccess: (deletedAppointmentId, _variables, _context: unknown) => {
      // Note: We need the appointment date for targeted invalidation
      // For now, invalidate all to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.appointments.all(organizationId),
      })

      // Remove from specific detail cache
      queryClient.removeQueries({
        queryKey: queryKeys.business.appointments.detail(organizationId, deletedAppointmentId),
      })
    },
    onError: (_error) => {
      // Error handling delegated to UI layer
    },
  })
}

/**
 * Combined hook with all appointment operations
 * Convenience hook following the pattern from useCustomers
 */
export const useAppointmentActions = (organizationId: string) => {
  const createMutation = useCreateAppointment(organizationId)
  const updateMutation = useUpdateAppointment(organizationId)
  const cancelMutation = useCancelAppointment(organizationId)
  const deleteMutation = useDeleteAppointment(organizationId)

  return {
    // Mutations
    createAppointment: createMutation.mutate,
    updateAppointment: updateMutation.mutate,
    cancelAppointment: cancelMutation.mutate,
    deleteAppointment: deleteMutation.mutate,

    // Async versions
    createAppointmentAsync: createMutation.mutateAsync,
    updateAppointmentAsync: updateMutation.mutateAsync,
    cancelAppointmentAsync: cancelMutation.mutateAsync,
    deleteAppointmentAsync: deleteMutation.mutateAsync,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Any operation pending
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      cancelMutation.isPending ||
      deleteMutation.isPending,

    // Error states
    createError: createMutation.error,
    updateError: updateMutation.error,
    cancelError: cancelMutation.error,
    deleteError: deleteMutation.error,
  }
}
