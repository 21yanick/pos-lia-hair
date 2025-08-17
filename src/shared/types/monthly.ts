// Import transaction types
import type { TransactionItem } from './transactions'

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

// Legacy MonthlySummary moved to docs/legacy_modules_backup/

// Re-export transaction types for convenience
export type { TransactionItem }
