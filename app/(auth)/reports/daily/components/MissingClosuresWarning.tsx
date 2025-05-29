"use client"

import React, { useState, useEffect } from "react"
import { AlertTriangle, X, Calendar, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDailySummaries } from "@/lib/hooks/business/useDailySummaries"

type MissingClosure = {
  missing_date: string
  sales_count: number
  sales_total: number
  has_draft_summary: boolean
  days_ago: number
}

type MissingClosuresWarningProps = {
  onBulkClosure?: (dates: string[]) => void
  className?: string
}

export function MissingClosuresWarning({ onBulkClosure, className }: MissingClosuresWarningProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [missingClosures, setMissingClosures] = useState<MissingClosure[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { getRecentMissingClosures } = useDailySummaries()

  // Fehlende Abschlüsse beim Mount laden
  useEffect(() => {
    const loadMissingClosures = async () => {
      setIsLoading(true)
      try {
        const result = await (getRecentMissingClosures as any)()
        if (result.success) {
          setMissingClosures(result.missingClosures || [])
        }
      } catch (error) {
        console.error('Fehler beim Laden fehlender Abschlüsse:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMissingClosures()
  }, [])

  // Nicht anzeigen wenn keine fehlenden Abschlüsse oder ausgeblendet
  if (!isVisible || missingClosures.length === 0) {
    return null
  }

  const handleBulkClosure = () => {
    if (onBulkClosure) {
      const dates = missingClosures.map(closure => closure.missing_date)
      onBulkClosure(dates)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('de-CH', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    })
  }

  const totalMissingSales = missingClosures.reduce((sum, closure) => sum + closure.sales_total, 0)

  return (
    <Alert className={`border-warning/20 bg-warning/10 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-warning" />
      <div className="flex justify-between items-start w-full">
        <div className="flex-1">
          <AlertDescription className="text-warning-foreground">
            <div className="font-medium mb-2">
              ⚠️ {missingClosures.length} offene Tagesabschlüsse gefunden
            </div>
            
            <div className="mb-3 text-sm">
              Gesamtumsatz der offenen Tage: <span className="font-semibold">CHF {totalMissingSales.toFixed(2)}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {missingClosures.slice(0, 5).map((closure) => (
                <Badge 
                  key={closure.missing_date} 
                  variant={closure.has_draft_summary ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(closure.missing_date)}
                  <span className="ml-1 text-xs">CHF</span>
                  {closure.sales_total.toFixed(0)}
                </Badge>
              ))}
              {missingClosures.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{missingClosures.length - 5} weitere
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              {onBulkClosure && (
                <Button 
                  onClick={handleBulkClosure}
                  size="sm"
                  variant="outline"
                  className="text-warning hover:text-warning border-warning/30 hover:bg-warning/10"
                >
                  Alle schließen
                </Button>
              )}
              <Button 
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="text-warning hover:text-warning hover:bg-warning/10"
              >
                Ausblenden
              </Button>
            </div>
          </AlertDescription>
        </div>
        
        <Button 
          onClick={() => setIsVisible(false)}
          size="sm"
          variant="ghost"
          className="ml-2 h-6 w-6 p-0 text-warning hover:bg-warning/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  )
}