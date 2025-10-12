'use client'

/**
 * Customer Selection Step (Corrected Version)
 * Step 2 of QuickBookingDialog - Customer picker OR create new customer
 */

import { Check, Phone, Search, User } from 'lucide-react'
import { useId, useState } from 'react'
import { useCustomersQuery } from '@/modules/customers/hooks/useCustomersQuery'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Textarea } from '@/shared/components/ui/textarea'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { cn } from '@/shared/utils'
import { formatDateForDisplay, formatTimeShort } from '@/shared/utils/dateUtils'
import type { CustomerStepProps } from '../../types/quickBooking'

interface Customer {
  id: string
  name: string
  phone?: string | null
  email?: string | null
}

export function CustomerSelectionStep({
  appointmentType,
  onAppointmentTypeChange,
  customerName,
  customerPhone,
  customerEmail,
  title,
  onTitleChange,
  notes,
  onCustomerChange,
  onNotesChange,
  timeSlot,
  duration,
}: CustomerStepProps) {
  const { currentOrganization } = useCurrentOrganization()
  const { data: customers = [] } = useCustomersQuery(currentOrganization?.id || '')
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false) // false = select existing, true = create new
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: customerName,
    phone: customerPhone || '',
    email: customerEmail || '',
  })

  // Generate unique IDs for form elements
  const newCustomerNameId = useId()
  const newCustomerPhoneId = useId()
  const newCustomerEmailId = useId()
  const titleInputId = useId()
  const notesId = useId()

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  // Handle existing customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomerId(customer.id)
    onCustomerChange(customer.name, customer.phone || null, customer.email || null, customer.id)
    setCustomerSearchOpen(false)
  }

  // Handle new customer form changes
  const handleNewCustomerFormChange = (field: string, value: string) => {
    const updatedForm = { ...newCustomerForm, [field]: value }
    setNewCustomerForm(updatedForm)

    // Update parent state (null customerId = create new customer)
    onCustomerChange(updatedForm.name, updatedForm.phone || null, updatedForm.email || null, null)
  }

  // Handle customer type toggle
  const handleCustomerTypeToggle = (createMode: boolean) => {
    setIsCreateMode(createMode)

    if (createMode) {
      // Switch to create mode: use form data
      onCustomerChange(
        newCustomerForm.name,
        newCustomerForm.phone || null,
        newCustomerForm.email || null
      )
      setSelectedCustomerId(null)
    } else {
      // Switch to existing: clear if no customer selected
      if (!selectedCustomer) {
        onCustomerChange('', null, null)
        setNewCustomerForm({ name: '', phone: '', email: '' })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Termin-Typ wählen</h3>
        <p className="text-sm text-muted-foreground">Kundentermin oder privater Blocker-Termin</p>
      </div>

      {/* Binary Appointment Type Toggle - V6.1 Enhanced */}
      <div className="flex gap-2">
        <Button
          variant={appointmentType === 'customer' ? 'default' : 'outline'}
          onClick={() => onAppointmentTypeChange('customer')}
          className="flex-1"
        >
          <User className="h-4 w-4 mr-2" />
          Kunde
        </Button>
        <Button
          variant={appointmentType === 'private' ? 'default' : 'outline'}
          onClick={() => onAppointmentTypeChange('private')}
          className="flex-1"
        >
          <User className="h-4 w-4 mr-2" />
          Privat
        </Button>
      </div>

      {/* Conditional UI based on appointmentType */}
      {appointmentType === 'customer' ? (
        /* Customer Appointment UI */
        <>
          {/* Sub-Toggle: Existing vs New Customer */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={!isCreateMode ? 'default' : 'outline'}
              onClick={() => handleCustomerTypeToggle(false)}
              className="flex-1 text-sm"
            >
              <User className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Bestehender Kunde</span>
              <span className="sm:hidden">Bestehend</span>
            </Button>
            <Button
              variant={isCreateMode ? 'default' : 'outline'}
              onClick={() => handleCustomerTypeToggle(true)}
              className="flex-1 text-sm"
            >
              <User className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Kunde erstellen</span>
              <span className="sm:hidden">Neu erstellen</span>
            </Button>
          </div>

          {!isCreateMode ? (
            /* Existing Customer Selection */
            <div className="space-y-4">
              <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerSearchOpen}
                    className="w-full justify-between h-12"
                  >
                    {selectedCustomer ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {selectedCustomer.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedCustomer.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Kunde auswählen...</span>
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
                            onSelect={() => handleCustomerSelect(customer)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {customer.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
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
                                  'ml-auto h-4 w-4',
                                  selectedCustomer?.id === customer.id ? 'opacity-100' : 'opacity-0'
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
            /* New Customer Creation Form */
            <div className="space-y-4">
              <div>
                <Label htmlFor={newCustomerNameId}>Name *</Label>
                <Input
                  id={newCustomerNameId}
                  value={newCustomerForm.name}
                  onChange={(e) => handleNewCustomerFormChange('name', e.target.value)}
                  placeholder="Vollständiger Name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={newCustomerPhoneId}>Telefon</Label>
                <Input
                  id={newCustomerPhoneId}
                  value={newCustomerForm.phone}
                  onChange={(e) => handleNewCustomerFormChange('phone', e.target.value)}
                  placeholder="Telefonnummer (optional)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={newCustomerEmailId}>E-Mail</Label>
                <Input
                  id={newCustomerEmailId}
                  type="email"
                  value={newCustomerForm.email}
                  onChange={(e) => handleNewCustomerFormChange('email', e.target.value)}
                  placeholder="E-Mail-Adresse (optional)"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </>
      ) : (
        /* Private Appointment UI - V6.1 Enhanced */
        <div className="space-y-4">
          <div>
            <Label htmlFor={titleInputId}>Titel *</Label>
            <Input
              id={titleInputId}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder='z.B. "Kids Kindergarten abholen", "Arzttermin"'
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Titel für privaten Blocker-Termin ohne Kunde
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <Label htmlFor={notesId}>Notizen</Label>
        <Textarea
          id={notesId}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notizen zum Termin..."
          rows={3}
          className="mt-1"
        />
      </div>

      {/* Booking Summary */}
      {((appointmentType === 'customer' && (customerName || selectedCustomer)) ||
        (appointmentType === 'private' && title)) &&
        timeSlot && (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4">
              <h4 className="font-medium text-success-foreground mb-3 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Termin-Zusammenfassung
              </h4>
              <div className="space-y-3 text-sm">
                {/* Display customer or title based on appointmentType */}
                {appointmentType === 'customer' ? (
                  <div>
                    <div className="text-muted-foreground mb-1">Kunde:</div>
                    <div className="font-medium truncate">
                      {isCreateMode ? newCustomerForm.name : selectedCustomer?.name}
                    </div>
                    {((isCreateMode && newCustomerForm.phone) ||
                      (!isCreateMode && selectedCustomer?.phone)) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Tel: {isCreateMode ? newCustomerForm.phone : selectedCustomer?.phone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-muted-foreground mb-1">Titel:</div>
                    <div className="font-medium truncate">{title}</div>
                    <div className="text-xs text-muted-foreground mt-1">Privater Termin</div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-muted-foreground mb-1">Datum:</div>
                    <div className="font-medium text-xs sm:text-sm">
                      {formatDateForDisplay(timeSlot.date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Zeit:</div>
                    <div className="font-medium text-xs sm:text-sm">
                      {formatTimeShort(timeSlot.start)} - {formatTimeShort(timeSlot.end)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1">Dauer:</div>
                  <div className="font-medium">{duration} Minuten</div>
                </div>

                {notes && (
                  <div>
                    <div className="text-muted-foreground mb-1">Notizen:</div>
                    <div className="text-xs bg-background/50 p-2 rounded">{notes}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
