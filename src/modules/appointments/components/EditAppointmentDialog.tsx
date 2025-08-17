'use client'

/**
 * EditAppointmentDialog - Simple edit dialog for existing appointments
 * Allows editing: Time, Duration, Customer Name, Notes
 */

import { Clock, Edit, Loader2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useToast } from '@/shared/hooks/core/useToast'
import type { AppointmentUpdate } from '@/shared/services/appointmentService'
import { formatDateForAPI, formatDateForDisplay } from '@/shared/utils/dateUtils'
import { useUpdateAppointment } from '../hooks/useAppointments'
import type { AppointmentBlock } from '../types/timeline'

interface EditAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  appointment: AppointmentBlock | null
}

interface EditFormData {
  startTime: string
  endTime: string
  duration: number
  customerName: string
  notes: string
}

export function EditAppointmentDialog({
  isOpen,
  onClose,
  onSuccess,
  appointment,
}: EditAppointmentDialogProps) {
  const { toast } = useToast()
  const { currentOrganization } = useCurrentOrganization()
  const updateAppointment = useUpdateAppointment(currentOrganization?.id || '')

  const [formData, setFormData] = useState<EditFormData>({
    startTime: '',
    endTime: '',
    duration: 60,
    customerName: '',
    notes: '',
  })

  // Initialize form when appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        startTime: normalizeTime(appointment.startTime),
        endTime: normalizeTime(appointment.endTime),
        duration: appointment.duration || 60,
        customerName: appointment.customerName || '',
        notes: appointment.notes || '',
      })
    }
  }, [appointment])

  // Normalize time to HH:mm format
  const normalizeTime = (time: string): string => {
    if (!time) return '09:00'
    const [hours, minutes] = time.split(':').map(Number)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Calculate end time when start time or duration changes
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + durationMinutes
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  // Update end time when start time changes
  const handleStartTimeChange = (newStartTime: string) => {
    const normalizedStartTime = normalizeTime(newStartTime)
    const newEndTime = calculateEndTime(normalizedStartTime, formData.duration)
    setFormData((prev) => ({
      ...prev,
      startTime: normalizedStartTime,
      endTime: newEndTime,
    }))
  }

  // Update end time when duration changes
  const handleDurationChange = (newDuration: number) => {
    const newEndTime = calculateEndTime(formData.startTime, newDuration)
    setFormData((prev) => ({
      ...prev,
      duration: newDuration,
      endTime: newEndTime,
    }))
  }

  const handleSubmit = async () => {
    if (!appointment || !currentOrganization) return

    try {
      // Ensure times are properly formatted
      const normalizedStartTime = normalizeTime(formData.startTime)
      const normalizedEndTime = normalizeTime(formData.endTime)

      const updateData: AppointmentUpdate = {
        id: appointment.id,
        appointment_date: formatDateForAPI(appointment.date),
        start_time: normalizedStartTime,
        end_time: normalizedEndTime,
        customer_name: formData.customerName || null,
        notes: formData.notes || null,
        // Keep existing customer_id and phone
        customer_id: appointment.customerId,
        customer_phone: appointment.customerPhone,
        // No services update - services stay unchanged
      }

      await updateAppointment.mutateAsync(updateData)

      toast({
        title: 'Termin aktualisiert',
        description: `Termin für ${formData.customerName} wurde erfolgreich aktualisiert.`,
      })

      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Edit appointment error:', error)
      toast({
        title: 'Fehler',
        description: error?.message || 'Termin konnte nicht aktualisiert werden.',
        variant: 'destructive',
      })
    }
  }

  if (!appointment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Termin bearbeiten
          </DialogTitle>
          <DialogDescription>{formatDateForDisplay(appointment.date)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Zeit Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Zeitplan
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startTime">Startzeit</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Endzeit</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Dauer (Minuten)</Label>
              <div className="flex gap-2 mt-1">
                {[30, 45, 60, 90, 120].map((mins) => (
                  <Button
                    key={mins}
                    type="button"
                    variant={formData.duration === mins ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDurationChange(mins)}
                  >
                    {mins}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Kunde Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Kunde
            </div>

            <div>
              <Label htmlFor="customerName">Name</Label>
              <Input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="Kundenname"
              />
            </div>
          </div>

          {/* Notizen Section */}
          <div className="space-y-3">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Zusätzliche Notizen..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateAppointment.isPending || !formData.customerName.trim()}
          >
            {updateAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aktualisieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
