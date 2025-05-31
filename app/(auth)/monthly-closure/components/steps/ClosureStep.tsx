"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Textarea } from "@/shared/components/ui/textarea"
import { Label } from "@/shared/components/ui/label"
import { CheckCircle2, AlertTriangle, Lock, FileText, Download, Archive } from "lucide-react"
import { useToast } from "@/shared/hooks/core/useToast"
import { useMonthlySummaries } from "@/shared/hooks/business/useMonthlySummaries"
import { exportMonthlyPDF, openMonthlyPDF } from "@/shared/utils/exportHelpers"
import { formatAllTransactions } from "@/modules/reports/daily"

interface ClosureStepProps {
  selectedMonth: string
  allStepData: Record<string, any>
  onComplete: (data: any) => void
  isAlreadyClosed?: boolean
  closedSummary?: any
}

export function ClosureStep({ selectedMonth, allStepData, onComplete, isAlreadyClosed = false, closedSummary }: ClosureStepProps) {
  const { toast } = useToast()
  const {
    loading,
    currentMonthlySummary,
    createMonthlySummary,
    closeMonthlySummary
  } = useMonthlySummaries()

  const [notes, setNotes] = useState("")
  const [isClosing, setIsClosing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [closureResult, setClosureResult] = useState<any>(null)

  // Parse selected month
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)
  const formattedMonthYear = selectedMonth.split('-').map((part, index) => {
    if (index === 1) return new Date(2000, parseInt(part) - 1).toLocaleDateString('de-DE', { month: 'long' })
    return part
  }).join(' ')

  // Calculate final statistics
  const dataCheck = allStepData['data-check'] || {}
  const settlement = allStepData['settlement'] || {}
  const bankRecon = allStepData['bank-reconciliation'] || {}
  const review = allStepData['review'] || {}

  const totalRevenue = dataCheck.salesTotal || 0
  const totalExpenses = dataCheck.expensesTotal || 0
  const totalFees = (settlement.settlementStatus?.twint?.fees || 0) + (settlement.settlementStatus?.sumup?.fees || 0)
  const netRevenue = totalRevenue - totalFees - totalExpenses

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    try {
      await openMonthlyPDF(selectedMonth)
      
      toast({
        title: "PDF wird geöffnet",
        description: "Das Monats-PDF wird in einem neuen Tab geöffnet.",
      })
    } catch (error: any) {
      toast({
        title: "Fehler beim Öffnen des PDFs",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleClosureComplete = async () => {
    setIsClosing(true)
    
    try {
      console.log("🎯 Starte kompletten Monatsabschluss für", selectedYear, selectedMonthNum)
      
      // 1. Monthly Summary erstellen (falls nicht vorhanden)
      let summaryId = currentMonthlySummary?.id
      if (!summaryId) {
        console.log("📝 Erstelle Monthly Summary...")
        const createResult = await createMonthlySummary(selectedYear, selectedMonthNum, notes)
        if (!createResult.success || !createResult.summary) {
          throw new Error("Monthly Summary konnte nicht erstellt werden")
        }
        summaryId = createResult.summary.id
        console.log("✅ Monthly Summary erstellt:", summaryId)
      }
      
      // 2. Monthly Summary schließen
      console.log("🔒 Schließe Monthly Summary...")
      const closeResult = await closeMonthlySummary(summaryId, notes)
      if (!closeResult.success) {
        throw new Error("Monthly Summary konnte nicht geschlossen werden")
      }
      console.log("✅ Monthly Summary geschlossen")
      
      // 3. Prepare data for PDF generation
      console.log("📄 Bereite PDF-Daten vor...")
      
      // Create simplified stats for PDF
      const stats = {
        salesTotal: totalRevenue,
        salesCash: settlement.settlementStatus?.cash?.amount || 0,
        salesTwint: settlement.settlementStatus?.twint?.totalAmount || 0,
        salesSumup: settlement.settlementStatus?.sumup?.totalAmount || 0,
        expensesTotal: totalExpenses,
        expensesCash: 0, // Would need to calculate from actual data
        expensesBank: totalExpenses, // Simplified assumption
        transactionDays: dataCheck.dailySummariesCount || 0,
        daysInMonth: new Date(selectedYear, selectedMonthNum, 0).getDate(),
        avgDailyRevenue: totalRevenue / (dataCheck.dailySummariesCount || 1)
      }

      // Create empty transactions array for PDF (could be populated with actual data)
      const transactions: any[] = []

      // 4. PDF erstellen und Document-Eintrag
      console.log("📄 Erstelle PDF und Document-Eintrag...")
      await exportMonthlyPDF(stats, transactions, selectedMonth, true)
      console.log("✅ PDF und Document-Eintrag erstellt")
      
      // 5. Mark closure as complete
      const result = {
        summaryId,
        closedAt: new Date().toISOString(),
        notes,
        finalStats: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          fees: totalFees,
          netRevenue,
          salesCount: dataCheck.salesCount,
          expensesCount: dataCheck.expensesCount,
          bankEntriesProcessed: bankRecon.bankEntriesCount,
          bankEntriesMatched: bankRecon.matchedCount
        },
        allStepData
      }

      setClosureResult(result)
      setIsComplete(true)
      
      onComplete(result)
      
      // Erfolg melden
      toast({
        title: "Monatsabschluss erfolgreich",
        description: `Monatsabschluss für ${formattedMonthYear} wurde komplett durchgeführt.`,
      })
      
    } catch (err: any) {
      console.error("❌ Fehler beim kompletten Monatsabschluss:", err)
      toast({
        title: "Fehler beim Monatsabschluss",
        description: err.message || "Der Monatsabschluss konnte nicht durchgeführt werden.",
        variant: "destructive",
      })
    } finally {
      setIsClosing(false)
    }
  }

  // View for already closed months
  if (isAlreadyClosed && closedSummary) {
    return (
      <div className="space-y-6">
        {/* Already Closed Message */}
        <Alert className="border-info bg-info/10">
          <Lock className="h-4 w-4 text-info" />
          <AlertDescription>
            <div className="font-medium text-info">
              Monat bereits abgeschlossen
            </div>
            <div className="text-sm text-info/80 mt-1">
              {formattedMonthYear} wurde am {new Date(closedSummary.closed_at).toLocaleDateString('de-CH')} final abgeschlossen.
            </div>
          </AlertDescription>
        </Alert>

        {/* Summary from Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive size={20} />
              Abgeschlossener Monat - {formattedMonthYear}
            </CardTitle>
            <CardDescription>
              Finale Zahlen (schreibgeschützt)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Summary from DB */}
              <div className="space-y-3">
                <h4 className="font-medium">Finanzielle Übersicht</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Brutto-Umsatz:</span>
                    <span className="font-medium">CHF {closedSummary.sales_total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ausgaben:</span>
                    <span className="text-red-600">-CHF {closedSummary.expenses_total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Netto-Ergebnis:</span>
                    <span className={(closedSummary.sales_total - closedSummary.expenses_total) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      CHF {(closedSummary.sales_total - closedSummary.expenses_total)?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="space-y-3">
                <h4 className="font-medium">Abschluss-Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="default">🔒 Abgeschlossen</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Abgeschlossen am:</span>
                    <span>{new Date(closedSummary.closed_at).toLocaleString('de-CH')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Erstellt am:</span>
                    <span>{new Date(closedSummary.created_at).toLocaleString('de-CH')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {closedSummary.notes && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Notizen</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  {closedSummary.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions for Closed Month */}
        <div className="flex gap-3">
          <Button onClick={handleDownloadPDF}>
            <Download size={16} className="mr-2" />
            PDF anzeigen
          </Button>
          <Button variant="outline" onClick={() => window.open('/documents', '_blank')}>
            <FileText size={16} className="mr-2" />
            Monatsberichte
          </Button>
        </div>
      </div>
    )
  }

  if (isComplete && closureResult) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <Alert className="border-success bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription>
            <div className="font-medium text-green-800 dark:text-green-400">
              Monatsabschluss erfolgreich abgeschlossen!
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 mt-1">
              {formattedMonthYear} wurde final abgeschlossen und ist für Änderungen gesperrt.
            </div>
          </AlertDescription>
        </Alert>

        {/* Final Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive size={20} />
              Abschluss-Zusammenfassung
            </CardTitle>
            <CardDescription>
              Finale Zahlen für {formattedMonthYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Summary */}
              <div className="space-y-3">
                <h4 className="font-medium">Finanzielle Übersicht</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Brutto-Umsatz:</span>
                    <span className="font-medium">CHF {totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provider Gebühren:</span>
                    <span className="text-red-600">-CHF {totalFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ausgaben:</span>
                    <span className="text-red-600">-CHF {totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Netto-Ergebnis:</span>
                    <span className={netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}>
                      CHF {netRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Process Summary */}
              <div className="space-y-3">
                <h4 className="font-medium">Verarbeitungs-Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Verkäufe:</span>
                    <span>{closureResult.finalStats.salesCount} Transaktionen</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ausgaben:</span>
                    <span>{closureResult.finalStats.expensesCount} Belege</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bank Einträge:</span>
                    <span>{closureResult.finalStats.bankEntriesMatched}/{closureResult.finalStats.bankEntriesProcessed} abgeglichen</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Abgeschlossen am:</span>
                    <span>{new Date(closureResult.closedAt).toLocaleString('de-CH')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Notizen</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  {notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Download size={16} className="mr-2" />
            Neuen Monat bearbeiten
          </Button>
          <Button variant="outline" onClick={() => window.open('/documents', '_blank')}>
            <FileText size={16} className="mr-2" />
            PDF anzeigen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pre-Closure Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            Monatsabschluss durchführen
          </CardTitle>
          <CardDescription>
            Finale Zahlen für {formattedMonthYear} vor dem Abschluss
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Revenue */}
            <div className="text-center p-4 rounded-lg bg-success/10">
              <div className="text-2xl font-bold text-success">
                CHF {totalRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Brutto-Umsatz</div>
            </div>

            {/* Fees */}
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <div className="text-2xl font-bold text-warning">
                CHF {totalFees.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Provider Gebühren</div>
            </div>

            {/* Expenses */}
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <div className="text-2xl font-bold text-destructive">
                CHF {totalExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Ausgaben</div>
            </div>

            {/* Net */}
            <div className={`text-center p-4 rounded-lg ${netRevenue >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <div className={`text-2xl font-bold ${netRevenue >= 0 ? 'text-success' : 'text-destructive'}`}>
                CHF {netRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Netto-Ergebnis</div>
            </div>
          </div>

          {/* Process Status Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="default">
              ✓ {dataCheck.salesCount || 0} Verkäufe
            </Badge>
            <Badge variant="default">
              ✓ {dataCheck.expensesCount || 0} Ausgaben
            </Badge>
            <Badge variant={settlement.isComplete ? "default" : "destructive"}>
              {settlement.isComplete ? "✓" : "⚠"} Settlement
            </Badge>
            <Badge variant={bankRecon.isComplete ? "default" : "destructive"}>
              {bankRecon.isComplete ? "✓" : "⚠"} Bank Reconciliation
            </Badge>
            <Badge variant={review.reviewComplete ? "default" : "destructive"}>
              {review.reviewComplete ? "✓" : "⚠"} Kontrolle
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Abschluss-Notizen</CardTitle>
          <CardDescription>
            Optionale Notizen für den Monatsabschluss (z.B. besondere Vorkommnisse, Anmerkungen)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="closure-notes">Notizen</Label>
            <Textarea
              id="closure-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Feiertage, besondere Ausgaben, Anmerkungen zum Monat..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium">Achtung: Finale Aktion</div>
          <div className="text-sm mt-1">
            Nach dem Abschluss können keine Änderungen mehr am Monat {formattedMonthYear} vorgenommen werden. 
            Die Daten werden gesperrt und ein PDF-Report wird erstellt.
          </div>
        </AlertDescription>
      </Alert>

      {/* Closure Action */}
      <div className="flex justify-center pt-6 pb-8">
        <Button
          onClick={handleClosureComplete}
          disabled={isClosing || loading}
          size="lg"
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-2 border-destructive shadow-lg px-8 py-4 text-lg font-semibold"
        >
          {isClosing ? (
            <>
              <Lock className="mr-2 h-5 w-5 animate-spin" />
              Abschluss wird durchgeführt...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-5 w-5" />
              🔒 MONATSABSCHLUSS FINAL DURCHFÜHREN
            </>
          )}
        </Button>
      </div>
    </div>
  )
}