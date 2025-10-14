'use client'

/**
 * Quick Booking Dialog (Simplified KISS Version)
 * 2-Step booking flow: Time Selection → Customer Creation
 */

import { AlertTriangle, Check, ChevronLeft, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Progress } from '@/shared/components/ui/progress'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useBusinessSettingsQuery } from '@/shared/hooks/business/useBusinessSettingsQuery'
import type { AppointmentInsert } from '@/shared/services/appointmentService'
import { createCustomer } from '@/shared/services/customerService'
import { safeBookingRules } from '@/shared/types/businessSettings'
import { cn } from '@/shared/utils'
import { formatDateForAPI, formatDateForDisplay } from '@/shared/utils/dateUtils'
import { useCreateAppointment } from '../../hooks/useAppointments'
import type {
  BookingStep,
  BookingTimeSlot,
  QuickBookingDialogProps,
  QuickBookingFormData,
} from '../../types/quickBooking'
import { CustomerSelectionStep } from './CustomerSelectionStep'
import { TimeSelectionStep } from './TimeSelectionStep'

export function QuickBookingDialog({
  isOpen,
  onClose,
  onSuccess,
  initialTimeSlot,
  initialDate = new Date(),
  isExceptionAppointment = false,
}: QuickBookingDialogProps) {
  const { currentOrganization } = useCurrentOrganization()
  const { settings } = useBusinessSettingsQuery()
  const createAppointment = useCreateAppointment(currentOrganization?.id || '')

  // Get default duration from settings
  const defaultDuration = useMemo(() => {
    const bookingRules = safeBookingRules(settings?.booking_rules)
    return bookingRules.defaultDuration
  }, [settings])

  // Steps state
  const [currentStep, setCurrentStep] = useState<BookingStep>('time')

  // Form state (simplified) - V6.1 Enhanced with appointmentType and title
  const [formData, setFormData] = useState<QuickBookingFormData>({
    timeSlot: initialTimeSlot || null,
    duration: defaultDuration,
    appointmentType: 'customer', // Default to customer appointments
    customerId: null,
    customerName: '',
    customerPhone: null,
    customerEmail: null,
    title: '', // V6.1: For private appointments
    notes: '',
    isExceptionAppointment,
  })

  // Note: Duration is set in the dialog initialization useEffect below
  // No need for separate duration update useEffect to avoid race conditions

  // Reset/Initialize form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('time')

      // Calculate proper end time for initial time slot
      let calculatedTimeSlot: BookingTimeSlot
      if (initialTimeSlot) {
        calculatedTimeSlot = {
          start: initialTimeSlot.start,
          end: calculateEndTime(initialTimeSlot.start, defaultDuration),
          date: initialTimeSlot.date,
        }
      } else {
        calculatedTimeSlot = {
          start: '09:00',
          end: calculateEndTime('09:00', defaultDuration),
          date: initialDate,
        }
      }

      setFormData({
        timeSlot: calculatedTimeSlot,
        duration: defaultDuration,
        appointmentType: 'customer', // Reset to customer on open
        customerId: null,
        customerName: '',
        customerPhone: null,
        customerEmail: null,
        title: '', // V6.1: Reset title
        notes: '',
        isExceptionAppointment,
      })
    }
  }, [isOpen, initialTimeSlot, initialDate, isExceptionAppointment, defaultDuration])

  // Progress calculation
  const progress = currentStep === 'time' ? 50 : 100

  // Validation for each step - V6.1 Enhanced with private appointment support
  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 'time':
        return formData.timeSlot && formData.duration > 0
      case 'customer':
        // V6.1: Validate based on appointmentType
        if (formData.appointmentType === 'private') {
          return formData.title.trim().length > 0 && formData.timeSlot
        }
        return formData.customerName.trim().length > 0 && formData.timeSlot
      default:
        return false
    }
  }, [currentStep, formData])

  // Step navigation
  const goToNextStep = () => {
    if (!canProceedToNextStep) return
    setCurrentStep('customer')
  }

  const goToPreviousStep = () => {
    setCurrentStep('time')
  }

  // Form submission
  const handleSubmit = async () => {
    if (!canProceedToNextStep || !currentOrganization || !formData.timeSlot) {
      return
    }

    try {
      // Step 1: Handle customer (existing or create new) - V6.1: Only for customer appointments
      let finalCustomerId: string | null = null

      if (formData.appointmentType === 'customer') {
        if (formData.customerId) {
          // Use existing customer
          finalCustomerId = formData.customerId
        } else if (formData.customerName.trim()) {
          // Create new customer
          const customerData = {
            name: formData.customerName.trim(),
            phone: formData.customerPhone?.trim() || undefined,
            email: formData.customerEmail?.trim() || undefined,
          }

          const newCustomer = await createCustomer(currentOrganization.id, customerData)
          finalCustomerId = newCustomer.id
        }
      }

      // Step 2: Prepare notes with exception marker if needed
      const baseNotes = formData.notes.trim()
      const exceptionNote = formData.isExceptionAppointment ? '[AUSNAHMETERMIN]' : ''
      const combinedNotes =
        [exceptionNote, baseNotes].filter((note) => note.length > 0).join(' - ') || null

      // Step 3: Create appointment (without services) - V6.1 Enhanced
      const appointmentData: AppointmentInsert = {
        appointment_date: formatDateForAPI(formData.timeSlot.date),
        start_time: formData.timeSlot.start,
        end_time: formData.timeSlot.end,
        // V6.1: Include customer OR title based on appointmentType
        customer_id: formData.appointmentType === 'customer' ? finalCustomerId : null,
        customer_name:
          formData.appointmentType === 'customer' ? formData.customerName || null : null,
        customer_phone: formData.appointmentType === 'customer' ? formData.customerPhone : null,
        title: formData.appointmentType === 'private' ? formData.title : undefined,
        notes: combinedNotes,
        organization_id: currentOrganization.id,
        // No services - simplified booking
        services: [],
      }

      const _result = await createAppointment.mutateAsync(appointmentData)

      // V6.1: Display appropriate success message
      const displayName =
        formData.appointmentType === 'private'
          ? `"${formData.title}"`
          : appointmentData.customer_name || 'Kunde'

      toast.success('Termin erstellt', {
        description: `Termin für ${displayName} am ${formatDateForDisplay(formData.timeSlot.date)} um ${formData.timeSlot.start} wurde erfolgreich erstellt.`,
      })

      onSuccess?.()
      onClose()
    } catch (error: unknown) {
      // V6.1 Enhanced: Improved error handling with specific conflict detection (KISS: Same as EditDialog)
      console.error('Create appointment error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'

      // Check if this is a conflict error (KISS: Simple string check)
      const isConflict = errorMessage.includes('Terminkonflikt') || errorMessage.includes('belegt')

      toast.error(isConflict ? 'Terminüberschneidung!' : 'Fehler beim Erstellen', {
        description: isConflict
          ? `${errorMessage}\n\nBitte wählen Sie eine andere Zeit.`
          : errorMessage,
        duration: isConflict ? 8000 : 5000, // Longer display for conflicts
      })

      // Don't close dialog on error - let user fix the conflict
    }
  }

  const handleClose = () => {
    onClose()
  }

  // Update handlers for child components
  const handleTimeSlotChange = (timeSlot: BookingTimeSlot) => {
    setFormData((prev) => ({ ...prev, timeSlot }))
  }

  const handleDurationChange = (duration: number) => {
    setFormData((prev) => ({ ...prev, duration }))
  }

  const handleCustomerChange = (
    customerName: string,
    customerPhone: string | null,
    customerEmail: string | null,
    customerId?: string | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      customerId: customerId || null,
      customerName,
      customerPhone,
      customerEmail,
    }))
  }

  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({ ...prev, notes }))
  }

  // V6.1: Handlers for appointment type and title
  const handleAppointmentTypeChange = (type: 'customer' | 'private') => {
    setFormData((prev) => ({ ...prev, appointmentType: type }))
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({ ...prev, title }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Neuer Termin -{' '}
            {formData.timeSlot ? formatDateForDisplay(formData.timeSlot.date) : 'Datum auswählen'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'time'
              ? 'Wählen Sie die Start- und Endzeit für den Termin'
              : 'Geben Sie die Kundendaten ein und bestätigen Sie den Termin'}
          </DialogDescription>

          {/* Exception Appointment Warning */}
          {formData.isExceptionAppointment && (
            <Alert className="border-destructive/20 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Ausnahmetermin:</strong> Dieser Termin liegt außerhalb der normalen
                Arbeitszeiten.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Bar */}
          <div className="w-full mt-4">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-3 text-sm">
            <div
              className={cn(
                'flex items-center gap-2',
                currentStep === 'time' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  currentStep === 'time'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep === 'customer' ? <Check className="h-3 w-3" /> : '1'}
              </div>
              <span className="font-medium">Zeit festlegen</span>
            </div>

            <div
              className={cn(
                'flex items-center gap-2',
                currentStep === 'customer' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  currentStep === 'customer'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                2
              </div>
              <span className="font-medium">Kunde erstellen</span>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Time Selection */}
          {currentStep === 'time' && (
            <TimeSelectionStep
              timeSlot={formData.timeSlot}
              duration={formData.duration}
              defaultDuration={defaultDuration}
              onTimeSlotChange={handleTimeSlotChange}
              onDurationChange={handleDurationChange}
            />
          )}

          {/* Step 2: Customer Selection/Creation - V6.1 Enhanced */}
          {currentStep === 'customer' && (
            <CustomerSelectionStep
              appointmentType={formData.appointmentType}
              onAppointmentTypeChange={handleAppointmentTypeChange}
              customerName={formData.customerName}
              customerPhone={formData.customerPhone}
              customerEmail={formData.customerEmail}
              title={formData.title}
              onTitleChange={handleTitleChange}
              notes={formData.notes}
              onCustomerChange={handleCustomerChange}
              onNotesChange={handleNotesChange}
              timeSlot={formData.timeSlot}
              duration={formData.duration}
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          {/* Back Button */}
          {currentStep === 'customer' && (
            <Button variant="outline" onClick={goToPreviousStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          )}

          {/* Cancel Button */}
          <Button variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>

          {/* Next/Save Button */}
          {currentStep === 'time' ? (
            <Button onClick={goToNextStep} disabled={!canProceedToNextStep}>
              Weiter
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedToNextStep || createAppointment.isPending}
            >
              {createAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Termin erstellen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + durationMinutes
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
}
