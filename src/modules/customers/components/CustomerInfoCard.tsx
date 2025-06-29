'use client'

import { useState } from 'react'
import { Pencil, X, Check, Phone, Mail, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { useToast } from '@/shared/hooks/core/useToast'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useCustomerActions } from '../hooks/useCustomerActions'
import type { Customer, CustomerFormData } from '@/shared/services/customerService'

interface CustomerInfoCardProps {
  customer: Customer
  onUpdate?: (updatedCustomer: Customer) => void
}

type EditField = 'name' | 'phone' | 'email' | null

export function CustomerInfoCard({ customer, onUpdate }: CustomerInfoCardProps) {
  const { toast } = useToast()
  const { currentOrganization } = useCurrentOrganization()
  const { updateCustomer } = useCustomerActions(currentOrganization?.id || '')

  const [editingField, setEditingField] = useState<EditField>(null)
  const [editValues, setEditValues] = useState<Partial<CustomerFormData>>({
    name: customer.name,
    phone: customer.phone || '',
    email: customer.email || ''
  })

  const startEdit = (field: EditField) => {
    setEditingField(field)
    // Reset to current values
    setEditValues({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || ''
    })
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValues({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || ''
    })
  }

  const saveField = async (field: keyof CustomerFormData) => {
    const newValue = editValues[field]?.trim()
    const oldValue = field === 'phone' ? customer.phone || '' : 
                    field === 'email' ? customer.email || '' : 
                    customer.name

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
        variant: 'destructive'
      })
      return
    }

    // Validate email format
    if (field === 'email' && newValue && !newValue.includes('@')) {
      toast({
        title: 'Fehler',
        description: 'Ungültige E-Mail-Adresse.',
        variant: 'destructive'
      })
      return
    }

    try {
      const updateData = {
        [field]: newValue || undefined
      }

      await updateCustomer.mutateAsync({
        customerId: customer.id,
        data: updateData
      })

      setEditingField(null)
      
      toast({
        title: 'Aktualisiert',
        description: `${field === 'name' ? 'Name' : field === 'phone' ? 'Telefon' : 'E-Mail'} wurde aktualisiert.`,
      })

    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Änderung konnte nicht gespeichert werden.',
        variant: 'destructive'
      })
    }
  }

  const toggleStatus = async () => {
    const newStatus = !customer.is_active

    try {
      await updateCustomer.mutateAsync({
        customerId: customer.id,
        data: { is_active: newStatus }
      })
      
      toast({
        title: 'Status aktualisiert',
        description: `Kunde ist jetzt ${newStatus ? 'aktiv' : 'inaktiv'}.`,
      })

    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht geändert werden.',
        variant: 'destructive'
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
    const currentValue = field === 'phone' ? customer.phone || '' : 
                        field === 'email' ? customer.email || '' : 
                        customer.name
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
              value={editValues[field] || ''}
              onChange={(e) => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
              onBlur={() => saveField(field)}
              onKeyDown={(e) => handleKeyDown(e, field)}
              placeholder={placeholder}
              autoFocus
              className="flex-1 min-w-0"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="group cursor-pointer hover:bg-muted rounded p-2 -m-2 transition-colors flex items-center justify-between min-w-0"
                  onClick={() => startEdit(field)}
                >
                  <span className={`flex-1 truncate ${!currentValue ? 'text-muted-foreground italic' : ''}`}>
                    {displayValue}
                  </span>
                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0 ml-2" />
                </div>
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
        {renderEditableField(
          'name',
          'Name',
          <User className="h-4 w-4" />,
          'z.B. Maria Müller'
        )}

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
                      checked={customer.is_active}
                      onCheckedChange={toggleStatus}
                      disabled={updateCustomer.isPending}
                    />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
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
            {new Date(customer.created_at).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}