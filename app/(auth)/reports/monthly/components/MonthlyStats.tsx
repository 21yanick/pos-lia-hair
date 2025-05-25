import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type MonthlyStatsData = {
  salesTotal: number
  salesCash: number
  salesTwint: number
  salesSumup: number
  expensesTotal: number
  expensesCash: number
  expensesBank: number
  transactionDays: number
  daysInMonth: number
  avgDailyRevenue: number
}

interface MonthlyStatsProps {
  data: MonthlyStatsData
  loading?: boolean
}

export function MonthlyStats({ data, loading = false }: MonthlyStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-3 bg-gray-200 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cardsRevenue = data.salesCash + data.salesTwint + data.salesSumup

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Monatsumsatz */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Monatsumsatz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">CHF {data.salesTotal.toFixed(2)}</div>
          <p className="text-sm text-gray-500">
            {data.transactionDays} von {data.daysInMonth} Tagen
          </p>
        </CardContent>
      </Card>

      {/* Bar-Umsätze */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Bar-Umsätze</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">CHF {data.salesCash.toFixed(2)}</div>
          <p className="text-sm text-gray-500">
            {data.salesTotal > 0 ? ((data.salesCash / data.salesTotal) * 100).toFixed(0) : 0}% vom Umsatz
          </p>
        </CardContent>
      </Card>

      {/* Karten-Umsätze */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Karten-Umsätze</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">CHF {cardsRevenue.toFixed(2)}</div>
          <p className="text-sm text-gray-500">
            TWINT: {data.salesTwint.toFixed(0)} | SumUp: {data.salesSumup.toFixed(0)}
          </p>
        </CardContent>
      </Card>

      {/* Ausgaben */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Ausgaben</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">CHF {data.expensesTotal.toFixed(2)}</div>
          <p className="text-sm text-gray-500">
            Bar: {data.expensesCash.toFixed(0)} | Bank: {data.expensesBank.toFixed(0)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}