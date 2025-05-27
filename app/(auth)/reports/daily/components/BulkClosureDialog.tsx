"use client"

import React, { useState, useEffect } from "react"
import { Calendar, AlertCircle, CheckCircle, XCircle, ArrowDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useDailySummaries } from "@/lib/hooks/business/useDailySummaries"
import { generateDailyReportPDF, formatTransactionsFromSales } from "../utils/dailyHelpers"

type MissingClosure = {
  missing_date: string
  sales_count: number
  sales_total: number
  has_draft_summary: boolean
}

type IndividualClosureResult = {
  date: string
  success: boolean
  summary_id: string | null
  error_message: string | null
  cash_starting: number
  cash_ending: number
  sales_cash: number
  pdf_created: boolean
}

type CashChainItem = {
  date: string
  sales_cash: number
  cash_starting: number
  cash_ending_soll: number
  cash_ending_ist: number
  difference: number
  ist_editable: boolean
}

type BulkClosureDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  missingClosures: MissingClosure[]
  onComplete: () => void
}

export function BulkClosureDialog({ 
  isOpen, 
  onOpenChange, 
  missingClosures, 
  onComplete 
}: BulkClosureDialogProps) {
  const [firstDayCashStarting, setFirstDayCashStarting] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<IndividualClosureResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [cashChain, setCashChain] = useState<CashChainItem[]>([])
  const [currentProcessingDay, setCurrentProcessingDay] = useState<number>(0)
  
  const { createDailySummary, getSalesForDate } = useDailySummaries()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('de-CH', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const totalSales = missingClosures.reduce((sum, closure) => sum + closure.sales_total, 0)

  // Sortiere Missing Closures nach Datum (älteste zuerst)
  const sortedClosures = [...missingClosures].sort((a, b) => 
    new Date(a.missing_date).getTime() - new Date(b.missing_date).getTime()
  )

  // Berechne Cash Chain wenn sich firstDayCashStarting ändert
  useEffect(() => {
    if (firstDayCashStarting >= 0) {
      calculateCashChain()
    }
  }, [firstDayCashStarting, missingClosures])

  const calculateCashChain = async () => {
    let currentCashStarting = firstDayCashStarting
    const chain: CashChainItem[] = []

    for (const closure of sortedClosures) {
      // Hole tatsächliche Bargeld-Verkäufe für das Datum
      const salesResult = await (getSalesForDate as any)(closure.missing_date)
      let salesCash = 0
      
      if (salesResult.success && salesResult.sales) {
        salesCash = salesResult.sales
          .filter((sale: any) => sale.payment_method === 'cash')
          .reduce((sum: number, sale: any) => sum + sale.total_amount, 0)
      }

      const cashEndingSoll = currentCashStarting + salesCash
      
      chain.push({
        date: closure.missing_date,
        sales_cash: salesCash,
        cash_starting: currentCashStarting,
        cash_ending_soll: cashEndingSoll,
        cash_ending_ist: cashEndingSoll, // Initial gleich SOLL
        difference: 0,
        ist_editable: true
      })
      
      // Nächster Tag startet mit dem SOLL-Endbestand (wird später mit IST überschrieben)
      currentCashStarting = cashEndingSoll
    }
    
    setCashChain(chain)
  }

  // Funktion um IST-Werte zu aktualisieren
  const updateCashChainIst = (dateToUpdate: string, newIstValue: number) => {
    const updatedChain = [...cashChain]
    const index = updatedChain.findIndex(item => item.date === dateToUpdate)
    
    if (index !== -1) {
      // Aktualisiere IST-Wert und Differenz
      updatedChain[index].cash_ending_ist = newIstValue
      updatedChain[index].difference = newIstValue - updatedChain[index].cash_ending_soll
      
      // Aktualisiere alle folgenden Tage mit dem neuen Anfangsbestand
      for (let i = index + 1; i < updatedChain.length; i++) {
        const previousIst = updatedChain[i - 1].cash_ending_ist
        updatedChain[i].cash_starting = previousIst
        updatedChain[i].cash_ending_soll = previousIst + updatedChain[i].sales_cash
        // IST-Wert initial gleich dem neuen SOLL setzen
        updatedChain[i].cash_ending_ist = updatedChain[i].cash_ending_soll
        updatedChain[i].difference = 0
      }
      
      setCashChain(updatedChain)
    }
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    setProgress(0)
    setResults([])
    setShowResults(true)
    setCurrentProcessingDay(0)

    try {
      const processingResults: IndividualClosureResult[] = []
      const bulkNotes = notes || `Sequenzieller Tagesabschluss - ${cashChain.length} Tage`
      
      // Verarbeite jeden Tag einzeln in chronologischer Reihenfolge
      for (let i = 0; i < cashChain.length; i++) {
        const dayChain = cashChain[i]
        setCurrentProcessingDay(i + 1)
        
        console.log(`🔄 Verarbeite Tag ${i + 1}/${cashChain.length}: ${dayChain.date}`)
        
        try {
          // 1. Erstelle Daily Summary für diesen Tag (mit IST-Werten)
          const summaryResult = await (createDailySummary as any)(
            dayChain.date,
            dayChain.cash_starting,
            dayChain.cash_ending_ist, // Verwende IST-Endbestand statt SOLL
            `${bulkNotes} - Tag ${i + 1}/${cashChain.length} | SOLL: ${dayChain.cash_ending_soll.toFixed(2)} | IST: ${dayChain.cash_ending_ist.toFixed(2)} | Diff: ${dayChain.difference.toFixed(2)}`
          )
          
          if (!summaryResult.success) {
            throw new Error(summaryResult.error || 'Daily Summary konnte nicht erstellt werden')
          }
          
          // 2. Hole Transaktionen für PDF
          const salesResult = await (getSalesForDate as any)(dayChain.date)
          let formattedTransactions: any[] = []
          
          if (salesResult.success && salesResult.sales) {
            // Formatiere Sales zu TransactionItems für PDF
            formattedTransactions = formatTransactionsFromSales(salesResult.sales)
            console.log(`📋 ${formattedTransactions.length} Transaktionen für PDF formatiert`)
          }
          
          // 3. Generiere PDF automatisch (mit Fehlerbehandlung)
          let pdfCreated = false
          if (summaryResult.summary) {
            try {
              console.log(`📄 Starte PDF-Generierung für ${dayChain.date}...`)
              console.log(`📋 Summary:`, summaryResult.summary)
              console.log(`📋 Transactions:`, formattedTransactions.length, 'items')
              
              const pdfResult = await generateDailyReportPDF(
                summaryResult.summary,
                formattedTransactions,
                true // Automatisch generiert
              )
              
              if (pdfResult.success) {
                console.log(`✅ PDF für ${dayChain.date} erfolgreich erstellt: ${pdfResult.filePath}`)
                pdfCreated = true
              } else {
                console.error(`❌ PDF-Fehler für ${dayChain.date}:`, pdfResult.error)
              }
            } catch (pdfError: any) {
              console.error(`❌ PDF-Exception für ${dayChain.date}:`, pdfError)
              console.error('PDF Error Stack:', pdfError.stack)
              // PDF-Fehler soll den Tagesabschluss nicht blockieren
            }
          }
          
          processingResults.push({
            date: dayChain.date,
            success: true,
            summary_id: summaryResult.summary?.id || null,
            error_message: null,
            cash_starting: dayChain.cash_starting,
            cash_ending: dayChain.cash_ending_ist, // Zeige IST-Werte in Results
            sales_cash: dayChain.sales_cash,
            pdf_created: pdfCreated
          })
          
          console.log(`✅ Tag ${dayChain.date} erfolgreich abgeschlossen`)
          
        } catch (dayError: any) {
          console.error(`❌ Fehler bei Tag ${dayChain.date}:`, dayError)
          processingResults.push({
            date: dayChain.date,
            success: false,
            summary_id: null,
            error_message: dayError.message,
            cash_starting: dayChain.cash_starting,
            cash_ending: dayChain.cash_ending_ist,
            sales_cash: dayChain.sales_cash,
            pdf_created: false
          })
        }
        
        // Progress aktualisieren
        const progressPercent = ((i + 1) / cashChain.length) * 100
        setProgress(progressPercent)
        setResults([...processingResults])
        
        // Kurze Pause zwischen Tagen für bessere UX
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Abschluss-Meldung
      const successCount = processingResults.filter(r => r.success).length
      console.log(`🎯 Bulk Closure abgeschlossen: ${successCount}/${cashChain.length} Tage erfolgreich`)
      
      // Nach kurzer Verzögerung Dialog schließen wenn alle erfolgreich
      if (successCount === cashChain.length) {
        setTimeout(() => {
          onComplete()
          onOpenChange(false)
          resetForm()
        }, 2000)
      }
      
    } catch (error: any) {
      console.error('❌ Schwerwiegender Fehler beim Bulk Closure:', error)
      // Setze Fehler für alle verbleibenden Tage
      const errorResults = cashChain.map(chain => ({
        date: chain.date,
        success: false,
        summary_id: null,
        error_message: error.message,
        cash_starting: chain.cash_starting,
        cash_ending: chain.cash_ending_ist,
        sales_cash: chain.sales_cash,
        pdf_created: false
      }))
      setResults(errorResults)
    } finally {
      setIsProcessing(false)
      setCurrentProcessingDay(0)
    }
  }

  const resetForm = () => {
    setFirstDayCashStarting(0)
    setNotes('')
    setProgress(0)
    setResults([])
    setShowResults(false)
    setIsProcessing(false)
    setCashChain([])
    setCurrentProcessingDay(0)
  }

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false)
      resetForm()
    }
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sequenzieller Tagesabschluss</DialogTitle>
          <DialogDescription>
            Schließen Sie {sortedClosures.length} offene Tagesabschlüsse einzeln ab. Geben Sie für jeden Tag den tatsächlich gezählten Bargeld-Bestand (IST) ein. SOLL-Werte werden automatisch berechnet.
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6">
            {/* Anfangs-Bargeld Eingabe */}
            <div>
              <Label htmlFor="firstDayCashStarting">Bargeld-Anfangsbestand für ersten Tag (CHF)</Label>
              <Input
                id="firstDayCashStarting"
                type="number"
                step="0.01"
                value={firstDayCashStarting}
                onChange={(e) => setFirstDayCashStarting(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Der Endbestand jedes Tages wird automatisch zum Anfangsbestand des nächsten Tages.
              </p>
            </div>

            {/* Cash Chain mit SOLL/IST */}
            {cashChain.length > 0 && (
              <div>
                <Label className="text-base font-medium">Bargeld-Kette mit SOLL/IST ({cashChain.length} Tage)</Label>
                <div className="mt-2 p-4 bg-blue-50 rounded-lg max-h-64 overflow-y-auto">
                  <div className="space-y-4">
                    {cashChain.map((item, index) => (
                      <div key={item.date} className="bg-white p-4 rounded-lg border border-blue-200">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{formatDate(item.date)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Anfang: CHF {item.cash_starting.toFixed(2)}
                          </div>
                        </div>
                        
                        {/* Sales */}
                        <div className="mb-3 text-sm">
                          <span className="text-green-600">+ Bargeld-Umsatz: CHF {item.sales_cash.toFixed(2)}</span>
                        </div>
                        
                        {/* SOLL vs IST */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* SOLL */}
                          <div className="bg-blue-100 p-2 rounded">
                            <div className="text-xs text-blue-600 font-medium">SOLL-Endbestand</div>
                            <div className="text-sm font-semibold">CHF {item.cash_ending_soll.toFixed(2)}</div>
                          </div>
                          
                          {/* IST Eingabe */}
                          <div className="bg-green-100 p-2 rounded">
                            <div className="text-xs text-green-600 font-medium">IST-Endbestand (gezählt)</div>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.cash_ending_ist}
                              onChange={(e) => updateCashChainIst(item.date, parseFloat(e.target.value) || 0)}
                              className="h-6 text-sm mt-1 bg-white"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        
                        {/* Differenz */}
                        {item.difference !== 0 && (
                          <div className={`mt-2 text-center text-sm font-medium ${
                            item.difference > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            Differenz: {item.difference > 0 ? '+' : ''}{item.difference.toFixed(2)} CHF
                          </div>
                        )}
                        
                        {/* Pfeil zum nächsten Tag */}
                        {index < cashChain.length - 1 && (
                          <div className="flex justify-center mt-3">
                            <ArrowDown className="h-4 w-4 text-blue-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Zusammenfassung */}
                  <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Gesamtumsatz Bargeld:</strong><br />
                        CHF {cashChain.reduce((sum, item) => sum + item.sales_cash, 0).toFixed(2)}
                      </div>
                      <div>
                        <strong>Gesamtdifferenz:</strong><br />
                        <span className={cashChain.reduce((sum, item) => sum + item.difference, 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {cashChain.reduce((sum, item) => sum + item.difference, 0) > 0 ? '+' : ''}
                          {cashChain.reduce((sum, item) => sum + item.difference, 0).toFixed(2)} CHF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Notizen */}
            <div>
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Grund für sequenziellen Abschluss, Besonderheiten..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isProcessing || cashChain.length === 0}
              >
                {cashChain.length} Tage sequenziell schließen
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Fortschritt</Label>
                <span className="text-sm text-gray-600">
                  {currentProcessingDay > 0 ? `Tag ${currentProcessingDay}/${cashChain.length}` : `${successCount + failureCount} / ${cashChain.length}`}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentProcessingDay > 0 && isProcessing && (
                <p className="text-sm text-blue-600 mt-1">
                  Verarbeite {formatDate(cashChain[currentProcessingDay - 1]?.date || '')}...
                </p>
              )}
            </div>

            {/* Zusammenfassung */}
            {results.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="font-semibold text-green-800">{successCount}</div>
                  <div className="text-sm text-green-600">Erfolgreich</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                  <div className="font-semibold text-red-800">{failureCount}</div>
                  <div className="text-sm text-red-600">Fehlgeschlagen</div>
                </div>
              </div>
            )}

            {/* Detaillierte Ergebnisse */}
            {results.length > 0 && (
              <div>
                <Label className="text-base font-medium">Detaillierte Ergebnisse</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {results.map((result) => (
                    <div key={result.date} className="flex items-center justify-between p-3 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">{formatDate(result.date)}</div>
                          {result.success && (
                            <div className="text-xs text-gray-500">
                              CHF {result.cash_starting.toFixed(2)} → CHF {result.cash_ending.toFixed(2)} 
                              (Cash: +{result.sales_cash.toFixed(2)})
                              {(() => {
                                const chainItem = cashChain.find(c => c.date === result.date)
                                return chainItem && chainItem.difference !== 0 ? (
                                  <div className={`${chainItem.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Diff: {chainItem.difference > 0 ? '+' : ''}{chainItem.difference.toFixed(2)} CHF
                                  </div>
                                ) : null
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {result.success && result.pdf_created && (
                          <div className="text-xs text-green-600">✓ PDF erstellt</div>
                        )}
                        {result.success && !result.pdf_created && (
                          <div className="text-xs text-orange-600">⚠ Ohne PDF</div>
                        )}
                        {result.error_message && (
                          <span className="text-red-600 text-xs">{result.error_message}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {!isProcessing && (
              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Schließen
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}