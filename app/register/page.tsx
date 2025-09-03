'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import type React from 'react'
import { Suspense, useCallback, useEffect, useId, useState } from 'react'
import { PublicRoute } from '@/shared/components/auth'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { supabase } from '@/shared/lib/supabase/client'
import { sendWelcomeEmail } from '@/shared/services/emailService'
import { acceptInvitation } from '@/shared/services/invitationService'

interface InvitationInfo {
  organizationName: string
  organizationSlug: string
  role: 'staff' | 'admin' | 'owner'
  invitedByName: string
  email: string
}

function RegisterForm() {
  const { resolvedTheme } = useTheme()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')

  // Theme-aware logo selection
  const logoSrc =
    resolvedTheme === 'dark' ? '/logo/Ledgr_Logo_dark.png' : '/logo/Ledgr_Logo_light.png'

  // Generate unique IDs for form fields
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null)
  const [isValidatingInvite, setIsValidatingInvite] = useState(false)

  // User data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Validate invitation token function
  const validateInvitationToken = useCallback(async (token: string) => {
    setIsValidatingInvite(true)
    setError('')

    try {
      const response = await fetch('/api/invitations/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (data.valid) {
        setInvitationInfo(data.invitation)
        setEmail(data.invitation.email) // Pre-fill email from invitation
      } else {
        setError(`Ungültige Einladung: ${data.error}`)
      }
    } catch (err) {
      console.error('Invitation validation error:', err)
      setError('Fehler beim Validieren der Einladung')
    } finally {
      setIsValidatingInvite(false)
    }
  }, [])

  // Validate invitation token on page load
  useEffect(() => {
    if (inviteToken) {
      validateInvitationToken(inviteToken)
    }
  }, [inviteToken, validateInvitationToken])

  const validateForm = () => {
    if (!name.trim()) {
      setError('Bitte geben Sie Ihren Namen ein')
      return false
    }

    if (!email.trim()) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein')
      return false
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein')
      return false
    }

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein')
      return false
    }

    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setError('')
    setIsLoading(true)

    try {
      // 1. Create user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            username: email.trim().split('@')[0],
          },
        },
      })

      if (authError) {
        setError(authError.message || 'Fehler bei der Registrierung')
        return
      }

      if (!authData.user) {
        setError('Benutzer konnte nicht erstellt werden')
        return
      }

      // 2. User record is automatically created by the handle_new_user trigger

      if (inviteToken) {
        // 3. Accept invitation using JWT token
        try {
          const result = await acceptInvitation(inviteToken, authData.user.id)

          // 4. Send welcome email for new team member
          try {
            await sendWelcomeEmail({
              to: email.trim(),
              userName: name.trim(),
              organizationName: result.organization.name,
              organizationSlug: result.organization.slug,
              isOwner: false,
            })
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError)
            // Don't fail registration for email errors
          }

          setSuccess(true)
          setTimeout(() => {
            window.location.href = `/org/${result.organization.slug}/dashboard`
          }, 1000)
        } catch (inviteError) {
          console.error('Error accepting invitation:', inviteError)
          setError(
            inviteError instanceof Error
              ? inviteError.message
              : 'Fehler beim Annehmen der Einladung'
          )
          return
        }
      } else {
        // 3. New user without invitation - redirect to organizations page
        setSuccess(true)
        setTimeout(() => {
          window.location.href = `/organizations`
        }, 1000)
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
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

      <Card
        className={`w-full max-w-2xl shadow-xl bg-card border-border/50 transition-all duration-600 hover:shadow-2xl transform-gpu relative z-10
        ${success ? 'animate-card-flip scale-95 opacity-0' : 'animate-in fade-in-0 zoom-in-90'}`}
      >
        <CardHeader className="space-y-1 flex flex-col items-center pb-6">
          <div className="relative mb-4 transform transition-transform duration-300 hover:scale-105">
            <Image
              src={logoSrc}
              alt="Ledger Logo"
              width={96}
              height={96}
              className="drop-shadow-lg w-24 h-24 object-contain rounded-3xl"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Ledgr - Dein Business in einer App
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground/80">
            {invitationInfo
              ? `Einladung zu ${invitationInfo.organizationName}`
              : 'Neues Benutzerkonto erstellen'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-6">
            {isValidatingInvite && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-lg text-sm backdrop-blur-sm animate-pulse">
                Einladung wird validiert...
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-2">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-sm backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-2">
                {invitationInfo
                  ? 'Registrierung erfolgreich! Sie werden weitergeleitet...'
                  : 'Benutzerkonto erstellt! Sie werden zur Organisations-Auswahl weitergeleitet...'}
              </div>
            )}

            {invitationInfo && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                  Einladungsdetails
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  <strong>{invitationInfo.invitedByName}</strong> hat Sie zu{' '}
                  <strong>{invitationInfo.organizationName}</strong> als{' '}
                  <strong>
                    {invitationInfo.role === 'staff'
                      ? 'Mitarbeiter'
                      : invitationInfo.role === 'admin'
                        ? 'Administrator'
                        : 'Inhaber'}
                  </strong>{' '}
                  eingeladen.
                </p>
              </div>
            )}

            {/* User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Persönliche Daten</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={nameId} className="text-sm font-medium text-foreground/90">
                    Vollständiger Name *
                  </Label>
                  <Input
                    id={nameId}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 transition-all duration-200"
                    placeholder="Max Mustermann"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={emailId} className="text-sm font-medium text-foreground/90">
                    E-Mail-Adresse *
                  </Label>
                  <Input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 transition-all duration-200"
                    placeholder="max@example.ch"
                    autoComplete="email"
                    disabled={!!invitationInfo} // Disable if email comes from invitation
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={passwordId} className="text-sm font-medium text-foreground/90">
                    Passwort *
                  </Label>
                  <Input
                    id={passwordId}
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
                  <Label
                    htmlFor={confirmPasswordId}
                    className="text-sm font-medium text-foreground/90"
                  >
                    Passwort bestätigen *
                  </Label>
                  <Input
                    id={confirmPasswordId}
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button
              type="submit"
              className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              disabled={isLoading || isValidatingInvite}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Wird registriert...
                </span>
              ) : invitationInfo ? (
                'Einladung annehmen'
              ) : (
                'Benutzerkonto erstellen'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Haben Sie bereits ein Konto?{' '}
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

export default function RegisterPage() {
  return (
    <PublicRoute>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </PublicRoute>
  )
}
