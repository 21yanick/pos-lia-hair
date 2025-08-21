'use client'

import { Loader2, Plus } from 'lucide-react'
import { useId, useState } from 'react'
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
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useToast } from '@/shared/hooks/core/useToast'
import type { CustomerFormData } from '@/shared/services/customerService'
import type { CustomerRow } from '@/types/database'
import { useCustomerActions } from '../hooks/useCustomerActions'

interface CustomerCreateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (customer: CustomerRow) => void
}

export function CustomerCreateDialog({ isOpen, onClose, onSuccess }: CustomerCreateDialogProps) {
  const nameId = useId()
  const phoneId = useId()
  const emailId = useId()

  const { toast } = useToast()
  const { currentOrganization } = useCurrentOrganization()
  const { createCustomer } = useCustomerActions(currentOrganization?.id || '')

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
  })

  const [errors, setErrors] = useState<Partial<CustomerFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich'
    }

    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Ungültige E-Mail-Adresse'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const result = await createCustomer.mutateAsync({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
      })

      toast({
        title: 'Kunde erstellt',
        description: `${result.name} wurde erfolgreich erstellt.`,
      })

      onSuccess?.(result)
      handleClose()
    } catch (_error) {
      toast({
        title: 'Fehler',
        description: 'Kunde konnte nicht erstellt werden.',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    setFormData({ name: '', phone: '', email: '' })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Neuen Kunden erstellen
          </DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Kunden. Name ist erforderlich, Telefon und E-Mail sind
            optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor={nameId}>Name *</Label>
            <Input
              id={nameId}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="z.B. Maria Müller"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor={phoneId}>Telefon</Label>
            <Input
              id={phoneId}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="z.B. +41 79 123 45 67"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor={emailId}>E-Mail</Label>
            <Input
              id={emailId}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="z.B. maria@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createCustomer.isPending}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={createCustomer.isPending || !formData.name.trim()}>
              {createCustomer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kunde erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
