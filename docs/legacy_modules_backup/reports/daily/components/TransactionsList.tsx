"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { Wallet, CreditCard, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react"
import type { TransactionItem } from "../utils/dailyTypes"

export type { TransactionItem }

interface TransactionsListProps {
  transactions: TransactionItem[]
  loading?: boolean
  showSettlementDetails?: boolean // Phase 1: Settlement optional
}

export function TransactionsList({ 
  transactions, 
  loading = false, 
  showSettlementDetails = false // Phase 1: Default aus
}: TransactionsListProps) {
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
        return <Wallet size={16} className="mr-2 text-payment-cash" />
      case "twint":
        return <Wallet size={16} className="mr-2 text-payment-twint" />
      case "sumup":
        return <CreditCard size={16} className="mr-2 text-payment-sumup" />
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
      completed: "bg-success/10 text-success hover:bg-success/10",
      cancelled: "bg-destructive/10 text-destructive hover:bg-destructive/10",
      refunded: "bg-warning/10 text-warning hover:bg-warning/10"
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

  const getSettlementBadge = (transaction: TransactionItem) => {
    if (transaction.method === 'cash') {
      return null // Cash transactions don't need settlement
    }

    const settlementStatus = transaction.settlementStatus || 'pending'
    
    const variants = {
      settled: { 
        icon: CheckCircle, 
        variant: "default" as const,
        className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300",
        label: "Settled" 
      },
      pending: { 
        icon: Clock, 
        variant: "secondary" as const,
        className: "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
        label: "Pending" 
      },
      failed: { 
        icon: AlertCircle, 
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300",
        label: "Failed" 
      },
      weekend_delay: { 
        icon: Clock, 
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
        label: "Weekend Delay" 
      },
      charged_back: { 
        icon: AlertCircle, 
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300",
        label: "Charged Back" 
      }
    }

    const config = variants[settlementStatus] || variants.pending
    const Icon = config.icon

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant={config.variant} className={config.className}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p>Settlement Status: {config.label}</p>
              {transaction.providerFee && (
                <p>Fee: CHF {transaction.providerFee.toFixed(2)}</p>
              )}
              {transaction.netAmount && (
                <p>Net: CHF {transaction.netAmount.toFixed(2)}</p>
              )}
              {transaction.settlementDate && (
                <p>Date: {transaction.settlementDate}</p>
              )}
              {transaction.providerReferenceId && (
                <p>Ref: {transaction.providerReferenceId}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaktionen</CardTitle>
        {transactions.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {transactions.length} Transaktion{transactions.length !== 1 ? 'en' : ''}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Noch keine Transaktionen für heute vorhanden.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Zeit</TableHead>
                <TableHead>Zahlungsart</TableHead>
                <TableHead>Status</TableHead>
                {showSettlementDetails && <TableHead>Settlement</TableHead>}
                <TableHead className="text-right">Betrag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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
                  {showSettlementDetails && (
                    <TableCell>
                      {getSettlementBadge(transaction)}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium">
                        CHF {transaction.amount.toFixed(2)}
                      </div>
                      {showSettlementDetails && transaction.providerFee && transaction.providerFee > 0 && (
                        <div className="text-xs text-red-500">
                          -CHF {transaction.providerFee.toFixed(2)} (Fee)
                        </div>
                      )}
                      {showSettlementDetails && transaction.netAmount && transaction.netAmount !== transaction.amount && (
                        <div className="text-xs text-green-600">
                          CHF {transaction.netAmount.toFixed(2)} (Net)
                        </div>
                      )}
                    </div>
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