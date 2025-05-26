"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useDailySummaries } from "@/lib/hooks/business/useDailySummaries"
import { useMonthlySummaries } from "@/lib/hooks/business/useMonthlySummaries"
import { useExpenses } from "@/lib/hooks/business/useExpenses"
import { useToast } from "@/lib/hooks/core/useToast"

// Komponenten
import { MonthlyStats, type MonthlyStatsData } from "./components/MonthlyStats"
import { TransactionsList, type TransactionItem } from "./components/TransactionsList"
import { ExportButtons, type ExportType } from "./components/ExportButtons"
import { MonthlyActions } from "./components/MonthlyActions"

// Utils
import { 
  getCurrentYearMonth, 
  getMonthOptions, 
  formatMonthYear, 
  handleExport,
  exportMonthlyPDF
} from "./utils/monthlyHelpers"

export default function MonthlyReportPage() {
  const { toast } = useToast()

  // Hooks
  const { loadDailySummaries } = useDailySummaries()
  const { loadExpenses } = useExpenses()
  const {
    loading,
    error,
    currentMonthlySummary,
    getMonthlySummaryByDate,
    createMonthlySummary,
    closeMonthlySummary,
    setCurrentMonthlySummary,
  } = useMonthlySummaries()

  // State
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth())
  const [stats, setStats] = useState<MonthlyStatsData>({
    salesTotal: 0,
    salesCash: 0,
    salesTwint: 0,
    salesSumup: 0,
    expensesTotal: 0,
    expensesCash: 0,
    expensesBank: 0,
    transactionDays: 0,
    daysInMonth: 0,
    avgDailyRevenue: 0
  })
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Aktueller Monat/Jahr
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)
  const formattedMonthYear = formatMonthYear(selectedMonth)

  // Fehlerbehandlung
  useEffect(() => {
    if (error) {
      toast({
        title: "Fehler",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Daten laden wenn sich der Monat ändert
  useEffect(() => {
    const loadMonthlyData = async () => {
      setIsLoadingData(true)
      
      try {
        console.log(`Lade Monthly Data für ${selectedYear}-${selectedMonthNum}`)

        // 1. Monthly Summary für Status-Check laden
        await getMonthlySummaryByDate(selectedYear, selectedMonthNum)

        // 2. Daily Summaries laden
        const dailyResult = await loadDailySummaries()
        let dailyReports: any[] = []
        
        if (dailyResult.success && dailyResult.summaries) {
          // Nur Reports für den ausgewählten Monat filtern
          dailyReports = dailyResult.summaries.filter((summary: any) => {
            const reportDate = new Date(summary.report_date + 'T12:00:00')
            return reportDate.getFullYear() === selectedYear && 
                   reportDate.getMonth() === selectedMonthNum - 1
          })
          console.log(`${dailyReports.length} Daily Reports für ${selectedMonth} gefunden`)
        }

        // 3. Expenses laden
        const expensesResult = await loadExpenses()
        let monthlyExpenses: any[] = []
        
        if (expensesResult.success && expensesResult.expenses) {
          // Nur Ausgaben für den ausgewählten Monat filtern
          monthlyExpenses = expensesResult.expenses.filter((expense: any) => {
            const expenseDate = new Date(expense.payment_date + 'T12:00:00')
            return expenseDate.getFullYear() === selectedYear && 
                   expenseDate.getMonth() === selectedMonthNum - 1
          })
          console.log(`${monthlyExpenses.length} Ausgaben für ${selectedMonth} gefunden`)
        }

        // 4. Statistiken berechnen
        let salesCash = 0, salesTwint = 0, salesSumup = 0
        let expensesCash = 0, expensesBank = 0

        dailyReports.forEach((report: any) => {
          salesCash += report.sales_cash || 0
          salesTwint += report.sales_twint || 0
          salesSumup += report.sales_sumup || 0
        })

        monthlyExpenses.forEach((expense: any) => {
          if (expense.payment_method === 'cash') {
            expensesCash += expense.amount || 0
          } else {
            expensesBank += expense.amount || 0
          }
        })

        const salesTotal = salesCash + salesTwint + salesSumup
        const expensesTotal = expensesCash + expensesBank
        const daysInMonth = new Date(selectedYear, selectedMonthNum, 0).getDate()
        const transactionDays = dailyReports.length
        const avgDailyRevenue = transactionDays > 0 ? salesTotal / transactionDays : 0

        setStats({
          salesTotal,
          salesCash,
          salesTwint,
          salesSumup,
          expensesTotal,
          expensesCash,
          expensesBank,
          transactionDays,
          daysInMonth,
          avgDailyRevenue
        })

        // 5. Transaktionsliste erstellen (Daily Reports + Expenses)
        const allTransactions: TransactionItem[] = [
          // Daily Reports
          ...dailyReports.map((report: any) => ({
            id: report.id,
            date: report.report_date,
            type: 'daily_report' as const,
            description: `Tagesabschluss ${new Date(report.report_date).toLocaleDateString('de-CH')}`,
            cash: report.sales_cash,
            twint: report.sales_twint,
            sumup: report.sales_sumup,
            total: report.sales_total,
            status: report.status
          })),
          // Expenses
          ...monthlyExpenses.map((expense: any) => ({
            id: expense.id,
            date: expense.payment_date,
            type: 'expense' as const,
            description: expense.description || 'Ausgabe',
            total: expense.amount,
            paymentMethod: expense.payment_method,
            category: expense.category
          }))
        ]

        setTransactions(allTransactions)
        console.log(`${allTransactions.length} Transaktionen total erstellt`)

      } catch (err: any) {
        console.error('Fehler beim Laden der Monthly Data:', err)
        toast({
          title: "Fehler",
          description: "Die Monatsdaten konnten nicht geladen werden.",
          variant: "destructive",
        })
        
        // Bei Fehler leere Daten setzen
        setStats({
          salesTotal: 0,
          salesCash: 0,
          salesTwint: 0,
          salesSumup: 0,
          expensesTotal: 0,
          expensesCash: 0,
          expensesBank: 0,
          transactionDays: 0,
          daysInMonth: new Date(selectedYear, selectedMonthNum, 0).getDate(),
          avgDailyRevenue: 0
        })
        setTransactions([])
      } finally {
        setIsLoadingData(false)
      }
    }
    
    loadMonthlyData()
  }, [selectedYear, selectedMonthNum])

  // Kompletter Monatsabschluss mit PDF
  const handleCompleteMonthClose = async (notes: string) => {
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
      
      // 3. PDF erstellen und Document-Eintrag
      console.log("📄 Erstelle PDF und Document-Eintrag...")
      await exportMonthlyPDF(stats, transactions, selectedMonth, true)
      console.log("✅ PDF und Document-Eintrag erstellt")
      
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
      throw err
    }
  }

  // PDF Export (nur für manuellen Export)
  const handleExportPDF = async () => {
    try {
      await exportMonthlyPDF(stats, transactions, selectedMonth, false) // false = manuell, PDF öffnen
      toast({
        title: "PDF erstellt",
        description: "Der Monatsabschluss wurde als PDF erstellt.",
      })
    } catch (error: any) {
      console.error('Fehler beim PDF-Export:', error)
      toast({
        title: "Fehler beim PDF-Export",
        description: error.message || "Das PDF konnte nicht erstellt werden.",
        variant: "destructive",
      })
    }
  }

  // Export Handler
  const handleExportClick = async (type: ExportType, data: any) => {
    try {
      await handleExport(data)
      toast({
        title: "Export erfolgreich",
        description: `${data.label} wurde heruntergeladen.`,
      })
    } catch (error: any) {
      console.error('Fehler beim Export:', error)
      toast({
        title: "Fehler beim Export",
        description: error.message || "Der Export konnte nicht erstellt werden.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monatsabschluss</h1>
          <p className="text-gray-500">{formattedMonthYear}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Monat auswählen */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Actions */}
          <MonthlyActions
            selectedMonth={selectedMonth}
            formattedMonthYear={formattedMonthYear}
            currentMonthlySummary={currentMonthlySummary}
            stats={stats}
            onClose={handleCompleteMonthClose}
            onExportPDF={handleExportPDF}
            loading={loading}
          />
        </div>
      </div>

      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 size={30} className="animate-spin mb-4" />
          <span>Daten werden geladen...</span>
        </div>
      ) : (
        <>
          {/* Statistiken */}
          <MonthlyStats data={stats} loading={loading} />

          {/* Export-Optionen */}
          <ExportButtons
            transactions={transactions}
            stats={stats}
            selectedMonth={selectedMonth}
            onExport={handleExportClick}
            loading={loading}
          />

          {/* Transaktionsliste */}
          <TransactionsList 
            transactions={transactions}
            loading={loading}
          />
        </>
      )}
    </div>
  )
}