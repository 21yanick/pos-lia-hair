'use client'

import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'
import { useState } from 'react'
import { ProtectedRoute } from '@/shared/components/auth'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useAuth } from '@/shared/hooks/auth/useAuth'
import { supabase } from '@/shared/lib/supabase/client'
import { EmailService } from '@/shared/services/emailService'

function CreateOrganizationForm() {
  const { user } = useAuth()

  // Form state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Organization data
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [orgDisplayName, setOrgDisplayName] = useState('')
  const [orgEmail, setOrgEmail] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgAddress, setOrgAddress] = useState('')
  const [orgCity, setOrgCity] = useState('')
  const [orgPostalCode, setOrgPostalCode] = useState('')

  // Auto-generate slug from organization name
  const handleOrgNameChange = (value: string) => {
    setOrgName(value)
    const slug = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .trim()
    setOrgSlug(slug)
  }

  // Form validation
  const validateForm = () => {
    if (!orgName.trim()) {
      setError('Bitte geben Sie den Namen Ihrer Organisation ein')
      return false
    }

    if (!orgSlug.trim()) {
      setError('Bitte geben Sie einen URL-Namen für Ihre Organisation ein')
      return false
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(orgSlug)) {
      setError('Der URL-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten')
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) {
      return
    }

    setError('')
    setIsLoading(true)

    try {
      // 1. Create new organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          slug: orgSlug.trim(),
          display_name: orgDisplayName.trim() || orgName.trim(),
          email: orgEmail.trim() || user.email,
          phone: orgPhone.trim(),
          address: orgAddress.trim(),
          city: orgCity.trim(),
          postal_code: orgPostalCode.trim(),
          settings: {
            tax_rate: 7.7,
            default_currency: 'CHF',
            pdf_show_logo: true,
            pdf_show_company_details: true,
            custom_expense_categories: {},
          },
        })
        .select()
        .single()

      if (orgError) {
        console.error('Error creating organization:', orgError)
        if (orgError.code === '23505') {
          setError('Eine Organisation mit diesem URL-Namen existiert bereits')
        } else {
          setError('Fehler beim Erstellen der Organisation')
        }
        return
      }

      // 2. Add user as owner to organization
      const { error: memberError } = await supabase.from('organization_users').insert({
        organization_id: orgData.id,
        user_id: user.id,
        role: 'owner',
      })

      if (memberError) {
        console.error('Error adding user to organization:', memberError)
        setError('Fehler beim Zuordnen zur Organisation')
        return
      }

      // 3. Send welcome email
      try {
        await EmailService.sendWelcomeEmail({
          to: user.email || '',
          userName: user.user_metadata?.name || user.email || '',
          organizationName: orgData.name,
          organizationSlug: orgData.slug,
          isOwner: true,
        })
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail organization creation for email errors
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = `/org/${orgData.slug}/dashboard`
      }, 1000)
    } catch (err) {
      console.error('Organization creation error:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <Link href="/organizations">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Auswahl
            </Button>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Neue Organisation erstellen</h1>
            <p className="text-muted-foreground mt-2">
              Erstelle eine neue Organisation für dein Unternehmen.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Organisation erstellen</CardTitle>
              <CardDescription>
                Erstellen Sie Ihre neue Organisation für das Salon Management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-sm">
                  Organisation erfolgreich erstellt! Sie werden weitergeleitet...
                </div>
              )}

              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Grundinformationen</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-sm font-medium">
                      Organisationsname *
                    </Label>
                    <Input
                      id="orgName"
                      type="text"
                      value={orgName}
                      onChange={(e) => handleOrgNameChange(e.target.value)}
                      className="h-11"
                      placeholder="Mein Friseursalon"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgSlug" className="text-sm font-medium">
                      URL-Name *
                    </Label>
                    <Input
                      id="orgSlug"
                      type="text"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      className="h-11"
                      placeholder="mein-salon"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Wird für URLs verwendet: /org/{orgSlug || 'ihr-salon'}/dashboard
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgDisplayName" className="text-sm font-medium">
                      Anzeigename
                    </Label>
                    <Input
                      id="orgDisplayName"
                      type="text"
                      value={orgDisplayName}
                      onChange={(e) => setOrgDisplayName(e.target.value)}
                      className="h-11"
                      placeholder="Offizieller Firmenname"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgEmail" className="text-sm font-medium">
                      Geschäfts-E-Mail
                    </Label>
                    <Input
                      id="orgEmail"
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      className="h-11"
                      placeholder="info@salon.ch"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Kontaktinformationen</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgPhone" className="text-sm font-medium">
                      Telefon
                    </Label>
                    <Input
                      id="orgPhone"
                      type="tel"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      className="h-11"
                      placeholder="+41 XX XXX XX XX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgAddress" className="text-sm font-medium">
                      Adresse
                    </Label>
                    <Input
                      id="orgAddress"
                      type="text"
                      value={orgAddress}
                      onChange={(e) => setOrgAddress(e.target.value)}
                      className="h-11"
                      placeholder="Musterstrasse 123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgCity" className="text-sm font-medium">
                      Ort
                    </Label>
                    <Input
                      id="orgCity"
                      type="text"
                      value={orgCity}
                      onChange={(e) => setOrgCity(e.target.value)}
                      className="h-11"
                      placeholder="Zürich"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgPostalCode" className="text-sm font-medium">
                      PLZ
                    </Label>
                    <Input
                      id="orgPostalCode"
                      type="text"
                      value={orgPostalCode}
                      onChange={(e) => setOrgPostalCode(e.target.value)}
                      className="h-11"
                      placeholder="8000"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/organizations" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zurück
                  </Button>
                </Link>

                <Button type="submit" className="flex-1 h-11" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Wird erstellt...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Organisation erstellen
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </ProtectedRoute>
  )
}

export default function CreateOrganizationPage() {
  return <CreateOrganizationForm />
}
