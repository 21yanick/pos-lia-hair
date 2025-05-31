// Expenses Module Public API
export { ExpensesPage } from './components/ExpensesPage'

// Re-export from shared (useExpenses is now shared business logic)
export { useExpenses } from '@/shared/hooks/business/useExpenses'
export type { Expense, ExpenseInsert, ExpenseUpdate, ExpenseCategory } from '@/shared/types/expenses'
export { EXPENSE_CATEGORIES } from '@/shared/types/expenses'