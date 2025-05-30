// Daily Reports TypeScript Types

export type TransactionItem = {
  id: string
  date: string // Datum hinzugefügt
  time: string
  amount: number
  method: 'cash' | 'twint' | 'sumup' | 'bank'
  status: 'completed' | 'cancelled' | 'refunded'
  type?: 'sale' | 'expense' | 'bank_deposit' // Transaktionstyp
  description?: string // Beschreibung
  category?: string // Kategorie (revenue, business_expense, bank_operation, etc.)
  // Settlement fields (Phase 1)
  grossAmount?: number | null
  providerFee?: number | null
  netAmount?: number | null
  settlementStatus?: 'pending' | 'settled' | 'failed' | 'weekend_delay' | 'charged_back' | null
  settlementDate?: string | null
  providerReferenceId?: string | null
}

export type DailyStatsData = {
  cash: number
  twint: number
  sumup: number
  total: number
  startingCash: number
  endingCash: number
  transactionCount: number
  // Settlement data (Phase 1) - Optional for monthly reports only
  settlementStats?: {
    twintGross: number
    twintFees: number
    twintNet: number
    twintSettled: number
    twintPending: number
    sumupGross: number
    sumupFees: number
    sumupNet: number
    sumupSettled: number
    sumupPending: number
    totalFees: number
    settlementRate: number // Percentage of transactions settled
  }
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