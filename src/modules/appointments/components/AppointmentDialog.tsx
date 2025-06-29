'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Loader2, Scissors, User, Phone, Mail, Search, ChevronLeft, Check } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/shared/components/ui/dialog'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { useToast } from '@/shared/hooks/core/useToast'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useItems } from '@/shared/hooks/business/useItems'
import { useCustomersQuery } from '@/modules/customers/hooks/useCustomersQuery'
import { useCreateAppointment } from '../hooks/useAppointments'
import { TimeSlotPicker } from './TimeSlotPicker'
import { formatDateForAPI, formatDateForDisplay, formatTimeShort } from '@/shared/utils/dateUtils'
import { cn } from '@/shared/utils'
import type { Item } from '@/shared/hooks/business/useItems'
import type { AppointmentInsert } from '@/shared/services/appointmentService'

type AppointmentStep = 'service' | 'time' | 'customer'

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
}

interface AppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialDate?: Date
  editAppointment?: any // For future edit functionality
}

export function AppointmentDialog({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialDate = new Date()
}: AppointmentDialogProps) {
  const { toast } = useToast()
  const { currentOrganization } = useCurrentOrganization()
  const { items } = useItems()
  const { data: customers = [] } = useCustomersQuery(currentOrganization?.id || '')
  const createAppointment = useCreateAppointment(currentOrganization?.id || '')

  // Steps state
  const [currentStep, setCurrentStep] = useState<AppointmentStep>('service')
  
  // Form data
  const [selectedService, setSelectedService] = useState<Item | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [walkInCustomer, setWalkInCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [notes, setNotes] = useState('')
  const [isWalkIn, setIsWalkIn] = useState(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('service')
      setSelectedService(null)
      setSelectedDate(initialDate)
      setSelectedTimeSlot(null)
      setSelectedCustomer(null)
      setWalkInCustomer({ name: '', phone: '', email: '' })
      setNotes('')
      setIsWalkIn(false)
    }
  }, [isOpen, initialDate])

  // Available services (filter for bookable services)
  const availableServices = useMemo(() => {
    return items.filter(item => 
      item.type === 'service' && 
      item.active && 
      item.requires_booking !== false
    )
  }, [items])

  // Progress calculation
  const progress = useMemo(() => {
    const stepIndex = ['service', 'time', 'customer'].indexOf(currentStep)
    return ((stepIndex + 1) / 3) * 100
  }, [currentStep])

  // Validation for each step
  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 'service':
        return !!selectedService
      case 'time':
        return !!selectedTimeSlot && !!selectedDate
      case 'customer':
        return !!selectedCustomer || (isWalkIn && walkInCustomer.name.trim())
      default:
        return false
    }
  }, [currentStep, selectedService, selectedTimeSlot, selectedDate, selectedCustomer, isWalkIn, walkInCustomer])

  // Step navigation
  const goToNextStep = () => {
    if (!canProceedToNextStep) return
    
    const steps: AppointmentStep[] = ['service', 'time', 'customer']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const goToPreviousStep = () => {
    const steps: AppointmentStep[] = ['service', 'time', 'customer']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  // Form submission
  const handleSubmit = async () => {
    if (!selectedService || !selectedTimeSlot || !selectedDate || !currentOrganization) {
      return
    }

    try {
      const appointmentData: AppointmentInsert = {
        appointment_date: formatDateForAPI(selectedDate),
        start_time: selectedTimeSlot.start,
        end_time: selectedTimeSlot.end,
        item_id: selectedService.id,
        customer_id: selectedCustomer?.id || null,
        customer_name: isWalkIn ? walkInCustomer.name : selectedCustomer?.name || '',
        customer_phone: isWalkIn ? walkInCustomer.phone || null : selectedCustomer?.phone || null,
        notes: notes.trim() || null,
        estimated_price: selectedService.default_price || null,
        status: 'scheduled'
      }

      await createAppointment.mutateAsync(appointmentData)

      toast({
        title: 'Termin erstellt',
        description: `Termin für ${appointmentData.customer_name} am ${formatDateForDisplay(selectedDate)} um ${formatTimeShort(selectedTimeSlot.start)} wurde erfolgreich erstellt.`,
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Termin konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
        variant: 'destructive'
      })
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuer Termin</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Termin in 3 einfachen Schritten
          </DialogDescription>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-3 text-sm">
            {[
              { key: 'service', label: 'Service', icon: Scissors },
              { key: 'time', label: 'Zeit', icon: Search },
              { key: 'customer', label: 'Kunde', icon: User }
            ].map(({ key, label, icon: Icon }, index) => {
              const isActive = currentStep === key
              const isCompleted = ['service', 'time', 'customer'].indexOf(currentStep) > index
              
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                    isCompleted ? "bg-green-500 text-white" : 
                    isActive ? "bg-primary text-primary-foreground" : 
                    "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                  </div>
                  <span className={cn(
                    "font-medium",
                    isActive ? "text-primary" : 
                    isCompleted ? "text-green-600" : 
                    "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Service Selection */}
          {currentStep === 'service' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Service auswählen</h3>
              
              {availableServices.length === 0 ? (
                <Card className="border-amber-200">
                  <CardContent className="p-4">
                    <p className="text-amber-600">Keine buchbaren Services gefunden.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {availableServices.map((service) => (
                    <Card 
                      key={service.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedService?.id === service.id && "ring-2 ring-primary border-primary"
                      )}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Scissors className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <div className="text-sm text-muted-foreground">
                                {service.duration_minutes} Minuten
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              CHF {service.default_price?.toFixed(2) || '0.00'}
                            </div>
                            {selectedService?.id === service.id && (
                              <Badge variant="secondary" className="mt-1">
                                Ausgewählt
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Time Selection */}
          {currentStep === 'time' && (
            <TimeSlotPicker
              selectedDate={selectedDate}
              onDateChange={(newDate) => {
                setSelectedDate(newDate)
                // Clear selected time slot when date changes (better UX)
                setSelectedTimeSlot(null)
              }}
              selectedService={selectedService}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotSelect={setSelectedTimeSlot}
            />
          )}

          {/* Step 3: Customer Selection */}
          {currentStep === 'customer' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Kunde auswählen</h3>
              
              {/* Customer Type Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={!isWalkIn ? "default" : "outline"}
                  onClick={() => setIsWalkIn(false)}
                  className="flex-1"
                >
                  Bestehender Kunde
                </Button>
                <Button
                  variant={isWalkIn ? "default" : "outline"}
                  onClick={() => setIsWalkIn(true)}
                  className="flex-1"
                >
                  Laufkundschaft
                </Button>
              </div>

              {!isWalkIn ? (
                /* Existing Customer Selection */
                <div className="space-y-4">
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedCustomer ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {selectedCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {selectedCustomer.name}
                          </div>
                        ) : (
                          "Kunde auswählen..."
                        )}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Kunde suchen..." />
                        <CommandEmpty>Kein Kunde gefunden.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.name}
                                onSelect={() => {
                                  setSelectedCustomer(customer)
                                  setCustomerSearchOpen(false)
                                }}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="font-medium">{customer.name}</div>
                                    {customer.phone && (
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {customer.phone}
                                      </div>
                                    )}
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                /* Walk-in Customer Form */
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="walkInName">Name *</Label>
                    <Input
                      id="walkInName"
                      value={walkInCustomer.name}
                      onChange={(e) => setWalkInCustomer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name der Laufkundschaft"
                    />
                  </div>
                  <div>
                    <Label htmlFor="walkInPhone">Telefon</Label>
                    <Input
                      id="walkInPhone"
                      value={walkInCustomer.phone}
                      onChange={(e) => setWalkInCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Telefonnummer (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="walkInEmail">E-Mail</Label>
                    <Input
                      id="walkInEmail"
                      type="email"
                      value={walkInCustomer.email}
                      onChange={(e) => setWalkInCustomer(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="E-Mail-Adresse (optional)"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Zusätzliche Notizen zum Termin..."
                  rows={3}
                />
              </div>

              {/* Summary */}
              {(selectedCustomer || (isWalkIn && walkInCustomer.name)) && selectedService && selectedTimeSlot && (
                <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">Termin-Zusammenfassung</h4>
                    <div className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                      <div className="flex justify-between">
                        <span>Kunde:</span>
                        <span className="font-medium">
                          {isWalkIn ? walkInCustomer.name : selectedCustomer?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span className="font-medium">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Datum:</span>
                        <span className="font-medium">{formatDateForDisplay(selectedDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zeit:</span>
                        <span className="font-medium">
                          {formatTimeShort(selectedTimeSlot.start)} - {formatTimeShort(selectedTimeSlot.end)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Preis:</span>
                        <span className="font-semibold">
                          CHF {selectedService.default_price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {/* Back Button */}
          {currentStep !== 'service' && (
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
          {currentStep !== 'customer' ? (
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