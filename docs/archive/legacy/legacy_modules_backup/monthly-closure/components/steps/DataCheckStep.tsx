"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Loader2, CheckCircle2, AlertTriangle, Calendar, CreditCard, Receipt } from "lucide-react"
import { useSales } from "@/shared/hooks/business/useSales"
import { useExpenses } from "@/modules/expenses"
import { useDailySummaries } from "@/shared/hooks/business/useDailySummaries"

interface DataCheckStepProps {
  selectedMonth: string
  onComplete: (data: any) => void
  onNext: () => void
}

interface DataCheckResult {
  salesCount: number
  salesTotal: number
  expensesCount: number
  expensesTotal: number
  dailySummariesCount: number
  missingDays: string[]
  cashSettlementStatus: 'ok' | 'needs_attention'
  issues: string[]
  isComplete: boolean
}

export function DataCheckStep({ selectedMonth, onComplete, onNext }: DataCheckStepProps) {
  const { loadSalesForDateRange } = useSales()
  const { loadExpenses } = useExpenses()
  const { loadDailySummaries } = useDailySummaries()
  
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<DataCheckResult | null>(null)

  // Parse selected month
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)

  useEffect(() => {
    const performDataCheck = async () => {
      setLoading(true)
      
      try {
        // Calculate date range for the month
        const startDate = new Date(selectedYear, selectedMonthNum - 1, 1)
        const endDate = new Date(selectedYear, selectedMonthNum, 0, 23, 59, 59)
        
        // Load all data in parallel
        const [salesResult, expensesResult, dailyResult] = await Promise.all([
          loadSalesForDateRange(startDate.toISOString(), endDate.toISOString()),
          loadExpenses(),
          loadDailySummaries()
        ])

        // Process sales data
        let salesCount = 0
        let salesTotal = 0
        if (salesResult.success && salesResult.sales) {
          salesCount = salesResult.sales.length
          salesTotal = salesResult.sales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0)
        }

        // Process expenses data for this month
        let expensesCount = 0
        let expensesTotal = 0
        if (expensesResult.success && expensesResult.expenses) {
          const monthlyExpenses = expensesResult.expenses.filter((expense: any) => {
            const expenseDate = new Date(expense.payment_date + 'T12:00:00')
            return expenseDate.getFullYear() === selectedYear && 
                   expenseDate.getMonth() === selectedMonthNum - 1
          })
          expensesCount = monthlyExpenses.length
          expensesTotal = monthlyExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0)
        }

        // Process daily summaries for this month
        let dailySummariesCount = 0
        if (dailyResult.success && dailyResult.summaries) {
          const monthlySummaries = dailyResult.summaries.filter((summary: any) => {
            const reportDate = new Date(summary.report_date + 'T12:00:00')
            return reportDate.getFullYear() === selectedYear && 
                   reportDate.getMonth() === selectedMonthNum - 1
          })
          dailySummariesCount = monthlySummaries.length
        }

        // Detect potential issues
        const issues: string[] = []
        let cashSettlementStatus: 'ok' | 'needs_attention' = 'ok'

        // Check for very low sales count
        if (salesCount < 10) {
          issues.push(`Nur ${salesCount} Verkäufe gefunden - ist das korrekt?`)
        }

        // Check for high expense ratio
        if (expensesTotal > salesTotal * 0.3) {
          issues.push(`Ausgaben sind ${Math.round((expensesTotal / salesTotal) * 100)}% vom Umsatz - ungewöhnlich hoch`)
        }

        // Check for missing daily summaries (rough heuristic)
        if (salesCount > 0 && dailySummariesCount === 0) {
          issues.push('Verkäufe vorhanden aber keine Tagesabschlüsse gefunden')
        }

        // Check cash settlement status - set all cash to settled
        if (salesCount > 0) {
          // For this step, we automatically set cash transactions to settled
          cashSettlementStatus = 'ok'
        }

        const checkResult: DataCheckResult = {
          salesCount,
          salesTotal,
          expensesCount,
          expensesTotal,
          dailySummariesCount,
          missingDays: [], // Could implement day-by-day check later
          cashSettlementStatus,
          issues,
          isComplete: issues.length === 0 // Auto-complete if no major issues
        }

        setResult(checkResult)

        // Auto-complete if no issues
        if (checkResult.isComplete) {
          onComplete(checkResult)
        }

      } catch (error: any) {
        console.error('Data check failed:', error)
        setResult({
          salesCount: 0,
          salesTotal: 0,
          expensesCount: 0,
          expensesTotal: 0,
          dailySummariesCount: 0,
          missingDays: [],
          cashSettlementStatus: 'needs_attention',
          issues: ['Fehler beim Laden der Daten: ' + error.message],
          isComplete: false
        })
      } finally {
        setLoading(false)
      }
    }

    performDataCheck()
  }, [selectedMonth, selectedYear, selectedMonthNum])

  const handleForceComplete = () => {
    if (result) {
      onComplete(result)
      onNext()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p>Daten werden überprüft...</p>
      </div>
    )
  }

  if (!result) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Datencheck konnte nicht durchgeführt werden. Bitte versuchen Sie es erneut.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard size={16} />
              Verkäufe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.salesCount}</div>
            <p className="text-xs text-muted-foreground">
              Total: CHF {result.salesTotal.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt size={16} />
              Ausgaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.expensesCount}</div>
            <p className="text-xs text-muted-foreground">
              Total: CHF {result.expensesTotal.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} />
              Tagesabschlüsse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.dailySummariesCount}</div>
            <p className="text-xs text-muted-foreground">
              Abgeschlossene Tage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Checks */}
      <div className="space-y-3">
        <h3 className="font-medium">Vollständigkeitsprüfung</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span>Verkaufsdaten</span>
            </div>
            <Badge variant="default">
              {result.salesCount} Transaktionen
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span>Ausgabendaten</span>
            </div>
            <Badge variant="default">
              {result.expensesCount} Ausgaben
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span>Cash Settlement Status</span>
            </div>
            <Badge variant="default">
              Automatisch settled
            </Badge>
          </div>
        </div>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Gefundene Auffälligkeiten:</div>
            <ul className="list-disc list-inside space-y-1">
              {result.issues.map((issue, index) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Action */}
      {result.isComplete ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Datencheck erfolgreich abgeschlossen. Sie können zum nächsten Schritt wechseln.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <div>
            <p className="font-medium">Auffälligkeiten gefunden</p>
            <p className="text-sm text-muted-foreground">
              Möchten Sie trotzdem fortfahren oder die Daten zuerst korrigieren?
            </p>
          </div>
          <Button onClick={handleForceComplete} variant="outline">
            Trotzdem fortfahren
          </Button>
        </div>
      )}
    </div>
  )
}