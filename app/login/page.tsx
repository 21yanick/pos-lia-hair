"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { supabase } from "@/shared/lib/supabase/client"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Echte Supabase-Authentifizierung
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message || "Ungültiger Benutzername oder Passwort")
        return
      }

      if (data.session) {
        setIsSuccess(true)
        // Warte kurz für die Animation
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 600)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 animate-gradient-shift" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,transparent_50%)] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--accent)_0%,transparent_50%)] opacity-20" />
      
      <Card className={`w-full max-w-md shadow-xl bg-card border-border/50 transition-all duration-600 hover:shadow-2xl transform-gpu relative z-10
        ${isSuccess ? 'animate-card-flip scale-95 opacity-0' : 'animate-in fade-in-0 zoom-in-90'}`}>
        <CardHeader className="space-y-1 flex flex-col items-center pb-8">
          <div className="relative w-32 h-32 mb-6 transform transition-transform duration-300 hover:scale-105">
            <Image
              src="/logo_clean.svg"
              alt="Coiffeursalon Logo"
              width={128}
              height={128}
              className="drop-shadow-lg"
              priority
            />
          </div>
          <CardTitle className="text-3xl font-bold text-center">
            Lia Hair by Zilfije Rupp
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground/80 mt-2">
            Melde dich bitte an
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
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                Angemeldet bleiben
              </Label>
            </div>
          </CardContent>

          <CardFooter className="pb-8">
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
                "Anmelden"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

