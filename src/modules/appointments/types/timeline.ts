/**
 * Timeline Types for Day View
 * Clean, type-safe definitions for timeline components
 */

export type SlotStatus = 
  | 'available'       // Free slot, bookable
  | 'booked'          // Has appointment
  | 'break'           // Business break time
  | 'closed'          // Outside business hours
  | 'buffer'          // Buffer time between appointments

export interface AppointmentService {
  id: string
  name: string
  price: number
  duration_minutes: number
  notes?: string
  sort_order: number
}

export interface TimeSlot {
  time: string          // "09:00", "09:15", etc.
  date: Date            // Full date+time for this slot
  status: SlotStatus
  duration: number      // Slot duration in minutes (15, 30, etc.)
  isClickable: boolean
  breakReason?: string  // "Mittagspause", etc.
}

export interface AppointmentBlock {
  id: string
  title: string
  customerName?: string
  startTime: string     // "09:00"
  endTime: string       // "10:30"
  duration: number      // Duration in minutes
  services: AppointmentService[]  // Full service objects with details
  notes?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  backgroundColor?: string
  textColor?: string
  estimatedPrice?: number
  totalPrice?: number   // Calculated from services
  totalDuration?: number // Calculated from services
}

export interface TimelineHour {
  hour: number          // 9, 10, 11, etc.
  timeLabel: string     // "09:00"
  slots: TimeSlot[]     // All slots in this hour
  appointments: AppointmentBlock[]
}

export interface TimelineData {
  date: Date
  hours: TimelineHour[]
  startHour: number     // 8, 9, etc.
  endHour: number       // 18, 19, etc.
  slotInterval: number  // 15, 30 minutes
  businessHours: {
    start: string       // "09:00"
    end: string         // "18:00"
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
    className: 'bg-muted/30 hover:bg-muted/60 cursor-pointer border border-dashed border-muted-foreground/20 transition-all',
    description: 'Verfügbar'
  },
  booked: {
    className: 'cursor-pointer', // Styling applied by AppointmentBlock
    description: 'Gebucht'
  },
  break: {
    className: 'bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300',
    description: 'Pause'
  },
  closed: {
    className: 'bg-muted text-muted-foreground opacity-50',
    description: 'Geschlossen'
  },
  buffer: {
    className: 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300',
    description: 'Pufferzeit'
  }
} as const

/**
 * Timeline layout configuration
 */
export const TIMELINE_CONFIG = {
  hourHeight: 80,           // Height per hour in pixels
  slotMinHeight: 20,        // Minimum height per slot
  appointmentMinHeight: 48, // Minimum height for appointments (increased for name visibility)
  hourLabelWidth: 64,       // Width of hour labels column
  scrollPadding: 20,        // Padding for smooth scrolling
  touchTargetSize: 44       // Minimum touch target size (Apple HIG)
} as const

/**
 * Business hours validation
 */
export interface WorkingPeriod {
  start: string
  end: string
  type: 'work' | 'break'
}