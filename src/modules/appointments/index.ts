/**
 * Appointments Module (Phase 3)
 * 
 * Simple appointment booking system for hair salon
 * - Clean calendar views (mobile agenda + desktop week)
 * - 3-step booking flow
 * - Swiss timezone support
 * - Multi-tenant architecture
 */

// Main Components
export { AppointmentsPage } from './components/AppointmentsPage'

// Calendar Components  
export { AgendaView } from './components/calendar/AgendaView'
export { SimpleWeekView } from './components/calendar/SimpleWeekView'

// Dialog Components
export { AppointmentDialog } from './components/AppointmentDialog'
export { TimeSlotPicker } from './components/TimeSlotPicker'

// Hooks
export { 
  useAppointmentsByDate,
  useAppointmentsByDateRange,
  useAppointment,
  useCustomerAppointments,
  useTimeSlotAvailability,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
  useDeleteAppointment,
  useAppointmentActions
} from './hooks/useAppointments'

// Re-export service types for convenience
export type {
  Appointment,
  AppointmentInsert,
  AppointmentUpdate,
  AppointmentQueryResult,
  AppointmentMutationResult,
  AppointmentDeleteResult
} from '@/shared/services/appointmentService'