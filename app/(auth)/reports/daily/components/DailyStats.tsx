"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Wallet, CreditCard, TrendingUp } from "lucide-react"
import type { DailyStatsData } from "../utils/dailyTypes"

export type { DailyStatsData }

interface DailyStatsProps {
  stats: DailyStatsData
  loading?: boolean
}

export function DailyStats({ stats, loading = false }: DailyStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Bar-Umsätze */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bar-Umsätze</CardTitle>
            <Wallet className="h-4 w-4 text-payment-cash" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-payment-cash">
              CHF {stats.cash.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* TWINT-Umsätze */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TWINT-Umsätze</CardTitle>
            <Wallet className="h-4 w-4 text-payment-twint" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-payment-twint">
              CHF {stats.twint.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* SumUp-Umsätze */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SumUp-Umsätze</CardTitle>
            <CreditCard className="h-4 w-4 text-payment-sumup" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-payment-sumup">
              CHF {stats.sumup.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Gesamtumsatz */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              CHF {stats.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.transactionCount} Transaktionen
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}