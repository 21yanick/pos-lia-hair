'use client'

import { useMemo } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Calendar } from '@/shared/components/ui/calendar'
import { Clock, AlertCircle } from 'lucide-react'
import { 
  generateTimeSlots, 
  calculateAppointmentEnd, 
  formatTimeShort,
  formatDateForAPI,
  formatDateForDisplay,
  isValidAppointmentDate,
  swissLocale
} from '@/shared/utils/dateUtils'
import { useTimeSlotAvailability } from '../hooks/useAppointments'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { cn } from '@/shared/utils'
import type { Item } from '@/shared/hooks/business/useItems'

interface TimeSlotPickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  selectedService: Item | null
  selectedTimeSlot: { start: string; end: string } | null
  onTimeSlotSelect: (timeSlot: { start: string; end: string }) => void
  businessHours?: { start: number; end: number }
  excludeAppointmentId?: string
}

export function TimeSlotPicker({
  selectedDate,
  onDateChange,
  selectedService,
  selectedTimeSlot,
  onTimeSlotSelect,
  businessHours = { start: 9, end: 18 },
  excludeAppointmentId
}: TimeSlotPickerProps) {
  const { currentOrganization } = useCurrentOrganization()

  // Generate available time slots
  const timeSlots = useMemo(() => {
    return generateTimeSlots(businessHours.start, businessHours.end, 15) // 15-minute intervals
  }, [businessHours])

  // Calculate duration from service
  const serviceDuration = selectedService?.duration_minutes || 60 // Default 1 hour

  // Generate time slot options with end times
  const timeSlotOptions = useMemo(() => {
    return timeSlots.map(startTime => ({
      start: startTime,
      end: calculateAppointmentEnd(startTime, serviceDuration)
    })).filter(slot => {
      // Filter out slots that would extend beyond business hours
      const endHour = parseInt(slot.end.split(':')[0])
      const endMinute = parseInt(slot.end.split(':')[1])
      const endTotalMinutes = endHour * 60 + endMinute
      const businessEndMinutes = businessHours.end * 60
      
      return endTotalMinutes <= businessEndMinutes
    })
  }, [timeSlots, serviceDuration, businessHours])

  const selectedDateStr = formatDateForAPI(selectedDate)

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Datum wählen</h3>
        <Card>
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onDateChange(date)
                }
              }}
              locale={swissLocale}
              disabled={(date) => {
                // Disable past dates (but allow today)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                
                // Disable dates more than 3 months in future
                const maxFuture = new Date()
                maxFuture.setMonth(maxFuture.getMonth() + 3)
                
                return date < today || date > maxFuture
              }}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Service Info */}
      {selectedService && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Gewählter Service</h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{selectedService.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{serviceDuration} Minuten</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    CHF {selectedService.default_price?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Slot Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Zeit wählen - {formatDateForDisplay(selectedDate)}
        </h3>
        
        {!selectedService ? (
          <Card className="border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Bitte wählen Sie zuerst einen Service aus.</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {timeSlotOptions.map((slot) => (
              <TimeSlotButton
                key={slot.start}
                slot={slot}
                isSelected={selectedTimeSlot?.start === slot.start}
                onSelect={() => onTimeSlotSelect(slot)}
                organizationId={currentOrganization?.id || ''}
                date={selectedDateStr}
                excludeAppointmentId={excludeAppointmentId}
              />
            ))}
          </div>
        )}

        {selectedService && timeSlotOptions.length === 0 && (
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Keine verfügbaren Zeitslots für einen {serviceDuration}-Minuten Service an diesem Tag.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Time Summary */}
      {selectedTimeSlot && selectedService && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Terminzeit ausgewählt</h4>
                <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  {formatDateForDisplay(selectedDate)} um {formatTimeShort(selectedTimeSlot.start)} - {formatTimeShort(selectedTimeSlot.end)}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  {selectedService.name} ({serviceDuration} Min)
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                Verfügbar
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Time Slot Button with availability checking
interface TimeSlotButtonProps {
  slot: { start: string; end: string }
  isSelected: boolean
  onSelect: () => void
  organizationId: string
  date: string
  excludeAppointmentId?: string
}

function TimeSlotButton({ 
  slot, 
  isSelected, 
  onSelect, 
  organizationId, 
  date, 
  excludeAppointmentId 
}: TimeSlotButtonProps) {
  const { data: isAvailable, isLoading } = useTimeSlotAvailability(
    organizationId,
    date,
    slot.start,
    slot.end,
    excludeAppointmentId
  )

  const handleClick = () => {
    if (isAvailable && !isLoading) {
      onSelect()
    }
  }

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      onClick={handleClick}
      disabled={isLoading || !isAvailable}
      className={cn(
        "h-auto py-2 px-3 text-sm",
        !isAvailable && !isLoading && "opacity-50 cursor-not-allowed",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className="text-center">
        <div className="font-medium">
          {formatTimeShort(slot.start)}
        </div>
        <div className="text-xs opacity-75">
          {formatTimeShort(slot.end)}
        </div>
        {isLoading && (
          <div className="text-xs mt-1">
            Prüfe...
          </div>
        )}
        {!isLoading && !isAvailable && (
          <div className="text-xs mt-1 text-red-500">
            Belegt
          </div>
        )}
      </div>
    </Button>
  )
}