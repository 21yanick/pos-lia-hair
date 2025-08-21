'use client'

import { AlertCircle, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'
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
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { createSupplier } from '@/shared/services/supplierServices'
import type { Supplier, SupplierCategory, SupplierFormData } from '@/shared/types/suppliers'
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'

interface SupplierCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (supplier: Supplier) => void
  initialName?: string
  userId: string
}

export function SupplierCreateDialog({
  open,
  onOpenChange,
  onSuccess,
  initialName = '',
  userId,
}: SupplierCreateDialogProps) {
  const { currentOrganization } = useCurrentOrganization()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<SupplierFormData>({
    name: initialName,
    category: 'other',
    contact_email: '',
    contact_phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'CH',
    iban: '',
    vat_number: '',
    notes: '',
    is_active: true,
  })

  // 🆔 Generate unique IDs for accessibility compliance
  const nameId = useId()
  const categoryId = useId()
  const contactEmailId = useId()
  const contactPhoneId = useId()
  const websiteId = useId()
  const addressLine1Id = useId()
  const addressLine2Id = useId()
  const cityId = useId()
  const postalCodeId = useId()
  const countryId = useId()
  const ibanId = useId()
  const vatNumberId = useId()
  const _isActiveId = useId()
  const notesId = useId()

  // Reset form when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        name: '',
        category: 'other',
        contact_email: '',
        contact_phone: '',
        website: '',
        address_line1: '',
        address_line2: '',
        city: '',
        postal_code: '',
        country: 'CH',
        iban: '',
        vat_number: '',
        notes: '',
        is_active: true,
      })
      setError(null)
    } else if (initialName) {
      setFormData((prev) => ({ ...prev, name: initialName }))
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Name ist erforderlich')
      return
    }

    if (!currentOrganization) {
      setError('Keine Organisation ausgewählt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supplier = await createSupplier(formData, userId, currentOrganization.id)
      onSuccess(supplier)
      handleOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Lieferanten erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Lieferanten für Ihre Ausgaben.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Required Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={nameId}>Name *</Label>
                <Input
                  id={nameId}
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Migros AG"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={categoryId}>Kategorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: SupplierCategory) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger id={categoryId}>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUPPLIER_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={contactEmailId}>E-Mail</Label>
                <Input
                  id={contactEmailId}
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contact_email: e.target.value }))
                  }
                  placeholder="info@lieferant.ch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={contactPhoneId}>Telefon</Label>
                <Input
                  id={contactPhoneId}
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))
                  }
                  placeholder="+41 44 123 45 67"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={websiteId}>Website</Label>
              <Input
                id={websiteId}
                type="url"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.lieferant.ch"
              />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={addressLine1Id}>Adresse</Label>
                <Input
                  id={addressLine1Id}
                  value={formData.address_line1}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address_line1: e.target.value }))
                  }
                  placeholder="Musterstrasse 123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={addressLine2Id}>Adresszusatz</Label>
                <Input
                  id={addressLine2Id}
                  value={formData.address_line2}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address_line2: e.target.value }))
                  }
                  placeholder="c/o, Stockwerk, etc."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={postalCodeId}>PLZ</Label>
                  <Input
                    id={postalCodeId}
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, postal_code: e.target.value }))
                    }
                    placeholder="8001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={cityId}>Ort</Label>
                  <Input
                    id={cityId}
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Zürich"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={countryId}>Land</Label>
                  <Input
                    id={countryId}
                    value={formData.country}
                    onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    placeholder="CH"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={ibanId}>IBAN</Label>
                <Input
                  id={ibanId}
                  value={formData.iban}
                  onChange={(e) => setFormData((prev) => ({ ...prev, iban: e.target.value }))}
                  placeholder="CH93 0076 2011 6238 5295 7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={vatNumberId}>UID-Nummer</Label>
                <Input
                  id={vatNumberId}
                  value={formData.vat_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vat_number: e.target.value }))}
                  placeholder="CHE-123.456.789"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor={notesId}>Notizen</Label>
              <Textarea
                id={notesId}
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Zusätzliche Informationen..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
