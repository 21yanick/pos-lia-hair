'use client'

/**
 * AppointmentDetailDialog - Display and Edit Existing Appointments
 * Modern UI with theme colors and proper status management
 */

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Scissors, 
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/shared/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useToast } from '@/shared/hooks/core/useToast'
import { formatDateForDisplay, formatTimeShort } from '@/shared/utils/dateUtils'
import { cn } from '@/shared/utils'
import type { AppointmentBlock } from '../types/timeline'

interface AppointmentDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentBlock | null
  onEdit?: (appointment: AppointmentBlock) => void
  onDelete?: (appointmentId: string) => void
  onStatusChange?: (appointmentId: string, status: string) => void
}

export function AppointmentDetailDialog({ 
  isOpen, 
  onClose, 
  appointment,
  onEdit,
  onDelete,
  onStatusChange
}: AppointmentDetailDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  if (!appointment) return null

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Bestätigt',
          variant: 'default' as const,
          className: 'bg-[hsl(var(--appointment-confirmed))] text-[hsl(var(--appointment-confirmed-foreground))]',
          icon: CheckCircle
        }
      case 'scheduled':
        return {
          label: 'Geplant',
          variant: 'secondary' as const,
          className: 'bg-[hsl(var(--appointment-scheduled))] text-[hsl(var(--appointment-scheduled-foreground))]',
          icon: Calendar
        }
      case 'pending':
        return {
          label: 'Ausstehend',
          variant: 'outline' as const,
          className: 'bg-[hsl(var(--appointment-pending))] text-[hsl(var(--appointment-pending-foreground))]',
          icon: Clock
        }
      case 'completed':
        return {
          label: 'Abgeschlossen',
          variant: 'default' as const,
          className: 'bg-[hsl(var(--appointment-completed))] text-[hsl(var(--appointment-completed-foreground))]',
          icon: CheckCircle
        }
      case 'cancelled':
        return {
          label: 'Storniert',
          variant: 'destructive' as const,
          className: 'bg-[hsl(var(--appointment-cancelled))] text-[hsl(var(--appointment-cancelled-foreground))]',
          icon: XCircle
        }
      default:
        return {
          label: 'Unbekannt',
          variant: 'outline' as const,
          className: 'bg-muted text-muted-foreground',
          icon: Calendar
        }
    }
  }

  const statusConfig = getStatusConfig(appointment.status)
  const StatusIcon = statusConfig.icon

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    try {
      await onStatusChange?.(appointment.id, newStatus)
      toast({
        title: 'Status aktualisiert',
        description: `Termin-Status wurde zu "${getStatusConfig(newStatus).label}" geändert.`
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht aktualisiert werden.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Möchten Sie diesen Termin wirklich löschen?')) return
    
    setIsLoading(true)
    try {
      await onDelete?.(appointment.id)
      toast({
        title: 'Termin gelöscht',
        description: 'Der Termin wurde erfolgreich gelöscht.'
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Termin konnte nicht gelöscht werden.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl">Termin-Details</DialogTitle>
                <DialogDescription>
                  {formatDateForDisplay(new Date())} • {appointment.startTime} - {appointment.endTime}
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={cn(statusConfig.className)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isLoading}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(appointment)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {appointment.status !== 'confirmed' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('confirmed')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Bestätigen
                    </DropdownMenuItem>
                  )}
                  {appointment.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Als erledigt markieren
                    </DropdownMenuItem>
                  )}
                  {appointment.status !== 'cancelled' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Stornieren
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {appointment.customerName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{appointment.customerName || 'Unbekannter Kunde'}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {/* TODO: Add phone/email from customer data */}
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>Nicht verfügbar</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>Nicht verfügbar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Services
              </h4>
              <div className="space-y-3">
                {appointment.services.map((service, index) => (
                  <div key={service.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.duration_minutes} Minuten
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">CHF {service.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {appointment.services.length > 1 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Gesamt</span>
                    <span className="font-semibold text-lg">
                      CHF {appointment.services.reduce((sum, service) => sum + service.price, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time & Duration */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Zeitplan
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Startzeit</div>
                  <div className="font-medium">{formatTimeShort(appointment.startTime)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Endzeit</div>
                  <div className="font-medium">{formatTimeShort(appointment.endTime)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Dauer</div>
                  <div className="font-medium">{appointment.duration} Minuten</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Preis</div>
                  <div className="font-medium">
                    CHF {(appointment.totalPrice || appointment.estimatedPrice || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {appointment.notes && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">Notizen</h4>
                <p className="text-muted-foreground leading-relaxed">{appointment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
          <Button onClick={() => onEdit?.(appointment)} disabled={isLoading}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}