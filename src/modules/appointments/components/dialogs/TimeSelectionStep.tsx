'use client'

/**
 * Time Selection Step (Simplified KISS Version)
 * Step 1 of QuickBookingDialog - Simple Von/Bis Zeit-Eingabe
 */

import { Clock } from 'lucide-react'
import { useId } from 'react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { formatTimeShort } from '@/shared/utils/dateUtils'
import type { TimeStepProps } from '../../types/quickBooking'

export function TimeSelectionStep({
  timeSlot,
  duration,
  defaultDuration,
  onTimeSlotChange,
  onDurationChange,
}: TimeStepProps) {
  const startTimeId = useId()
  const endTimeId = useId()
  // Handle start time change - auto-calculate end time
  const handleStartTimeChange = (startTime: string) => {
    if (!timeSlot) return

    const endTime = calculateEndTime(startTime, duration)

    onTimeSlotChange({
      ...timeSlot,
      start: startTime,
      end: endTime,
    })

    // Duration stays the same when changing start time
    // No need to call onDurationChange
  }

  // Handle end time change - auto-calculate duration
  const handleEndTimeChange = (endTime: string) => {
    if (!timeSlot) return

    const newDuration = calculateDuration(timeSlot.start, endTime)

    // Update both timeSlot and duration simultaneously
    onTimeSlotChange({
      ...timeSlot,
      end: endTime,
    })

    onDurationChange(newDuration)
  }

  // Reset to default duration
  const handleResetDuration = () => {
    if (!timeSlot) return

    const endTime = calculateEndTime(timeSlot.start, defaultDuration)
    onTimeSlotChange({
      ...timeSlot,
      end: endTime,
    })
    onDurationChange(defaultDuration)
  }

  if (!timeSlot) {
    return (
      <div className="space-y-6">
        <div className="text-center text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Keine Zeit ausgewählt</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Terminzeit festlegen</h3>
        <p className="text-sm text-muted-foreground">
          Wählen Sie die Start- und Endzeit für den Termin
        </p>
      </div>

      {/* Native Time Inputs */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={startTimeId} className="text-sm font-medium">
                Von
              </Label>
              <Input
                id={startTimeId}
                type="time"
                value={timeSlot.start}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="font-mono text-center"
                step="900" // 15-minute steps
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={endTimeId} className="text-sm font-medium">
                Bis
              </Label>
              <Input
                id={endTimeId}
                type="time"
                value={timeSlot.end}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="font-mono text-center"
                step="900" // 15-minute steps
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duration Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">Dauer: {duration} Minuten</span>
            </div>

            {duration !== defaultDuration && (
              <button
                type="button"
                onClick={handleResetDuration}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Standard ({defaultDuration} Min) wiederherstellen
              </button>
            )}
          </div>

          <div className="mt-3 text-sm text-center">
            <span className="font-mono bg-background px-2 py-1 rounded">
              {formatTimeShort(timeSlot.start)} - {formatTimeShort(timeSlot.end)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = startMinutes + durationMinutes
  return minutesToTime(endMinutes)
}

function calculateDuration(startTime: string, endTime: string): number {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  const duration = endMinutes - startMinutes

  // If same time or negative duration, return 0 (let user see the problem)
  // Don't force minimum here - let user fix it manually
  return Math.max(0, duration)
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
