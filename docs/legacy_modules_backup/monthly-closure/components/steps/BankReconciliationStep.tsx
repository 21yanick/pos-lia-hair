"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Loader2, CheckCircle2, AlertTriangle, Upload, Building, Check, X, TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/shared/hooks/core/useToast"
import { useBankReconciliation } from "@/shared/hooks/business/useBankReconciliation"
import { formatDateForDisplay } from "@/shared/utils/dateUtils"
import { ManualMatchDialog } from "./ManualMatchDialog"

interface BankReconciliationStepProps {
  selectedMonth: string
  settlementResult: any
  onComplete: (data: any) => void
  onNext: () => void
}

interface SimplifiedMatch {
  id: string
  amount: number
  date: string
  description: string
  type: 'settlement' | 'expense' | 'deposit' | 'unknown'
  details: string
  confidence: number
  status: 'pending' | 'approved' | 'rejected'
  bankEntry: any
  posData?: any
}

export function BankReconciliationStep({ selectedMonth, settlementResult, onComplete, onNext }: BankReconciliationStepProps) {
  const { toast } = useToast()
  const formattedMonthYear = selectedMonth.split('-').map((part, index) => {
    if (index === 1) return new Date(2000, parseInt(part) - 1).toLocaleDateString('de-DE', { month: 'long' })
    return part
  }).join(' ')
  
  const {
    bankEntries,
    reconciliationMatches,
    summary,
    loading,
    error,
    importBankStatement,
    approveMatch,
    rejectMatch,
    resetReconciliation,
    loadExistingReconciliation,
    isCompleted: bankReconciliationCompleted
  } = useBankReconciliation()

  const [isUploading, setIsUploading] = useState(false)
  const [simplifiedMatches, setSimplifiedMatches] = useState<SimplifiedMatch[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [manualMatchDialogOpen, setManualMatchDialogOpen] = useState(false)
  const [selectedBankEntryForManualMatch, setSelectedBankEntryForManualMatch] = useState<any>(null)
  const onCompleteCalledRef = useRef(false)

  // Check for existing bank reconciliation on mount
  useEffect(() => {
    const checkExisting = async () => {
      const result = await loadExistingReconciliation(selectedMonth)
      if (result.exists && result.isCompleted) {
        // Show completed state
        setIsComplete(true)
        onCompleteCalledRef.current = true
        onComplete({
          bankEntriesCount: summary.totalBankEntries,
          matchedCount: summary.matched,
          unmatchedCount: summary.unmatched,
          isComplete: true,
          sessionId: result.sessionId
        })
      }
    }
    
    checkExisting()
  }, [selectedMonth])

  // Transform technical matches to user-friendly format
  useEffect(() => {
    const simplified = reconciliationMatches.map(match => {
      let type: SimplifiedMatch['type'] = 'unknown'
      let details = ''

      // Determine match type and create user-friendly description
      if (match.batchTransactions && match.batchTransactions.length > 0) {
        type = 'settlement'
        // Check if all are same provider (TWINT never mixes with SumUp)
        const providers = [...new Set(match.batchTransactions.map((tx: any) => tx.payment_method))]
        if (providers.length === 1) {
          const provider = providers[0].toUpperCase()
          details = `${match.batchTransactions.length} ${provider} Verkäufe zusammen`
        } else {
          details = `${match.batchTransactions.length} Verkäufe zusammen` // Should not happen
        }
      } else if (match.posTransaction) {
        if (match.posTransaction.payment_method === 'twint') {
          type = 'settlement'
          details = `TWINT Verkauf vom ${formatDateForDisplay(match.posTransaction.created_at)}`
        } else if (match.posTransaction.payment_method === 'sumup') {
          type = 'settlement'
          details = `SumUp Verkauf vom ${formatDateForDisplay(match.posTransaction.created_at)}`
        }
      } else if (match.expense) {
        type = 'expense'
        details = `Geschäftsausgabe: ${match.expense.description}`
      } else if (match.bankEntry.direction === 'credit' && match.bankEntry.amount > 100) {
        type = 'deposit'
        details = 'Mögliche Bareinzahlung'
      }

      return {
        id: match.id,
        amount: match.bankEntry.amount,
        date: formatDateForDisplay(match.bankEntry.date),
        description: match.bankEntry.description,
        type,
        details,
        confidence: Math.round(match.confidence || 0), // Keep original confidence or 0 if not provided
        status: match.status,
        bankEntry: match.bankEntry,
        posData: match.batchTransactions || (match.posTransaction ? [match.posTransaction] : null) || (match.expense ? [match.expense] : null)
      }
    })

    setSimplifiedMatches(simplified)

    // Check if reconciliation is complete
    const pendingCount = simplified.filter(m => m.status === 'pending').length
    const newIsComplete = pendingCount === 0 && simplified.length > 0
    
    // Reset onComplete flag if completion status changes
    if (newIsComplete !== isComplete) {
      onCompleteCalledRef.current = false
    }
    
    setIsComplete(newIsComplete)

  }, [reconciliationMatches])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const result = await importBankStatement(file, selectedMonth)
      if (result.success) {
        toast({
          title: "Bank Statement importiert",
          description: `${result.entriesFound} Bank-Einträge gefunden und analysiert`,
        })
      } else {
        toast({
          title: "Import Fehler",
          description: result.error || "Bank Statement konnte nicht importiert werden",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Import Fehler",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleApprove = async (matchId: string) => {
    try {
      const result = await approveMatch(matchId)
      if (result.success) {
        toast({
          title: "Abgleich bestätigt",
          description: "Der Bank-Eintrag wurde erfolgreich abgeglichen",
        })
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleReject = async (matchId: string) => {
    try {
      const result = await rejectMatch(matchId)
      if (result.success) {
        toast({
          title: "Abgleich abgelehnt",
          description: "Der Bank-Eintrag wurde als nicht zutreffend markiert",
        })
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleForceComplete = () => {
    onComplete({
      bankEntriesCount: bankEntries.length,
      matchedCount: summary.matched,
      unmatchedCount: summary.unmatched,
      reconciliationMatches: simplifiedMatches,
      isComplete: true
    })
    onNext()
  }

  // Auto-complete when all matches are processed (only once)
  useEffect(() => {
    if (isComplete && simplifiedMatches.length > 0 && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true
      onComplete({
        bankEntriesCount: bankEntries.length,
        matchedCount: summary.matched,
        unmatchedCount: summary.unmatched,
        reconciliationMatches: simplifiedMatches,
        isComplete: true
      })
    }
  }, [isComplete, simplifiedMatches.length])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {bankEntries.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} />
              Bank Statement Upload
            </CardTitle>
            <CardDescription>
              Laden Sie das Raiffeisen CAMT.053 XML für {formattedMonthYear} hoch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-medium mb-2">Bank Statement hochladen</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Unterstützt: Raiffeisen CAMT.053 XML
              </p>
              <input
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="bank-statement-upload"
              />
              <label htmlFor="bank-statement-upload">
                <Button asChild disabled={isUploading}>
                  <span className="cursor-pointer">
                    {isUploading ? "Importiere..." : "Datei auswählen"}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {bankEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Bank Einträge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bankEntries.length}</div>
              <p className="text-xs text-muted-foreground">Gefunden</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Abgeglichen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{summary.matched}</div>
              <p className="text-xs text-muted-foreground">
                {bankEntries.length > 0 ? `${Math.round((summary.matched / bankEntries.length) * 100)}%` : '0%'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Offen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{summary.unmatched}</div>
              <p className="text-xs text-muted-foreground">
                {summary.unmatched > 0 ? "Benötigen Review" : "Alle abgeglichen"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Simplified Matches */}
      {simplifiedMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bank-Einträge prüfen</CardTitle>
            <CardDescription>
              Bestätigen Sie, ob die automatischen Zuordnungen korrekt sind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {simplifiedMatches
                .filter(match => match.status === 'pending')
                .map((match) => (
                <div key={match.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Amount and Direction */}
                      <div className="flex items-center gap-3">
                        {match.bankEntry.direction === 'credit' ? (
                          <TrendingUp className="text-success" size={20} />
                        ) : (
                          <TrendingDown className="text-destructive" size={20} />
                        )}
                        <div>
                          <div className="font-medium text-lg">
                            CHF {match.amount.toFixed(2)}
                            <span className="text-sm text-muted-foreground ml-2">
                              ({match.bankEntry.direction === 'credit' ? 'Eingang' : 'Ausgang'})
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {match.date}
                          </div>
                        </div>
                      </div>

                      {/* Match Type Badge */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {match.type === 'settlement' && '💳 Settlement'}
                          {match.type === 'expense' && '💸 Ausgabe'}
                          {match.type === 'deposit' && '💰 Einzahlung'}
                          {match.type === 'unknown' && '❓ Unbekannt'}
                        </Badge>
                        <Badge variant={match.confidence >= 90 ? 'default' : match.confidence >= 70 ? 'secondary' : 'destructive'}>
                          {match.confidence}% sicher
                        </Badge>
                      </div>

                      {/* User-friendly description */}
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="font-medium">Zuordnung:</div>
                        <div className="text-sm">{match.details}</div>
                        
                        {/* Show individual transactions for batch matches */}
                        {match.posData && Array.isArray(match.posData) && match.posData.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">
                              {match.posData.length > 1 ? 'Einzelne Transaktionen:' : 'Transaktion Details:'}
                            </div>
                            {match.posData.map((tx: any, idx: number) => (
                              <div key={idx} className="text-xs bg-background p-3 rounded border">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">
                                      📅 {formatDateForDisplay(tx.created_at || tx.payment_date)}
                                    </div>
                                    <div className="text-muted-foreground">
                                      ID: {tx.id?.substring(0, 8)}...
                                    </div>
                                    <div className="text-muted-foreground">
                                      {tx.payment_method?.toUpperCase() || 'UNKNOWN'}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">
                                      CHF {(tx.total_amount || tx.amount || 0)?.toFixed(2)}
                                    </div>
                                    {tx.net_amount && tx.net_amount !== (tx.total_amount || tx.amount) && (
                                      <div className="text-xs text-muted-foreground">
                                        Netto: CHF {tx.net_amount.toFixed(2)}
                                      </div>
                                    )}
                                    {tx.provider_fee && (
                                      <div className="text-xs text-warning">
                                        Fee: CHF {tx.provider_fee.toFixed(2)}
                                      </div>
                                    )}
                                    {tx.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {tx.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                              <strong>Debug:</strong>
                              <pre className="whitespace-pre-wrap text-xs">
                                {JSON.stringify(match.posData?.map((tx: any) => ({
                                  id: tx.id,
                                  total_amount: tx.total_amount,
                                  amount: tx.amount,
                                  net_amount: tx.net_amount,
                                  provider_fee: tx.provider_fee,
                                  payment_method: tx.payment_method,
                                  description: tx.description,
                                  created_at: tx.created_at,
                                  payment_date: tx.payment_date
                                })), null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground mt-2">
                          <strong>Bank Eintrag:</strong> {match.bankEntry?.description || match.description || 'Keine Beschreibung'}
                        </div>
                      </div>

                      {/* Confidence explanation */}
                      {match.confidence < 90 && (
                        <div className="text-sm text-warning">
                          ⚠️ Niedrige Sicherheit - bitte manuell prüfen
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(match.id)}
                        disabled={loading}
                      >
                        <Check size={14} className="mr-1" />
                        Korrekt
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedBankEntryForManualMatch(match.bankEntry)
                          setManualMatchDialogOpen(true)
                        }}
                        disabled={loading}
                      >
                        <X size={14} className="mr-1" />
                        Falsch
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* No pending matches */}
              {simplifiedMatches.filter(m => m.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Alle Bank-Einträge wurden überprüft
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Status */}
      {isComplete ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Bank Reconciliation abgeschlossen</div>
            <div className="text-sm mt-1">
              Alle Bank-Einträge wurden überprüft und zugeordnet. Sie können zum nächsten Schritt wechseln.
            </div>
          </AlertDescription>
        </Alert>
      ) : bankEntries.length > 0 ? (
        <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <div>
            <p className="font-medium">Bank Reconciliation unvollständig</p>
            <p className="text-sm text-muted-foreground">
              {simplifiedMatches.filter(m => m.status === 'pending').length} Bank-Einträge benötigen noch eine Überprüfung.
            </p>
          </div>
          <Button onClick={handleForceComplete} variant="outline">
            Trotzdem fortfahren
          </Button>
        </div>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bitte laden Sie zuerst ein Bank Statement hoch, um mit der Reconciliation zu beginnen.
          </AlertDescription>
        </Alert>
      )}

      {/* Reset Option */}
      {bankEntries.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={resetReconciliation}>
            Reconciliation zurücksetzen
          </Button>
        </div>
      )}

      {/* Manual Match Dialog */}
      <ManualMatchDialog
        isOpen={manualMatchDialogOpen}
        onOpenChange={setManualMatchDialogOpen}
        bankEntry={selectedBankEntryForManualMatch}
        possibleMatches={[]} // TODO: Generate possible matches from unmatched transactions
        onCreateMatch={(bankEntryId, matchData, notes) => {
          console.log('Creating manual match:', { bankEntryId, matchData, notes })
          // TODO: Implement manual match creation
          toast({
            title: "Manual Match erstellt",
            description: "Der Bank-Eintrag wurde manuell zugeordnet",
          })
        }}
        onMarkAsUnmatched={(bankEntryId, reason, notes) => {
          console.log('Marking as unmatched:', { bankEntryId, reason, notes })
          // TODO: Implement unmatched marking
          toast({
            title: "Als Unmatched markiert",
            description: `Bank-Eintrag wurde als unmatched markiert: ${reason}`,
          })
        }}
      />
    </div>
  )
}