// Transaction-related types
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

// Daily statistics (moved from dailyTypes.ts for centralization)
export type DailyStatsData = {
  cash: number
  twint: number
  sumup: number
  total: number
  startingCash: number
  endingCash: number
  transactionCount: number
}

// Common transaction filtering and sorting
export type TransactionFilter = {
  method?: TransactionItem['method']
  status?: TransactionItem['status']
  type?: TransactionItem['type']
  dateFrom?: string
  dateTo?: string
}

export type TransactionSort = {
  field: 'date' | 'amount' | 'method' | 'status'
  direction: 'asc' | 'desc'
}