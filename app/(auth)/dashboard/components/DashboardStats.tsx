"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react"

export type DashboardStatsData = {
  cashBalance: number
  thisMonth: {
    revenue: number
    expenses: number
    profit: number
  }
  last30Days: {
    revenue: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  yearTotal: {
    revenue: number
    expenses: number
    profit: number
  }
}

interface DashboardStatsProps {
  data: DashboardStatsData
  loading?: boolean
}

export function DashboardStats({ data, loading = false }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

  const getTrendIcon = () => {
    if (data.last30Days.trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (data.last30Days.trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />
    return <div className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (data.last30Days.trend === 'up') return 'text-green-600'
    if (data.last30Days.trend === 'down') return 'text-red-600'
    return 'text-gray-500'
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Aktueller Kassenbestand */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Kassenbestand</CardTitle>
          <Wallet className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">CHF {data.cashBalance.toFixed(2)}</div>
          <p className="text-xs text-gray-500">
            Aktueller Bargeld-Bestand
          </p>
        </CardContent>
      </Card>

      {/* Dieser Monat */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Dieser Monat</CardTitle>
          <Calendar className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">CHF {data.thisMonth.profit.toFixed(2)}</div>
          <p className="text-xs text-gray-500">
            Umsatz: {data.thisMonth.revenue.toFixed(0)} | Ausgaben: {data.thisMonth.expenses.toFixed(0)}
          </p>
        </CardContent>
      </Card>

      {/* Letzte 30 Tage Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">30-Tage Trend</CardTitle>
          {getTrendIcon()}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">CHF {data.last30Days.revenue.toFixed(2)}</div>
          <p className={`text-xs flex items-center gap-1 ${getTrendColor()}`}>
            {data.last30Days.trend === 'up' && '+'}
            {data.last30Days.trend === 'down' && '-'}
            {data.last30Days.percentage.toFixed(1)}% vs. Vormonat
          </p>
        </CardContent>
      </Card>

      {/* Jahres-Total */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Jahres-Gewinn</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">CHF {data.yearTotal.profit.toFixed(2)}</div>
          <p className="text-xs text-gray-500">
            Umsatz: {(data.yearTotal.revenue / 1000).toFixed(1)}k | Ausgaben: {(data.yearTotal.expenses / 1000).toFixed(1)}k
          </p>
        </CardContent>
      </Card>
    </div>
  )
}