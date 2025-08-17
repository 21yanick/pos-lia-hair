'use client'

import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  History,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { supabase } from '@/shared/lib/supabase/client'
import type { ReconciliationData } from '@/shared/services/reconciliationService'
import { getReconciliationData } from '@/shared/services/reconciliationService'
import {
  createSwissDateForDay,
  formatDateForDisplay,
  getTodaySwissString,
} from '@/shared/utils/dateUtils'
import { exportMonthlyPDFWithReconciliation } from '@/shared/utils/exportHelpers'

export function ReconciliationReportTab() {
  const [reconciliationData, setReconciliationData] = useState<ReconciliationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return getTodaySwissString().slice(0, 7) // "2024-11" format in Swiss timezone
  })
  const [generatedReports, setGeneratedReports] = useState<any[]>([])
  const [showArchive, setShowArchive] = useState(false)

  // Generate available months (last 12 months) in Swiss timezone
  const getAvailableMonths = () => {
    const months = []
    const today = getTodaySwissString() // Swiss date as YYYY-MM-DD
    const currentYear = parseInt(today.slice(0, 4), 10)
    const currentMonth = parseInt(today.slice(5, 7), 10)

    for (let i = 0; i < 12; i++) {
      const targetMonth = currentMonth - i
      const targetYear = currentYear + Math.floor((targetMonth - 1) / 12)
      const adjustedMonth = ((((targetMonth - 1) % 12) + 12) % 12) + 1

      const monthString = `${targetYear}-${adjustedMonth.toString().padStart(2, '0')}`
      const displayDate = createSwissDateForDay(targetYear, adjustedMonth, 1)

      months.push({
        value: monthString,
        label: displayDate.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' }),
      })
    }
    return months
  }

  // Load reconciliation data when month changes
  useEffect(() => {
    loadReconciliationData()
    if (showArchive) {
      loadGeneratedReports()
    }
  }, [showArchive, loadGeneratedReports, loadReconciliationData])

  const loadReconciliationData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getReconciliationData(selectedMonth)
      setReconciliationData(data)
    } catch (err: any) {
      console.error('Error loading reconciliation data:', err)
      setError('Fehler beim Laden der Abgleich-Daten')
    } finally {
      setLoading(false)
    }
  }

  // Navigate months in Swiss timezone
  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number)
    let newYear = year
    let newMonth = month

    if (direction === 'prev') {
      newMonth -= 1
      if (newMonth < 1) {
        newMonth = 12
        newYear -= 1
      }
    } else {
      newMonth += 1
      if (newMonth > 12) {
        newMonth = 1
        newYear += 1
      }
    }

    const newMonthString = `${newYear}-${newMonth.toString().padStart(2, '0')}`
    setSelectedMonth(newMonthString)
  }

  // Load generated reports from Supabase documents storage
  const loadGeneratedReports = async () => {
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('id, file_name, file_path, created_at, file_size')
        .like('file_name', 'monatsabschluss-%')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        // console.error('Error loading generated reports:', error)
      } else {
        setGeneratedReports(documents || [])
      }
    } catch (err) {
      console.error('Error loading reports:', err)
    }
  }

  const handleViewReport = async (document: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600) // 1 hour

      if (error) {
        // console.error('Error creating signed URL:', error)
        setError('Fehler beim Öffnen des Berichts')
        return
      }

      window.open(data.signedUrl, '_blank')
    } catch (err) {
      console.error('Error viewing report:', err)
      setError('Fehler beim Öffnen des Berichts')
    }
  }

  const handleGeneratePDF = async () => {
    if (!reconciliationData) return

    try {
      setGenerating(true)
      setError(null)

      // Berechne Start- und Enddatum für den Monat
      const [year, month] = selectedMonth.split('-')
      const startDate = `${selectedMonth}-01`
      const endDate = `${selectedMonth}-${new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate().toString().padStart(2, '0')}`

      // Lade vollständige Sales-Daten für den Monat
      const { data: sales } = await supabase
        .from('sales')
        .select('id, total_amount, payment_method, created_at, receipt_number')
        .eq('status', 'completed')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)

      // Lade vollständige Ausgaben für den Monat
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, payment_method, payment_date, description, category')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate)

      // Berechne vollständige Sales-Stats (inkl. Cash!)
      const salesCash =
        sales
          ?.filter((s) => s.payment_method === 'cash')
          .reduce((sum, s) => sum + s.total_amount, 0) || 0
      const salesTwint =
        sales
          ?.filter((s) => s.payment_method === 'twint')
          .reduce((sum, s) => sum + s.total_amount, 0) || 0
      const salesSumup =
        sales
          ?.filter((s) => s.payment_method === 'sumup')
          .reduce((sum, s) => sum + s.total_amount, 0) || 0
      const salesTotal = salesCash + salesTwint + salesSumup

      // Berechne vollständige Ausgaben-Stats
      const expensesCash =
        expenses
          ?.filter((e) => e.payment_method === 'cash')
          .reduce((sum, e) => sum + e.amount, 0) || 0
      const expensesBank =
        expenses
          ?.filter((e) => e.payment_method === 'bank')
          .reduce((sum, e) => sum + e.amount, 0) || 0
      const expensesTotal = expensesCash + expensesBank

      const stats = {
        salesTotal,
        salesCash,
        salesTwint,
        salesSumup,
        expensesTotal,
        expensesCash,
        expensesBank,
        daysInMonth: new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate(),
        transactionDays: new Set(sales?.map((s) => s.created_at?.split('T')[0])).size || 0,
        avgDailyRevenue: salesTotal > 0 ? Math.round(salesTotal / 30) : 0,
      }

      // Generate PDF with vollständigen Daten UND reconciliationData
      await exportMonthlyPDFWithReconciliation(stats, selectedMonth, reconciliationData)

      // Refresh reports list to show newly generated report
      if (showArchive) {
        setTimeout(() => loadGeneratedReports(), 2000)
      }
    } catch (err: any) {
      console.error('Error generating PDF:', err)
      setError('Fehler beim Generieren des PDF-Berichts')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error && !reconciliationData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" className="ml-2" onClick={loadReconciliationData}>
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const formatMonthYear = (month: string) => {
    const [year, monthNum] = month.split('-')
    const monthDate = createSwissDateForDay(parseInt(year, 10), parseInt(monthNum, 10), 1)
    return monthDate.toLocaleDateString('de-CH', {
      month: 'long',
      year: 'numeric',
    })
  }

  const availableMonths = getAvailableMonths()

  return (
    <div className="space-y-6">
      {/* Header with Month Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Abgleich-Bericht</h2>
          <p className="text-muted-foreground">
            Monatlicher Überblick über Provider- und Bank-Abgleiche
          </p>
        </div>

        {/* Month Navigation & Archive Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchive(!showArchive)}
            className={showArchive ? 'bg-secondary' : ''}
          >
            <History className="h-4 w-4 mr-2" />
            {showArchive ? 'Aktuellen Monat' : 'Archiv'}
          </Button>

          {!showArchive && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Monat auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                disabled={loading || selectedMonth >= getTodaySwissString().slice(0, 7)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Archive View */}
      {showArchive ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <History className="h-5 w-5 mr-2" />
              Generierte Berichte
            </CardTitle>
            <CardDescription>Bereits erstellte Monatsberichte herunterladen</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Noch keine Berichte generiert</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Wechseln Sie zur Monatsansicht um einen Bericht zu erstellen
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {generatedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{report.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Erstellt: {formatDateForDisplay(report.created_at)} •
                          {report.file_size ? ` ${Math.round(report.file_size / 1024)} KB` : ''}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Öffnen
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Status Overview */}
          {reconciliationData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Provider Matching Rate */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      Provider-Abgleich
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reconciliationData.providerReconciliation.summary.matchingRate}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {reconciliationData.providerReconciliation.summary.matchedSales} von{' '}
                      {reconciliationData.providerReconciliation.summary.totalSales} abgeglichen
                    </p>
                  </CardContent>
                </Card>

                {/* Bank Matching Rate */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-green-500" />
                      Bank-Abgleich
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reconciliationData.bankReconciliation.summary.matchingRate}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {reconciliationData.bankReconciliation.summary.matchedTransactions} von{' '}
                      {reconciliationData.bankReconciliation.summary.totalBankTransactions}{' '}
                      abgeglichen
                    </p>
                  </CardContent>
                </Card>

                {/* Total Matched Sales */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Abgeglichene Verkäufe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reconciliationData.providerReconciliation.summary.matchedSales}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Erfolgreich zugeordnet</p>
                  </CardContent>
                </Card>

                {/* Action Items */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                      Nachbearbeitung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reconciliationData.providerReconciliation.summary.unmatchedSales +
                        reconciliationData.bankReconciliation.summary.unmatchedTransactions}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Offene Abgleiche</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Preview */}
              <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                {/* Provider Issues */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Provider-Abgleich</CardTitle>
                    <CardDescription>Offene und abgeglichene Verkäufe</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
                    {/* ALL unmatched sales */}
                    {reconciliationData.providerReconciliation.unmatchedSales.map((sale, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-500"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {sale.receiptNumber}: {sale.amount.toFixed(2)} CHF
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.date} • {sale.reason}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* ALL success matches */}
                    {reconciliationData.providerReconciliation.matches.map((match, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {match.sale.receiptNumber}: {match.sale.amount.toFixed(2)} CHF
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ↔ {match.provider.provider.toUpperCase()}:{' '}
                            {match.provider.netAmount.toFixed(2)} CHF
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Bank Issues */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bank-Abgleich</CardTitle>
                    <CardDescription>Bank-Transaktionen Status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
                    {/* ALL unmatched bank transactions */}
                    {reconciliationData.bankReconciliation.unmatchedBankTransactions.map(
                      (tx, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-500"
                        >
                          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              Bank: {tx.amount.toFixed(2)} CHF ({tx.date})
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tx.description}
                            </p>
                          </div>
                        </div>
                      )
                    )}

                    {/* ALL success matches */}
                    {reconciliationData.bankReconciliation.matches.map((match, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Bank: {match.bankTransaction.amount.toFixed(2)} CHF
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ↔ {match.matchedItems.length}x Positionen abgeglichen
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* PDF Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Monatsbericht generieren
                  </CardTitle>
                  <CardDescription>
                    Erstellen Sie einen detaillierten PDF-Bericht für die Buchhaltung
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Abgleich-Bericht {formatMonthYear(selectedMonth)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Enthält alle Provider- und Bank-Abgleiche mit Audit-Trail
                      </p>
                    </div>
                    <Button
                      onClick={handleGeneratePDF}
                      disabled={generating}
                      className="flex items-center space-x-2"
                    >
                      {generating ? (
                        <>
                          <Download className="h-4 w-4 animate-pulse" />
                          <span>Generiere...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>PDF Bericht</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
