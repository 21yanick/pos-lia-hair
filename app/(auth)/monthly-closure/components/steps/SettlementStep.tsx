"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertTriangle, FileUp, Download } from "lucide-react"
import { useToast } from "@/lib/hooks/core/useToast"
import { useSales } from "@/lib/hooks/business/useSales"
import { SettlementImportDialog } from "@/app/(auth)/documents/components/SettlementImportDialog"
import { CrossMonthSettlementWarning } from "../CrossMonthSettlementWarning"

interface SettlementStepProps {
  selectedMonth: string
  dataCheckResult: any
  onComplete: (data: any) => void
  onNext: () => void
}

interface SettlementStatus {
  twint: {
    total: number
    settled: number
    pending: number
    totalAmount: number
    fees: number
    netAmount: number
  }
  sumup: {
    total: number
    settled: number
    pending: number
    totalAmount: number
    fees: number
    netAmount: number
  }
  cash: {
    total: number
    amount: number
    status: 'settled' // Cash is always settled
  }
}

export function SettlementStep({ selectedMonth, dataCheckResult, onComplete, onNext }: SettlementStepProps) {
  const { toast } = useToast()
  const { loadSalesForDateRange } = useSales()
  
  const [loading, setLoading] = useState(true)
  const [settlementStatus, setSettlementStatus] = useState<SettlementStatus | null>(null)
  const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [pendingSettlements, setPendingSettlements] = useState<any[]>([])

  // Parse selected month
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)

  const loadSettlementStatus = async () => {
    setLoading(true)
    
    try {
      // Calculate date range for the month
      const startDate = new Date(selectedYear, selectedMonthNum - 1, 1)
      const endDate = new Date(selectedYear, selectedMonthNum, 0, 23, 59, 59)
      
      // Also load previous month for cross-month settlements
      const prevStartDate = new Date(selectedYear, selectedMonthNum - 2, 1)
      const prevEndDate = new Date(selectedYear, selectedMonthNum - 1, 0, 23, 59, 59)
      
      // Load sales data for current and previous month
      const [salesResult, prevSalesResult] = await Promise.all([
        loadSalesForDateRange(startDate.toISOString(), endDate.toISOString()),
        loadSalesForDateRange(prevStartDate.toISOString(), prevEndDate.toISOString())
      ])

      if (!salesResult.success || !salesResult.sales) {
        throw new Error('Could not load sales data')
      }

      const sales = salesResult.sales
      const prevSales = prevSalesResult.success ? prevSalesResult.sales : []

      // Analyze settlement status by payment method
      const twintSales = sales.filter((sale: any) => sale.payment_method === 'twint')
      const sumupSales = sales.filter((sale: any) => sale.payment_method === 'sumup')
      const cashSales = sales.filter((sale: any) => sale.payment_method === 'cash')

      const status: SettlementStatus = {
        twint: {
          total: twintSales.length,
          settled: twintSales.filter((sale: any) => sale.settlement_status === 'settled').length,
          pending: twintSales.filter((sale: any) => sale.settlement_status === 'pending').length,
          totalAmount: twintSales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0),
          fees: twintSales.reduce((sum: number, sale: any) => sum + (sale.provider_fee || 0), 0),
          netAmount: twintSales.reduce((sum: number, sale: any) => sum + (sale.net_amount || sale.total_amount), 0)
        },
        sumup: {
          total: sumupSales.length,
          settled: sumupSales.filter((sale: any) => sale.settlement_status === 'settled').length,
          pending: sumupSales.filter((sale: any) => sale.settlement_status === 'pending').length,
          totalAmount: sumupSales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0),
          fees: sumupSales.reduce((sum: number, sale: any) => sum + (sale.provider_fee || 0), 0),
          netAmount: sumupSales.reduce((sum: number, sale: any) => sum + (sale.net_amount || sale.total_amount), 0)
        },
        cash: {
          total: cashSales.length,
          amount: cashSales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0),
          status: 'settled'
        }
      }

      setSettlementStatus(status)

      // Check if settlement is complete
      const twintComplete = status.twint.total === 0 || status.twint.pending === 0
      const sumupComplete = status.sumup.total === 0 || status.sumup.pending === 0
      const complete = twintComplete && sumupComplete

      // Generate pending settlement warnings for cross-month
      const pendingSettlementsData = [
        ...twintSales.filter(sale => sale.settlement_status === 'pending').map(sale => ({
          id: sale.id,
          amount: sale.total_amount,
          paymentMethod: 'twint' as const,
          transactionDate: sale.created_at,
          estimatedFee: sale.total_amount * 0.013, // ~1.3% average TWINT fee
          estimatedNetAmount: sale.total_amount * 0.987
        })),
        ...sumupSales.filter(sale => sale.settlement_status === 'pending').map(sale => ({
          id: sale.id,
          amount: sale.total_amount,
          paymentMethod: 'sumup' as const,
          transactionDate: sale.created_at,
          estimatedFee: sale.total_amount * 0.029, // ~2.9% average SumUp fee  
          estimatedNetAmount: sale.total_amount * 0.971
        }))
      ]
      
      setPendingSettlements(pendingSettlementsData)

      setIsComplete(complete)

      if (complete) {
        onComplete({
          settlementStatus: status,
          pendingSettlements: pendingSettlementsData,
          isComplete: true
        })
      } else {
        onComplete({
          settlementStatus: status,
          pendingSettlements: pendingSettlementsData,
          isComplete: false
        })
      }

    } catch (error: any) {
      console.error('Settlement status check failed:', error)
      toast({
        title: "Fehler",
        description: "Settlement Status konnte nicht geladen werden: " + error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettlementStatus()
  }, [selectedMonth])

  const handleSettlementComplete = () => {
    // Reload settlement status after import
    loadSettlementStatus()
    setIsSettlementDialogOpen(false)
    
    toast({
      title: "Settlement Import abgeschlossen",
      description: "Settlement Status wurde aktualisiert.",
    })
  }

  const handleForceComplete = () => {
    if (settlementStatus) {
      onComplete({
        settlementStatus,
        isComplete: true
      })
      onNext()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p>Settlement Status wird überprüft...</p>
      </div>
    )
  }

  if (!settlementStatus) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Settlement Status konnte nicht geladen werden. Bitte versuchen Sie es erneut.
        </AlertDescription>
      </Alert>
    )
  }

  const { twint, sumup, cash } = settlementStatus

  return (
    <div className="space-y-6">
      {/* Settlement Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TWINT */}
        <Card className={twint.pending > 0 ? "border-warning" : "border-success"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>TWINT</span>
              <Badge variant={twint.pending > 0 ? "destructive" : "default"}>
                {twint.pending > 0 ? `${twint.pending} pending` : "Settled"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Transaktionen:</span>
                <span>{twint.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Brutto:</span>
                <span>CHF {twint.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Gebühren:</span>
                <span>CHF {twint.fees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Netto:</span>
                <span>CHF {twint.netAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SumUp */}
        <Card className={sumup.pending > 0 ? "border-warning" : "border-success"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>SumUp</span>
              <Badge variant={sumup.pending > 0 ? "destructive" : "default"}>
                {sumup.pending > 0 ? `${sumup.pending} pending` : "Settled"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Transaktionen:</span>
                <span>{sumup.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Brutto:</span>
                <span>CHF {sumup.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Gebühren:</span>
                <span>CHF {sumup.fees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Netto:</span>
                <span>CHF {sumup.netAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Cash</span>
              <Badge variant="default">Settled</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Transaktionen:</span>
                <span>{cash.total}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Betrag:</span>
                <span>CHF {cash.amount.toFixed(2)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Cash wird über Kassenbuch abgerechnet
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Import Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp size={20} />
            Settlement Import
          </CardTitle>
          <CardDescription>
            Importieren Sie TWINT/SumUp CSV-Dateien für automatischen Settlement-Abgleich
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Import Status */}
            {(twint.pending > 0 || sumup.pending > 0) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Ausstehende Settlements gefunden</div>
                  <div className="text-sm mt-1">
                    {twint.pending > 0 && `TWINT: ${twint.pending} Transaktionen pending`}
                    {twint.pending > 0 && sumup.pending > 0 && " • "}
                    {sumup.pending > 0 && `SumUp: ${sumup.pending} Transaktionen pending`}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Import Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Unterstützte Dateiformate:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• TWINT CSV (Transaction Reports)</li>
                  <li>• SumUp CSV (Transaction Reports)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Import-Prozess:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Datei-Upload & Parsing</li>
                  <li>2. Automatisches Transaction-Matching</li>
                  <li>3. Settlement-Daten Update</li>
                </ul>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsSettlementDialogOpen(true)}
              className="w-full"
              variant={isComplete ? "outline" : "default"}
            >
              <FileUp className="mr-2" size={16} />
              Settlement Import Dialog öffnen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Month Settlement Warning */}
      {settlementStatus && (
        <CrossMonthSettlementWarning
          pendingSettlements={pendingSettlements}
          currentMonth={new Date(selectedYear, selectedMonthNum - 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        />
      )}

      {/* Completion Status */}
      {isComplete ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Settlement komplett abgeschlossen</div>
            <div className="text-sm mt-1">
              Alle TWINT/SumUp Transaktionen sind settled. Sie können zum nächsten Schritt wechseln.
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <div>
            <p className="font-medium">Settlement nicht vollständig oder Cross-Month erwartet</p>
            <p className="text-sm text-muted-foreground">
              {twint.pending > 0 && `${twint.pending} TWINT`}
              {twint.pending > 0 && sumup.pending > 0 && " und "}
              {sumup.pending > 0 && `${sumup.pending} SumUp`}
              {" "}Transaktionen sind noch nicht settled. Monatsabschluss kann als "preliminär" durchgeführt werden.
            </p>
          </div>
          <Button onClick={handleForceComplete} variant="outline">
            Preliminär fortfahren
          </Button>
        </div>
      )}

      {/* Settlement Import Dialog */}
      <SettlementImportDialog
        isOpen={isSettlementDialogOpen}
        onOpenChange={setIsSettlementDialogOpen}
        month={selectedMonth}
        onComplete={handleSettlementComplete}
      />
    </div>
  )
}