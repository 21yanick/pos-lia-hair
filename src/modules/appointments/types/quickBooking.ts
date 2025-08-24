/**
 * Quick Booking Dialog Types (Simplified KISS Version)
 * 2-Step booking flow: Time → Customer Creation
 */

export type BookingStep = 'time' | 'customer'

export interface BookingTimeSlot {
  start: string // "11:00"
  end: string // "12:30"
  date: Date // Full date for this booking
}

export interface QuickBookingFormData {
  // Step 1: Time Selection (simplified)
  timeSlot: BookingTimeSlot | null
  duration: number // Duration in minutes (from settings defaultDuration)

  // Step 2: Customer Selection/Creation
  customerId: string | null // null = create new, string = use existing
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
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
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  notes: string
  onCustomerChange: (
    customerName: string,
    customerPhone: string | null,
    customerEmail: string | null,
    customerId?: string | null // Add customerId for existing customers
  ) => void
  onNotesChange: (notes: string) => void
  // Summary data for display
  timeSlot: BookingTimeSlot | null
  duration: number
}
