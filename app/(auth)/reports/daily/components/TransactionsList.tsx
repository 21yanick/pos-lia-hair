"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, Loader2 } from "lucide-react"
import type { TransactionItem } from "../utils/dailyTypes"

export type { TransactionItem }

interface TransactionsListProps {
  transactions: TransactionItem[]
  loading?: boolean
}

export function TransactionsList({ transactions, loading = false }: TransactionsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Transaktionen werden geladen...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPaymentMethodIcon = (method: TransactionItem['method']) => {
    switch (method) {
      case "cash":
        return <Wallet size={16} className="mr-2 text-green-500" />
      case "twint":
        return <Wallet size={16} className="mr-2 text-purple-500" />
      case "sumup":
        return <CreditCard size={16} className="mr-2 text-blue-500" />
    }
  }

  const getPaymentMethodLabel = (method: TransactionItem['method']) => {
    switch (method) {
      case "cash":
        return "Bar"
      case "twint":
        return "TWINT"
      case "sumup":
        return "SumUp"
    }
  }

  const getStatusBadge = (status: TransactionItem['status']) => {
    const variants = {
      completed: "bg-green-50 text-green-700 hover:bg-green-50",
      cancelled: "bg-red-50 text-red-700 hover:bg-red-50",
      refunded: "bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
    }

    const labels = {
      completed: "Abgeschlossen",
      cancelled: "Storniert",
      refunded: "Erstattet"
    }

    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaktionen</CardTitle>
        {transactions.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {transactions.length} Transaktion{transactions.length !== 1 ? 'en' : ''} heute
          </p>
        )}
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Noch keine Transaktionen für heute vorhanden.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeit</TableHead>
                <TableHead>Zahlungsart</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.time}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getPaymentMethodIcon(transaction.method)}
                      <span>{getPaymentMethodLabel(transaction.method)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    CHF {transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}