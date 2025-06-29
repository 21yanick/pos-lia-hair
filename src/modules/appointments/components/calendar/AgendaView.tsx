'use client'

import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Clock, User, Scissors, Phone, MoreVertical } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { formatTimeShort, isAppointmentToday, getAppointmentTimeStatus } from '@/shared/utils/dateUtils'
import { cn } from '@/shared/utils'
import type { Appointment } from '@/shared/services/appointmentService'

interface AgendaViewProps {
  appointments: Appointment[]
  selectedDate: Date
  onEditAppointment: (appointment: Appointment) => void
}

export function AgendaView({ appointments, selectedDate, onEditAppointment }: AgendaViewProps) {
  // Group appointments by time slot for better organization
  const sortedAppointments = [...appointments].sort((a, b) => 
    a.start_time.localeCompare(b.start_time)
  )

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Geplant</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Erledigt</Badge>
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Storniert</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getCustomerInitials = (appointment: Appointment) => {
    const name = appointment.customer_name || 'Unbekannt'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getTimeStatus = (appointment: Appointment) => {
    if (!isAppointmentToday(appointment.appointment_date)) return null
    return getAppointmentTimeStatus(appointment.appointment_date, appointment.start_time)
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Keine Termine für diesen Tag</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedAppointments.map((appointment) => {
        const timeStatus = getTimeStatus(appointment)
        const isUpcoming = timeStatus && !timeStatus.includes('Vergangen')
        
        return (
          <Card 
            key={appointment.id} 
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              appointment.status === 'cancelled' && "opacity-60",
              isUpcoming && "ring-2 ring-blue-100 border-blue-200"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Customer Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getCustomerInitials(appointment)}
                  </AvatarFallback>
                </Avatar>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Customer Name */}
                      <h4 className="font-medium text-foreground truncate">
                        {appointment.customer_name || 'Unbekannter Kunde'}
                      </h4>
                      
                      {/* Service Info */}
                      <div className="flex items-center gap-2 mt-1">
                        <Scissors className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">
                          {appointment.service?.name || 'Service nicht verfügbar'}
                        </span>
                      </div>

                      {/* Time & Duration */}
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {formatTimeShort(appointment.start_time)} - {formatTimeShort(appointment.end_time)}
                        </span>
                        {timeStatus && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            timeStatus.includes('Vergangen') 
                              ? "bg-gray-100 text-gray-600"
                              : "bg-blue-100 text-blue-600"
                          )}>
                            {timeStatus}
                          </span>
                        )}
                      </div>

                      {/* Customer Phone */}
                      {appointment.customer_phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {appointment.customer_phone}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {appointment.notes}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-start gap-2 flex-shrink-0">
                      {getStatusBadge(appointment.status)}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditAppointment(appointment)}>
                            Bearbeiten
                          </DropdownMenuItem>
                          {appointment.status === 'scheduled' && (
                            <DropdownMenuItem>
                              Als erledigt markieren
                            </DropdownMenuItem>
                          )}
                          {appointment.status === 'scheduled' && (
                            <DropdownMenuItem className="text-destructive">
                              Stornieren
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Price Info */}
                  {appointment.estimated_price && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-sm font-medium text-foreground">
                        CHF {appointment.estimated_price.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}