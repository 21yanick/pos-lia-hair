"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { 
  RefreshCw, 
  TrendingUp,
  Building2,
  Wallet,
  User,
  AlertCircle
} from "lucide-react"
import { getProviderSummaries } from '../../services/bankingApi'
import type { ProviderSummaryDashboard, ProviderSummary } from '../../services/matchingTypes'

interface ProviderSummaryDashboardProps {
  onProviderSelect?: (providerSummary: ProviderSummary) => void
  className?: string
}

export function ProviderSummaryDashboard({ onProviderSelect, className }: ProviderSummaryDashboardProps) {
  const [dashboard, setDashboard] = useState<ProviderSummaryDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummaries = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: apiError } = await getProviderSummaries()
      
      if (apiError || !data) {
        throw new Error(apiError?.message || 'Fehler beim Laden der Provider-Summaries')
      }
      
      setDashboard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSummaries()
  }, [])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'twint':
        return '🟦'
      case 'sumup':
        return '🟧'
      case 'cash':
        return '💰'
      case 'owner':
        return '🏢'
      default:
        return '📄'
    }
  }

  const getProviderBadgeVariant = (provider: string) => {
    switch (provider) {
      case 'twint':
        return 'default' as const
      case 'sumup':
        return 'secondary' as const
      case 'cash':
        return 'outline' as const
      case 'owner':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Provider Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Provider Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600 mb-3">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button onClick={loadSummaries} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!dashboard || dashboard.summaries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Provider Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Keine verfügbaren Items für Matching</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Provider Übersicht
          </CardTitle>
          <Button 
            onClick={loadSummaries} 
            variant="ghost" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Grand Total */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Gesamt verfügbar</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-900">
                {formatAmount(dashboard.grandTotal)}
              </div>
              <div className="text-sm text-blue-600">
                {dashboard.summaries.reduce((sum, s) => sum + s.itemCount, 0)} Items
              </div>
            </div>
          </div>
        </div>

        {/* Provider Summaries */}
        {dashboard.summaries.map((summary) => (
          <div
            key={summary.provider}
            className={`border rounded-lg p-4 transition-all duration-200 ${
              onProviderSelect 
                ? 'cursor-pointer hover:bg-gray-50 hover:border-gray-300' 
                : ''
            }`}
            onClick={() => onProviderSelect?.(summary)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{summary.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{summary.displayName}</span>
                    <Badge variant={getProviderBadgeVariant(summary.provider)}>
                      {summary.itemCount} Items
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {summary.provider === 'twint' && 'TWINT Transaktionen'}
                    {summary.provider === 'sumup' && 'SumUp Transaktionen'}
                    {summary.provider === 'cash' && 'Cash Bewegungen'}
                    {summary.provider === 'owner' && 'Inhaber Transaktionen'}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {formatAmount(summary.totalAmount)}
                </div>
                <div className="text-sm text-gray-500">
                  Ø {formatAmount(summary.totalAmount / summary.itemCount)}
                </div>
              </div>
            </div>

            {/* Click hint */}
            {onProviderSelect && (
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Klicken zum Filtern nach {summary.displayName}
              </div>
            )}
          </div>
        ))}

        {/* Last Updated */}
        <div className="text-xs text-gray-400 text-center pt-2">
          Zuletzt aktualisiert: {new Date(dashboard.lastUpdated).toLocaleTimeString('de-CH')}
        </div>
      </CardContent>
    </Card>
  )
}