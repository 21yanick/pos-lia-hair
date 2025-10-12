/**
 * Quick Booking Dialog Types (Simplified KISS Version)
 * 2-Step booking flow: Time → Customer Creation OR Private Appointment
 * V6.1 Enhanced: Support for private appointments without customer
 */

export type BookingStep = 'time' | 'customer'
export type AppointmentType = 'customer' | 'private'

export interface BookingTimeSlot {
  start: string // "11:00"
  end: string // "12:30"
  date: Date // Full date for this booking
}

export interface QuickBookingFormData {
  // Step 1: Time Selection (simplified)
  timeSlot: BookingTimeSlot | null
  duration: number // Duration in minutes (from settings defaultDuration)

  // Step 2: Appointment Type (V6.1 Enhanced)
  appointmentType: AppointmentType // 'customer' or 'private'

  // Step 2a: Customer Selection/Creation (for customer appointments)
  customerId: string | null // null = create new, string = use existing
  customerName: string
  customerPhone: string | null
  customerEmail: string | null

  // Step 2b: Private Appointment (V6.1 Enhanced)
  title: string // For private appointments (e.g., "Kids Kindergarten abholen")

  // Common fields
  notes: string

  // Exception Appointment
  isExceptionAppointment: boolean // True if booked outside working hours
}

export interface QuickBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialTimeSlot?: BookingTimeSlot
  initialDate?: Date
  isExceptionAppointment?: boolean // True if this is an exception appointment outside working hours
}

export interface TimeStepProps {
  timeSlot: BookingTimeSlot | null
  duration: number
  defaultDuration: number // From settings
  onTimeSlotChange: (timeSlot: BookingTimeSlot) => void
  onDurationChange: (duration: number) => void
}

export interface CustomerStepProps {
  // V6.1 Enhanced: Appointment Type
  appointmentType: AppointmentType
  onAppointmentTypeChange: (type: AppointmentType) => void

  // Customer fields (for 'customer' type)
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  onCustomerChange: (
    customerName: string,
    customerPhone: string | null,
    customerEmail: string | null,
    customerId?: string | null // Add customerId for existing customers
  ) => void

  // Private appointment fields (for 'private' type)
  title: string
  onTitleChange: (title: string) => void

  // Common fields
  notes: string
  onNotesChange: (notes: string) => void

  // Summary data for display
  timeSlot: BookingTimeSlot | null
  duration: number
}
