'use client'

import { de } from 'date-fns/locale'
import { CalendarIcon, X } from 'lucide-react'
import type React from 'react'
import { useId, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { cn } from '@/shared/utils'
import { formatDateForDisplay } from '@/shared/utils/dateUtils'

interface DateRangePickerProps {
  dateRange?: DateRange
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  placeholder = 'Zeitraum wählen...',
  disabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const datePickerId = useId()

  // Use consistent Swiss date formatting from utilities

  const formatDisplayText = () => {
    if (!dateRange?.from) {
      return placeholder
    }

    if (!dateRange.to) {
      return formatDateForDisplay(dateRange.from)
    }

    return `${formatDateForDisplay(dateRange.from)} - ${formatDateForDisplay(dateRange.to)}`
  }

  const clearDateRange = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateRangeChange(undefined)
    setOpen(false)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={datePickerId}
            variant="outline"
            size="sm"
            disabled={disabled}
            className={cn(
              'justify-start text-left font-normal text-xs w-full max-w-full overflow-hidden',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate flex-1 min-w-0">{formatDisplayText()}</span>
            {dateRange?.from && (
              <X
                className="ml-2 h-4 w-4 hover:text-destructive flex-shrink-0"
                onClick={clearDateRange}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm">Zeitraum wählen</h4>
            <p className="text-xs text-muted-foreground">
              Wählen Sie Start- und Enddatum für die Transaktionssuche
            </p>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={de}
            weekStartsOn={1}
            className="rounded-md"
          />
          <div className="p-3 border-t flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDateRangeChange(undefined)
                setOpen(false)
              }}
            >
              Zurücksetzen
            </Button>
            <Button size="sm" onClick={() => setOpen(false)} disabled={!dateRange?.from}>
              Anwenden
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Quick Preset Buttons für häufige Zeiträume
interface DateRangePresetsProps {
  onSelectPreset: (dateRange: DateRange) => void
  className?: string
}

export function DateRangePresets({ onSelectPreset, className }: DateRangePresetsProps) {
  const getPresetRange = (preset: string): DateRange => {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    switch (preset) {
      case 'today':
        return { from: startOfToday, to: startOfToday }

      case 'yesterday': {
        const yesterday = new Date(startOfToday)
        yesterday.setDate(yesterday.getDate() - 1)
        return { from: yesterday, to: yesterday }
      }

      case 'last_7_days': {
        const last7Days = new Date(startOfToday)
        last7Days.setDate(last7Days.getDate() - 6)
        return { from: last7Days, to: startOfToday }
      }

      case 'last_30_days': {
        const last30Days = new Date(startOfToday)
        last30Days.setDate(last30Days.getDate() - 29)
        return { from: last30Days, to: startOfToday }
      }

      case 'this_month': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return { from: startOfMonth, to: startOfToday }
      }

      case 'last_month': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        return { from: startOfLastMonth, to: endOfLastMonth }
      }

      case 'this_year': {
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        return { from: startOfYear, to: startOfToday }
      }

      default:
        return { from: startOfToday, to: startOfToday }
    }
  }

  const presets = [
    { key: 'today', label: 'Heute' },
    { key: 'yesterday', label: 'Gestern' },
    { key: 'last_7_days', label: 'Letzte 7 Tage' },
    { key: 'last_30_days', label: 'Letzte 30 Tage' },
    { key: 'this_month', label: 'Dieser Monat' },
    { key: 'last_month', label: 'Letzter Monat' },
    { key: 'this_year', label: 'Dieses Jahr' },
  ]

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {presets.map(({ key, label }) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          onClick={() => onSelectPreset(getPresetRange(key))}
          className="text-xs"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
