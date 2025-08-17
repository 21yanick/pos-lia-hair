/**
 * Timeline Utility Functions
 * Business logic for day timeline generation and calculations
 */

import { isSameDay, setHours, setMinutes, startOfDay } from 'date-fns'
import type { BusinessSettings, DayWorkingHours } from '@/shared/types/businessSettings'
import { formatTimeShort24h, timeToMinutes } from '@/shared/utils/dateUtils'
import type {
  AppointmentBlock,
  SlotStatus,
  TimelineData,
  TimelineHour,
  TimeSlot,
} from '../types/timeline'

/**
 * Generate complete timeline data for a specific date
 */
export function generateTimelineData(
  date: Date,
  businessSettings: BusinessSettings | null,
  appointments: AppointmentBlock[] = []
): TimelineData {
  // Get day working hours
  const dayHours = getDayWorkingHours(date, businessSettings)

  // Check if this is a closed day (for exception slots)
  const isClosedDay = !dayHours || dayHours.closed

  // Determine timeline bounds
  const displayPrefs = businessSettings?.display_preferences
  const startHour = displayPrefs?.timelineStart ? parseTimeToHour(displayPrefs.timelineStart) : 8
  const endHour = displayPrefs?.timelineEnd ? parseTimeToHour(displayPrefs.timelineEnd) : 19

  // Get slot interval from booking rules
  const slotInterval = businessSettings?.booking_rules?.slotInterval || 15

  // Generate all time slots
  const hours = generateTimelineHours(
    date,
    startHour,
    endHour,
    slotInterval,
    dayHours,
    appointments,
    isClosedDay
  )

  return {
    date,
    hours,
    startHour,
    endHour,
    slotInterval,
    businessHours: dayHours
      ? {
          start: dayHours.start,
          end: dayHours.end,
          breaks: dayHours.breaks,
        }
      : {
          start: '09:00',
          end: '18:00',
          breaks: [],
        },
  }
}

/**
 * Generate timeline hours with slots and appointments
 */
function generateTimelineHours(
  date: Date,
  startHour: number,
  endHour: number,
  slotInterval: number,
  dayHours: DayWorkingHours | null,
  appointments: AppointmentBlock[],
  isClosedDay: boolean = false
): TimelineHour[] {
  const hours: TimelineHour[] = []

  for (let hour = startHour; hour <= endHour; hour++) {
    const timeLabel = formatHour(hour)
    const slots = generateSlotsForHour(date, hour, slotInterval, dayHours, isClosedDay)
    const hourAppointments = getAppointmentsForHour(appointments, hour)

    hours.push({
      hour,
      timeLabel,
      slots,
      appointments: hourAppointments,
    })
  }

  return hours
}

/**
 * Generate time slots for a specific hour
 */
function generateSlotsForHour(
  date: Date,
  hour: number,
  slotInterval: number,
  dayHours: DayWorkingHours | null,
  isClosedDay: boolean = false
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const slotsPerHour = 60 / slotInterval

  for (let i = 0; i < slotsPerHour; i++) {
    const minutes = i * slotInterval
    const time = formatTime(hour, minutes)
    const slotDate = setMinutes(setHours(startOfDay(date), hour), minutes)

    const status = determineSlotStatus(time, dayHours, isClosedDay)

    slots.push({
      time,
      date: slotDate,
      status,
      duration: slotInterval,
      isClickable: status === 'available' || status === 'exception',
      breakReason: status === 'break' ? getBreakReason(time, dayHours) : undefined,
    })
  }

  return slots
}

/**
 * Determine slot status based on business hours and breaks
 */
function determineSlotStatus(
  time: string,
  dayHours: DayWorkingHours | null,
  isClosedDay: boolean = false
): SlotStatus {
  if (!dayHours || dayHours.closed) {
    // If this is a closed day but we want to show exception slots
    if (isClosedDay) {
      return 'exception'
    }
    return 'closed'
  }

  const timeMinutes = parseTimeToMinutes(time)
  const startMinutes = parseTimeToMinutes(dayHours.start)
  const endMinutes = parseTimeToMinutes(dayHours.end)

  // Check if outside business hours
  if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
    // If this is a closed day, allow exception appointments outside hours
    if (isClosedDay) {
      return 'exception'
    }
    return 'closed'
  }

  // Check if during break
  for (const breakPeriod of dayHours.breaks) {
    const breakStart = parseTimeToMinutes(breakPeriod.start)
    const breakEnd = parseTimeToMinutes(breakPeriod.end)

    if (timeMinutes >= breakStart && timeMinutes < breakEnd) {
      return 'break'
    }
  }

  // Available by default (will be updated with appointments)
  return 'available'
}

/**
 * Get appointments that START in a specific hour
 *
 * Fixed: Only return appointments that start in this hour to prevent duplicates.
 * Multi-hour appointments will be rendered with correct height from their start hour.
 *
 * Examples:
 * - 09:15-09:45 → shows in hour 9 only
 * - 09:45-10:15 → shows in hour 9 only (starts at 9:45)
 * - 09:30-11:30 → shows in hour 9 only (starts at 9:30)
 */
function getAppointmentsForHour(
  appointments: AppointmentBlock[],
  hour: number
): AppointmentBlock[] {
  // Define hour boundaries in minutes since midnight
  const hourStartMinutes = hour * 60 // e.g., hour 9 = 540 minutes (09:00)
  const hourEndMinutes = (hour + 1) * 60 // e.g., hour 9 = 600 minutes (10:00)

  const filteredAppointments = appointments.filter((appointment) => {
    // Convert appointment times to minutes since midnight
    const appointmentStartMinutes = timeToMinutes(appointment.startTime)

    // Only include appointments that START in this hour
    // This prevents multi-hour appointments from appearing in multiple hours
    const startsInThisHour =
      appointmentStartMinutes >= hourStartMinutes && appointmentStartMinutes < hourEndMinutes

    return startsInThisHour
  })

  return filteredAppointments
}

/**
 * Get working hours for a specific date
 */
function getDayWorkingHours(
  date: Date,
  businessSettings: BusinessSettings | null
): DayWorkingHours | null {
  if (!businessSettings?.working_hours) return null

  const dayIndex = date.getDay()
  const weekDays = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const
  const weekDay = weekDays[dayIndex]

  return businessSettings.working_hours[weekDay] || null
}

/**
 * Get break reason for a specific time
 */
function getBreakReason(time: string, dayHours: DayWorkingHours | null): string | undefined {
  if (!dayHours) return undefined

  const timeMinutes = parseTimeToMinutes(time)

  for (const breakPeriod of dayHours.breaks) {
    const breakStart = parseTimeToMinutes(breakPeriod.start)
    const breakEnd = parseTimeToMinutes(breakPeriod.end)

    if (timeMinutes >= breakStart && timeMinutes < breakEnd) {
      // Simple break naming - could be enhanced
      if (breakStart >= 720 && breakStart <= 840) {
        // 12:00-14:00 range
        return 'Mittagspause'
      }
      return 'Pause'
    }
  }

  return undefined
}

/**
 * Calculate appointment position and height for positioning within the hour
 * Fixed: Position relative to the hour where appointment starts
 */
export function calculateAppointmentPosition(
  appointment: AppointmentBlock,
  _slotInterval: number,
  hourHeight: number
): { top: number; height: number } {
  const startMinutes = parseTimeToMinutes(appointment.startTime)
  const endMinutes = parseTimeToMinutes(appointment.endTime)
  const duration = endMinutes - startMinutes

  // Calculate position within the starting hour
  const minutesIntoHour = startMinutes % 60

  // Position relative to the current hour (where appointment starts)
  const top = (minutesIntoHour / 60) * hourHeight
  const height = (duration / 60) * hourHeight

  return { top, height }
}

/**
 * Check if a time slot is available for booking
 */
export function isSlotAvailable(
  slot: TimeSlot,
  appointments: AppointmentBlock[],
  duration: number = 60 // Default appointment duration
): boolean {
  if (slot.status !== 'available') return false

  const slotStart = parseTimeToMinutes(slot.time)
  const slotEnd = slotStart + duration

  // Check for conflicts with existing appointments
  for (const appointment of appointments) {
    const appointmentStart = parseTimeToMinutes(appointment.startTime)
    const appointmentEnd = parseTimeToMinutes(appointment.endTime)

    // Check if there's an overlap
    if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
      return false
    }
  }

  return true
}

/**
 * Find next available slot after a given time
 */
export function findNextAvailableSlot(
  timelineData: TimelineData,
  afterTime: string,
  duration: number = 60
): TimeSlot | null {
  const afterMinutes = parseTimeToMinutes(afterTime)

  for (const hour of timelineData.hours) {
    for (const slot of hour.slots) {
      const slotMinutes = parseTimeToMinutes(slot.time)

      if (slotMinutes >= afterMinutes) {
        const appointments = timelineData.hours.flatMap((h) => h.appointments)
        if (isSlotAvailable(slot, appointments, duration)) {
          return slot
        }
      }
    }
  }

  return null
}

// ==========================================
// Time Utility Functions
// ==========================================

/**
 * Parse time string to minutes (09:30 -> 570)
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Parse time string to hour (09:30 -> 9)
 */
export function parseTimeToHour(time: string): number {
  return parseInt(time.split(':')[0], 10)
}

/**
 * Convert minutes to time string (570 -> "09:30")
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Format hour to time string (9 -> "09:00")
 */
export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

/**
 * Format time from hour and minutes (9, 30 -> "09:30")
 */
export function formatTime(hour: number, minutes: number): string {
  return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Format time for display (with Swiss locale considerations)
 */
export function formatTimeForDisplay(time: string): string {
  return time // Swiss format is already HH:mm
}

/**
 * Get current time as string
 */
export function getCurrentTime(): string {
  return formatTimeShort24h(new Date())
}

/**
 * Check if a time is in the past today
 */
export function isTimeInPast(time: string, date: Date): boolean {
  if (!isSameDay(date, new Date())) return false

  const currentMinutes = parseTimeToMinutes(getCurrentTime())
  const timeMinutes = parseTimeToMinutes(time)

  return timeMinutes < currentMinutes
}
