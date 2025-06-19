"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { supabase } from "@/shared/lib/supabase/client"
import { SmartAppLogo } from "@/shared/components/ui/SmartAppLogo"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  // User data
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Organization data
  const [orgName, setOrgName] = useState("")
  const [orgSlug, setOrgSlug] = useState("")
  const [orgDisplayName, setOrgDisplayName] = useState("")
  const [orgEmail, setOrgEmail] = useState("")
  const [orgPhone, setOrgPhone] = useState("")
  const [orgAddress, setOrgAddress] = useState("")
  const [orgCity, setOrgCity] = useState("")
  const [orgPostalCode, setOrgPostalCode] = useState("")
  
  // Join organization
  const [orgInviteCode, setOrgInviteCode] = useState("")
  
  const [tabValue, setTabValue] = useState("create")

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

  const validateForm = () => {
    if (!name.trim()) {
      setError("Bitte geben Sie Ihren Namen ein")
      return false
    }
    
    if (!email.trim()) {
      setError("Bitte geben Sie Ihre E-Mail-Adresse ein")
      return false
    }
    
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein")
      return false
    }
    
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein")
      return false
    }
    
    if (tabValue === "create") {
      if (!orgName.trim()) {
        setError("Bitte geben Sie den Namen Ihrer Organisation ein")
        return false
      }
      
      if (!orgSlug.trim()) {
        setError("Bitte geben Sie einen URL-Namen für Ihre Organisation ein")
        return false
      }
      
      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(orgSlug)) {
        setError("Der URL-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten")
        return false
      }
    }
    
    if (tabValue === "join" && !orgInviteCode.trim()) {
      setError("Bitte geben Sie den Einladungscode ein")
      return false
    }
    
    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setError("")
    setIsLoading(true)

    try {
      // 1. Create user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            username: email.trim().split('@')[0] // Use email prefix as username
          }
        }
      })

      if (authError) {
        setError(authError.message || "Fehler bei der Registrierung")
        return
      }

      if (!authData.user) {
        setError("Benutzer konnte nicht erstellt werden")
        return
      }

      // 2. Create user record in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: name.trim(),
          username: email.trim().split('@')[0],
          email: email.trim(),
          role: 'admin' // Default role
        })

      if (userError) {
        console.error("Error creating user record:", userError)
        setError("Fehler beim Erstellen des Benutzerprofils")
        return
      }

      if (tabValue === "create") {
        // 3a. Create new organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName.trim(),
            slug: orgSlug.trim(),
            display_name: orgDisplayName.trim() || orgName.trim(),
            email: orgEmail.trim() || email.trim(),
            phone: orgPhone.trim(),
            address: orgAddress.trim(),
            city: orgCity.trim(),
            postal_code: orgPostalCode.trim(),
            settings: {
              tax_rate: 7.7,
              default_currency: 'CHF',
              pdf_show_logo: true,
              pdf_show_company_details: true,
              custom_expense_categories: {}
            }
          })
          .select()
          .single()

        if (orgError) {
          console.error("Error creating organization:", orgError)
          if (orgError.code === '23505') { // Unique constraint violation
            setError("Eine Organisation mit diesem URL-Namen existiert bereits")
          } else {
            setError("Fehler beim Erstellen der Organisation")
          }
          return
        }

        // 4a. Add user as owner to organization
        const { error: memberError } = await supabase
          .from('organization_users')
          .insert({
            organization_id: orgData.id,
            user_id: authData.user.id,
            role: 'owner'
          })

        if (memberError) {
          console.error("Error adding user to organization:", memberError)
          setError("Fehler beim Zuordnen zur Organisation")
          return
        }

        setSuccess(true)
        setTimeout(() => {
          router.push(`/org/${orgData.slug}/dashboard`)
        }, 1500)

      } else {
        // 3b. Join existing organization with invite code
        // For now, we'll implement a simple approach where invite code = organization slug
        // In production, you might want proper invite tokens
        
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('slug', orgInviteCode.trim().toLowerCase())
          .eq('active', true)
          .single()

        if (orgError || !orgData) {
          setError("Ungültiger Einladungscode oder Organisation nicht gefunden")
          return
        }

        // 4b. Add user as staff to organization
        const { error: memberError } = await supabase
          .from('organization_users')
          .insert({
            organization_id: orgData.id,
            user_id: authData.user.id,
            role: 'staff' // Default role for invited users
          })

        if (memberError) {
          console.error("Error adding user to organization:", memberError)
          if (memberError.code === '23505') { // Unique constraint violation
            setError("Sie sind bereits Mitglied dieser Organisation")
          } else {
            setError("Fehler beim Beitreten zur Organisation")
          }
          return
        }

        setSuccess(true)
        setTimeout(() => {
          router.push(`/org/${orgData.slug}/dashboard`)
        }, 1500)
      }

    } catch (err) {
      console.error("Registration error:", err)
      setError("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 animate-gradient-shift" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,transparent_50%)] opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--accent)_0%,transparent_50%)] opacity-30" />
      
      <Card className={`w-full max-w-2xl shadow-xl bg-card border-border/50 transition-all duration-600 hover:shadow-2xl transform-gpu relative z-10
        ${success ? 'animate-card-flip scale-95 opacity-0' : 'animate-in fade-in-0 zoom-in-90'}`}>
        <CardHeader className="space-y-1 flex flex-col items-center pb-6">
          <div className="relative mb-4 transform transition-transform duration-300 hover:scale-105">
            <SmartAppLogo 
              size="lg"
              alt="Coiffeursalon Logo"
              className="drop-shadow-lg w-24 h-24"
              fallback={
                <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg border border-border">
                  <span className="text-xl font-bold text-muted-foreground">Logo</span>
                </div>
              }
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Lia Hair by Zilfije Rupp
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground/80">
            Neues Konto erstellen
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-2">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-sm backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-2">
                Registrierung erfolgreich! Sie werden weitergeleitet...
              </div>
            )}

            {/* User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Persönliche Daten</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground/90">
                    Vollständiger Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 transition-all duration-200"
                    placeholder="Max Mustermann"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                    E-Mail-Adresse *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 transition-all duration-200"
                    placeholder="max@example.ch"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
                    Passwort *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 transition-all duration-200"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/90">
                    Passwort bestätigen *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 transition-all duration-200"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Organization Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Organisation</h3>
              
              <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Neue Organisation erstellen</TabsTrigger>
                  <TabsTrigger value="join">Bestehender Organisation beitreten</TabsTrigger>
                </TabsList>
                
                <TabsContent value="create" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName" className="text-sm font-medium text-foreground/90">
                        Organisationsname *
                      </Label>
                      <Input
                        id="orgName"
                        type="text"
                        value={orgName}
                        onChange={(e) => handleOrgNameChange(e.target.value)}
                        className="h-11 transition-all duration-200"
                        placeholder="Mein Coiffeur-Salon"
                        required={tabValue === "create"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgSlug" className="text-sm font-medium text-foreground/90">
                        URL-Name *
                      </Label>
                      <Input
                        id="orgSlug"
                        type="text"
                        value={orgSlug}
                        onChange={(e) => setOrgSlug(e.target.value)}
                        className="h-11 transition-all duration-200"
                        placeholder="mein-salon"
                        required={tabValue === "create"}
                      />
                      <p className="text-xs text-muted-foreground">
                        Wird für URLs verwendet: /org/{orgSlug || "ihr-salon"}/dashboard
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgDisplayName" className="text-sm font-medium text-foreground/90">
                        Anzeigename
                      </Label>
                      <Input
                        id="orgDisplayName"
                        type="text"
                        value={orgDisplayName}
                        onChange={(e) => setOrgDisplayName(e.target.value)}
                        className="h-11 transition-all duration-200"
                        placeholder="Offizieller Firmenname"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgEmail" className="text-sm font-medium text-foreground/90">
                        Geschäfts-E-Mail
                      </Label>
                      <Input
                        id="orgEmail"
                        type="email"
                        value={orgEmail}
                        onChange={(e) => setOrgEmail(e.target.value)}
                        className="h-11 transition-all duration-200"
                        placeholder="info@salon.ch"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgPhone" className="text-sm font-medium text-foreground/90">
                        Telefon
                      </Label>
                      <Input
                        id="orgPhone"
                        type="tel"
                        value={orgPhone}
                        onChange={(e) => setOrgPhone(e.target.value)}
                        className="h-11 transition-all duration-200"
                        placeholder="+41 XX XXX XX XX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgAddress" className="text-sm font-medium text-foreground/90">
                        Adresse
                      </Label>
                      <Input
                        id="orgAddress"
                        type="text"
                        value={orgAddress}
                        onChange={(e) => setOrgAddress(e.target.value)}
                        className="h-11 transition-all duration-200"
                        placeholder="Musterstrasse 123"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgCity" className="text-sm font-medium text-foreground/90">
                        Ort
                      </Label>
                      <Input
                        id="orgCity"
                        type="text"
                        value={orgCity}
                        onChange={(e) => setOrgCity(e.target.value)}
                        className="h-11 transition-all duration-200"
                        placeholder="Zürich"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgPostalCode" className="text-sm font-medium text-foreground/90">
                        PLZ
                      </Label>
                      <Input
                        id="orgPostalCode"
                        type="text"
                        value={orgPostalCode}
                        onChange={(e) => setOrgPostalCode(e.target.value)}
                        className="h-11 transition-all duration-200"
                        placeholder="8000"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="join" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgInviteCode" className="text-sm font-medium text-foreground/90">
                      Einladungscode *
                    </Label>
                    <Input
                      id="orgInviteCode"
                      type="text"
                      value={orgInviteCode}
                      onChange={(e) => setOrgInviteCode(e.target.value)}
                      className="h-11 transition-all duration-200"
                      placeholder="salon-mustermann"
                      required={tabValue === "join"}
                    />
                    <p className="text-xs text-muted-foreground">
                      Geben Sie den Einladungscode ein, den Sie von Ihrem Administrator erhalten haben
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button 
              type="submit" 
              className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Wird registriert...
                </span>
              ) : (
                "Konto erstellen"
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Haben Sie bereits ein Konto?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Hier anmelden
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}