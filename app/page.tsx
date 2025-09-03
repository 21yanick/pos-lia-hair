import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { SmartRedirectPage } from '@/shared/components/SmartRedirectPage'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'

/**
 * 🏠 ROOT LANDING PAGE - SMART PWA REDIRECT
 *
 * Intelligent redirect system for PWA shortcuts:
 * - ?quick=appointments → /org/{slug}/appointments
 * - ?quick=pos → /org/{slug}/pos
 * - No params → /org/{slug}/dashboard (last org)
 * - Fallback → /organizations
 */

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <CardTitle>Ledgr.</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SmartRedirectPage />
    </Suspense>
  )
}
