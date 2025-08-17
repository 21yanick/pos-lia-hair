// Expenses Module Public API

// Re-export from shared (useExpenses is now shared business logic)
export { useExpenses } from '@/shared/hooks/business/useExpenses'
export type {
  Expense,
  ExpenseCategory,
  ExpenseInsert,
  ExpenseUpdate,
} from '@/shared/types/expenses'
export { EXPENSE_CATEGORIES } from '@/shared/types/expenses'
export { ExpensesPage } from './components/ExpensesPage'
