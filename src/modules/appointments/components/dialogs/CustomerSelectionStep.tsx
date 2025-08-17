'use client'

/**
 * Customer Selection Step - Customer picker with booking summary
 * Step 2 of QuickBookingDialog
 */

import { Check, Phone, Search, User } from 'lucide-react'
import { useState } from 'react'
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
  phone?: string | null // V6.1 compatibility: allow both undefined and null
  email?: string | null // V6.1 compatibility: allow both undefined and null
}

export function CustomerSelectionStep({
  customerId,
  customerName,
  customerPhone,
  notes,
  isWalkIn,
  onCustomerChange,
  onWalkInToggle,
  onNotesChange,
  selectedServices,
  timeSlot,
  totalDuration,
}: CustomerStepProps) {
  const { currentOrganization } = useCurrentOrganization()
  const { data: customers = [] } = useCustomersQuery(currentOrganization?.id || '')
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [walkInForm, setWalkInForm] = useState({
    name: customerName,
    phone: customerPhone || '',
    email: '',
  })

  const selectedCustomer = customers.find((c) => c.id === customerId)
  const selectedServiceNames = selectedServices
    .filter((s) => s.selected)
    .map((s) => s.service.name)
    .join(' + ')

  // Handle existing customer selection
  const handleCustomerSelect = (customer: Customer) => {
    onCustomerChange(customer.id, customer.name, customer.phone || null)
    setCustomerSearchOpen(false)

    // Switch to existing customer mode
    if (isWalkIn) {
      onWalkInToggle(false)
    }
  }

  // Handle walk-in customer form
  const handleWalkInFormChange = (field: string, value: string) => {
    const updatedForm = { ...walkInForm, [field]: value }
    setWalkInForm(updatedForm)

    // Update parent state
    onCustomerChange(null, updatedForm.name, updatedForm.phone || null)
  }

  // Handle customer type toggle
  const handleCustomerTypeToggle = (walkIn: boolean) => {
    onWalkInToggle(walkIn)

    if (walkIn) {
      // Switch to walk-in: set "Laufkundschaft" as default name
      const defaultName = walkInForm.name || 'Laufkundschaft'
      setWalkInForm((prev) => ({ ...prev, name: defaultName }))
      onCustomerChange(null, defaultName, walkInForm.phone || null)
    } else {
      // Switch to existing: clear form data
      onCustomerChange(null, '', null)
      setWalkInForm({ name: '', phone: '', email: '' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Kunde auswählen</h3>
        <p className="text-sm text-muted-foreground">
          Wählen Sie einen bestehenden Kunden oder geben Sie Laufkundschaft ein
        </p>
      </div>

      {/* Customer Type Toggle - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant={!isWalkIn ? 'default' : 'outline'}
          onClick={() => handleCustomerTypeToggle(false)}
          className="flex-1"
        >
          <User className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Bestehender Kunde</span>
          <span className="sm:hidden">Bestehend</span>
        </Button>
        <Button
          variant={isWalkIn ? 'default' : 'outline'}
          onClick={() => handleCustomerTypeToggle(true)}
          className="flex-1"
        >
          <User className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Laufkundschaft</span>
          <span className="sm:hidden">Laufkunde</span>
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
        /* Walk-in Customer Form */
        <div className="space-y-4">
          <div>
            <Label htmlFor="walkInName">Name *</Label>
            <Input
              id="walkInName"
              value={walkInForm.name}
              onChange={(e) => handleWalkInFormChange('name', e.target.value)}
              placeholder="Name der Laufkundschaft"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="walkInPhone">Telefon</Label>
            <Input
              id="walkInPhone"
              value={walkInForm.phone}
              onChange={(e) => handleWalkInFormChange('phone', e.target.value)}
              placeholder="Telefonnummer (optional)"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="walkInEmail">E-Mail</Label>
            <Input
              id="walkInEmail"
              type="email"
              value={walkInForm.email}
              onChange={(e) => handleWalkInFormChange('email', e.target.value)}
              placeholder="E-Mail-Adresse (optional)"
              className="mt-1"
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
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notizen zum Termin..."
          rows={3}
          className="mt-1"
        />
      </div>

      {/* Booking Summary */}
      {(customerName || selectedCustomer) && selectedServices.length > 0 && timeSlot && (
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-4">
            <h4 className="font-medium text-success-foreground mb-3 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Termin-Zusammenfassung
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Kunde:</div>
                <div className="font-medium truncate">
                  {isWalkIn ? walkInForm.name : selectedCustomer?.name}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Services:</div>
                <div className="font-medium break-words">{selectedServiceNames}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                <div className="font-medium">{totalDuration} Minuten</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
