"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Line, ComposedChart, LineChart } from "recharts"

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
    label: "Umsatz",
    color: "#22c55e", // green-500
  },
  expenses: {
    label: "Ausgaben", 
    color: "#ef4444", // red-500
  },
  profit: {
    label: "Gewinn",
    color: "#3b82f6", // blue-500
  },
}

export function MonthlyTrendChart({ data, loading = false }: MonthlyTrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jahresverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full animate-pulse bg-gray-200 rounded" />
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
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="monthName" 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => [
                    `CHF ${Number(value).toFixed(2)}`,
                    chartConfig[name as keyof typeof chartConfig]?.label || name
                  ]}
                />
              }
            />
            <Bar 
              dataKey="revenue" 
              fill="var(--color-revenue)" 
              radius={[2, 2, 0, 0]}
              name="revenue"
            />
            <Bar 
              dataKey="expenses" 
              fill="var(--color-expenses)" 
              radius={[2, 2, 0, 0]}
              name="expenses"
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="var(--color-profit)" 
              strokeWidth={3}
              dot={{ fill: "var(--color-profit)", strokeWidth: 2, r: 4 }}
              name="profit"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}