'use client'

import { AlertCircle, ArrowLeft, Loader2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useCustomerDetail } from '../hooks/useCustomerDetail'
import { CustomerInfoCard } from './CustomerInfoCard'
import { CustomerNotesPanel } from './CustomerNotesPanel'
import { CustomerSalesHistory } from './CustomerSalesHistory'

interface CustomerDetailPageProps {
  customerId: string
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const router = useRouter()
  const { currentOrganization } = useCurrentOrganization()

  const {
    data: customer,
    isLoading,
    error,
  } = useCustomerDetail(customerId, currentOrganization?.id || '')

  const handleBack = () => {
    if (currentOrganization) {
      router.push(`/org/${currentOrganization.slug}/customers`)
    } else {
      router.back()
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xl font-bold">Lade Kunde...</span>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 4 }, (_, i) => i + 1).map((row) => (
                  <div key={`skeleton-customer-detail-${row}`} className="flex items-center gap-4">
                    <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-48 h-4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-32 h-6 bg-muted rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 2 }, (_, i) => i + 1).map((row) => (
                  <div
                    key={`skeleton-customer-activity-${row}`}
                    className="w-full h-20 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold">Kunde nicht gefunden</h1>
        </div>

        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Kunde konnte nicht geladen werden</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Der Kunde existiert möglicherweise nicht oder Sie haben keine Berechtigung, ihn
                  anzuzeigen.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleBack}>Zurück zur Kundenliste</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Button variant="ghost" size="sm" onClick={handleBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Zurück</span>
        </Button>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
          <h1 className="text-xl sm:text-3xl font-bold truncate">{customer.name}</h1>
        </div>
      </div>

      {/* Customer Info Section */}
      <CustomerInfoCard customer={customer} />

      {/* Notes Section */}
      <CustomerNotesPanel customer={customer} />

      {/* Sales History Section */}
      <CustomerSalesHistory customerId={customer.id} />
    </div>
  )
}
