'use client'

import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { getSupplierById, updateSupplier } from '@/shared/services/supplierServices'
import type { Supplier, SupplierCategory, SupplierFormData } from '@/shared/types/suppliers'
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'

interface SupplierEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (supplier: Supplier) => void
  supplierId: string | null
}

export function SupplierEditDialog({
  open,
  onOpenChange,
  onSuccess,
  supplierId,
}: SupplierEditDialogProps) {
  const { currentOrganization } = useCurrentOrganization()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supplier, setSupplier] = useState<Supplier | null>(null)

  const [formData, setFormData] = useState<SupplierFormData>({
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

  // Load supplier data when dialog opens
  useEffect(() => {
    if (open && supplierId && currentOrganization) {
      loadSupplierData()
    }
  }, [open, supplierId, currentOrganization])

  const loadSupplierData = async () => {
    if (!supplierId || !currentOrganization) return

    setDataLoading(true)
    setError(null)

    try {
      const supplierData = await getSupplierById(supplierId, currentOrganization.id)

      if (!supplierData) {
        throw new Error('Lieferant nicht gefunden')
      }

      setSupplier(supplierData)
      setFormData({
        name: supplierData.name,
        category: supplierData.category,
        contact_email: supplierData.contact_email || '',
        contact_phone: supplierData.contact_phone || '',
        website: supplierData.website || '',
        address_line1: supplierData.address_line1 || '',
        address_line2: supplierData.address_line2 || '',
        city: supplierData.city || '',
        postal_code: supplierData.postal_code || '',
        country: supplierData.country || 'CH',
        iban: supplierData.iban || '',
        vat_number: supplierData.vat_number || '',
        notes: supplierData.notes || '',
        is_active: supplierData.is_active,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Daten')
    } finally {
      setDataLoading(false)
    }
  }

  // Reset form when dialog closes
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
      setSupplier(null)
      setError(null)
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Name ist erforderlich')
      return
    }

    if (!supplierId || !currentOrganization) {
      setError('Lieferant-ID oder Organisation fehlt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updatedSupplier = await updateSupplier(supplierId, formData, currentOrganization.id)
      onSuccess(updatedSupplier)
      handleOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  const isFormDisabled = dataLoading || loading

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lieferant bearbeiten</DialogTitle>
          <DialogDescription>Bearbeiten Sie die Informationen des Lieferanten.</DialogDescription>
        </DialogHeader>

        {dataLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Lade Lieferantendaten...</span>
          </div>
        ) : (
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
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. Migros AG"
                    disabled={isFormDisabled}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: SupplierCategory) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="contact_email">E-Mail</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contact_email: e.target.value }))
                    }
                    placeholder="info@lieferant.ch"
                    disabled={isFormDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefon</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))
                    }
                    placeholder="+41 44 123 45 67"
                    disabled={isFormDisabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.lieferant.ch"
                  disabled={isFormDisabled}
                />
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line1">Adresse</Label>
                  <Input
                    id="address_line1"
                    value={formData.address_line1}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address_line1: e.target.value }))
                    }
                    placeholder="Musterstrasse 123"
                    disabled={isFormDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line2">Adresszusatz</Label>
                  <Input
                    id="address_line2"
                    value={formData.address_line2}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address_line2: e.target.value }))
                    }
                    placeholder="c/o, Stockwerk, etc."
                    disabled={isFormDisabled}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">PLZ</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, postal_code: e.target.value }))
                      }
                      placeholder="8001"
                      disabled={isFormDisabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ort</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="Zürich"
                      disabled={isFormDisabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Land</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, country: e.target.value }))
                      }
                      placeholder="CH"
                      disabled={isFormDisabled}
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={(e) => setFormData((prev) => ({ ...prev, iban: e.target.value }))}
                    placeholder="CH93 0076 2011 6238 5295 7"
                    disabled={isFormDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vat_number">UID-Nummer</Label>
                  <Input
                    id="vat_number"
                    value={formData.vat_number}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, vat_number: e.target.value }))
                    }
                    placeholder="CHE-123.456.789"
                    disabled={isFormDisabled}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <Select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, is_active: value === 'active' }))
                  }
                  disabled={isFormDisabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Zusätzliche Informationen..."
                  rows={2}
                  disabled={isFormDisabled}
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
              <Button type="submit" disabled={isFormDisabled} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aktualisieren
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
