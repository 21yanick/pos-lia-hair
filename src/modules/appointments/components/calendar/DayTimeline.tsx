'use client'

/**
 * DayTimeline Component
 * Interactive timeline with touch optimization and appointment display
 */

import { Clock } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useBusinessSettingsQuery } from '@/shared/hooks/business/useBusinessSettingsQuery'
import { cn } from '@/shared/utils'
import { formatFullDate, formatWeekdayName, isToday, timeToMinutes } from '@/shared/utils/dateUtils'
import { useAppointmentsByDate } from '../../hooks/useAppointments'
import type {
  AppointmentBlock,
  AppointmentService,
  DayTimelineProps,
  TimelineData,
  TimelineHour,
  TimeSlot,
} from '../../types/timeline'
import { SLOT_CONFIG, TIMELINE_CONFIG } from '../../types/timeline'
import {
  calculateAppointmentPosition,
  formatTimeForDisplay,
  generateTimelineData,
  getCurrentTime,
  isTimeInPast,
} from '../../utils/timelineUtils'

/**
 * Helper function to calculate duration from start and end times
 */
function calculateDurationFromTimes(startTime: string, endTime: string): number {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  return endMinutes - startMinutes
}

/**
 * Main DayTimeline Component
 */
export function DayTimeline({
  selectedDate,
  onSlotClick,
  onAppointmentClick,
  className,
}: DayTimelineProps) {
  const { currentOrganization } = useCurrentOrganization()
  const { settings, loading: settingsLoading } = useBusinessSettingsQuery()
  const timelineRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(getCurrentTime())

  // Debug: Log current organization (development only)
  // Removed: Causing excessive logging on every render

  // Load real appointments for selected date
  const {
    data: appointmentsData = [],
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useAppointmentsByDate(currentOrganization?.id || '', selectedDate)

  // Debug: Log appointment query results (development only)
  // Removed: Causing excessive logging on every data change

  // Convert DB appointments to AppointmentBlocks
  const appointments: AppointmentBlock[] = useMemo(() => {
    if (!appointmentsData || appointmentsData.length === 0) {
      return []
    }

    const converted = appointmentsData.map((apt) => {
      // Type-safe Json to AppointmentService[] conversion (Clean Architecture)
      let services: AppointmentService[] = []
      try {
        if (apt.services && Array.isArray(apt.services)) {
          // Type-safe mapping with validation (KISS principle)
          services = (apt.services as unknown[]).filter(
            (service): service is AppointmentService =>
              service !== null &&
              typeof service === 'object' &&
              'id' in service &&
              'name' in service
          )
        }
      } catch (e) {
        console.warn('Failed to parse appointment services:', e)
        services = []
      }

      // Map to AppointmentService format with null safety
      const mappedServices = services.map((service) => ({
        id: service?.id || '',
        name: service?.name || 'Unbekannte Leistung',
        price: service?.price || 0,
        duration_minutes: service?.duration_minutes || 0,
        notes: service?.notes || '',
        sort_order: service?.sort_order || 1,
      }))

      const appointment = {
        id: apt.id || '',
        startTime: apt.start_time || '00:00',
        endTime: apt.end_time || '00:00',
        title: apt.customer_name || 'Unbekannter Kunde',
        customerName: apt.customer_name || 'Unbekannter Kunde',
        date: selectedDate,
        services: mappedServices,
        estimatedPrice: apt.estimated_price || undefined,
        totalPrice: apt.total_price || undefined,
        totalDuration: apt.total_duration_minutes || undefined,
        notes: apt.notes || undefined, // Convert null to undefined for AppointmentBlock
        duration: calculateDurationFromTimes(apt.start_time || '00:00', apt.end_time || '00:00'),
        // Additional fields for editing
        customerId: apt.customer_id,
        customerPhone: apt.customer_phone,
        // Note: V6.1 doesn't have status field - removed for KISS compliance
      }

      return appointment
    })

    // Debug: Conversion logging removed for performance

    return converted
  }, [appointmentsData, selectedDate])

  // Update current time every minute (MUST be before any conditional logic!)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Generate timeline data
  const timelineData = useMemo(() => {
    const timeline = generateTimelineData(selectedDate, settings, appointments)

    // Debug: Timeline generation logging removed for performance

    return timeline
  }, [selectedDate, settings, appointments])

  // Auto-scroll to current time on mount (MUST be before any conditional logic!)
  useEffect(() => {
    if (!timelineRef.current) return

    const isTodayCheck = isToday(selectedDate)
    if (!isTodayCheck) return

    // Scroll to current time with some offset
    const currentHour = parseInt(currentTime.split(':')[0], 10)
    const targetHour = Math.max(currentHour - 1, timelineData.startHour) // Show hour before current
    const scrollTop = (targetHour - timelineData.startHour) * TIMELINE_CONFIG.hourHeight

    timelineRef.current.scrollTop = scrollTop
  }, [selectedDate, currentTime, timelineData.startHour])

  // Show loading state (AFTER all hooks)
  if (settingsLoading || appointmentsLoading) {
    return <DayTimelineSkeleton className={className} />
  }

  // Show error state (AFTER all hooks)
  if (appointmentsError) {
    // Continue with empty appointments array - don't block the UI
  }

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isClickable) return
    onSlotClick?.(slot)
  }

  const handleAppointmentClick = (appointment: AppointmentBlock) => {
    onAppointmentClick?.(appointment)
  }

  return (
    <Card className={cn('w-full h-full flex flex-col', className)}>
      <CardHeader className="pb-4 shrink-0">
        <DayTimelineHeader selectedDate={selectedDate} timelineData={timelineData} />
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div
          ref={timelineRef}
          className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-background"
          style={{
            scrollBehavior: 'smooth',
            paddingBottom: TIMELINE_CONFIG.scrollPadding,
          }}
        >
          <div className="relative">
            {timelineData.hours.map((hour) => (
              <TimelineHourComponent
                key={hour.hour}
                hour={hour}
                selectedDate={selectedDate}
                slotInterval={timelineData.slotInterval}
                onSlotClick={handleSlotClick}
                onAppointmentClick={handleAppointmentClick}
              />
            ))}

            {/* Current Time Indicator */}
            <CurrentTimeIndicator
              selectedDate={selectedDate}
              currentTime={currentTime}
              timelineData={timelineData}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Timeline Header with date and controls
 */
function DayTimelineHeader({
  selectedDate,
  timelineData,
}: {
  selectedDate: Date
  timelineData: TimelineData
}) {
  const dayName = formatWeekdayName(selectedDate)
  const dateStr = formatFullDate(selectedDate)
  const appointmentCount = timelineData.hours.reduce(
    (sum, hour) => sum + hour.appointments.length,
    0
  )

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-primary" />
        <div>
          <CardTitle className="text-lg">{dayName}</CardTitle>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {appointmentCount > 0 && (
          <Badge variant="secondary">
            {appointmentCount} Termin{appointmentCount !== 1 ? 'e' : ''}
          </Badge>
        )}
      </div>
    </div>
  )
}

/**
 * Individual Timeline Hour Component
 */
function TimelineHourComponent({
  hour,
  selectedDate,
  slotInterval,
  onSlotClick,
  onAppointmentClick,
}: {
  hour: TimelineHour
  selectedDate: Date
  slotInterval: number
  onSlotClick: (slot: TimeSlot) => void
  onAppointmentClick: (appointment: AppointmentBlock) => void
}) {
  return (
    <div className="relative border-b border-border" style={{ height: TIMELINE_CONFIG.hourHeight }}>
      {/* Hour Label */}
      <div
        className="absolute left-0 top-0 flex items-start justify-center pt-1 text-sm font-medium text-muted-foreground"
        style={{ width: TIMELINE_CONFIG.hourLabelWidth }}
      >
        {hour.timeLabel}
      </div>

      {/* Slots Grid */}
      <div
        className="absolute top-0 right-0 grid"
        style={{
          left: TIMELINE_CONFIG.hourLabelWidth,
          gridTemplateRows: `repeat(${60 / slotInterval}, 1fr)`,
          height: '100%',
        }}
      >
        {hour.slots.map((slot) => (
          <TimeSlotComponent
            key={slot.time}
            slot={slot}
            selectedDate={selectedDate}
            onSlotClick={onSlotClick}
          />
        ))}
      </div>

      {/* Appointments */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{ left: TIMELINE_CONFIG.hourLabelWidth }}
      >
        {hour.appointments.map((appointment) => (
          <AppointmentBlockComponent
            key={appointment.id}
            appointment={appointment}
            slotInterval={slotInterval}
            onAppointmentClick={onAppointmentClick}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual Time Slot Component
 */
function TimeSlotComponent({
  slot,
  selectedDate,
  onSlotClick,
}: {
  slot: TimeSlot
  selectedDate: Date
  onSlotClick: (slot: TimeSlot) => void
}) {
  const config = SLOT_CONFIG[slot.status]
  const isPast = isTimeInPast(slot.time, selectedDate)

  const handleClick = () => {
    if (slot.isClickable && !isPast) onSlotClick(slot)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && slot.isClickable && !isPast) {
      e.preventDefault()
      onSlotClick(slot)
    }
  }

  return (
    <button
      type="button"
      className={cn(
        'border-r border-border transition-all duration-200 flex items-center justify-center text-xs bg-transparent p-0',
        config.className,
        isPast && 'opacity-40 cursor-not-allowed',
        slot.isClickable &&
          !isPast &&
          'hover:bg-muted/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
      style={{
        minHeight: TIMELINE_CONFIG.slotMinHeight,
        minWidth: TIMELINE_CONFIG.touchTargetSize,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={!slot.isClickable || isPast}
      aria-label={`${formatTimeForDisplay(slot.time)} - ${config.description}${slot.breakReason ? `: ${slot.breakReason}` : ''}`}
      title={slot.breakReason || config.description}
    >
      {slot.status === 'break' && slot.breakReason && (
        <span className="text-xs font-medium text-warning-foreground">Pause</span>
      )}
    </button>
  )
}

/**
 * Appointment Block Component with adaptive layout based on duration
 */
function AppointmentBlockComponent({
  appointment,
  slotInterval,
  onAppointmentClick,
}: {
  appointment: AppointmentBlock
  slotInterval: number
  onAppointmentClick: (appointment: AppointmentBlock) => void
}) {
  const position = calculateAppointmentPosition(
    appointment,
    slotInterval,
    TIMELINE_CONFIG.hourHeight
  )

  // Adaptive layout threshold: 45 minutes
  const COMPACT_THRESHOLD = 45
  const isCompact = appointment.duration <= COMPACT_THRESHOLD

  // Ultra-clean: Single appointment style using primary theme colors
  const appointmentStyle = 'bg-primary text-primary-foreground border-primary/20'

  const customerName = appointment.customerName || appointment.title || 'Unbekannt'
  const timeRange = `${appointment.startTime} - ${appointment.endTime}`

  const handleClick = () => {
    onAppointmentClick(appointment)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onAppointmentClick(appointment)
    }
  }

  return (
    <button
      type="button"
      className={cn(
        'absolute left-0 right-2 rounded-lg cursor-pointer pointer-events-auto border shadow-lg z-10 bg-transparent p-0 text-left',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        appointmentStyle
      )}
      style={{
        top: position.top,
        height: Math.max(position.height, TIMELINE_CONFIG.appointmentMinHeight),
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Termin: ${appointment.title} von ${appointment.startTime} bis ${appointment.endTime}${appointment.customerName ? ` mit ${appointment.customerName}` : ''}`}
    >
      {isCompact ? (
        /* Compact Layout: Horizontal for short appointments (≤45min) */
        <div className="px-2 py-1.5 h-full overflow-hidden flex items-center justify-between">
          <div className="font-bold truncate text-white text-sm flex-1 mr-2">{customerName}</div>
          <div className="text-white/90 text-xs font-medium whitespace-nowrap">{timeRange}</div>
        </div>
      ) : (
        /* Extended Layout: Vertical for longer appointments (>45min) */
        <div className="p-2 text-sm h-full overflow-hidden flex flex-col justify-center gap-0.5">
          {/* Customer Name - Most Important */}
          <div className="font-bold truncate text-white leading-none text-sm">{customerName}</div>

          {/* Time - Secondary */}
          <div className="text-white/80 text-xs font-medium leading-none">{timeRange}</div>

          {/* Service - Only if space allows */}
          {appointment.services.length > 0 && (
            <div className="text-white/70 text-xs truncate leading-none">
              {appointment.services.map((service) => service.name).join(', ')}
            </div>
          )}
        </div>
      )}
    </button>
  )
}

/**
 * Current Time Indicator Line
 */
function CurrentTimeIndicator({
  selectedDate,
  currentTime,
  timelineData,
}: {
  selectedDate: Date
  currentTime: string
  timelineData: TimelineData
}) {
  const isTodayCheck = isToday(selectedDate)

  if (!isTodayCheck) return null

  const currentHour = parseInt(currentTime.split(':')[0], 10)
  const currentMinutes = parseInt(currentTime.split(':')[1], 10)

  // Check if current time is within timeline range
  if (currentHour < timelineData.startHour || currentHour > timelineData.endHour) {
    return null
  }

  const top =
    (currentHour - timelineData.startHour) * TIMELINE_CONFIG.hourHeight +
    (currentMinutes / 60) * TIMELINE_CONFIG.hourHeight

  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{
        top,
        left: TIMELINE_CONFIG.hourLabelWidth,
        right: 0,
      }}
    >
      {/* Current Time Line */}
      <div className="flex items-center">
        <div className="bg-destructive text-destructive-foreground text-xs px-1 rounded-sm mr-2">
          {currentTime}
        </div>
        <div className="flex-1 h-0.5 bg-destructive"></div>
        <div className="w-2 h-2 bg-destructive rounded-full -mr-1"></div>
      </div>
    </div>
  )
}

/**
 * Loading Skeleton for DayTimeline
 */
export function DayTimelineSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('w-full h-full flex flex-col', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div>
              <div className="h-5 w-24 bg-muted rounded animate-pulse mb-1" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="space-y-1 p-4">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((row) => (
            <div key={`skeleton-timeline-${row}`} className="flex items-center gap-4">
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              <div className="flex-1 h-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
