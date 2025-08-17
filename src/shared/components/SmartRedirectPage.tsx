'use client'

import { Loader2 } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useSmartRedirect } from '@/shared/hooks/core/useSmartRedirect'

export function SmartRedirectPage() {
  const { isRedirecting, targetUrl } = useSmartRedirect()

  // Show loading during redirect
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <CardTitle>Leite weiter...</CardTitle>
            <CardDescription>
              {targetUrl && (
                <span className="text-sm text-muted-foreground">Weiterleitung zu: {targetUrl}</span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Default fallback - shouldn't normally reach here
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>LIA HAIR</CardTitle>
          <CardDescription>Lade...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
