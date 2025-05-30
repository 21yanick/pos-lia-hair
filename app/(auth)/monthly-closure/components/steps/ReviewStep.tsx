"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, AlertTriangle, FileText, CreditCard, Receipt, Building, Eye } from "lucide-react"

interface ReviewStepProps {
  selectedMonth: string
  allStepData: Record<string, any>
  onComplete: (data: any) => void
  onNext: () => void
}

interface ReviewChecklistItem {
  id: string
  title: string
  description: string
  checked: boolean
  required: boolean
}

export function ReviewStep({ selectedMonth, allStepData, onComplete, onNext }: ReviewStepProps) {
  const onCompleteCalledRef = useRef(false)
  const [checklist, setChecklist] = useState<ReviewChecklistItem[]>([
    {
      id: 'sales-data',
      title: 'Verkaufsdaten vollständig',
      description: 'Alle Verkäufe des Monats sind erfasst und korrekt',
      checked: false,
      required: true
    },
    {
      id: 'expense-data',
      title: 'Ausgabendaten vollständig',
      description: 'Alle Geschäftsausgaben sind erfasst und belegt',
      checked: false,
      required: true
    },
    {
      id: 'settlement-complete',
      title: 'Settlement abgeschlossen',
      description: 'TWINT/SumUp CSV importiert und alle Transaktionen settled',
      checked: false,
      required: true
    },
    {
      id: 'cross-month-settlements',
      title: 'Cross-Month Settlements geprüft',
      description: 'Settlements die in zukünftigen Monaten erwartet werden sind dokumentiert',
      checked: false,
      required: false
    },
    {
      id: 'bank-reconciled',
      title: 'Bank Reconciliation durchgeführt',
      description: 'Bank Statement importiert und alle Einträge zugeordnet',
      checked: false,
      required: true
    },
    {
      id: 'receipts-filed',
      title: 'Belege archiviert',
      description: 'Alle physischen/digitalen Belege sind ordnungsgemäß abgelegt',
      checked: false,
      required: false
    },
    {
      id: 'cash-reconciled',
      title: 'Kassenbuch abgeglichen',
      description: 'Kassenstand stimmt mit Kassenbuch überein',
      checked: false,
      required: false
    }
  ])

  const [isComplete, setIsComplete] = useState(false)
  
  const formattedMonthYear = selectedMonth.split('-').map((part, index) => {
    if (index === 1) return new Date(2000, parseInt(part) - 1).toLocaleDateString('de-DE', { month: 'long' })
    return part
  }).join(' ')

  // Auto-check items based on step data
  useEffect(() => {
    setChecklist(prev => prev.map(item => {
      let autoChecked = item.checked
      
      switch (item.id) {
        case 'sales-data':
          autoChecked = allStepData['data-check']?.salesCount > 0
          break
        case 'expense-data':
          autoChecked = allStepData['data-check']?.expensesCount >= 0 // 0 is valid
          break
        case 'settlement-complete':
          autoChecked = allStepData['settlement']?.isComplete === true
          break
        case 'bank-reconciled':
          autoChecked = allStepData['bank-reconciliation']?.isComplete === true
          break
      }
      
      return { ...item, checked: autoChecked }
    }))
  }, [allStepData])

  // Check if review is complete (only call onComplete once)
  useEffect(() => {
    const requiredItems = checklist.filter(item => item.required)
    const requiredCompleted = requiredItems.filter(item => item.checked)
    const complete = requiredCompleted.length === requiredItems.length
    
    // Reset flag if completion status changes
    if (complete !== isComplete) {
      onCompleteCalledRef.current = false
    }
    
    setIsComplete(complete)
    
    if (complete && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true
      onComplete({
        checklist,
        reviewComplete: true,
        completedAt: new Date().toISOString()
      })
    }
  }, [checklist, isComplete])

  const handleCheckChange = (itemId: string, checked: boolean) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked } : item
    ))
  }

  const handleForceComplete = () => {
    onComplete({
      checklist,
      reviewComplete: true,
      forcedComplete: true,
      completedAt: new Date().toISOString()
    })
    onNext()
  }

  // Calculate summary statistics
  const dataCheck = allStepData['data-check'] || {}
  const settlement = allStepData['settlement'] || {}
  const bankRecon = allStepData['bank-reconciliation'] || {}

  const totalRevenue = dataCheck.salesTotal || 0
  const totalExpenses = dataCheck.expensesTotal || 0
  const totalFees = (settlement.settlementStatus?.twint?.fees || 0) + (settlement.settlementStatus?.sumup?.fees || 0)
  const netRevenue = totalRevenue - totalFees - totalExpenses

  return (
    <div className="space-y-6">
      {/* Summary Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Monatsübersicht {formattedMonthYear}
          </CardTitle>
          <CardDescription>
            Finale Zahlen und Kontrolle vor dem Abschluss
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Brutto-Umsatz</div>
              <div className="text-2xl font-bold text-success">
                CHF {totalRevenue.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {dataCheck.salesCount || 0} Verkäufe
              </div>
            </div>

            {/* Fees */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Provider Gebühren</div>
              <div className="text-2xl font-bold text-warning">
                CHF {totalFees.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                TWINT + SumUp Fees
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Ausgaben</div>
              <div className="text-2xl font-bold text-destructive">
                CHF {totalExpenses.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {dataCheck.expensesCount || 0} Ausgaben
              </div>
            </div>

            {/* Net */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Netto-Ergebnis</div>
              <div className={`text-2xl font-bold ${netRevenue >= 0 ? 'text-success' : 'text-destructive'}`}>
                CHF {netRevenue.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Nach allen Abzügen
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Data Check */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText size={16} />
              Datencheck
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="w-full justify-center">
              ✓ Abgeschlossen
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              {dataCheck.salesCount} Sales, {dataCheck.expensesCount} Expenses
            </div>
          </CardContent>
        </Card>

        {/* Settlement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard size={16} />
              Settlement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={settlement.isComplete ? "default" : "destructive"} className="w-full justify-center">
              {settlement.isComplete ? "✓ Komplett" : "⚠ Unvollständig"}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              TWINT/SumUp Status
            </div>
          </CardContent>
        </Card>

        {/* Bank Reconciliation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building size={16} />
              Bank Recon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={bankRecon.isComplete ? "default" : "destructive"} className="w-full justify-center">
              {bankRecon.isComplete ? "✓ Abgeglichen" : "⚠ Offen"}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              {bankRecon.matchedCount || 0}/{bankRecon.bankEntriesCount || 0} Einträge
            </div>
          </CardContent>
        </Card>

        {/* Review */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye size={16} />
              Kontrolle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isComplete ? "default" : "secondary"} className="w-full justify-center">
              {isComplete ? "✓ Bereit" : "🔄 In Arbeit"}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Finale Prüfung
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Abschluss-Checkliste</CardTitle>
          <CardDescription>
            Bestätigen Sie alle Punkte vor dem finalen Monatsabschluss
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => handleCheckChange(item.id, !!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label 
                    htmlFor={item.id}
                    className={`text-sm font-medium cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.title}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
                {item.checked && (
                  <CheckCircle2 size={16} className="text-success mt-1" />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              * Pflichtfelder für den Monatsabschluss
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {isComplete ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Kontrolle abgeschlossen</div>
            <div className="text-sm mt-1">
              Alle erforderlichen Prüfungen sind durchgeführt. Sie können den Monatsabschluss erstellen.
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <div>
            <p className="font-medium">Kontrolle unvollständig</p>
            <p className="text-sm text-muted-foreground">
              Bitte bestätigen Sie alle Pflichtfelder (*) vor dem Abschluss.
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