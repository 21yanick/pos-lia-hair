'use client'

import { Mail, Pencil, Phone, User, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useToast } from '@/shared/hooks/core/useToast'
import type { Customer, CustomerFormData } from '@/shared/services/customerService'
import { useCustomerActions } from '../hooks/useCustomerActions'

interface CustomerInfoCardProps {
  customer: Customer
  onUpdate?: (updatedCustomer: Customer) => void
}

type EditField = 'name' | 'phone' | 'email' | 'is_active' | null // V6.1: Add missing is_active field

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  const { toast } = useToast()
  const { currentOrganization } = useCurrentOrganization()
  const { updateCustomer } = useCustomerActions(currentOrganization?.id || '')

  const [editingField, setEditingField] = useState<EditField>(null)
  const [editValues, setEditValues] = useState<Partial<CustomerFormData>>({
    name: customer.name,
    phone: customer.phone || '',
    email: customer.email || '',
    is_active: customer.is_active, // V6.1: Include is_active field
  })

  const startEdit = (field: EditField) => {
    setEditingField(field)
    // Reset to current values
    setEditValues({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      is_active: customer.is_active, // V6.1: Include is_active field
    })
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValues({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      is_active: customer.is_active, // V6.1: Include is_active field
    })
  }

  const saveField = async (field: keyof CustomerFormData) => {
    // V6.1: Handle boolean vs string fields differently
    const fieldValue = editValues[field]
    const newValue =
      field === 'is_active'
        ? fieldValue // boolean field - no trim needed
        : typeof fieldValue === 'string'
          ? fieldValue.trim()
          : fieldValue

    const oldValue =
      field === 'phone'
        ? customer.phone || ''
        : field === 'email'
          ? customer.email || ''
          : field === 'is_active'
            ? customer.is_active
            : customer.name

    // Check if value changed
    if (newValue === oldValue) {
      setEditingField(null)
      return
    }

    // Validate required fields
    if (field === 'name' && !newValue) {
      toast({
        title: 'Fehler',
        description: 'Name ist erforderlich.',
        variant: 'destructive',
      })
      return
    }

    // Validate email format - V6.1: Type guard for string values only
    if (field === 'email' && newValue && typeof newValue === 'string' && !newValue.includes('@')) {
      toast({
        title: 'Fehler',
        description: 'Ungültige E-Mail-Adresse.',
        variant: 'destructive',
      })
      return
    }

    try {
      const updateData = {
        [field]: newValue || undefined,
      }

      await updateCustomer.mutateAsync({
        customerId: customer.id,
        data: updateData,
      })

      setEditingField(null)

      toast({
        title: 'Aktualisiert',
        description: `${field === 'name' ? 'Name' : field === 'phone' ? 'Telefon' : 'E-Mail'} wurde aktualisiert.`,
      })
    } catch (_error) {
      toast({
        title: 'Fehler',
        description: 'Änderung konnte nicht gespeichert werden.',
        variant: 'destructive',
      })
    }
  }

  const toggleStatus = async () => {
    const newStatus = !customer.is_active

    try {
      await updateCustomer.mutateAsync({
        customerId: customer.id,
        data: { is_active: newStatus },
      })

      toast({
        title: 'Status aktualisiert',
        description: `Kunde ist jetzt ${newStatus ? 'aktiv' : 'inaktiv'}.`,
      })
    } catch (_error) {
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht geändert werden.',
        variant: 'destructive',
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: keyof CustomerFormData) => {
    if (e.key === 'Enter') {
      saveField(field)
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const renderEditableField = (
    field: keyof CustomerFormData,
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    type: string = 'text'
  ) => {
    const isEditing = editingField === field
    const currentValue =
      field === 'phone'
        ? customer.phone || ''
        : field === 'email'
          ? customer.email || ''
          : customer.name
    const displayValue = currentValue || `Keine ${label.toLowerCase()}`

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </Label>

        {isEditing ? (
          <div className="flex gap-2">
            <Input
              type={type}
              value={typeof editValues[field] === 'string' ? editValues[field] : ''} // V6.1: Type guard for string values only
              onChange={(e) => setEditValues((prev) => ({ ...prev, [field]: e.target.value }))}
              onBlur={() => saveField(field)}
              onKeyDown={(e) => handleKeyDown(e, field)}
              placeholder={placeholder}
              autoFocus
              className="flex-1 min-w-0"
            />
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="group cursor-pointer hover:bg-muted rounded p-2 -m-2 transition-colors flex items-center justify-between min-w-0"
                  onClick={() => startEdit(field)}
                >
                  <span
                    className={`flex-1 truncate ${!currentValue ? 'text-muted-foreground italic' : ''}`}
                  >
                    {displayValue}
                  </span>
                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0 ml-2" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Klicken zum Bearbeiten • Automatisches Speichern</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Kundendaten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderEditableField('name', 'Name', <User className="h-4 w-4" />, 'z.B. Maria Müller')}

        {renderEditableField(
          'phone',
          'Telefon',
          <Phone className="h-4 w-4" />,
          'z.B. +41 79 123 45 67',
          'tel'
        )}

        {renderEditableField(
          'email',
          'E-Mail',
          <Mail className="h-4 w-4" />,
          'z.B. maria@example.com',
          'email'
        )}

        {/* Customer Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={customer.is_active ?? undefined} // V6.1: Convert null to undefined for component
                      onCheckedChange={toggleStatus}
                      disabled={updateCustomer.isPending}
                    />
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}
                    >
                      {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Klicken um Status zu ändern</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Created Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Erstellt am</Label>
          <div className="text-sm text-muted-foreground">
            {customer.created_at &&
              new Date(customer.created_at).toLocaleDateString('de-DE', {
                // V6.1: Null safety for Date constructor
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
