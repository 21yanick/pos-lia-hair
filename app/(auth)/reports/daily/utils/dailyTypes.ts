// Daily Reports TypeScript Types

export type TransactionItem = {
  id: string
  time: string
  amount: number
  method: 'cash' | 'twint' | 'sumup'
  status: 'completed' | 'cancelled' | 'refunded'
}

export type DailyStatsData = {
  cash: number
  twint: number
  sumup: number
  total: number
  startingCash: number
  endingCash: number
  transactionCount: number
}

export type DailySummaryStatus = 'draft' | 'closed' | 'corrected'

export type DailySummary = {
  id: string
  report_date: string
  sales_cash: number
  sales_twint: number
  sales_sumup: number
  sales_total: number
  cash_starting: number
  cash_ending: number
  cash_difference: number
  status: DailySummaryStatus
  notes: string | null
  user_id: string
  created_at: string | null  // Kann null sein
  closed_at: string | null
}

export type CashCountData = {
  expectedCash: number
  actualCash: number
  difference: number
  notes: string
}

export type DailyActionType = 'close' | 'update' | 'correct' | 'export_pdf'