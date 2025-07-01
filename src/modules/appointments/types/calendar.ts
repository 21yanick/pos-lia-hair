/**
 * Calendar Types for Appointment System
 * Clean, type-safe definitions for calendar components
 */

export type DayStatus = 
  | 'today'           // Today (primary highlight)
  | 'available'       // Free day with working hours
  | 'booked'          // Has appointments
  | 'vacation'        // In vacation period
  | 'closed'          // Business closed (no working hours)
  | 'other-month'     // Days from previous/next month

export interface CalendarDay {
  date: Date
  dayNumber: number
  status: DayStatus
  appointmentCount: number
  isWeekend: boolean
  isClickable: boolean
  vacationReason?: string
}

export interface MonthData {
  year: number
  month: number
  monthName: string
  days: CalendarDay[]
  startDate: Date
  endDate: Date
}

export interface MonthGridProps {
  currentDate: Date
  onDayClick: (date: Date) => void
  className?: string
}

/**
 * Visual indicator configuration for different day states
 */
export const DAY_INDICATOR_CONFIG = {
  today: {
    className: 'bg-primary text-primary-foreground ring-2 ring-primary/50 font-semibold',
    description: 'Heute'
  },
  available: {
    className: 'bg-muted/30 text-foreground hover:bg-muted/60 transition-colors cursor-pointer',
    description: 'Verfügbar'
  },
  booked: {
    className: 'bg-secondary text-secondary-foreground font-medium cursor-pointer hover:bg-secondary/80',
    description: 'Termine vorhanden'
  },
  vacation: {
    className: 'bg-destructive/20 text-destructive border border-destructive/30 relative overflow-hidden',
    description: 'Urlaubszeit'
  },
  closed: {
    className: 'bg-muted text-muted-foreground opacity-60',
    description: 'Geschlossen'
  },
  'other-month': {
    className: 'text-muted-foreground/40 cursor-default',
    description: 'Anderer Monat'
  }
} as const

/**
 * Swiss locale settings for calendar
 */
export const SWISS_CALENDAR_CONFIG = {
  locale: 'de-CH',
  weekStartsOn: 1, // Monday
  monthNames: [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ],
  weekDayNames: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  weekDayNamesLong: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
} as const