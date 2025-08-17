// Shared Expense Types
import type { Database } from '@/types/database'
import type { Supplier } from './suppliers'

// Core expense types (re-exported from database)
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Omit<
  Database['public']['Tables']['expenses']['Insert'],
  'id' | 'created_at'
>
export type ExpenseUpdate = Partial<
  Omit<Database['public']['Tables']['expenses']['Update'], 'id' | 'created_at'>
> & { id: string }

// Enhanced expense with supplier data
export interface ExpenseWithSupplier {
  id: string
  amount: number
  description: string
  category: string
  payment_method: string
  payment_date: string
  supplier_name: string | null
  invoice_number: string | null
  notes: string | null
  user_id: string
  created_at: string
  bank_transaction_id: string | null
  banking_status: string | null
  receipt_number: string | null
  supplier_id: string | null
  supplier?: Supplier | null
  suppliers?: Supplier | null // For Supabase join
}

// Default-Kategorien (immer verfügbar)
export const DEFAULT_EXPENSE_CATEGORIES = {
  rent: 'Miete',
  supplies: 'Einkauf/Material',
  salary: 'Lohn',
  utilities: 'Nebenkosten',
  insurance: 'Versicherung',
  other: 'Sonstiges',
} as const

// Expense Category ist jetzt string (dynamisch)
export type ExpenseCategory = string

// Backward compatibility
export const EXPENSE_CATEGORIES = DEFAULT_EXPENSE_CATEGORIES
