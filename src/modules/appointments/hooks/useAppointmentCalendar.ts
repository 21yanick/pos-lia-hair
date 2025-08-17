'use client'

/**
 * useAppointmentCalendar Hook
 * Manages state and interactions between MonthGrid and DayTimeline
 */

import { addMonths, startOfMonth, subMonths } from 'date-fns'
import { useCallback, useState } from 'react'
import { formatDateForAPI, formatYearMonth } from '@/shared/utils/dateUtils'
import type { AppointmentBlock, TimeSlot } from '../types/timeline'

interface UseAppointmentCalendarReturn {
  // State
  selectedDate: Date
  currentMonth: Date

  // Month Navigation
  goToNextMonth: () => void
  goToPrevMonth: () => void
  goToMonth: (date: Date) => void
  goToToday: () => void

  // Day Selection
  selectDate: (date: Date) => void

  // Timeline Interactions
  handleSlotClick: (slot: TimeSlot) => void
  handleAppointmentClick: (appointment: AppointmentBlock) => void

  // Booking Dialog State
  isBookingDialogOpen: boolean
  selectedSlot: TimeSlot | null
  selectedAppointment: AppointmentBlock | null
  openBookingDialog: (slot: TimeSlot) => void
  openAppointmentDialog: (appointment: AppointmentBlock) => void
  closeDialogs: () => void

  // Exception Appointment State
  isExceptionAppointment: boolean

  // Utilities
  formatDateKey: (date: Date) => string
  isToday: (date: Date) => boolean
  isSameMonth: (date: Date) => boolean
}

export function useAppointmentCalendar(
  initialDate: Date = new Date()
): UseAppointmentCalendarReturn {
  // Core state
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialDate))

  // Dialog state
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentBlock | null>(null)

  // Exception appointment state
  const [isExceptionAppointment, setIsExceptionAppointment] = useState(false)

  // Month Navigation
  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }, [])

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }, [])

  const goToMonth = useCallback((date: Date) => {
    setCurrentMonth(startOfMonth(date))
  }, [])

  const goToToday = useCallback(() => {
    const today = new Date()
    setSelectedDate(today)
    setCurrentMonth(startOfMonth(today))
  }, [])

  // Day Selection
  const selectDate = useCallback(
    (date: Date) => {
      setSelectedDate(date)
      // Update month if date is in different month
      if (!isSameMonth(date)) {
        setCurrentMonth(startOfMonth(date))
      }
    },
    [isSameMonth]
  )

  // Timeline Interactions
  const handleSlotClick = useCallback((slot: TimeSlot) => {
    setSelectedSlot(slot)
    setSelectedAppointment(null)
    setIsExceptionAppointment(slot.status === 'exception')
    setIsBookingDialogOpen(true)
  }, [])

  const handleAppointmentClick = useCallback((appointment: AppointmentBlock) => {
    setSelectedAppointment(appointment)
    setSelectedSlot(null)
    setIsBookingDialogOpen(true)
  }, [])

  // Dialog Management
  const openBookingDialog = useCallback(
    (slot: TimeSlot) => {
      handleSlotClick(slot)
    },
    [handleSlotClick]
  )

  const openAppointmentDialog = useCallback(
    (appointment: AppointmentBlock) => {
      handleAppointmentClick(appointment)
    },
    [handleAppointmentClick]
  )

  const closeDialogs = useCallback(() => {
    setIsBookingDialogOpen(false)
    setSelectedSlot(null)
    setSelectedAppointment(null)
    setIsExceptionAppointment(false)
  }, [])

  // Utilities
  const formatDateKey = useCallback((date: Date): string => {
    return formatDateForAPI(date)
  }, [])

  const isToday = useCallback((date: Date): boolean => {
    return formatDateForAPI(date) === formatDateForAPI(new Date())
  }, [])

  const isSameMonth = useCallback(
    (date: Date): boolean => {
      return formatYearMonth(date) === formatYearMonth(currentMonth)
    },
    [currentMonth]
  )

  return {
    // State
    selectedDate,
    currentMonth,

    // Month Navigation
    goToNextMonth,
    goToPrevMonth,
    goToMonth,
    goToToday,

    // Day Selection
    selectDate,

    // Timeline Interactions
    handleSlotClick,
    handleAppointmentClick,

    // Booking Dialog State
    isBookingDialogOpen,
    selectedSlot,
    selectedAppointment,
    openBookingDialog,
    openAppointmentDialog,
    closeDialogs,

    // Exception Appointment State
    isExceptionAppointment,

    // Utilities
    formatDateKey,
    isToday,
    isSameMonth,
  }
}
