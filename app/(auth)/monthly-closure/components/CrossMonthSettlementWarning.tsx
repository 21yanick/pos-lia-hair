"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, AlertTriangle, Clock, CreditCard } from "lucide-react"
import { formatDateForDisplay } from "@/lib/utils/dateUtils"

interface PendingSettlement {
  id: string
  amount: number
  paymentMethod: 'twint' | 'sumup'
  transactionDate: string
  estimatedFee: number
  estimatedNetAmount: number
}

interface CrossMonthSettlementWarningProps {
  pendingSettlements: PendingSettlement[]
  currentMonth: string
}

export function CrossMonthSettlementWarning({ 
  pendingSettlements, 
  currentMonth 
}: CrossMonthSettlementWarningProps) {
  if (pendingSettlements.length === 0) {
    return (
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium">Alle Settlements abgeschlossen</div>
          <div className="text-sm mt-1">
            Keine ausstehenden TWINT/SumUp Settlements für {currentMonth}.
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const totalPendingAmount = pendingSettlements.reduce((sum, s) => sum + s.amount, 0)
  const totalEstimatedFees = pendingSettlements.reduce((sum, s) => sum + s.estimatedFee, 0)
  const totalEstimatedNet = pendingSettlements.reduce((sum, s) => sum + s.estimatedNetAmount, 0)

  const twintPending = pendingSettlements.filter(s => s.paymentMethod === 'twint')
  const sumupPending = pendingSettlements.filter(s => s.paymentMethod === 'sumup')

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium">Cross-Month Settlements erwartet</div>
          <div className="text-sm mt-1">
            {pendingSettlements.length} Transaktionen aus {currentMonth} werden voraussichtlich 
            im nächsten Monat settled. Monatsabschluss ist "preliminär" bis alle Settlements eingetroffen sind.
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock size={16} />
            Ausstehende Settlements
          </CardTitle>
          <CardDescription>
            Diese Transaktionen aus {currentMonth} werden voraussichtlich im nächsten Monat settled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Total Pending */}
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded">
              <div className="text-lg font-bold text-orange-600">
                CHF {totalPendingAmount.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Brutto pending</div>
            </div>

            {/* Estimated Fees */}
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded">
              <div className="text-lg font-bold text-red-600">
                CHF {totalEstimatedFees.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Geschätzte Fees</div>
            </div>

            {/* Estimated Net */}
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
              <div className="text-lg font-bold text-blue-600">
                CHF {totalEstimatedNet.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Geschätztes Netto</div>
            </div>
          </div>

          {/* Breakdown by Provider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {twintPending.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard size={14} />
                    TWINT
                    <Badge variant="destructive">{twintPending.length} pending</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {twintPending.map((settlement) => (
                      <div key={settlement.id} className="flex justify-between items-center text-sm p-2 bg-background rounded border">
                        <div>
                          <div className="font-medium">
                            {formatDateForDisplay(settlement.transactionDate)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {settlement.id.substring(0, 8)}...
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">CHF {settlement.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            ~CHF {settlement.estimatedNetAmount.toFixed(2)} netto
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {sumupPending.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard size={14} />
                    SumUp
                    <Badge variant="destructive">{sumupPending.length} pending</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sumupPending.map((settlement) => (
                      <div key={settlement.id} className="flex justify-between items-center text-sm p-2 bg-background rounded border">
                        <div>
                          <div className="font-medium">
                            {formatDateForDisplay(settlement.transactionDate)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {settlement.id.substring(0, 8)}...
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">CHF {settlement.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            ~CHF {settlement.estimatedNetAmount.toFixed(2)} netto
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded">
            <div className="text-sm">
              <div className="font-medium mb-1">💡 Nächste Schritte:</div>
              <ul className="text-muted-foreground space-y-1">
                <li>• Monatsabschluss kann als "preliminär" durchgeführt werden</li>
                <li>• Settlements werden im nächsten Monat automatisch erkannt (Cross-Month Detection)</li>
                <li>• Finale Zahlen werden nach Settlement-Import verfügbar</li>
                <li>• Geschätzte Fees basieren auf historischen Durchschnittswerten</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}