"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useSmartRedirect } from '@/shared/hooks/core/useSmartRedirect'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Loader2, Building2, ArrowRight } from 'lucide-react'

export function SmartRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isRedirecting, fallbackReason, targetUrl } = useSmartRedirect()
  
  // Preserve quick parameter when redirecting to organization selection
  const quickParam = searchParams.get('quick')
  const organizationUrl = quickParam 
    ? `/organizations?returnTo=${quickParam}` 
    : '/organizations'

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
                <span className="text-sm text-muted-foreground">
                  Weiterleitung zu: {targetUrl}
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Show fallback UI if redirect failed
  if (fallbackReason) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>LIA HAIR</CardTitle>
            <CardDescription>
              {fallbackReason === 'no-organization' && 
                "Wählen Sie Ihre Organisation zum Fortfahren"
              }
              {fallbackReason === 'invalid-quick' && 
                "Ungültiger Schnellzugriff - wählen Sie Ihre Organisation"
              }
              {fallbackReason === 'no-params' && 
                "Wählen Sie Ihre Organisation"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push(organizationUrl)}
              className="w-full"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Zur Organisation
            </Button>
          </CardContent>
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