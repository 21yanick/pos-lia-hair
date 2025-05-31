import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Download, Wallet, CreditCard, Receipt, TrendingDown, FileText } from "lucide-react"
import type { MonthlyStatsData, ExportType } from "@/shared/types/monthly"
import type { TransactionItem } from "@/shared/types/transactions"

interface ExportButtonsProps {
  transactions: TransactionItem[]
  stats: MonthlyStatsData
  selectedMonth: string
  onExport: (type: ExportType, data: any) => void
  loading?: boolean
}

// ExportType is now imported from @/shared/types/monthly

export function ExportButtons({ transactions, stats, selectedMonth, onExport, loading = false }: ExportButtonsProps) {
  const exportConfigs: Array<{
    type: ExportType
    label: string
    icon: React.ReactNode
    description: string
    color: string
    getValue: () => number
  }> = [
    {
      type: 'revenue_cash',
      label: 'Einnahmen Bar',
      icon: <Wallet size={16} />,
      description: `CHF ${stats.salesCash.toFixed(2)}`,
      color: 'bg-payment-cash/10 hover:bg-payment-cash/20 text-payment-cash border-payment-cash/20',
      getValue: () => stats.salesCash
    },
    {
      type: 'revenue_twint',
      label: 'Einnahmen TWINT',
      icon: <Wallet size={16} />,
      description: `CHF ${stats.salesTwint.toFixed(2)}`,
      color: 'bg-payment-twint/10 hover:bg-payment-twint/20 text-payment-twint border-payment-twint/20',
      getValue: () => stats.salesTwint
    },
    {
      type: 'revenue_sumup',
      label: 'Einnahmen SumUp',
      icon: <CreditCard size={16} />,
      description: `CHF ${stats.salesSumup.toFixed(2)}`,
      color: 'bg-payment-sumup/10 hover:bg-payment-sumup/20 text-payment-sumup border-payment-sumup/20',
      getValue: () => stats.salesSumup
    },
    {
      type: 'expenses_cash',
      label: 'Ausgaben Bar',
      icon: <TrendingDown size={16} />,
      description: `CHF ${stats.expensesCash.toFixed(2)}`,
      color: 'bg-warning/10 hover:bg-warning/20 text-warning border-warning/20',
      getValue: () => stats.expensesCash
    },
    {
      type: 'expenses_bank',
      label: 'Ausgaben Bank',
      icon: <CreditCard size={16} />,
      description: `CHF ${stats.expensesBank.toFixed(2)}`,
      color: 'bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20',
      getValue: () => stats.expensesBank
    },
    {
      type: 'complete_month',
      label: 'Kompletter Monat',
      icon: <FileText size={16} />,
      description: 'Alles chronologisch',
      color: 'bg-muted hover:bg-muted/80 text-foreground border-border',
      getValue: () => stats.salesTotal + stats.expensesTotal
    }
  ]

  const handleExport = (config: typeof exportConfigs[0]) => {
    const filteredData = getFilteredData(config.type)
    onExport(config.type, {
      type: config.type,
      label: config.label,
      transactions: filteredData,
      stats,
      selectedMonth,
      total: config.getValue()
    })
  }

  const getFilteredData = (type: ExportType): TransactionItem[] => {
    switch (type) {
      case 'revenue_cash':
        return transactions.filter(t => t.type === 'daily_report' && t.cash && t.cash > 0)
      case 'revenue_twint':
        return transactions.filter(t => t.type === 'daily_report' && t.twint && t.twint > 0)
      case 'revenue_sumup':
        return transactions.filter(t => t.type === 'daily_report' && t.sumup && t.sumup > 0)
      case 'expenses_cash':
        return transactions.filter(t => t.type === 'expense' && t.paymentMethod === 'cash')
      case 'expenses_bank':
        return transactions.filter(t => t.type === 'expense' && t.paymentMethod === 'bank')
      case 'complete_month':
        return transactions
      default:
        return []
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download size={20} />
          Export-Optionen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {exportConfigs.map((config) => {
            const filteredCount = getFilteredData(config.type).length
            const isDisabled = config.getValue() === 0 || loading
            
            return (
              <Button
                key={config.type}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-start gap-2 ${config.color} ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleExport(config)}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-2 font-medium">
                  {config.icon}
                  {config.label}
                </div>
                <div className="text-sm font-normal">{config.description}</div>
                <div className="text-xs text-muted-foreground">
                  {filteredCount} Einträge
                </div>
              </Button>
            )
          })}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>💡 Tipp: Jeder Export erstellt eine separate CSV/PDF-Datei mit den gefilterten Daten.</p>
        </div>
      </CardContent>
    </Card>
  )
}