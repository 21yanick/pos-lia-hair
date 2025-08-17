'use client'

/**
 * Quick Booking Dialog - 2-Step simplified booking flow
 * Mobile-first design with multi-service selection
 */

import { AlertTriangle, Check, ChevronLeft, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { useItems } from '@/shared/hooks/business/useItems'
import { useToast } from '@/shared/hooks/core/useToast'
import type { AppointmentInsert } from '@/shared/services/appointmentService'
import { cn } from '@/shared/utils'
import { formatDateForAPI, formatDateForDisplay } from '@/shared/utils/dateUtils'
import { useCreateAppointment } from '../../hooks/useAppointments'
import type {
  BookingStep,
  BookingTimeSlot,
  QuickBookingDialogProps,
  QuickBookingFormData,
  ServiceSelection,
} from '../../types/quickBooking'
import { CustomerSelectionStep } from './CustomerSelectionStep'
import { ServiceSelectionStep } from './ServiceSelectionStep'

export function QuickBookingDialog({
  isOpen,
  onClose,
  onSuccess,
  initialTimeSlot,
  initialDate = new Date(),
  isExceptionAppointment = false,
}: QuickBookingDialogProps) {
  const { toast } = useToast()
  const { currentOrganization } = useCurrentOrganization()
  const { items } = useItems()
  const createAppointment = useCreateAppointment(currentOrganization?.id || '')

  // Steps state
  const [currentStep, setCurrentStep] = useState<BookingStep>('services')

  // Form state
  const [formData, setFormData] = useState<QuickBookingFormData>({
    selectedServices: [],
    totalDuration: 0,
    timeSlot: initialTimeSlot || null,
    customerId: null,
    customerName: '',
    customerPhone: null,
    notes: '',
    isWalkIn: false,
    isExceptionAppointment,
  })

  // Available services (filter for bookable services)
  const availableServices = useMemo(() => {
    return items.filter(
      (item) => item.type === 'service' && item.active && item.requires_booking !== false
    )
  }, [items])

  // Initialize service selections when services load
  useEffect(() => {
    if (availableServices.length > 0 && formData.selectedServices.length === 0) {
      const serviceSelections: ServiceSelection[] = availableServices.map((service) => ({
        service,
        selected: false,
      }))
      setFormData((prev) => ({
        ...prev,
        selectedServices: serviceSelections,
      }))
    }
  }, [availableServices, formData.selectedServices.length])

  // Calculate total duration from selected services using standard durations
  const totalDuration = useMemo(() => {
    return formData.selectedServices
      .filter((s) => s.selected)
      .reduce((sum, s) => sum + (s.service.duration_minutes || 60), 0)
  }, [formData.selectedServices])

  // Update total duration when services change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      totalDuration,
    }))
  }, [totalDuration])

  // Reset/Initialize form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('services')
      setFormData({
        selectedServices: [],
        totalDuration: 0,
        timeSlot: initialTimeSlot || {
          start: '09:00',
          end: '10:00',
          date: initialDate,
        },
        customerId: null,
        customerName: '',
        customerPhone: null,
        notes: '',
        isWalkIn: false,
        isExceptionAppointment,
      })
    }
  }, [isOpen, initialTimeSlot, initialDate, isExceptionAppointment])

  // Progress calculation
  const progress = currentStep === 'services' ? 50 : 100

  // Validation for each step
  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 'services':
        return formData.selectedServices.some((s) => s.selected) && formData.timeSlot
      case 'customer':
        return (formData.customerId || formData.customerName.trim()) && formData.timeSlot
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
    setCurrentStep('services')
  }

  // Form submission
  const handleSubmit = async () => {
    if (!canProceedToNextStep || !currentOrganization || !formData.timeSlot) {
      return
    }

    try {
      const selectedServices = formData.selectedServices.filter((s) => s.selected)

      // Prepare notes with exception marker if needed
      const baseNotes = formData.notes.trim()
      const exceptionNote = formData.isExceptionAppointment ? '[AUSNAHMETERMIN]' : ''
      const combinedNotes =
        [exceptionNote, baseNotes].filter((note) => note.length > 0).join(' - ') || null

      // Create new appointment
      const appointmentData: AppointmentInsert = {
        appointment_date: formatDateForAPI(formData.timeSlot.date),
        start_time: formData.timeSlot.start,
        end_time: formData.timeSlot.end,
        customer_id: formData.customerId,
        customer_name: formData.customerName || null,
        customer_phone: formData.customerPhone,
        notes: combinedNotes,
        organization_id: currentOrganization.id,
        // Multi-service structure
        services: selectedServices.map((serviceSelection, index) => ({
          item_id: serviceSelection.service.id,
          service_price: serviceSelection.service.default_price || null,
          service_duration_minutes: serviceSelection.service.duration_minutes || 60,
          sort_order: index + 1,
        })),
      }

      await createAppointment.mutateAsync(appointmentData)

      toast({
        title: 'Termin erstellt',
        description: `Termin für ${appointmentData.customer_name} am ${formatDateForDisplay(formData.timeSlot.date)} um ${formData.timeSlot.start} wurde erfolgreich erstellt.`,
      })

      onSuccess?.()
      onClose()
    } catch (_error) {
      toast({
        title: 'Fehler',
        description: 'Termin konnte nicht erstellt werden.',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    onClose()
  }

  // Update handlers for child components
  const handleServicesChange = (services: ServiceSelection[]) => {
    setFormData((prev) => ({ ...prev, selectedServices: services }))
  }

  const handleTimeSlotChange = (timeSlot: BookingTimeSlot) => {
    setFormData((prev) => ({ ...prev, timeSlot }))
  }

  const handleDurationAdjust = (newDuration: number) => {
    setFormData((prev) => ({ ...prev, totalDuration: newDuration }))

    // Update end time if we have a time slot
    if (formData.timeSlot) {
      const endTime = calculateEndTime(formData.timeSlot.start, newDuration)
      handleTimeSlotChange({
        ...formData.timeSlot,
        end: endTime,
      })
    }
  }

  const handleCustomerChange = (
    customerId: string | null,
    customerName: string,
    customerPhone: string | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      customerId,
      customerName,
      customerPhone,
    }))
  }

  const handleWalkInToggle = (isWalkIn: boolean) => {
    setFormData((prev) => ({ ...prev, isWalkIn }))
  }

  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({ ...prev, notes }))
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
            {currentStep === 'services'
              ? 'Wählen Sie Services und passen Sie die Zeit an'
              : 'Wählen Sie einen Kunden und bestätigen Sie den Termin'}
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
                currentStep === 'services' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  currentStep === 'services'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                1
              </div>
              <span className="font-medium">Services & Zeit</span>
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
                {currentStep === 'customer' ? <Check className="h-3 w-3" /> : '2'}
              </div>
              <span className="font-medium">Kunde & Bestätigung</span>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Service Selection */}
          {currentStep === 'services' && (
            <ServiceSelectionStep
              availableServices={availableServices}
              selectedServices={formData.selectedServices}
              totalDuration={formData.totalDuration}
              timeSlot={formData.timeSlot}
              onServicesChange={handleServicesChange}
              onTimeSlotChange={handleTimeSlotChange}
              onDurationAdjust={handleDurationAdjust}
            />
          )}

          {/* Step 2: Customer Selection */}
          {currentStep === 'customer' && (
            <CustomerSelectionStep
              customerId={formData.customerId}
              customerName={formData.customerName}
              customerPhone={formData.customerPhone}
              notes={formData.notes}
              isWalkIn={formData.isWalkIn}
              onCustomerChange={handleCustomerChange}
              onWalkInToggle={handleWalkInToggle}
              onNotesChange={handleNotesChange}
              selectedServices={formData.selectedServices}
              timeSlot={formData.timeSlot}
              totalDuration={formData.totalDuration}
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
          {currentStep === 'services' ? (
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
