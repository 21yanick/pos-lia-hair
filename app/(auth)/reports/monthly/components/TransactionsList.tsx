import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, Receipt, TrendingDown } from "lucide-react"

export type TransactionItem = {
  id: string
  date: string
  type: 'daily_report' | 'expense'
  description: string
  cash?: number
  twint?: number
  sumup?: number
  total: number
  status?: 'draft' | 'closed'
  paymentMethod?: 'cash' | 'bank'
  category?: string
}

interface TransactionsListProps {
  transactions: TransactionItem[]
  loading?: boolean
}

export function TransactionsList({ transactions, loading = false }: TransactionsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chronologische Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  <div className="h-3 bg-muted animate-pulse rounded w-32" />
                </div>
                <div className="h-6 bg-muted animate-pulse rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transaktionen nach Datum sortieren (neueste zuerst)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-CH', { 
      day: '2-digit', 
      month: '2-digit',
      weekday: 'short'
    })
  }

  const getTransactionIcon = (transaction: TransactionItem) => {
    if (transaction.type === 'daily_report') {
      return <Receipt size={16} className="text-success" />
    } else {
      return <TrendingDown size={16} className="text-destructive" />
    }
  }

  const getPaymentMethodIcon = (transaction: TransactionItem) => {
    if (transaction.type === 'daily_report') {
      // Für Daily Reports zeigen wir die Zahlungsarten
      return (
        <div className="flex gap-1">
          {transaction.cash && transaction.cash > 0 && (
            <Wallet size={14} className="text-payment-cash" />
          )}
          {transaction.twint && transaction.twint > 0 && (
            <Wallet size={14} className="text-payment-twint" />
          )}
          {transaction.sumup && transaction.sumup > 0 && (
            <CreditCard size={14} className="text-payment-sumup" />
          )}
        </div>
      )
    } else {
      // Für Ausgaben zeigen wir Bar/Bank
      return transaction.paymentMethod === 'cash' ? (
        <Wallet size={14} className="text-payment-cash" />
      ) : (
        <CreditCard size={14} className="text-payment-sumup" />
      )
    }
  }

  const getTransactionDetails = (transaction: TransactionItem) => {
    if (transaction.type === 'daily_report') {
      const parts = []
      if (transaction.cash && transaction.cash > 0) parts.push(`Bar: ${transaction.cash.toFixed(0)}`)
      if (transaction.twint && transaction.twint > 0) parts.push(`TWINT: ${transaction.twint.toFixed(0)}`)
      if (transaction.sumup && transaction.sumup > 0) parts.push(`SumUp: ${transaction.sumup.toFixed(0)}`)
      return parts.join(' | ')
    } else {
      return `${transaction.category || 'Ausgabe'} (${transaction.paymentMethod === 'cash' ? 'Bar' : 'Bank'})`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Chronologische Transaktionen ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length > 0 ? (
          <div className="space-y-2">
            {sortedTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className={`flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 ${
                  transaction.type === 'expense' ? 'border-l-4 border-l-destructive/20' : 'border-l-4 border-l-success/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatDate(transaction.date)}</span>
                      {transaction.status && (
                        <Badge variant={transaction.status === 'closed' ? "default" : "outline"} className="text-xs">
                          {transaction.status === 'closed' ? 'Abgeschlossen' : 'Entwurf'}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{transaction.description}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {getPaymentMethodIcon(transaction)}
                      {getTransactionDetails(transaction)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    transaction.type === 'daily_report' ? 'text-success' : 'text-destructive'
                  }`}>
                    {transaction.type === 'daily_report' ? '+' : '-'}CHF {Math.abs(transaction.total).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground">Keine Transaktionen für diesen Monat verfügbar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}