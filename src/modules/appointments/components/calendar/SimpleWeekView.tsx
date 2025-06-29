'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Clock, Scissors } from 'lucide-react'
import { 
  getWeekDays, 
  formatDateForDisplay, 
  generateTimeSlots, 
  timeToMinutes, 
  formatTimeShort,
  isToday 
} from '@/shared/utils/dateUtils'
import { cn } from '@/shared/utils'
import type { Appointment } from '@/shared/services/appointmentService'

interface SimpleWeekViewProps {
  appointments: Appointment[]
  selectedDate: Date
  onEditAppointment: (appointment: Appointment) => void
}

export function SimpleWeekView({ appointments, selectedDate, onEditAppointment }: SimpleWeekViewProps) {
  // Generate week days
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])
  
  // Generate time slots (9 AM to 6 PM, 30 minute intervals)
  const timeSlots = useMemo(() => generateTimeSlots(9, 18, 30), [])
  
  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {}
    
    appointments.forEach(appointment => {
      const dateKey = appointment.appointment_date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(appointment)
    })
    
    return grouped
  }, [appointments])

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointmentsByDate[dateStr] || []
  }

  // Calculate appointment position and height
  const getAppointmentStyle = (appointment: Appointment) => {
    const startMinutes = timeToMinutes(appointment.start_time)
    const endMinutes = timeToMinutes(appointment.end_time)
    const duration = endMinutes - startMinutes
    
    // Starting position relative to 9 AM (540 minutes from midnight)
    const dayStartMinutes = 9 * 60
    const relativeStart = startMinutes - dayStartMinutes
    
    // Each time slot is 30 minutes, calculate position
    const slotHeight = 4 // rem
    const top = (relativeStart / 30) * slotHeight
    const height = (duration / 30) * slotHeight
    
    return {
      top: `${top}rem`,
      height: `${Math.max(height, 1)}rem`, // Minimum 1rem height
    }
  }

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-8 min-h-[600px]">
          {/* Time Column */}
          <div className="border-r bg-muted/30">
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Time Slots */}
            <div className="relative">
              {timeSlots.map((time, index) => (
                <div 
                  key={time} 
                  className="h-16 border-b border-border/50 px-2 flex items-center justify-end"
                >
                  <span className="text-xs text-muted-foreground font-mono">
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDay(day)
            const isCurrentDay = isToday(day)
            
            return (
              <div key={day.toISOString()} className="border-r last:border-r-0">
                {/* Day Header */}
                <div className={cn(
                  "h-16 border-b flex flex-col items-center justify-center p-2",
                  isCurrentDay && "bg-primary/5 border-primary/20"
                )}>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {day.toLocaleDateString('de-DE', { weekday: 'short' })}
                  </span>
                  <span className={cn(
                    "text-sm font-medium mt-1",
                    isCurrentDay ? "text-primary font-semibold" : "text-foreground"
                  )}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Appointments Container */}
                <div className="relative">
                  {/* Time Slot Grid */}
                  {timeSlots.map((time, index) => (
                    <div 
                      key={time} 
                      className={cn(
                        "h-16 border-b border-border/30",
                        isCurrentDay && "bg-primary/[0.02]"
                      )}
                    />
                  ))}

                  {/* Appointments */}
                  {dayAppointments.map((appointment) => {
                    const style = getAppointmentStyle(appointment)
                    
                    return (
                      <div
                        key={appointment.id}
                        className={cn(
                          "absolute left-1 right-1 p-1 rounded border cursor-pointer",
                          "hover:shadow-sm transition-shadow overflow-hidden",
                          getStatusColor(appointment.status),
                          appointment.status === 'cancelled' && "opacity-60"
                        )}
                        style={style}
                        onClick={() => onEditAppointment(appointment)}
                      >
                        <div className="text-xs font-medium truncate">
                          {appointment.customer_name || 'Unbekannt'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Scissors className="h-2 w-2 flex-shrink-0" />
                          {appointment.service?.name || 'Service'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeShort(appointment.start_time)}
                        </div>
                      </div>
                    )
                  })}

                  {/* Empty Day Indicator */}
                  {dayAppointments.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                      <span className="text-xs">Keine Termine</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="border-t p-4 bg-muted/20">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Geplant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Erledigt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Storniert</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}