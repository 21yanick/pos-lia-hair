/**
 * Quick Booking Dialog Types
 * 2-Step booking flow with multi-service selection
 */

import type { Item } from '@/shared/hooks/business/useItems'
import type { Appointment } from '@/shared/services/appointmentService'

export type BookingStep = 'services' | 'customer'

export interface ServiceSelection {
  service: Item
  selected: boolean
  // Duration is always taken from service.duration_minutes (no override)
}

export interface BookingTimeSlot {
  start: string    // "11:00"  
  end: string      // "12:30"
  date: Date       // Full date for this booking
}

export interface QuickBookingFormData {
  // Step 1: Services + Time
  selectedServices: ServiceSelection[]
  totalDuration: number
  timeSlot: BookingTimeSlot | null
  
  // Step 2: Customer  
  customerId: string | null
  customerName: string
  customerPhone: string | null
  notes: string
  isWalkIn: boolean
  
  // Exception Appointment
  isExceptionAppointment: boolean  // True if booked outside working hours
}

export interface QuickBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialTimeSlot?: BookingTimeSlot
  initialDate?: Date
  isExceptionAppointment?: boolean  // True if this is an exception appointment outside working hours
}

export interface ServiceStepProps {
  availableServices: Item[]
  selectedServices: ServiceSelection[]
  totalDuration: number
  timeSlot: BookingTimeSlot | null
  onServicesChange: (services: ServiceSelection[]) => void
  onTimeSlotChange: (timeSlot: BookingTimeSlot) => void
  onDurationAdjust: (newDuration: number) => void
}

export interface CustomerStepProps {
  customerId: string | null
  customerName: string
  customerPhone: string | null
  notes: string
  isWalkIn: boolean
  onCustomerChange: (customerId: string | null, customerName: string, customerPhone: string | null) => void
  onWalkInToggle: (isWalkIn: boolean) => void
  onNotesChange: (notes: string) => void
  // Summary data for display
  selectedServices: ServiceSelection[]
  timeSlot: BookingTimeSlot | null
  totalDuration: number
}

