/**
 * Appointments Module (Phase 3)
 *
 * Simple appointment booking system for hair salon
 * - Clean calendar views (mobile agenda + desktop week)
 * - 2-step booking flow (QuickBookingDialog)
 * - Swiss timezone support
 * - Multi-tenant architecture
 */

// Main Components
export { AppointmentsPage } from './components/AppointmentsPage'

// NEW: Phase 2 Calendar Components (clean replacement)
export * from './components/calendar'

// Dialog Components (QuickBookingDialog exported via ./components/dialogs)

// Re-export service types for convenience
export type {
  Appointment,
  AppointmentDeleteResult,
  AppointmentInsert,
  AppointmentMutationResult,
  AppointmentQueryResult,
  AppointmentUpdate,
} from '@/shared/services/appointmentService'
export { BookingRulesConfig } from './components/settings/BookingRulesConfig'
// Settings Components
export { BusinessHoursConfig } from './components/settings/BusinessHoursConfig'
export { VacationManager } from './components/settings/VacationManager'
// Hooks
export {
  useAppointment,
  useAppointmentActions,
  useAppointmentsByDate,
  useAppointmentsByDateRange,
  useCancelAppointment,
  useCreateAppointment,
  useCustomerAppointments,
  useDeleteAppointment,
  useTimeSlotAvailability,
  useUpdateAppointment,
} from './hooks/useAppointments'
