"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/lib/hooks/useToast"
import { useDailySummaries } from "@/lib/hooks/useDailySummaries"
import { useSales } from "@/lib/hooks/useSales"
import { formatDateForAPI, formatDateForDisplay, getTodaySwiss } from "@/lib/utils/dateUtils"

// Komponenten importieren
import { DailyStats } from "./components/DailyStats"
import { TransactionsList } from "./components/TransactionsList"
import { DailyActions } from "./components/DailyActions"
import { CashCountDialog } from "./components/CashCountDialog"

// Utils importieren
import { 
  generateDailyReportPDF, 
  calculateDailyStats, 
  formatTransactionsFromSales,
  getDateString 
} from "./utils/dailyHelpers"
import type { 
  DailyStatsData, 
  TransactionItem, 
  DailySummary, 
  DailyActionType, 
  CashCountData 
} from "./utils/dailyTypes"

export default function DailyReportPage() {
  // Hooks
  const { toast } = useToast()
  const { 
    loading: summariesLoading, 
    error: summariesError, 
    currentDailySummary,
    getDailySummaryByDate,
    createDailySummary,
    getSalesForDate,
  } = useDailySummaries()
  
  const { 
    loading: salesLoading 
  } = useSales()

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(getTodaySwiss())
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [stats, setStats] = useState<DailyStatsData>({
    cash: 0,
    twint: 0,
    sumup: 0,
    total: 0,
    startingCash: 0,
    endingCash: 0,
    transactionCount: 0
  })

  // Dialog State
  const [isCashCountDialogOpen, setIsCashCountDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Berechnete Werte
  const apiDateFormat = formatDateForAPI(selectedDate)
  const formattedDate = formatDateForDisplay(apiDateFormat)
  const isLoading = isLoadingData || summariesLoading || salesLoading

  // Daten laden bei Datum-Änderung
  useEffect(() => {
    const loadReportData = async () => {
      try {
        setIsLoadingData(true)
        console.log("🔧 DEBUG: Lade Daily Report Daten für:", apiDateFormat)
        console.log("🔧 DEBUG: Selected Date:", selectedDate)
        console.log("🔧 DEBUG: API Date Format:", apiDateFormat)
        console.log("🔧 DEBUG: Aktuell:", new Date().toISOString())

        // 1. Daily Summary laden
        const summaryResult = await getDailySummaryByDate(apiDateFormat)
        console.log("Daily Summary Ergebnis:", summaryResult)

        // 2. Verkäufe für das Datum laden
        const salesResult = await getSalesForDate(apiDateFormat)
        console.log("Sales Ergebnis:", salesResult)

        if (salesResult.success && salesResult.sales) {
          // Transaktionen formatieren
          const formattedTransactions = formatTransactionsFromSales(salesResult.sales)
          setTransactions(formattedTransactions)

          // Stats berechnen
          const startingCash = summaryResult.success && summaryResult.summary 
            ? summaryResult.summary.cash_starting 
            : 0
          const calculatedStats = calculateDailyStats(formattedTransactions, startingCash)
          setStats(calculatedStats)
        } else {
          setTransactions([])
          setStats({
            cash: 0,
            twint: 0,
            sumup: 0,
            total: 0,
            startingCash: 0,
            endingCash: 0,
            transactionCount: 0
          })
        }

      } catch (err: any) {
        console.error('Fehler beim Laden der Daily Report Daten:', err)
        toast({
          title: "Fehler",
          description: err.message || "Daten konnten nicht geladen werden",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadReportData()
  }, [selectedDate, apiDateFormat])


  // Error Toast
  useEffect(() => {
    if (summariesError) {
      toast({
        title: "Fehler",
        description: summariesError,
        variant: "destructive",
      })
    }
  }, [summariesError, toast])

  // Action Handler
  const handleAction = async (action: DailyActionType) => {
    switch (action) {
      case 'close':
      case 'update':
        // Erwarteten Bargeldbestand setzen
        if (stats.endingCash > 0 || currentDailySummary?.cash_ending) {
          setIsCashCountDialogOpen(true)
        } else {
          toast({
            title: "Keine Bardaten",
            description: "Es sind keine Bargeldtransaktionen vorhanden.",
            variant: "destructive",
          })
        }
        break

      case 'export_pdf':
        if (!currentDailySummary) {
          toast({
            title: "Kein Tagesabschluss",
            description: "Es ist kein Tagesabschluss vorhanden.",
            variant: "destructive",
          })
          return
        }

        const pdfResult = await generateDailyReportPDF(
          currentDailySummary, 
          transactions, 
          false // Nicht automatisch generiert
        )

        if (pdfResult.success) {
          toast({
            title: "PDF erstellt",
            description: "Der Tagesabschluss wurde als PDF erstellt und geöffnet.",
          })
        } else {
          toast({
            title: "Fehler beim PDF-Export",
            description: pdfResult.error || "Das PDF konnte nicht erstellt werden.",
            variant: "destructive",
          })
        }
        break
    }
  }

  // Cash Count bestätigen
  const handleCashCountConfirm = async (data: CashCountData) => {
    try {
      setIsSubmitting(true)
      
      const result = await createDailySummary(
        apiDateFormat,
        data.expectedCash - stats.cash, // Starting cash
        data.actualCash,
        data.notes || undefined
      )
      
      if (result.success) {
        toast({
          title: "Tagesabschluss erfolgreich",
          description: "Der Tagesabschluss wurde erfolgreich durchgeführt.",
        })
        
        setIsCashCountDialogOpen(false)
        
        // Daten neu laden
        setTimeout(async () => {
          const reportResult = await getDailySummaryByDate(apiDateFormat)
          
          // Automatisch PDF für den geschlossenen Daily Report generieren
          if (reportResult.success && reportResult.summary) {
            try {
              await generateDailyReportPDF(
                reportResult.summary, 
                transactions, 
                true // Automatisch generiert
              )
              console.log("PDF für Daily Report automatisch erstellt")
            } catch (pdfError) {
              console.error("Fehler beim automatischen PDF-Export:", pdfError)
            }
          }
        }, 1000)
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Der Tagesabschluss konnte nicht durchgeführt werden.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error('Fehler beim Tagesabschluss:', err)
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header mit Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tagesabschluss</h1>
          <p className="text-gray-500">{formattedDate}</p>
        </div>

        <DailyActions
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          dailySummary={currentDailySummary}
          hasTransactions={transactions.length > 0}
          onAction={handleAction}
          isLoading={isLoading}
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 size={30} className="animate-spin mb-4" />
          <span>Daten werden geladen...</span>
          <p className="text-gray-500 mt-2">
            Datum: {apiDateFormat}
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <DailyStats stats={stats} loading={isLoading} />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaktionen Liste */}
            <div className="lg:col-span-2">
              <TransactionsList 
                transactions={transactions} 
                loading={isLoading}
              />
            </div>

            {/* Bargeld Info */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Bargeld-Bestand</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Anfangsbestand:</span>
                    <span className="font-medium">CHF {stats.startingCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>+ Bareinnahmen:</span>
                    <span className="font-medium text-green-600">CHF {stats.cash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Erwarteter Endbestand:</span>
                    <span className="font-bold">CHF {stats.endingCash.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {currentDailySummary?.notes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Notizen</h3>
                  <p className="text-sm text-gray-700">
                    {currentDailySummary.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Cash Count Dialog */}
      <CashCountDialog
        isOpen={isCashCountDialogOpen}
        onOpenChange={setIsCashCountDialogOpen}
        expectedCash={stats.endingCash}
        currentStatus={currentDailySummary?.status || 'draft'}
        onConfirm={handleCashCountConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}