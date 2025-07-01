/**
 * Timeline Utility Functions
 * Business logic for day timeline generation and calculations
 */

import { addMinutes, isSameDay, startOfDay, setHours, setMinutes } from 'date-fns'
import { formatTimeShort24h, timeToMinutes } from '@/shared/utils/dateUtils'
import type { 
  TimeSlot, 
  AppointmentBlock, 
  TimelineHour, 
  TimelineData, 
  SlotStatus,
  WorkingPeriod 
} from '../types/timeline'
import type { BusinessSettings, DayWorkingHours } from '@/shared/types/businessSettings'

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
    appointments
  )
  
  return {
    date,
    hours,
    startHour,
    endHour,
    slotInterval,
    businessHours: dayHours ? {
      start: dayHours.start,
      end: dayHours.end,
      breaks: dayHours.breaks
    } : {
      start: '09:00',
      end: '18:00', 
      breaks: []
    }
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
  appointments: AppointmentBlock[]
): TimelineHour[] {
  const hours: TimelineHour[] = []
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const timeLabel = formatHour(hour)
    const slots = generateSlotsForHour(date, hour, slotInterval, dayHours)
    const hourAppointments = getAppointmentsForHour(appointments, hour)
    
    hours.push({
      hour,
      timeLabel,
      slots,
      appointments: hourAppointments
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
  dayHours: DayWorkingHours | null
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const slotsPerHour = 60 / slotInterval
  
  for (let i = 0; i < slotsPerHour; i++) {
    const minutes = i * slotInterval
    const time = formatTime(hour, minutes)
    const slotDate = setMinutes(setHours(startOfDay(date), hour), minutes)
    
    const status = determineSlotStatus(time, dayHours)
    
    slots.push({
      time,
      date: slotDate,
      status,
      duration: slotInterval,
      isClickable: status === 'available',
      breakReason: status === 'break' ? getBreakReason(time, dayHours) : undefined
    })
  }
  
  return slots
}

/**
 * Determine slot status based on business hours and breaks
 */
function determineSlotStatus(time: string, dayHours: DayWorkingHours | null): SlotStatus {
  if (!dayHours || dayHours.closed) {
    return 'closed'
  }
  
  const timeMinutes = parseTimeToMinutes(time)
  const startMinutes = parseTimeToMinutes(dayHours.start)
  const endMinutes = parseTimeToMinutes(dayHours.end)
  
  // Check if outside business hours
  if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
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
 * Get appointments that overlap with a specific hour using precise minute-level detection
 * 
 * This implements true time overlap detection like Google Calendar, Outlook, etc.
 * An appointment appears in all hours it overlaps, even partially.
 * 
 * Examples:
 * - 09:15-09:45 → shows in hour 9 only
 * - 09:45-10:15 → shows in hour 9 AND hour 10  
 * - 09:30-11:30 → shows in hours 9, 10, AND 11
 */
function getAppointmentsForHour(appointments: AppointmentBlock[], hour: number): AppointmentBlock[] {
  // Define hour boundaries in minutes since midnight
  const hourStartMinutes = hour * 60        // e.g., hour 9 = 540 minutes (09:00)
  const hourEndMinutes = (hour + 1) * 60    // e.g., hour 9 = 600 minutes (10:00)
  
  console.log(`🔍 Timeline Debug - Checking appointments for hour ${hour}:`, {
    hour,
    hourRange: `${hour}:00 - ${hour + 1}:00`,
    hourStartMinutes,
    hourEndMinutes,
    appointmentsToCheck: appointments.length,
    appointments: appointments.map(apt => `${apt.customerName} ${apt.startTime}-${apt.endTime}`)
  })
  
  const filteredAppointments = appointments.filter(appointment => {
    // Convert appointment times to minutes since midnight
    const appointmentStartMinutes = timeToMinutes(appointment.startTime)  // e.g., "09:15" = 555
    const appointmentEndMinutes = timeToMinutes(appointment.endTime)      // e.g., "09:45" = 585
    
    // True overlap detection: intervals overlap if start1 < end2 AND start2 < end1
    // Appointment overlaps with hour if: appointmentStart < hourEnd AND hourStart < appointmentEnd
    const hasOverlap = appointmentStartMinutes < hourEndMinutes && 
                      hourStartMinutes < appointmentEndMinutes
    
    console.log(`  ➡️ ${appointment.customerName} ${appointment.startTime}-${appointment.endTime}:`, {
      appointmentStartMinutes,
      appointmentEndMinutes,
      condition1: `${appointmentStartMinutes} < ${hourEndMinutes} = ${appointmentStartMinutes < hourEndMinutes}`,
      condition2: `${hourStartMinutes} < ${appointmentEndMinutes} = ${hourStartMinutes < appointmentEndMinutes}`,
      hasOverlap
    })
    
    return hasOverlap
  })
  
  console.log(`✅ Hour ${hour} final result:`, {
    matchingAppointments: filteredAppointments.length,
    appointments: filteredAppointments.map(apt => `${apt.customerName} ${apt.startTime}-${apt.endTime}`)
  })
  
  return filteredAppointments
}

/**
 * Get working hours for a specific date
 */
function getDayWorkingHours(date: Date, businessSettings: BusinessSettings | null): DayWorkingHours | null {
  if (!businessSettings?.working_hours) return null
  
  const dayIndex = date.getDay()
  const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
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
      if (breakStart >= 720 && breakStart <= 840) { // 12:00-14:00 range
        return 'Mittagspause'
      }
      return 'Pause'
    }
  }
  
  return undefined
}

/**
 * Calculate appointment position and height for absolute positioning
 */
export function calculateAppointmentPosition(
  appointment: AppointmentBlock,
  slotInterval: number,
  hourHeight: number
): { top: number; height: number } {
  const startMinutes = parseTimeToMinutes(appointment.startTime)
  const endMinutes = parseTimeToMinutes(appointment.endTime)
  const duration = endMinutes - startMinutes
  
  // Calculate position within the hour
  const startHour = Math.floor(startMinutes / 60)
  const minutesIntoHour = startMinutes % 60
  
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
        const appointments = timelineData.hours.flatMap(h => h.appointments)
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