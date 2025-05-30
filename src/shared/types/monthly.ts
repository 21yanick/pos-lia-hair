// Monthly Reports & Statistics Types
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

// Export functionality types
export type ExportType = 
  | 'revenue_cash' 
  | 'revenue_twint' 
  | 'revenue_sumup' 
  | 'expenses_cash' 
  | 'expenses_bank' 
  | 'complete_month'

export type ExportData = {
  type: ExportType
  label: string
  transactions: TransactionItem[]
  stats: MonthlyStatsData
  selectedMonth: string
  total: number
}

// Monthly summary related types
export interface MonthlySummary {
  id: string
  year: number
  month: number
  sales_total: number
  expenses_total: number
  status: 'draft' | 'closed'
  created_at: string
  closed_at?: string
  notes?: string
}

// Re-export transaction types for convenience
export type { TransactionItem } from './transactions'