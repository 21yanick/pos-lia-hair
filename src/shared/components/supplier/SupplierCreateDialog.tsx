"use client"

import { useState } from 'react'
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { createSupplier } from '@/shared/services/supplierServices'
import { useOrganization } from '@/modules/organization'
import { SUPPLIER_CATEGORIES } from '@/shared/types/suppliers'
import type { Supplier, SupplierCategory, SupplierFormData } from '@/shared/types/suppliers'

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
  initialName = "",
  userId
}: SupplierCreateDialogProps) {
  const { currentOrganization } = useOrganization()
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
    is_active: true
  })

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
        is_active: true
      })
      setError(null)
    } else if (initialName) {
      setFormData(prev => ({ ...prev, name: initialName }))
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
      <DialogContent className="sm:max-w-[600px]">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Migros AG"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: SupplierCategory) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">E-Mail</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="info@lieferant.ch"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Telefon</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+41 44 123 45 67"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.lieferant.ch"
              />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address_line1">Adresse</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                  placeholder="Musterstrasse 123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address_line2">Adresszusatz</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                  placeholder="c/o, Stockwerk, etc."
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">PLZ</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="8001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Ort</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Zürich"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Land</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="CH"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                  placeholder="CH93 0076 2011 6238 5295 7"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vat_number">UID-Nummer</Label>
                <Input
                  id="vat_number"
                  value={formData.vat_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, vat_number: e.target.value }))}
                  placeholder="CHE-123.456.789"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Zusätzliche Informationen..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}