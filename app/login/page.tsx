'use client'

import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'
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
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { SmartAppLogo } from '@/shared/components/ui/SmartAppLogo'
import { supabase } from '@/shared/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Echte Supabase-Authentifizierung
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message || 'Ungültiger Benutzername oder Passwort')
        return
      }

      if (data.session) {
        setIsSuccess(true)

        // Simple redirect - Auth Guards will handle the rest
        router.push('/organizations')
      } else {
        setError('Login fehlgeschlagen - keine Session')
      }
    } catch (err) {
      console.error('❌ LOGIN EXCEPTION:', err)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 animate-gradient-shift" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,transparent_50%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--accent)_0%,transparent_50%)] opacity-30" />

        <Card
          className={`w-full max-w-md shadow-xl bg-card border-border/50 transition-all duration-600 hover:shadow-2xl transform-gpu relative z-10
          ${isSuccess ? 'animate-card-flip scale-95 opacity-0' : 'animate-in fade-in-0 zoom-in-90'}`}
        >
          <CardHeader className="space-y-1 flex flex-col items-center pb-8">
            <div className="relative mb-6 transform transition-transform duration-300 hover:scale-105">
              <SmartAppLogo
                size="xl"
                alt="Nexus Logo"
                className="drop-shadow-lg w-32 h-32"
                fallback={
                  <div className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    {/* Horizontale Verbindungslinie */}
                    <div className="absolute w-16 h-0.5 bg-gradient-to-r from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-300"></div>
                    {/* Vertikale Verbindungslinie */}
                    <div className="absolute h-16 w-0.5 bg-gradient-to-b from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-300"></div>
                    {/* Zentrale Nexus Node */}
                    <div className="relative z-10 w-3 h-3 bg-blue-500 rounded-full shadow-lg ring-2 ring-blue-200 dark:ring-blue-400"></div>
                    {/* Nexus Text */}
                    <div className="absolute bottom-3 text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                      NEXUS
                    </div>
                  </div>
                }
              />
            </div>
            <CardTitle className="text-3xl font-bold text-center">Nexus</CardTitle>
            <CardDescription className="text-center text-muted-foreground/80 mt-2">
              Business Connection Platform
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                  E-Mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 transition-all duration-200"
                  placeholder="deine@email.ch"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 transition-all duration-200"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  Angemeldet bleiben
                </Label>
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
                    Wird angemeldet...
                  </span>
                ) : (
                  'Anmelden'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Noch kein Konto?{' '}
                <a href="/register" className="text-primary hover:underline font-medium">
                  Hier registrieren
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PublicRoute>
  )
}
