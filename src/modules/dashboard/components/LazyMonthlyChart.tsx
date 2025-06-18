import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Line, ComposedChart } from "recharts"
import type { MonthlyData } from "./MonthlyTrendChart"

interface LazyChartProps {
  data: MonthlyData[]
  config: any
}

export default function LazyMonthlyChart({ data, config }: LazyChartProps) {
  return (
    <ChartContainer config={config} className="h-[250px] w-full">
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
                config[name as keyof typeof config]?.label || name
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
  )
}