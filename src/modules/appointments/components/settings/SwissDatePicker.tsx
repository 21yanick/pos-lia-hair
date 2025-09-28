'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { cn } from '@/shared/utils'
import { eachDayOfInterval, formatMonthYear } from '@/shared/utils/dateUtils'

const SWISS_CALENDAR_CONFIG = {
  monthNames: [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ],
  weekDayNames: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
}

interface SwissDatePickerProps {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
}

export function SwissDatePicker({ selected, onSelect, disabled, className }: SwissDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => selected || new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const monthName = `${SWISS_CALENDAR_CONFIG.monthNames[month]} ${year}`

  // Generate calendar days (42 days total for 6 weeks)
  // Use noon to avoid timezone issues (like MonthGrid)
  const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0, 0)

  // Get Monday of first week (Monday = 1, Sunday = 0)
  const firstMondayOffset = (firstDayOfMonth.getDay() + 6) % 7
  const startDate = new Date(year, month, 1 - firstMondayOffset, 12, 0, 0, 0)

  // End date for 6 weeks (42 days)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 41)

  // Use dateUtils.ts function for safe date generation
  const days = eachDayOfInterval(startDate, endDate)

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDayClick = (date: Date) => {
    if (disabled?.(date)) return
    onSelect?.(date)
  }

  // Split into weeks
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-muted"
            onClick={goToPrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="text-xl font-semibold text-center min-w-0 flex-1">
            {monthName}
          </h2>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-muted"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Weekday Header */}
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

          {/* Days Grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day) => {
                  const isCurrentMonth = day.getMonth() === month
                  const isSelected = selected &&
                    day.getDate() === selected.getDate() &&
                    day.getMonth() === selected.getMonth() &&
                    day.getFullYear() === selected.getFullYear()
                  const isToday = new Date().toDateString() === day.toDateString()
                  const isDisabled = disabled?.(day)

                  return (
                    <button
                      key={day.getTime()}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        'relative h-12 flex items-center justify-center text-sm rounded-md transition-all duration-200 p-0',
                        // Base styles
                        isCurrentMonth
                          ? 'text-foreground hover:bg-muted cursor-pointer'
                          : 'text-muted-foreground/40 cursor-pointer hover:text-muted-foreground/60',
                        // Today
                        isToday && 'bg-primary text-primary-foreground font-semibold',
                        // Selected
                        isSelected && !isToday && 'bg-secondary text-secondary-foreground font-medium',
                        // Disabled
                        isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                        // Interactive
                        !isDisabled && 'hover:scale-105 active:scale-95'
                      )}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}