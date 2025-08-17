'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

// Create a single lazy-loaded chart component
const LazyChart = lazy(() => import('./LazyMonthlyChart'))

export type MonthlyData = {
  month: string
  revenue: number
  expenses: number
  profit: number
  monthName: string
}

interface MonthlyTrendChartProps {
  data: MonthlyData[]
  loading?: boolean
}

const chartConfig = {
  revenue: {
    label: 'Umsatz',
    color: 'var(--chart-3)', // Grün aus tweakcn palette
  },
  expenses: {
    label: 'Ausgaben',
    color: 'var(--chart-4)', // Orange aus tweakcn palette
  },
  profit: {
    label: 'Gewinn',
    color: 'var(--chart-1)', // Primary Purple aus tweakcn palette
  },
}

function ChartLoadingFallback() {
  return <div className="h-[250px] w-full animate-pulse bg-muted rounded" />
}

export function MonthlyTrendChart({ data, loading = false }: MonthlyTrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jahresverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartLoadingFallback />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jahresverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">Keine Daten verfügbar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jahresverlauf - Umsatz vs. Ausgaben</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ChartLoadingFallback />}>
          <LazyChart data={data} config={chartConfig} />
        </Suspense>
      </CardContent>
    </Card>
  )
}
