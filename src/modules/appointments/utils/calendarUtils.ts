/**
 * Calendar Utility Functions
 * Clean, pure functions for calendar calculations
 */

import type { BusinessSettings, VacationPeriod, WeekDay } from '@/shared/types/businessSettings'
import { safeVacationPeriods, safeWorkingHours } from '@/shared/types/businessSettings'
import {
  eachDayOfInterval,
  formatDateForAPI,
  formatMonthYear,
  formatWeekdayFullDate,
  isSameMonth,
  isToday,
  isWeekend,
} from '@/shared/utils/dateUtils'
import type { CalendarDay, DayStatus, MonthData } from '../types/calendar'

/**
 * Generate complete month data with 42 days (6 weeks)
 * Always shows complete weeks for consistent grid layout
 */
export function generateMonthData(date: Date): MonthData {
  // Use noon to avoid timezone issues
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0)
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12, 0, 0, 0)

  // Get complete weeks (42 days total for consistent 6x7 grid)
  const calendarStart = getWeekStart(monthStart)
  const calendarEnd = getWeekEnd(monthEnd)

  const days = eachDayOfInterval(calendarStart, calendarEnd)

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    monthName: formatMonthYear(date),
    days: days.map((day) => createCalendarDay(day, date)),
    startDate: calendarStart,
    endDate: calendarEnd,
  }
}

/**
 * Create a single calendar day with initial status
 * Business logic will be applied separately
 */
function createCalendarDay(date: Date, currentMonth: Date): CalendarDay {
  const isCurrentMonth = isSameMonth(date, currentMonth)

  return {
    date,
    dayNumber: date.getDate(),
    status: getInitialDayStatus(date, isCurrentMonth),
    appointmentCount: 0, // Will be populated by business logic
    isWeekend: isWeekend(date),
    isClickable: true, // All days are clickable (other-month days navigate to that month)
    vacationReason: undefined, // Will be populated if in vacation period
  }
}

/**
 * Get initial day status before business logic
 */
function getInitialDayStatus(date: Date, isCurrentMonth: boolean): DayStatus {
  if (!isCurrentMonth) return 'other-month'
  if (isToday(date)) return 'today'
  return 'available' // Default, will be updated by business logic
}

/**
 * Apply business settings to determine day status
 */
export function applyBusinessLogicToMonth(
  monthData: MonthData,
  businessSettings: BusinessSettings | null,
  appointmentCounts: Record<string, number> = {}
): MonthData {
  if (!businessSettings) return monthData

  return {
    ...monthData,
    days: monthData.days.map((day) =>
      applyBusinessLogicToDay(day, businessSettings, appointmentCounts)
    ),
  }
}

/**
 * Apply business logic to a single day
 */
function applyBusinessLogicToDay(
  day: CalendarDay,
  settings: BusinessSettings,
  appointmentCounts: Record<string, number>
): CalendarDay {
  // Skip other-month days
  if (day.status === 'other-month') return day

  const dayKey = formatDateForAPI(day.date)
  const appointmentCount = appointmentCounts[dayKey] || 0

  // Check vacation periods - V6.1: Use safe type guard for JSONB union type
  const vacationInfo = getVacationInfo(day.date, safeVacationPeriods(settings.vacation_periods))
  if (vacationInfo) {
    return {
      ...day,
      status: 'vacation',
      appointmentCount,
      isClickable: true, // Allow exception appointments
      vacationReason: vacationInfo.reason,
    }
  }

  // IMPORTANT: 'today' ALWAYS has highest priority
  if (day.status === 'today') {
    return {
      ...day,
      status: 'today', // Today always wins, even over closed/vacation
      appointmentCount,
      isClickable: true,
    }
  }

  // Check if business is open on this day - V6.1: Use safe type guard for JSONB union type
  const weekDay = getWeekDay(day.date)
  const workingHours = safeWorkingHours(settings.working_hours)
  const dayWorkingHours = workingHours[weekDay]

  if (dayWorkingHours.closed) {
    return {
      ...day,
      status: 'closed',
      appointmentCount,
      isClickable: true, // Allow exception appointments
    }
  }

  // Determine status based on appointments
  const status = appointmentCount > 0 ? 'booked' : 'available'

  return {
    ...day,
    status,
    appointmentCount,
    isClickable: true,
  }
}

/**
 * Check if a date falls within any vacation period
 */
function getVacationInfo(date: Date, vacationPeriods: VacationPeriod[]): VacationPeriod | null {
  const dateStr = formatDateForAPI(date)

  return (
    vacationPeriods.find((vacation) => {
      return dateStr >= vacation.start && dateStr <= vacation.end
    }) || null
  )
}

/**
 * Convert Date to WeekDay type
 */
function getWeekDay(date: Date): WeekDay {
  const dayIndex = date.getDay()
  const weekDays: WeekDay[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  return weekDays[dayIndex]
}

/**
 * Format date for display in day cell
 */
export function formatDayNumber(day: CalendarDay): string {
  return day.dayNumber.toString()
}

/**
 * Get accessibility label for a day
 */
export function getDayAriaLabel(day: CalendarDay): string {
  const dateStr = formatWeekdayFullDate(day.date)
  const statusText = getStatusText(day.status)

  let label = `${dateStr}, ${statusText}`

  if (day.appointmentCount > 0) {
    label += `, ${day.appointmentCount} Termin${day.appointmentCount !== 1 ? 'e' : ''}`
  }

  if (day.vacationReason) {
    label += `, ${day.vacationReason}`
  }

  return label
}

/**
 * Get human-readable status text
 */
function getStatusText(status: DayStatus): string {
  switch (status) {
    case 'today':
      return 'Heute'
    case 'available':
      return 'Verfügbar'
    case 'booked':
      return 'Termine vorhanden'
    case 'vacation':
      return 'Urlaubszeit'
    case 'closed':
      return 'Geschlossen'
    case 'other-month':
      return 'Anderer Monat'
    default:
      return ''
  }
}

/**
 * Get start of week (Monday) for a given date
 * Uses noon to avoid timezone issues
 */
function getWeekStart(date: Date): Date {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday = 1, Sunday = 0
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff, 12, 0, 0, 0)
  return result
}

/**
 * Get end of week (Sunday) for a given date
 * Uses noon to avoid timezone issues
 */
function getWeekEnd(date: Date): Date {
  const day = date.getDay()
  const diff = day === 0 ? 0 : 7 - day // Sunday = 0
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff, 12, 0, 0, 0)
  return result
}
