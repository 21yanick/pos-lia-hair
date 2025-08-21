'use client'

/**
 * MonthGrid Client Component
 * Performance-optimized calendar with visual indicators and React Query
 */

import { endOfMonth, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useBusinessSettingsQuery } from '@/shared/hooks/business/useBusinessSettingsQuery'
import { cn } from '@/shared/utils'
import { formatMonthYear } from '@/shared/utils/dateUtils'
import { useAppointmentsByDateRange } from '../../hooks/useAppointments'
import type { CalendarDay, MonthData } from '../../types/calendar'
import { DAY_INDICATOR_CONFIG, SWISS_CALENDAR_CONFIG } from '../../types/calendar'
import {
  applyBusinessLogicToMonth,
  formatDayNumber,
  generateMonthData,
  getDayAriaLabel,
} from '../../utils/calendarUtils'

interface MonthGridClientProps {
  currentDate: Date
  className?: string
  onDayClick?: (date: Date) => void
  onMonthChange?: (date: Date) => void
}

/**
 * MonthGrid - Client Component for appointment calendar
 * Renders month view with business logic applied client-side with React Query
 */
export function MonthGrid({
  currentDate,
  className,
  onDayClick,
  onMonthChange,
}: MonthGridClientProps) {
  const { currentOrganization } = useCurrentOrganization()

  // Load business settings with React Query
  const { settings: businessSettings, loading: settingsLoading } = useBusinessSettingsQuery()

  // Load appointments for the entire month to get counts
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const { data: monthAppointments = [], isLoading: appointmentsLoading } =
    useAppointmentsByDateRange(currentOrganization?.id || '', monthStart, monthEnd)

  // Generate appointment counts by date
  const appointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {}

    monthAppointments.forEach((apt) => {
      // V6.1 null safety: appointment_date can be null
      const dateKey = apt.appointment_date
      if (dateKey) {
        counts[dateKey] = (counts[dateKey] || 0) + 1
      }
    })

    return counts
  }, [monthAppointments])

  // Generate calendar data
  const monthWithBusinessLogic = useMemo(() => {
    const monthData = generateMonthData(currentDate)

    // Apply business logic to determine day states with real appointment counts
    return applyBusinessLogicToMonth(monthData, businessSettings, appointmentCounts)
  }, [currentDate, businessSettings, appointmentCounts])

  // Show loading skeleton while business settings or appointments are loading
  if (settingsLoading || appointmentsLoading) {
    return <MonthGridSkeleton className={className} />
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <MonthHeader monthData={monthWithBusinessLogic} onMonthChange={onMonthChange} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <WeekdayHeader />
          <DaysGrid
            monthData={monthWithBusinessLogic}
            onDayClick={onDayClick}
            onMonthChange={onMonthChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Month Header with navigation
 */
function MonthHeader({
  monthData,
  onMonthChange,
}: {
  monthData: MonthData
  onMonthChange?: (date: Date) => void
}) {
  const prevMonth = new Date(monthData.year, monthData.month - 1)
  const nextMonth = new Date(monthData.year, monthData.month + 1)

  const handlePrevMonth = () => {
    onMonthChange?.(prevMonth)
  }

  const handleNextMonth = () => {
    onMonthChange?.(nextMonth)
  }

  return (
    <div className="flex items-center justify-between">
      <MonthNavigationButton
        direction="prev"
        onClick={handlePrevMonth}
        aria-label={`Vorheriger Monat (${formatMonthYear(prevMonth)})`}
      />

      <h2 className="text-xl font-semibold text-center min-w-0 flex-1">{monthData.monthName}</h2>

      <MonthNavigationButton
        direction="next"
        onClick={handleNextMonth}
        aria-label={`Nächster Monat (${formatMonthYear(nextMonth)})`}
      />
    </div>
  )
}

/**
 * Month Navigation Button with real navigation
 */
function MonthNavigationButton({
  direction,
  onClick,
  'aria-label': ariaLabel,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  'aria-label': string
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 hover:bg-muted"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {direction === 'prev' ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  )
}

/**
 * Weekday Header Row
 */
function WeekdayHeader() {
  return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {SWISS_CALENDAR_CONFIG.weekDayNames.map((day) => (
        <div
          key={day}
          className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
        >
          {day}
        </div>
      ))}
    </div>
  )
}

/**
 * Days Grid - 6 weeks x 7 days
 */
function DaysGrid({
  monthData,
  onDayClick,
  onMonthChange,
}: {
  monthData: MonthData
  onDayClick?: (date: Date) => void
  onMonthChange?: (date: Date) => void
}) {
  // Split days into weeks for proper grid layout
  const weeks: CalendarDay[][] = []
  for (let i = 0; i < monthData.days.length; i += 7) {
    weeks.push(monthData.days.slice(i, i + 7))
  }

  return (
    <div className="space-y-1">
      {weeks.map((week, weekIndex) => (
        <div
          key={week[0]?.date.getTime() || `week-${weekIndex}`}
          className="grid grid-cols-7 gap-1"
        >
          {week.map((day) => (
            <DayCell
              key={day.date.getTime()}
              day={day}
              onDayClick={onDayClick}
              onMonthChange={onMonthChange}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Individual Day Cell with Visual Indicators
 */
function DayCell({
  day,
  onDayClick,
  onMonthChange,
}: {
  day: CalendarDay
  onDayClick?: (date: Date) => void
  onMonthChange?: (date: Date) => void
}) {
  const config = DAY_INDICATOR_CONFIG[day.status]

  const handleClick = () => {
    if (!day.isClickable) return

    if (day.status === 'other-month') {
      // Navigate to the clicked month
      onMonthChange?.(day.date)
    } else {
      // All days (including closed/vacation) navigate to timeline
      onDayClick?.(day.date)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (day.isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      type="button"
      disabled={!day.isClickable}
      className={cn(
        // Base styles
        'relative h-12 flex items-center justify-center text-sm rounded-md transition-all duration-200 bg-transparent p-0',
        // Status-specific styles
        config.className,
        // Interactive styles
        day.isClickable &&
          'cursor-pointer hover:scale-105 hover:shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        // Additional vacation styling
        day.status === 'vacation' &&
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:to-destructive/10 before:rounded-md'
      )}
      aria-label={getDayAriaLabel(day)}
      title={getDayAriaLabel(day)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Day Number */}
      <span className="relative z-10">{formatDayNumber(day)}</span>

      {/* Appointment Count Badge */}
      {day.appointmentCount > 0 && day.status !== 'vacation' && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium z-20">
          {day.appointmentCount > 9 ? '9+' : day.appointmentCount}
        </span>
      )}

      {/* Vacation Indicator */}
      {day.status === 'vacation' && (
        <span className="absolute bottom-0.5 right-0.5 text-destructive text-xs font-bold">■</span>
      )}
    </button>
  )
}

/**
 * Loading Skeleton for MonthGrid
 */
export function MonthGridSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1">
            {['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'].map((day) => (
              <div key={`skeleton-weekday-${day}`} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
          {/* Days grid */}
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map((weekNum) => (
              <div key={`skeleton-week-${weekNum}`} className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
                  <div
                    key={`skeleton-day-w${weekNum}-d${dayNum}`}
                    className="h-12 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
