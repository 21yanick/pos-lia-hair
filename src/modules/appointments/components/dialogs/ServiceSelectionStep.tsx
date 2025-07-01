'use client'

/**
 * Service Selection Step - Multi-service selection with duration calculation
 * Step 1 of QuickBookingDialog
 */

import { useState } from 'react'
import { Clock, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Badge } from '@/shared/components/ui/badge'
import { formatTimeShort } from '@/shared/utils/dateUtils'
import { cn } from '@/shared/utils'
import type { ServiceStepProps, ServiceSelection } from '../../types/quickBooking'

export function ServiceSelectionStep({
  availableServices,
  selectedServices,
  totalDuration,
  timeSlot,
  onServicesChange,
  onTimeSlotChange,
  onDurationAdjust
}: ServiceStepProps) {
  const [customDurationMode, setCustomDurationMode] = useState(false)

  // Handle service selection toggle
  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    const updatedServices = selectedServices.map(serviceSelection => {
      if (serviceSelection.service.id === serviceId) {
        return { ...serviceSelection, selected: checked }
      }
      return serviceSelection
    })
    
    onServicesChange(updatedServices)
    
    // Auto-calculate new total duration
    const newTotalDuration = updatedServices
      .filter(s => s.selected)
      .reduce((sum, s) => sum + s.duration, 0)
    
    // Update end time if we have a start time
    if (timeSlot && newTotalDuration > 0) {
      const endTime = calculateEndTime(timeSlot.start, newTotalDuration)
      onTimeSlotChange({
        ...timeSlot,
        end: endTime
      })
    }
  }

  // Handle duration adjustment for individual service
  const handleServiceDurationChange = (serviceId: string, newDuration: number) => {
    const updatedServices = selectedServices.map(serviceSelection => {
      if (serviceSelection.service.id === serviceId) {
        return { ...serviceSelection, duration: Math.max(15, newDuration) }
      }
      return serviceSelection
    })
    
    onServicesChange(updatedServices)
  }

  // Handle manual total duration adjustment
  const handleTotalDurationAdjust = (adjustment: number) => {
    const newDuration = Math.max(15, totalDuration + adjustment)
    onDurationAdjust(newDuration)
    
    // Update end time
    if (timeSlot) {
      const endTime = calculateEndTime(timeSlot.start, newDuration)
      onTimeSlotChange({
        ...timeSlot,
        end: endTime
      })
    }
  }

  // Handle start time adjustment (±30min slots)
  const handleStartTimeAdjust = (adjustment: number) => {
    if (!timeSlot) return
    
    const currentMinutes = timeToMinutes(timeSlot.start)
    const newMinutes = currentMinutes + adjustment
    const newStartTime = minutesToTime(newMinutes)
    const newEndTime = calculateEndTime(newStartTime, totalDuration)
    
    onTimeSlotChange({
      ...timeSlot,
      start: newStartTime,
      end: newEndTime
    })
  }

  const selectedCount = selectedServices.filter(s => s.selected).length
  const hasSelectedServices = selectedCount > 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Services auswählen</h3>
        <p className="text-sm text-muted-foreground">
          Wählen Sie einen oder mehrere Services für den Termin
        </p>
      </div>

      {/* Service Selection Grid */}
      <div className="space-y-3">
        {availableServices.map((service) => {
          const serviceSelection = selectedServices.find(s => s.service.id === service.id)
          const isSelected = serviceSelection?.selected || false
          const currentDuration = serviceSelection?.duration || service.duration_minutes || 60

          return (
            <Card 
              key={service.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary border-primary bg-primary/5"
              )}
              onClick={() => handleServiceToggle(service.id, !isSelected)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onChange={(checked) => handleServiceToggle(service.id, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        Standard: {service.duration_minutes} Min
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Duration Adjustment for Selected Services */}
                    {isSelected && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleServiceDurationChange(service.id, currentDuration - 15)
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-12 text-center">
                          {currentDuration}min
                        </span>
                        <Button
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleServiceDurationChange(service.id, currentDuration + 15)
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Price Display */}
                    <div className="text-right">
                      <div className="font-semibold">
                        CHF {service.default_price?.toFixed(2) || '0.00'}
                      </div>
                      {isSelected && (
                        <Badge variant="secondary" className="mt-1">
                          Ausgewählt
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Duration Summary */}
      {hasSelectedServices && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Gesamtdauer:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTotalDurationAdjust(-15)}
                >
                  <Minus className="h-3 w-3" />
                  15min
                </Button>
                
                <Badge variant="default" className="text-base px-3 py-1">
                  {totalDuration} Minuten
                </Badge>
                
                <Button
                  size="sm"
                  variant="outline" 
                  onClick={() => handleTotalDurationAdjust(15)}
                >
                  <Plus className="h-3 w-3" />
                  15min
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Slot Selection */}
      {hasSelectedServices && timeSlot && (
        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary-foreground" />
                <span className="font-medium">Terminzeit:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartTimeAdjust(-30)}
                >
                  <ChevronLeft className="h-3 w-3" />
                  30min
                </Button>
                
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {formatTimeShort(timeSlot.start)} - {formatTimeShort(timeSlot.end)}
                </Badge>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartTimeAdjust(30)}
                >
                  30min
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper functions
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = startMinutes + durationMinutes
  return minutesToTime(endMinutes)
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