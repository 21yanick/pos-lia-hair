'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Separator } from '@/shared/components/ui/separator'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { useBusinessSettings } from '@/shared/hooks/business/useBusinessSettings'
import { DEFAULT_BUSINESS_SETTINGS } from '@/shared/types/businessSettings'
import type { BusinessSettingsFormData } from '@/shared/types/businessSettings'

export function CompanyInfoForm() {
  const { settings, updateSettings, saving } = useBusinessSettings()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<BusinessSettingsFormData>({
    company_name: '',
    company_tagline: '',
    company_address: '',
    company_postal_code: '',
    company_city: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    company_uid: '',
    default_currency: DEFAULT_BUSINESS_SETTINGS.default_currency!,
    tax_rate: DEFAULT_BUSINESS_SETTINGS.tax_rate!,
    pdf_show_logo: DEFAULT_BUSINESS_SETTINGS.pdf_show_logo!,
    pdf_show_company_details: DEFAULT_BUSINESS_SETTINGS.pdf_show_company_details!,
  })

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        company_tagline: settings.company_tagline || '',
        company_address: settings.company_address || '',
        company_postal_code: settings.company_postal_code || '',
        company_city: settings.company_city || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        company_website: settings.company_website || '',
        company_uid: settings.company_uid || '',
        default_currency: settings.default_currency,
        tax_rate: settings.tax_rate,
        pdf_show_logo: settings.pdf_show_logo,
        pdf_show_company_details: settings.pdf_show_company_details,
      })
    }
  }, [settings])

  const handleInputChange = (field: keyof BusinessSettingsFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!formData.company_name.trim()) {
      setError('Firmenname ist erforderlich')
      return
    }

    try {
      await updateSettings(formData)
    } catch (error) {
      setError('Fehler beim Speichern der Einstellungen')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Grunddaten */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Grunddaten</h3>
          <p className="text-sm text-muted-foreground">
            Hauptinformationen über Ihr Unternehmen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Firmenname *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Lia Hair by Zilfije Rupp"
              className="bg-background border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_tagline">Slogan</Label>
            <Input
              id="company_tagline"
              value={formData.company_tagline}
              onChange={(e) => handleInputChange('company_tagline', e.target.value)}
              placeholder="Ihr Friseursalon"
              className="bg-background border-input"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Adresse */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Adresse</h3>
          <p className="text-sm text-muted-foreground">
            Geschäftsadresse für Belege und Rechnungen
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_address">Straße & Hausnummer</Label>
            <Input
              id="company_address"
              value={formData.company_address}
              onChange={(e) => handleInputChange('company_address', e.target.value)}
              placeholder="Römerstrasse 6"
              className="bg-background border-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_postal_code">PLZ</Label>
              <Input
                id="company_postal_code"
                value={formData.company_postal_code}
                onChange={(e) => handleInputChange('company_postal_code', e.target.value)}
                placeholder="4512"
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_city">Ort</Label>
              <Input
                id="company_city"
                value={formData.company_city}
                onChange={(e) => handleInputChange('company_city', e.target.value)}
                placeholder="Bellach"
                className="bg-background border-input"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Kontakt */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Kontaktdaten</h3>
          <p className="text-sm text-muted-foreground">
            Telefon, E-Mail und Website
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_phone">Telefon</Label>
            <Input
              id="company_phone"
              value={formData.company_phone}
              onChange={(e) => handleInputChange('company_phone', e.target.value)}
              placeholder="+41 32 123 45 67"
              className="bg-background border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_email">E-Mail</Label>
            <Input
              id="company_email"
              type="email"
              value={formData.company_email}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              placeholder="hello@lia-hair.ch"
              className="bg-background border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_website">Website</Label>
            <Input
              id="company_website"
              type="url"
              value={formData.company_website}
              onChange={(e) => handleInputChange('company_website', e.target.value)}
              placeholder="https://lia-hair.ch"
              className="bg-background border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_uid">UID-Nummer</Label>
            <Input
              id="company_uid"
              value={formData.company_uid}
              onChange={(e) => handleInputChange('company_uid', e.target.value)}
              placeholder="CHE-123.456.789"
              className="bg-background border-input"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <Button 
          type="submit" 
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? 'Speichere...' : 'Einstellungen speichern'}
        </Button>
      </div>
    </form>
  )
}