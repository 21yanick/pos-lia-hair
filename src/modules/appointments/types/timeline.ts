/**
 * Timeline Types for Day View
 * Clean, type-safe definitions for timeline components
 */

export type SlotStatus =
  | 'available' // Free slot, bookable
  | 'booked' // Has appointment
  | 'break' // Business break time
  | 'closed' // Outside business hours
  | 'buffer' // Buffer time between appointments
  | 'exception' // Exception appointment slot (outside normal hours)

export interface AppointmentService {
  id: string
  name: string
  price: number
  duration_minutes: number
  notes?: string
  sort_order: number
}

export interface TimeSlot {
  time: string // "09:00", "09:15", etc.
  date: Date // Full date+time for this slot
  status: SlotStatus
  duration: number // Slot duration in minutes (15, 30, etc.)
  isClickable: boolean
  breakReason?: string // "Mittagspause", etc.
}

export interface AppointmentBlock {
  id: string
  title?: string // V6.1 Enhanced: For private appointments (e.g., "Kids Kindergarten abholen")
  customerName?: string
  startTime: string // "09:00"
  endTime: string // "10:30"
  duration: number // Duration in minutes
  date: Date // Appointment date
  services: AppointmentService[] // Full service objects with details
  notes?: string
  backgroundColor?: string
  textColor?: string
  estimatedPrice?: number
  totalPrice?: number // Calculated from services
  totalDuration?: number // Calculated from services
  // Additional fields for editing and customer details
  customerId?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  // Note: V6.1 doesn't have status field - removed for KISS compliance
}

export interface TimelineHour {
  hour: number // 9, 10, 11, etc.
  timeLabel: string // "09:00"
  slots: TimeSlot[] // All slots in this hour
  appointments: AppointmentBlock[]
}

export interface TimelineData {
  date: Date
  hours: TimelineHour[]
  startHour: number // 8, 9, etc.
  endHour: number // 18, 19, etc.
  slotInterval: number // 15, 30 minutes
  businessHours: {
    start: string // "09:00"
    end: string // "18:00"
    breaks: Array<{
      start: string
      end: string
    }>
  }
}

export interface DayTimelineProps {
  selectedDate: Date
  onSlotClick?: (slot: TimeSlot) => void
  onAppointmentClick?: (appointment: AppointmentBlock) => void
  className?: string
}

/**
 * Timeline configuration for visual styling
 */
export const SLOT_CONFIG = {
  available: {
    className:
      'bg-muted/30 hover:bg-muted/60 cursor-pointer border border-dashed border-muted-foreground/20 transition-all',
    description: 'Verfügbar',
  },
  booked: {
    className: 'cursor-pointer', // Styling applied by AppointmentBlock
    description: 'Gebucht',
  },
  break: {
    className: 'bg-warning/10 border border-warning/20 text-warning-foreground',
    description: 'Pause',
  },
  closed: {
    className: 'bg-muted text-muted-foreground opacity-50',
    description: 'Geschlossen',
  },
  buffer: {
    className: 'bg-primary/10 border border-primary/20 text-primary-foreground',
    description: 'Pufferzeit',
  },
  exception: {
    className:
      'bg-destructive/30 hover:bg-destructive/40 cursor-pointer border border-dashed border-destructive/60 transition-all',
    description: 'Ausnahmetermin möglich',
  },
} as const

/**
 * Timeline layout configuration
 */
export const TIMELINE_CONFIG = {
  hourHeight: 80, // Height per hour in pixels
  slotMinHeight: 20, // Minimum height per slot
  appointmentMinHeight: 48, // Minimum height for appointments (increased for name visibility)
  hourLabelWidth: 64, // Width of hour labels column
  scrollPadding: 20, // Padding for smooth scrolling
  touchTargetSize: 44, // Minimum touch target size (Apple HIG)
} as const

/**
 * Business hours validation
 */
export interface WorkingPeriod {
  start: string
  end: string
  type: 'work' | 'break'
}
