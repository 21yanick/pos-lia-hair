'use client'

/**
 * EditAppointmentDialog - Simple edit dialog for existing appointments
 * Allows editing: Time, Duration, Customer Name, Notes
 */

import { Clock, Edit, Loader2, User } from 'lucide-react'
import { useCallback, useEffect, useId, useState } from 'react'
import { toast } from 'sonner'
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
  // V6.1 Enhanced: Support both customer and private appointments
  appointmentType: 'customer' | 'private'
  customerName: string
  title: string // For private appointments
  notes: string
}

export function EditAppointmentDialog({
  isOpen,
  onClose,
  onSuccess,
  appointment,
}: EditAppointmentDialogProps) {
  const { currentOrganization } = useCurrentOrganization()
  const updateAppointment = useUpdateAppointment(currentOrganization?.id || '')

  const [formData, setFormData] = useState<EditFormData>({
    startTime: '',
    endTime: '',
    duration: 60,
    appointmentType: 'customer', // Default
    customerName: '',
    title: '',
    notes: '',
  })

  // Generate unique IDs for form elements
  const startTimeId = useId()
  const endTimeId = useId()
  const customerNameId = useId()
  const titleId = useId()
  const notesId = useId()

  // V6.1 Enhanced: Detect appointment type (KISS: Simple detection based on title presence)
  const isPrivateAppointment = !!appointment?.title && !appointment?.customerName

  // Normalize time to HH:mm format
  const normalizeTime = useCallback((time: string): string => {
    if (!time) return '09:00'
    const [hours, minutes] = time.split(':').map(Number)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }, [])

  // Initialize form when appointment changes
  useEffect(() => {
    if (appointment) {
      // V6.1 Enhanced: Detect type and populate appropriate fields
      const isPrivate = !!appointment.title && !appointment.customerName

      setFormData({
        startTime: normalizeTime(appointment.startTime),
        endTime: normalizeTime(appointment.endTime),
        duration: appointment.duration || 60,
        appointmentType: isPrivate ? 'private' : 'customer',
        customerName: appointment.customerName || '',
        title: appointment.title || '',
        notes: appointment.notes || '',
      })
    }
  }, [appointment, normalizeTime])

  // V6.1 Enhanced: Simplified time management (KISS: Like TimeSelectionStep)
  // Helper: Calculate duration from start and end time
  const calculateDuration = useCallback((startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)

    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes

    return Math.max(0, endTotalMinutes - startTotalMinutes)
  }, [])

  // Helper: Calculate end time from start time and duration
  const calculateEndTime = useCallback((startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + durationMinutes
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }, [])

  // Handle start time change - auto-calculate end time based on current duration
  const handleStartTimeChange = (newStartTime: string) => {
    const normalizedStartTime = normalizeTime(newStartTime)
    const newEndTime = calculateEndTime(normalizedStartTime, formData.duration)
    setFormData((prev) => ({
      ...prev,
      startTime: normalizedStartTime,
      endTime: newEndTime,
    }))
  }

  // Handle end time change - auto-calculate duration
  const handleEndTimeChange = (newEndTime: string) => {
    const normalizedEndTime = normalizeTime(newEndTime)
    const newDuration = calculateDuration(formData.startTime, normalizedEndTime)

    setFormData((prev) => ({
      ...prev,
      endTime: normalizedEndTime,
      duration: newDuration, // Auto-calculated
    }))
  }

  const handleSubmit = async () => {
    if (!appointment || !currentOrganization) return

    try {
      // Ensure times are properly formatted
      const normalizedStartTime = normalizeTime(formData.startTime)
      const normalizedEndTime = normalizeTime(formData.endTime)

      // V6.1 Enhanced: Handle both customer and private appointments (KISS approach)
      const updateData: AppointmentUpdate = {
        id: appointment.id,
        appointment_date: formatDateForAPI(appointment.date),
        start_time: normalizedStartTime,
        end_time: normalizedEndTime,
        notes: formData.notes || null,
        // Conditional fields based on appointment type
        ...(formData.appointmentType === 'private'
          ? {
              // Private appointment: Update title, clear customer fields
              title: formData.title || undefined,
              customer_name: null,
              customer_id: null,
              customer_phone: null,
            }
          : {
              // Customer appointment: Update customer fields, clear title
              customer_name: formData.customerName || null,
              customer_id: appointment.customerId,
              customer_phone: appointment.customerPhone,
              title: undefined,
            }),
        // No services update - services stay unchanged
      }

      const _result = await updateAppointment.mutateAsync(updateData)

      // V6.1: Display appropriate success message
      const displayName =
        formData.appointmentType === 'private' ? formData.title : formData.customerName

      toast.success('Termin aktualisiert', {
        description: `Termin "${displayName}" wurde erfolgreich aktualisiert.`,
      })

      onSuccess?.()
      onClose()
    } catch (error: unknown) {
      // V6.1 Enhanced: Improved error handling with specific conflict detection
      console.error('Edit appointment error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'

      // Check if this is a conflict error (KISS: Simple string check)
      const isConflict = errorMessage.includes('Terminkonflikt') || errorMessage.includes('belegt')

      toast.error(isConflict ? 'Terminüberschneidung!' : 'Fehler beim Aktualisieren', {
        description: isConflict
          ? `${errorMessage}\n\nBitte wählen Sie eine andere Zeit oder verschieben Sie den überschneidenden Termin.`
          : errorMessage,
        duration: isConflict ? 8000 : 5000, // Longer display for conflicts
      })

      // Don't close dialog on error - let user fix the conflict
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

            {/* V6.1 Enhanced: Both start and end time are editable (KISS: Like TimeSelectionStep) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={startTimeId}>Von</Label>
                <Input
                  id={startTimeId}
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="font-mono text-center"
                  step="900" // 15-minute steps
                />
              </div>
              <div>
                <Label htmlFor={endTimeId}>Bis</Label>
                <Input
                  id={endTimeId}
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="font-mono text-center"
                  step="900" // 15-minute steps
                />
              </div>
            </div>

            {/* Duration Display (auto-calculated) */}
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>Dauer: {formData.duration} Minuten</span>
            </div>
          </div>

          {/* V6.1 Enhanced: Conditional UI - Customer OR Private Appointment (KISS: Read-only type detection) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              {isPrivateAppointment ? 'Privater Termin' : 'Kunde'}
            </div>

            {isPrivateAppointment ? (
              // Private Appointment: Show title field
              <div>
                <Label htmlFor={titleId}>Titel *</Label>
                <Input
                  id={titleId}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder='z.B. "Kids Kindergarten abholen"'
                />
              </div>
            ) : (
              // Customer Appointment: Show customer name field
              <div>
                <Label htmlFor={customerNameId}>Name *</Label>
                <Input
                  id={customerNameId}
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, customerName: e.target.value }))
                  }
                  placeholder="Kundenname"
                />
              </div>
            )}
          </div>

          {/* Notizen Section */}
          <div className="space-y-3">
            <Label htmlFor={notesId}>Notizen</Label>
            <Textarea
              id={notesId}
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
            disabled={
              updateAppointment.isPending ||
              (isPrivateAppointment ? !formData.title.trim() : !formData.customerName.trim())
            }
          >
            {updateAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aktualisieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
